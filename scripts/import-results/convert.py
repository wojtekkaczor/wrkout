"""Converts the training spreadsheet into a wrkout backup file.

    python3 scripts/import-results/convert.py RESULTS.xlsx OUTPUT.json
    python3 scripts/import-results/convert.py --self-test

The spreadsheet has two sheets:

  dane      one row per exercise per workout:
            data | plan | tydzien | trening | cwiczenie | typ | powtorzenia | ciezar | rir | tempo
  bieganie  one row per run:
            tydzien | nr | opis | rpe | data | link | komentarz

The output is the app's export format (docs/06-model-danych.md §10), so it is
loaded through Profil → Importuj. Ids and timestamps are derived from the
rows, which makes the conversion repeatable: importing a newer spreadsheet
again adds the new workouts and never overwrites edits made in the app.

Requires openpyxl. The spreadsheet itself is personal data and is not part of
the repository.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, OrderedDict
from datetime import datetime, timezone

SCHEMA_VERSION = 1
FORMAT_VERSION = 1

TIERS = {"m": "main", "s": "supplementary", "a": "accessory"}

# name -> (primary muscle or None, secondary muscles, load, increment kind or None)
# Muscle groups and load kinds match src/domain. Exercises missing here are
# imported without muscle data and reported.
EXERCISES: dict[str, tuple[str | None, list[str], str, str | None]] = {
    "Goblet Squat - Dorsiflexion Mobility - Plate/KB/DB": (None, [], "external", "dumbbell"),
    "Squat - High Bar - BB": ("quads", ["glutes"], "external", "barbell"),
    "Bench Press": ("chest", ["triceps", "shoulders"], "external", "barbell"),
    "Chin Up - Close Grip": ("back", ["biceps"], "bodyweight", "bodyweight"),
    "Tall Kneeling Pallof Press": ("abs", [], "external", "machine"),
    "Calf Raise - Single Leg - Standing - DB/KB": ("calves", [], "external", "dumbbell"),
    "Biceps Curls - Standing - Ez Bar": ("biceps", [], "external", "barbell"),
    "Triceps Rope Pushdown": ("triceps", [], "external", "machine"),
    "Pogo - Intensive": (None, [], "none", None),
    "Trap Bar Deadlift": ("glutes", ["hamstrings", "quads", "back"], "external", "barbell"),
    "Overhead Press - BB": ("shoulders", ["triceps"], "external", "barbell"),
    "Cable Row - Seated - Neutral Wide Grip": ("back", ["biceps"], "external", "machine"),
    "Cossack Squat - Assisted": ("quads", ["glutes"], "bodyweight", "bodyweight"),
    "Dead Bug Hold": ("abs", [], "external", "dumbbell"),
    "Legs Curls - Lying": ("hamstrings", [], "external", "machine"),
    "Calf Raise - Seated - Machine": ("calves", [], "external", "machine"),
    "Banded Pull Apart /w External Rotation": ("shoulders", [], "none", None),
    "Med Ball Slam - Standing": (None, [], "external", None),
    "Romanian Deadlift - BB": ("hamstrings", ["glutes", "back"], "external", "barbell"),
    "Wall Tibialis Raise": (None, [], "none", None),
    "Incline Bench Press - DBs": ("chest", ["shoulders", "triceps"], "external", "dumbbell"),
    "Cuban Rotations w/ DBs": ("shoulders", [], "external", "dumbbell"),
    "Calf - Single Leg - Standing - Iso - Overcoming - BB": ("calves", [], "external", "barbell"),
    "External Rotation - Side Lying - Single Arm - DB": ("shoulders", [], "external", "dumbbell"),
    "Pull Up - Wide Grip": ("back", ["biceps"], "bodyweight", "bodyweight"),
    "Incline DBs Biceps Curls (back supported)": ("biceps", [], "external", "dumbbell"),
    "Incline Skull Crusher with Ez Bar": ("triceps", [], "external", "barbell"),
    "Single Leg Pogo Jumps": (None, [], "none", None),
    "Cable Row - Seated - Single Arm - Neutral": ("back", ["biceps"], "external", "machine"),
    "Pallof Press - Split Squat Hold": ("abs", [], "external", "machine"),
    "Incline Bench Press - BB": ("chest", ["shoulders", "triceps"], "external", "barbell"),
    "External Rotation - Low Cable - Single Arm": ("shoulders", [], "external", "machine"),
    "Bayesian Cable Biceps Curls - Single Arm": ("biceps", [], "external", "machine"),
    "Bench Press - Close Grip - BB": ("triceps", ["chest"], "external", "barbell"),
}

# Exercises done one side at a time even where the sheet writes plain "2x12".
ALWAYS_UNILATERAL = {
    "External Rotation - Side Lying - Single Arm - DB",
    "External Rotation - Low Cable - Single Arm",
    "Bayesian Cable Biceps Curls - Single Arm",
    "Cable Row - Seated - Single Arm - Neutral",
    "Single Leg Pogo Jumps",
}

NUMBER = re.compile(r"\d+(?:[.,]\d+)?")


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def to_day(text: str) -> str:
    """'05.08.2026' or '2026-08-05' -> '2026-08-05'."""
    text = text.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text
    day, month, year = text.split(".")
    return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"


def day_to_ms(day: str) -> int:
    """Noon UTC of the day: a stable timestamp for imported documents."""
    moment = datetime.strptime(day, "%Y-%m-%d").replace(hour=12, tzinfo=timezone.utc)
    return int(moment.timestamp() * 1000)


def week_number(text: str) -> int:
    match = NUMBER.search(text)
    if not match:
        raise ValueError(f"No week number in {text!r}")
    return int(match.group())


def parse_amount(token: str) -> tuple[int, bool, bool]:
    """One set's amount -> (value, is_time, is_unilateral).

    '10' -> (10, False, False)     "30''" -> (30, True, False)
    '10/10' -> (10, False, True)   "8''/8''" -> (8, True, True)
    """
    token = token.strip()
    unilateral = "/" in token
    first = token.split("/")[0]
    match = NUMBER.search(first)
    if not match:
        raise ValueError(f"No number in set amount {token!r}")
    return int(float(match.group().replace(",", "."))), "''" in first, unilateral


def parse_reps(text: str) -> tuple[list[int], bool, bool]:
    """The 'powtorzenia' cell -> (amount per set, is_time, is_unilateral).

    '3x6' -> [6, 6, 6]      '7;8;9' -> [7, 8, 9]      '20' -> [20]
    "3x30''/30''" -> [30, 30, 30] timed and unilateral
    """
    text = text.strip()
    multiplied = re.fullmatch(r"(\d+)\s*[xX]\s*(.+)", text)
    if multiplied and ";" not in text:
        value, timed, unilateral = parse_amount(multiplied.group(2))
        return [value] * int(multiplied.group(1)), timed, unilateral
    amounts = [parse_amount(part) for part in text.split(";") if part.strip()]
    if not amounts:
        raise ValueError(f"No sets in {text!r}")
    return (
        [amount[0] for amount in amounts],
        any(amount[1] for amount in amounts),
        any(amount[2] for amount in amounts),
    )


def parse_weights(text: str | None, count: int) -> tuple[list[float | None], bool]:
    """The 'ciezar' cell -> (weight per set, had_more_weights_than_sets).

    '60;70;75' -> [60, 70, 75]    'Kb 16kg;Kb 16kg' -> [16, 16]    '60;;' -> [60, None, None]
    Blank, 'max' and 0 mean "no load recorded".
    """
    if text is None or not str(text).strip():
        return [None] * count, False
    weights: list[float | None] = []
    for token in str(text).split(";"):
        match = NUMBER.search(token)
        value = float(match.group().replace(",", ".")) if match else None
        weights.append(value if value else None)
    while len(weights) > count and weights[-1] is None:
        weights.pop()
    overflow = len(weights) > count
    weights = weights[:count] + [None] * max(0, count - len(weights))
    return weights, overflow


def parse_duration(text: str) -> int:
    """'40:01' -> 2401, '1:00:23' -> 3623."""
    seconds = 0
    for part in text.strip().split(":"):
        seconds = seconds * 60 + int(part)
    return seconds


def envelope(doc_id: str, doc_type: str, updated_at: int, data: dict) -> dict:
    return {
        "id": doc_id,
        "type": doc_type,
        "updatedAt": updated_at,
        "schemaVersion": SCHEMA_VERSION,
        "data": data,
    }


def convert_strength(rows: list[tuple], warnings: list[str]) -> list[dict]:
    """Rows of the 'dane' sheet -> exercise, workoutLog and workoutTemplate documents."""
    sessions: OrderedDict[tuple, dict] = OrderedDict()
    exercise_rows: dict[str, list[dict]] = {}

    for index, row in enumerate(rows, start=2):
        date, plan, week, session, name, tier, reps, weight, rir, tempo = (
            None if cell is None else str(cell).strip() for cell in row[:10]
        )
        if not name:
            continue
        day = to_day(date)
        amounts, timed, unilateral = parse_reps(reps)
        weights, overflow = parse_weights(weight, len(amounts))
        if overflow:
            warnings.append(f"dane!{index}: more weights than sets for {name!r}; extra ignored")
        entry = {
            "name": name,
            "tier": TIERS.get(tier or "", "accessory"),
            "amounts": amounts,
            "timed": timed,
            "unilateral": unilateral or name in ALWAYS_UNILATERAL,
            "weights": weights,
            "rir": int(rir) if rir and rir.isdigit() else None,
            "tempo": tempo.lower() if tempo and re.fullmatch(r"[0-9xX]{4}", tempo) else None,
            "day": day,
        }
        key = (week_number(week), session)
        record = sessions.setdefault(
            key, {"day": day, "plan": plan, "week": week, "title": session, "entries": []}
        )
        if record["day"] != day:
            warnings.append(f"dane!{index}: {week} {session} spans {record['day']} and {day}")
        record["entries"].append(entry)
        exercise_rows.setdefault(name, []).append(entry)

    docs: list[dict] = []

    for name, entries in exercise_rows.items():
        if name not in EXERCISES:
            warnings.append(f"Exercise without muscle data: {name!r}")
        primary, secondary, load, increment = EXERCISES.get(name, (None, [], "external", None))
        data: dict = {
            "name": name,
            "tier": Counter(entry["tier"] for entry in entries).most_common(1)[0][0],
            "measure": "time" if any(entry["timed"] for entry in entries) else "reps",
            "load": load,
            "unilateral": any(entry["unilateral"] for entry in entries),
            "secondary": secondary,
        }
        if primary:
            data["primary"] = primary
        if increment:
            data["incrementKind"] = increment
        first_day = min(entry["day"] for entry in entries)
        docs.append(envelope(f"ex:{slug(name)}", "exercise", day_to_ms(first_day), data))

    latest_by_title: dict[str, dict] = {}
    for (week, title), record in sessions.items():
        stamp = day_to_ms(record["day"])
        exercises = []
        for entry in record["entries"]:
            sets = []
            for amount, weight in zip(entry["amounts"], entry["weights"]):
                logged: dict = {"kind": "work", "done": True}
                if weight is not None:
                    logged["weightKg"] = weight
                logged["durationSec" if entry["timed"] else "reps"] = amount
                sets.append(logged)
            exercise: dict = {
                "exerciseId": f"ex:{slug(entry['name'])}",
                "tier": entry["tier"],
                "sets": sets,
            }
            if entry["rir"] is not None:
                exercise["rir"] = entry["rir"]
            if entry["tempo"]:
                exercise["tempo"] = entry["tempo"]
            exercises.append(exercise)
        docs.append(
            envelope(
                f"wl:{record['day']}:t{week:02d}:{slug(title)}",
                "workoutLog",
                stamp,
                {
                    "templateId": f"tpl:{slug(title)}",
                    "title": title,
                    "date": record["day"],
                    "loggedAt": stamp,
                    "context": {"label": f"{record['plan']} · {record['week']}", "weekIndex": week},
                    "exercises": exercises,
                },
            )
        )
        current = latest_by_title.get(title)
        if current is None or (week, record["day"]) >= (current["week_no"], current["day"]):
            latest_by_title[title] = {**record, "week_no": week}

    # "Moje treningi": each session as it looked the last time it was done.
    for order, title in enumerate(sorted(latest_by_title)):
        record = latest_by_title[title]
        slots = []
        for number, entry in enumerate(record["entries"], start=1):
            slot: dict = {
                "id": f"s{number}",
                "exerciseId": f"ex:{slug(entry['name'])}",
                "tier": entry["tier"],
                "sets": len(entry["amounts"]),
                "range": [max(1, min(entry["amounts"])), max(1, max(entry["amounts"]))],
            }
            if entry["rir"] is not None:
                slot["rir"] = entry["rir"]
            if entry["tempo"]:
                slot["tempo"] = entry["tempo"]
            slots.append(slot)
        docs.append(
            envelope(
                f"tpl:{slug(title)}",
                "workoutTemplate",
                day_to_ms(record["day"]),
                {"name": title, "order": order, "slots": slots},
            )
        )

    return docs


def run_type(description: str) -> str:
    text = description.lower()
    if "test" in text:
        return "test"
    if re.search(r"\d+\s*x\s*\d+\s*m\b", text):
        return "intervals"
    if "przebieżki" in text:
        return "easy_strides"
    return "easy"


def convert_runs(rows: list[tuple], warnings: list[str]) -> list[dict]:
    """Rows of the 'bieganie' sheet -> runLog documents."""
    docs = []
    for index, row in enumerate(rows, start=2):
        week, number, description, rpe, date, link, comment = (
            None if cell is None else str(cell).strip() for cell in row[:7]
        )
        if not date:
            continue
        day = to_day(date)
        data: dict = {"date": day, "sport": "run", "source": "manual"}
        if description:
            data["planned"] = description[:1000]
        if rpe and NUMBER.fullmatch(rpe):
            data["rpe"] = float(rpe.replace(",", "."))
        if link and link.startswith("http"):
            data["url"] = link

        summary = dict(
            (key.strip(), value.strip())
            for key, _, value in (part.partition(":") for part in (comment or "").split("|"))
            if value.strip()
        )
        if "Czas" in summary:
            distance = NUMBER.search(summary.get("Dystans", ""))
            if distance:
                data["distanceM"] = round(float(distance.group().replace(",", ".")) * 1000)
            data["movingSec"] = parse_duration(summary["Czas"])
            heart_rate = NUMBER.search(summary.get("Avg HR", ""))
            if heart_rate:
                data["avgHr"] = float(heart_rate.group())
            elevation = NUMBER.search(summary.get("Wznios", ""))
            if elevation:
                data["elevationM"] = round(float(elevation.group().replace(",", ".")), 1)
        elif comment:
            data["note"] = comment[:2000]

        if "rower" in (description or "").lower() and "distanceM" not in data:
            data["sport"] = "bike"
        else:
            data["runType"] = run_type(description or "")
            if "rower" in (description or "").lower():
                warnings.append(f"bieganie!{index}: planned as cycling but recorded with a running distance")

        docs.append(
            envelope(f"run:sheet:t{week_number(week):02d}:{number}", "runLog", day_to_ms(day), data)
        )
    return docs


def convert(path: str) -> tuple[dict, list[str]]:
    from openpyxl import load_workbook

    workbook = load_workbook(path, data_only=True)
    warnings: list[str] = []

    def rows(sheet: str) -> list[tuple]:
        return [
            row
            for row in workbook[sheet].iter_rows(min_row=2, values_only=True)
            if any(cell is not None for cell in row)
        ]

    docs = convert_strength(rows("dane"), warnings)
    if "bieganie" in workbook.sheetnames:
        docs += convert_runs(rows("bieganie"), warnings)

    exported_at = max(doc["updatedAt"] for doc in docs)
    return (
        {"app": "wrkout", "exportedAt": exported_at, "formatVersion": FORMAT_VERSION, "docs": docs},
        warnings,
    )


def self_test() -> None:
    assert to_day("05.08.2026") == "2026-08-05"
    assert to_day("2026-08-04") == "2026-08-04"
    assert parse_reps("3x6") == ([6, 6, 6], False, False)
    assert parse_reps("7;8;9") == ([7, 8, 9], False, False)
    assert parse_reps("20") == ([20], False, False)
    assert parse_reps("8;8;7;7 ") == ([8, 8, 7, 7], False, False)
    assert parse_reps("3x10/10") == ([10, 10, 10], False, True)
    assert parse_reps("8/8;8/8;10/10") == ([8, 8, 10], False, True)
    assert parse_reps("3x30''") == ([30, 30, 30], True, False)
    assert parse_reps("3x8''/8''") == ([8, 8, 8], True, True)
    assert parse_weights("60;70;75", 3) == ([60.0, 70.0, 75.0], False)
    assert parse_weights("Kb 16kg;Kb 16kg", 2) == ([16.0, 16.0], False)
    assert parse_weights("14kg kb;14kg kb;14kg kb", 3) == ([14.0, 14.0, 14.0], False)
    assert parse_weights("60;;", 3) == ([60.0, None, None], False)
    assert parse_weights(";;;60", 4) == ([None, None, None, 60.0], False)
    assert parse_weights("0;0;0;", 4) == ([None, None, None, None], False)
    assert parse_weights("max;max;max", 3) == ([None, None, None], False)
    assert parse_weights("62.5;62.5", 2) == ([62.5, 62.5], False)
    assert parse_weights(None, 2) == ([None, None], False)
    assert parse_weights("50;55;", 3) == ([50.0, 55.0, None], False)
    assert parse_weights("10;20;30", 2) == ([10.0, 20.0], True)
    assert parse_duration("40:01") == 2401
    assert parse_duration("1:00:23") == 3623
    assert run_type("2 km Strefa 1 + 3x800m (6:05/km)") == "intervals"
    assert run_type("TEST: 3 km na czas") == "test"
    assert run_type("40' easy + 6x20'' przebieżki") == "easy_strides"
    assert run_type("9 km Strefa 2") == "easy"
    assert slug("Squat - High Bar - BB") == "squat-high-bar-bb"
    print("self-test passed")


def main(argv: list[str]) -> int:
    if argv[1:] == ["--self-test"]:
        self_test()
        return 0
    if len(argv) != 3:
        print(__doc__)
        return 2
    backup, warnings = convert(argv[1])
    with open(argv[2], "w", encoding="utf-8") as handle:
        json.dump(backup, handle, ensure_ascii=False, indent=1)
    counts = Counter(doc["type"] for doc in backup["docs"])
    print("documents:", dict(counts))
    for warning in warnings:
        print("warning:", warning)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
