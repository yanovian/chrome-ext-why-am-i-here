#!/usr/bin/env python3
"""Generate extension icons — large sharp vector ? on teal gradient."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "public" / "icon"
ASSETS_DIR = ROOT / "assets"

MASTER = 1024

TEAL_LIGHT = (45, 212, 191)
TEAL_MID = (20, 184, 166)
TEAL_DARK = (15, 118, 110)
WHITE = (255, 255, 255, 255)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def blend(c1: tuple[int, ...], c2: tuple[int, ...], t: float) -> tuple[int, int, int]:
    return (
        lerp(c1[0], c2[0], t),
        lerp(c1[1], c2[1], t),
        lerp(c1[2], c2[2], t),
    )


def rounded_gradient(size: int, box: tuple[int, int, int, int], radius: int) -> Image.Image:
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    h = max(y1 - y0, 1)

    for y in range(y0, y1 + 1):
        t = (y - y0) / h
        if t < 0.45:
            color = blend(TEAL_LIGHT, TEAL_MID, t / 0.45)
        else:
            color = blend(TEAL_MID, TEAL_DARK, (t - 0.45) / 0.55)
        draw.line([(x0, y), (x1, y)], fill=(*color, 255))

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=radius, fill=255)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(layer, mask=mask)
    return out, mask


def draw_sharp_question_mark(draw: ImageDraw.ImageDraw, size: int) -> None:
    """Bold geometric ? — fills most of the canvas."""
    s = float(size)
    stroke = max(2.5, s * 0.135)
    cx = s * 0.5

    hook_pad_x = s * 0.10
    hook_pad_y = s * 0.08
    hook_box = (
        hook_pad_x,
        hook_pad_y,
        s - hook_pad_x,
        s * 0.60,
    )
    draw.arc(
        hook_box,
        start=108,
        end=348,
        fill=WHITE,
        width=max(2, int(round(stroke))),
    )

    stem_w = stroke
    stem_top = s * 0.46
    stem_bottom = s * 0.64
    draw.rounded_rectangle(
        (
            cx - stem_w / 2,
            stem_top,
            cx + stem_w / 2,
            stem_bottom,
        ),
        radius=max(1, int(stem_w / 2)),
        fill=WHITE,
    )

    dot_r = stroke * 0.95
    dot_cy = s * 0.795
    draw.ellipse(
        (
            cx - dot_r,
            dot_cy - dot_r,
            cx + dot_r,
            dot_cy + dot_r,
        ),
        fill=WHITE,
    )


def draw_background(size: int, *, flat: bool = False) -> Image.Image:
    if flat and size <= 64:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        radius = max(3, size // 5)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=TEAL_MID)
        draw.line([(2, 2), (size - 3, 2)], fill=TEAL_LIGHT, width=max(1, size // 16))
        return img

    inset = max(1, size // 20)
    radius = max(3, int(size // 4.5))
    box = (inset, inset, size - inset - 1, size - inset - 1)

    img, mask = rounded_gradient(size, box, radius)

    shine = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shine)
    shine_box = (
        box[0] + max(1, size // 50),
        box[1] + max(1, size // 50),
        box[2] - max(1, size // 50),
        box[1] + int((box[3] - box[1]) * 0.4),
    )
    sdraw.rounded_rectangle(
        shine_box,
        radius=max(2, int(radius * 0.9)),
        fill=(255, 255, 255, 34),
    )
    return Image.alpha_composite(
        img,
        Image.composite(shine, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask),
    )


def make_icon(size: int, *, flat: bool = False) -> Image.Image:
    img = draw_background(size, flat=flat)
    draw = ImageDraw.Draw(img)
    draw_sharp_question_mark(draw, size)
    return img


def make_master() -> Image.Image:
    return make_icon(MASTER)


def export_icon(master: Image.Image, size: int) -> Image.Image:
    if size == 16:
        return make_icon(64, flat=True).resize((16, 16), Image.Resampling.NEAREST)
    return master.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    master = make_master()

    for icon_size in (16, 32, 48, 128):
        path = ICON_DIR / f"{icon_size}.png"
        export_icon(master, icon_size).save(path, "PNG", optimize=True)
        print(f"wrote {path}")

    export_icon(master, 128).save(ASSETS_DIR / "logo.png", "PNG", optimize=True)
    print(f"wrote {ASSETS_DIR / 'logo.png'}")


if __name__ == "__main__":
    main()
