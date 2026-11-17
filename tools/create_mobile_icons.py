import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    img = Image.new("RGBA", (size, size), (10, 12, 16, 255))
    draw = ImageDraw.Draw(img)

    # 1. Subtle gold outer border
    pad = int(size * 0.05)
    corner_radius = int(size * 0.22)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=corner_radius, outline=(212, 175, 55, 200), width=max(2, int(size * 0.015)), fill=(14, 18, 26, 255))

    # 2. Golden circular emblem
    center = size // 2
    r = int(size * 0.36)
    draw.ellipse([center - r, center - r, center + r, center + r], outline=(212, 175, 55, 255), width=max(2, int(size * 0.018)), fill=(20, 24, 34, 255))
    
    # Inner ring
    r_in = int(size * 0.33)
    draw.ellipse([center - r_in, center - r_in, center + r_in, center + r_in], outline=(212, 175, 55, 120), width=max(1, int(size * 0.008)))

    # 3. Draw Stylized Royal Horse Crown / Silhouette in center
    # Crown points
    cy = center - int(size * 0.08)
    crown_w = int(size * 0.22)
    crown_h = int(size * 0.14)
    pts = [
        (center - crown_w, cy + crown_h),
        (center - crown_w, cy),
        (center - crown_w // 2, cy + crown_h // 2),
        (center, cy - int(size * 0.05)),
        (center + crown_w // 2, cy + crown_h // 2),
        (center + crown_w, cy),
        (center + crown_w, cy + crown_h),
    ]
    draw.polygon(pts, fill=(212, 175, 55, 255))

    # Lightning bolt in center
    ly = center + int(size * 0.08)
    lw = int(size * 0.08)
    lh = int(size * 0.16)
    bolt = [
        (center - lw // 3, ly - lh // 2),
        (center + lw, ly - lh // 2),
        (center - lw // 4, ly),
        (center + lw // 2, ly),
        (center - lw, ly + lh // 2),
        (center, ly + lh // 6),
        (center - lw // 2, ly + lh // 6)
    ]
    draw.polygon(bolt, fill=(252, 246, 186, 255))

    # Star accents on crown tips
    star_r = max(2, int(size * 0.02))
    for sx, sy in [(center - crown_w, cy), (center, cy - int(size * 0.05)), (center + crown_w, cy)]:
        draw.ellipse([sx - star_r, sy - star_r, sx + star_r, sy + star_r], fill=(255, 255, 255, 255))

    # Save
    out_path = os.path.join(r"C:\Users\DELL\Desktop\.claude\public\icons", filename)
    img.save(out_path, "PNG")
    print(f"Generated {out_path} ({size}x{size})")

os.makedirs(r"C:\Users\DELL\Desktop\.claude\public\icons", exist_ok=True)
create_icon(192, "icon-192.png")
create_icon(512, "icon-512.png")
create_icon(180, "apple-touch-icon.png")
create_icon(64, "favicon.png")
