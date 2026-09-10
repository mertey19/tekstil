"""Siliver Silen logo generator.

Builds public/icon.svg (full lockup) and public/icon-mark.svg (emblem only) as
plain SVG 1.1 with outlined lettering, so the files open standalone in
CorelDRAW / Illustrator without any font dependency.

All geometry is emitted in absolute canvas coordinates (no group transforms on
painted shapes) so the userSpaceOnUse gold gradients stay continuous instead of
restarting per letter. Each swirl blade gets its own gradient running across the
blade so the ring reads as rim-lit metal rather than one flat diagonal wash.

Run:  python scripts/generate-logo.py
Then: node scripts/generate-icons.mjs   (rasters + favicon.ico)
"""

from __future__ import annotations

import math
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import ControlBoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

FONT_HEAVY = Path(r"C:\Windows\Fonts\seguibl.ttf")   # Segoe UI Black
FONT_MED = Path(r"C:\Windows\Fonts\seguisb.ttf")     # Segoe UI Semibold

MINT_TOP = "#CDEEDB"
MINT_BOTTOM = "#9FD8B9"
SHADOW = "#28553E"
KEYLINE = "#54330C"

# outer rim -> core -> inner bounce light: reads as a polished gold tube
TUBE = [
    (0.00, "#FCF3CE"),
    (0.14, "#EFCE72"),
    (0.34, "#D3A238"),
    (0.60, "#9A6518"),
    (0.82, "#71460F"),
    (1.00, "#C89530"),
]

# top-lit gold for letterforms
LETTER = [
    (0.00, "#FFF6D3"),
    (0.18, "#F0CE6C"),
    (0.42, "#C68C20"),
    (0.52, "#9A6716"),
    (0.80, "#E9C463"),
    (1.00, "#7E4C0D"),
]


# --------------------------------------------------------------------------
# type outlines
# --------------------------------------------------------------------------
_font_cache: dict[Path, TTFont] = {}


def _font(path: Path) -> TTFont:
    if path not in _font_cache:
        _font_cache[path] = TTFont(str(path), fontNumber=0, lazy=True)
    return _font_cache[path]


def _draw_text(font_path, text, size, tracking, ox, oy, pens):
    font = _font(font_path)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    scale = size / font["head"].unitsPerEm
    cursor = ox
    for char in text:
        name = cmap[ord(char)]
        matrix = Transform(scale, 0, 0, -scale, cursor, oy)
        for pen in pens:
            glyphs[name].draw(TransformPen(pen, matrix))
        cursor += hmtx[name][0] * scale + tracking


def text_bounds(font_path, text, size, tracking=0.0, ox=0.0, oy=0.0):
    pen = ControlBoundsPen(_font(font_path).getGlyphSet())
    _draw_text(font_path, text, size, tracking, ox, oy, [pen])
    return pen.bounds


def text_path(font_path, text, size, tracking, cx, baseline):
    """Outlined text, horizontally centred on `cx`, baseline at `baseline`."""
    x0, _, x1, _ = text_bounds(font_path, text, size, tracking)
    pen = SVGPathPen(_font(font_path).getGlyphSet(), ntos=lambda v: f"{v:.2f}")
    _draw_text(font_path, text, size, tracking, cx - (x0 + x1) / 2, baseline, [pen])
    return pen.getCommands()


def fit_tracking(font_path, text, size, target_width):
    """Letterspacing that stretches the inked width of `text` to `target_width`."""
    x0, _, x1, _ = text_bounds(font_path, text, size)
    return (target_width - (x1 - x0)) / max(len(text) - 1, 1)


# --------------------------------------------------------------------------
# svg helpers
# --------------------------------------------------------------------------
def linear_gradient(gid, p1, p2, stops):
    body = "".join(
        f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops
    )
    return (
        f'    <linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="{p1[0]:.2f}" y1="{p1[1]:.2f}" x2="{p2[0]:.2f}" y2="{p2[1]:.2f}">'
        f"{body}</linearGradient>"
    )


