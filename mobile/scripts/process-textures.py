#!/usr/bin/env python3
"""
One-off: turn the raw texture screenshots in ~/Downloads into neutral,
card-ready overlays in assets/textures/.

The textures are rendered stretched-to-cover on the card face (NOT tiled --
tile boundaries were visible even with a seamless source, and at card
scale the grain barely reads anyway), so there's no seamless step. Each
one is just:

  1. center-crop to a square (drops framing / perspective edges)
  2. desaturate to greyscale (colour comes from the material gradient)
  3. flatten the large-scale lightness gradient so there's no baked-in
     bright/dark side
  4. pull contrast in around mid-grey so it stays a subtle overlay
  5. resize to 1024 and save as PNG

Run:  python3 scripts/process-textures.py
Originals live in ~/Downloads; a copy of whatever was in assets/textures/
before the run is kept in assets/textures/_raw/ (first run only).
"""

from pathlib import Path
from PIL import Image, ImageOps, ImageFilter, ImageChops

SRC = Path.home() / "Downloads"
DST = Path(__file__).resolve().parent.parent / "assets" / "textures"
RAW = DST / "_raw"
SIZE = 1024

TEXTURES = [
    "cardstock_texture.png",
    "cotton_paper_texture.png",
    "matte_plastic_texture.png",
    "frosted_glass_texture.png",
    "titanium_texture.png",
    "holographic_prism_texture.png",
    "raw_concrete_texture.png",
    "carbon_fiber_texture.png",
    "brushed_metal_texture.png",
]


def center_square(im: Image.Image) -> Image.Image:
    w, h = im.size
    s = min(w, h)
    return im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))


def flatten_lightness(im: Image.Image) -> Image.Image:
    """image - blur(image) + mid-grey: removes the low-frequency lightness
    ramp (a photo's bright/dark side) and keeps only the fine grain."""
    radius = max(im.size) // 6
    low = im.filter(ImageFilter.GaussianBlur(radius))
    return ImageChops.subtract(im, low, scale=1.0, offset=128)


def normalise(im: Image.Image) -> Image.Image:
    im = ImageOps.autocontrast(im, cutoff=1)
    # blend toward flat mid-grey so the overlay whispers
    return Image.blend(Image.new("L", im.size, 128), im, 0.6)


def process(name: str) -> None:
    src = SRC / name
    if not src.exists():
        src = RAW / name if (RAW / name).exists() else DST / name
    im = Image.open(src).convert("L")
    im = center_square(im)
    im = flatten_lightness(im)
    im = normalise(im)
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    im.save(DST / name, "PNG", optimize=True)
    print(f"  {name}: {SIZE}px -> {DST / name}")


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    print("backing up current assets/textures/ files to _raw/ (first run only) ...")
    for name in TEXTURES:
        cur = DST / name
        if cur.exists() and not (RAW / name).exists():
            (RAW / name).write_bytes(cur.read_bytes())
    print("processing ...")
    for name in TEXTURES:
        process(name)
    print("done.")


if __name__ == "__main__":
    main()
