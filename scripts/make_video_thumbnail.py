#!/usr/bin/env python3
"""Generate a clickable-style video thumbnail with a play-button overlay.

Takes an existing screenshot and composites:
  - a subtle dark gradient/vignette for contrast
  - a large circular play button in the centre
  - a small "WATCH DEMO" pill near the top-left

Output: docs/screenshots/video-thumbnail.png
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

SRC = "docs/screenshots/results-quizzes.png"
OUT = "docs/screenshots/video-thumbnail.png"

base = Image.open(SRC).convert("RGBA")
W, H = base.size

# 1. Dark overlay for contrast so the play button pops.
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
od = ImageDraw.Draw(overlay)
od.rectangle([0, 0, W, H], fill=(10, 12, 30, 90))  # ~35% dark tint
base = Image.alpha_composite(base, overlay)

# 2. Soft radial glow behind the play button.
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy = W // 2, H // 2
glow_r = int(min(W, H) * 0.20)
gd.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r],
           fill=(79, 70, 229, 160))  # indigo glow
glow = glow.filter(ImageFilter.GaussianBlur(60))
base = Image.alpha_composite(base, glow)

# 3. Play button circle.
draw = ImageDraw.Draw(base)
r = int(min(W, H) * 0.105)
# outer translucent ring
draw.ellipse([cx - r - 14, cy - r - 14, cx + r + 14, cy + r + 14],
             fill=(255, 255, 255, 40))
# main circle (indigo)
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(79, 70, 229, 235))
# white triangle (play)
t = int(r * 0.5)
offset = int(r * 0.12)
triangle = [
    (cx - t * 0.55 + offset, cy - t),
    (cx - t * 0.55 + offset, cy + t),
    (cx + t + offset, cy),
]
draw.polygon(triangle, fill=(255, 255, 255, 255))

# 4. "WATCH DEMO" pill (top-left).
def load_font(size):
    for path in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

font = load_font(34)
label = "▶  WATCH DEMO"
pad_x, pad_y = 28, 16
try:
    bbox = draw.textbbox((0, 0), label, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
except Exception:
    tw, th = 220, 34
px, py = 40, 36
draw.rounded_rectangle(
    [px, py, px + tw + pad_x * 2, py + th + pad_y * 2],
    radius=(th + pad_y * 2) // 2,
    fill=(220, 38, 38, 235),  # red pill
)
draw.text((px + pad_x, py + pad_y - 4), label, font=font, fill=(255, 255, 255, 255))

# Flatten to RGB and save.
final = base.convert("RGB")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
final.save(OUT, "PNG", optimize=True)
print(f"Saved {OUT} ({final.size[0]}x{final.size[1]})")