def _smooth(points):
    """Catmull-Rom through an open point list -> cubic bezier commands."""
    out = []
    n = len(points)
    for i in range(n - 1):
        p0 = points[max(i - 1, 0)]
        p1 = points[i]
        p2 = points[i + 1]
        p3 = points[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append(
            f"C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}"
        )
    return "".join(out)


# --------------------------------------------------------------------------
# emblem
# --------------------------------------------------------------------------
BLADES = 3
SWEEP = 126.0
START = -104.0


def _blade_path(cx, cy, start_deg, r_outer, width, spiral, sweep=SWEEP, steps=20):
    outer, inner = [], []
    for i in range(steps + 1):
        t = i / steps
        ang = math.radians(start_deg + sweep * t)
        r_mid = r_outer - spiral * t
        w = width * math.sin(math.pi * t) ** 0.58
        ca, sa = math.cos(ang), math.sin(ang)
        outer.append((cx + (r_mid + w / 2) * ca, cy + (r_mid + w / 2) * sa))
        inner.append((cx + (r_mid - w / 2) * ca, cy + (r_mid - w / 2) * sa))
    d = (
        f"M{outer[0][0]:.2f} {outer[0][1]:.2f}"
        + _smooth(outer)
        + _smooth(inner[::-1])
        + "Z"
    )
    # gradient axis: across the blade at its widest point, outer edge -> inner
    ang = math.radians(start_deg + sweep * 0.5)
    ca, sa = math.cos(ang), math.sin(ang)
    r_mid = r_outer - spiral * 0.5
    p1 = (cx + (r_mid + width * 0.60) * ca, cy + (r_mid + width * 0.60) * sa)
    p2 = (cx + (r_mid - width * 0.62) * ca, cy + (r_mid - width * 0.62) * sa)
    return d, p1, p2


def emblem(cx, cy, radius, prefix, blade_width=27.0, s_height=112.0, sweep=SWEEP):
    """Returns (list of (path_d, fill), list of gradient defs)."""
    k = radius / 100.0
    shapes, grads = [], []
    for i in range(BLADES):
        d, p1, p2 = _blade_path(
            cx, cy, START + i * (360 / BLADES), 96 * k, blade_width * k, 20 * k, sweep=sweep
        )
        gid = f"{prefix}Blade{i}"
        grads.append(linear_gradient(gid, p1, p2, TUBE))
        shapes.append((d, f"url(#{gid})"))

    # the S, optically centred in the ring
    x0, y0, x1, y1 = text_bounds(FONT_HEAVY, "S", 100)
    scale = (s_height * k) / (y1 - y0)
    ox = cx - (x0 + x1) / 2 * scale
    oy = cy - (y0 + y1) / 2 * scale
    pen = SVGPathPen(_font(FONT_HEAVY).getGlyphSet(), ntos=lambda v: f"{v:.2f}")
    _draw_text(FONT_HEAVY, "S", 100 * scale, 0, ox, oy, [pen])
    sx0, sy0, sx1, sy1 = text_bounds(FONT_HEAVY, "S", 100 * scale, 0, ox, oy)
    gid = f"{prefix}S"
    grads.append(linear_gradient(gid, (sx0, sy0), (sx0, sy1), LETTER))
    shapes.append((pen.getCommands(), f"url(#{gid})"))
    return shapes, grads


# --------------------------------------------------------------------------
# assembly
# --------------------------------------------------------------------------
def paint(shapes, dx, dy, stroke_w, sheen_id=None):
    """Offset shadow + gradient body with keyline + optional top sheen."""
    body = "".join(f'<path d="{d}" fill="{f}"/>' for d, f in shapes)
    flat = "".join(f'<path d="{d}"/>' for d, _ in shapes)
    out = (
        f'  <g transform="translate({dx} {dy})" fill="{SHADOW}" opacity="0.22">{flat}</g>\n'
        f'  <g stroke="{KEYLINE}" stroke-width="{stroke_w}" stroke-linejoin="round" '
        f'stroke-opacity="0.85">{body}</g>\n'
    )
    if sheen_id:
        out += f'  <g fill="url(#{sheen_id})">{flat}</g>\n'
    return out


def sheen(gid, top, bottom, strength=0.34):
    return (
        f'    <linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="0" y1="{top:.1f}" x2="0" y2="{bottom:.1f}">'
        f'<stop offset="0" stop-color="#FFFFFF" stop-opacity="{strength}"/>'
        f'<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="{strength * 0.15:.2f}"/>'
        '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>'
        "</linearGradient>"
    )


def document(size, label, grads, body):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {size} {size}" version="1.1" role="img" aria-label="{label}">\n'
        f"  <title>{label}</title>\n"
        "  <defs>\n"
        f'    <linearGradient id="mint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="{size}">'
        f'<stop offset="0" stop-color="{MINT_TOP}"/>'
        f'<stop offset="1" stop-color="{MINT_BOTTOM}"/></linearGradient>\n'
        + "\n".join(grads)
        + "\n  </defs>\n"
        f'  <rect width="{size}" height="{size}" fill="url(#mint)"/>\n'
        + body
        + "</svg>\n"
    )


