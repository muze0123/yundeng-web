#!/usr/bin/env python3
"""Apply irreversible pixelation to sensitive fields in onboarding screenshots.

The screenshots are prototype references, not production data exports.  Keep the
redaction coordinates here so an asset refresh can be repeated and reviewed.
Coordinates are normalized (left, top, right, bottom) against each image.
"""

from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src" / "assets" / "新手引导"

# The masked boxes contain environment names, account labels, proxy endpoints,
# and selected environment metadata.  Coordinates are deliberately tight so the
# instructional UI remains readable while the original glyphs are destroyed.
MASKS: dict[str, tuple[tuple[float, float, float, float], ...]] = {
    "create_enter.png": ((0.84, 0.02, 1.00, 0.96),),
    "environment_locate.png": (
        (0.15, 0.12, 0.27, 0.94),  # environment names
        (0.34, 0.22, 0.46, 0.96),  # proxy IPs and locations
    ),
    "environment_starting.png": (
        (0.15, 0.10, 0.27, 0.94),
        (0.34, 0.20, 0.46, 0.96),
    ),
    "proxy_bind_target.png": (
        (0.15, 0.08, 0.27, 0.96),
        (0.34, 0.08, 0.46, 0.96),
    ),
    "proxy_bind_select.png": (
        (0.12, 0.34, 0.30, 0.66),  # background environment names
        (0.30, 0.36, 0.49, 0.56),  # selected proxy and table names
        (0.38, 0.51, 0.48, 0.74),  # proxy endpoints
        (0.34, 0.96, 0.44, 1.00),  # background environment IP
    ),
    "proxy_bind_save.png": (
        (0.15, 0.41, 0.27, 0.57),  # environment names
        (0.31, 0.46, 0.50, 0.76),  # selected proxy and endpoints
        (0.36, 0.96, 0.46, 1.00),  # background environment IP
    ),
    "environment_running.png": (
        (0.27, 0.00, 0.40, 0.16),  # background environment name
        (0.37, 0.00, 0.72, 0.10),  # top metadata, including environment name
        (0.43, 0.14, 0.59, 0.28),  # public IP and location
        (0.29, 0.47, 0.68, 0.57),  # account URL, account name, environment metadata
    ),
}


def redact(image: Image.Image, normalized_box: tuple[float, float, float, float]) -> None:
    width, height = image.size
    left, top, right, bottom = normalized_box
    box = (
        max(0, round(left * width)),
        max(0, round(top * height)),
        min(width, round(right * width)),
        min(height, round(bottom * height)),
    )
    crop = image.crop(box)
    if crop.width < 2 or crop.height < 2:
        return
    # Downsampling followed by nearest-neighbour scaling destroys glyph shapes;
    # the small blur removes residual edges without adding a visible overlay.
    reduced = crop.resize((max(1, crop.width // 18), max(1, crop.height // 18)), Image.Resampling.BOX)
    pixelated = reduced.resize(crop.size, Image.Resampling.NEAREST).filter(ImageFilter.GaussianBlur(radius=2.5))
    image.paste(pixelated, box)


def main() -> int:
    missing = [name for name in MASKS if not (ASSET_DIR / name).is_file()]
    if missing:
        print(f"missing onboarding assets: {', '.join(missing)}", file=sys.stderr)
        return 1

    for name, boxes in MASKS.items():
        path = ASSET_DIR / name
        with Image.open(path) as source:
            image = source.convert("RGBA")
            for box in boxes:
                redact(image, box)
            image.save(path, format="PNG", optimize=True)
        print(f"sanitized {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
