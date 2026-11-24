"""Regenerates the app icons in public/. Run: python3 scripts/generate-icons.py

The mark is a barbell seen from the front. Icons are full-bleed squares:
iOS and Android apply their own corner mask. The maskable variant keeps the
mark inside the central safe zone.
"""

from pathlib import Path

from PIL import Image, ImageDraw

BACKGROUND = "#0b0d10"
ACCENT = "#818cf8"
PUBLIC = Path(__file__).resolve().parent.parent / "public"

# Shapes on a 512 px canvas: (left, top, right, bottom, corner radius).
SHAPES = [
    (84, 244, 428, 268, 12),   # bar
    (110, 186, 140, 326, 10),  # small plate, left
    (150, 150, 186, 362, 12),  # large plate, left
    (326, 150, 362, 362, 12),  # large plate, right
    (372, 186, 402, 326, 10),  # small plate, right
]

SUPERSAMPLE = 4


def render(size: int, scale: float = 1.0) -> Image.Image:
    """Draws the icon at `size` px; `scale` shrinks the mark around the centre."""
    canvas = size * SUPERSAMPLE
    image = Image.new("RGB", (canvas, canvas), BACKGROUND)
    draw = ImageDraw.Draw(image)
    unit = canvas / 512
    for left, top, right, bottom, radius in SHAPES:
        box = [
            (256 + (left - 256) * scale) * unit,
            (256 + (top - 256) * scale) * unit,
            (256 + (right - 256) * scale) * unit,
            (256 + (bottom - 256) * scale) * unit,
        ]
        draw.rounded_rectangle(box, radius=radius * scale * unit, fill=ACCENT)
    return image.resize((size, size), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    render(192).save(PUBLIC / "pwa-192.png", optimize=True)
    render(512).save(PUBLIC / "pwa-512.png", optimize=True)
    render(512, scale=0.72).save(PUBLIC / "pwa-maskable-512.png", optimize=True)
    render(180).save(PUBLIC / "apple-touch-icon.png", optimize=True)


if __name__ == "__main__":
    main()