def build_lockup():
    size = 512
    cx, cy, r = 256.0, 168.0, 118.0

    big_size, big_track, big_baseline = 130.0, 1.0, 460.0
    bx0, _, bx1, _ = text_bounds(FONT_HEAVY, "Silen", big_size, big_track)
    big_width = bx1 - bx0

    small_size, small_baseline = 54.0, 352.0
    small_track = fit_tracking(FONT_MED, "Siliver", small_size, big_width * 0.66)

    mark_shapes, grads = emblem(cx, cy, r, "m")

    small_d = text_path(FONT_MED, "Siliver", small_size, small_track, cx, small_baseline)
    big_d = text_path(FONT_HEAVY, "Silen", big_size, big_track, cx, big_baseline)
    sx0, sy0, sx1, sy1 = text_bounds(FONT_MED, "Siliver", small_size, small_track, 0, small_baseline)
    lx0, ly0, lx1, ly1 = text_bounds(FONT_HEAVY, "Silen", big_size, big_track, 0, big_baseline)

    grads += [
        linear_gradient("smallGold", (0, sy0), (0, sy1), LETTER),
        linear_gradient("bigGold", (0, ly0), (0, ly1), LETTER),
        sheen("sheenSmall", sy0, sy1),
        sheen("sheenBig", ly0, ly1),
        sheen("sheenMark", cy - r, cy + r * 0.5),
    ]

    body = (
        paint(mark_shapes, 3, 5, 2.0, "sheenMark")
        + paint([(small_d, "url(#smallGold)")], 2, 3, 1.3, "sheenSmall")
        + paint([(big_d, "url(#bigGold)")], 3, 4, 1.9, "sheenBig")
    )
    return document(size, "Siliver Silen", grads, body)


def build_mark():
    """Emblem-only square used for the 16-48 px icons, where a wordmark is
    unreadable: chunkier blades, larger S, tighter ring gaps."""
    size = 512
    cx = cy = 256.0
    r = 224.0
    shapes, grads = emblem(cx, cy, r, "m", blade_width=31.0, s_height=124.0, sweep=138.0)
    grads.append(sheen("sheenMark", cy - r, cy + r * 0.5, 0.22))
    body = paint(shapes, 4, 7, 3.2, "sheenMark")
    return document(size, "Siliver Silen", grads, body)


def main():
    (PUBLIC / "icon.svg").write_text(build_lockup(), encoding="utf-8")
    (PUBLIC / "icon-mark.svg").write_text(build_mark(), encoding="utf-8")
    print("wrote public/icon.svg and public/icon-mark.svg")


if __name__ == "__main__":
    main()
