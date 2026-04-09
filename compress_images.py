"""
framelimit.com — Laptop image compression
Resizes all PNGs in images/laptops/ to max 800px wide and converts to WebP.
Also updates all imgUrl references in laptops.js from .png to .webp

Run from repo root:
  python compress_images.py

Requirements: pip install Pillow
"""

import os
import json
from PIL import Image

IMG_DIR  = 'images/laptops'
MAX_W    = 800
QUALITY  = 88   # WebP quality — 88 is visually lossless for product shots

ok = 0
skipped = 0
saved_kb = 0
failed = []

print(f"Scanning {IMG_DIR}/ ...\n")

pngs = [f for f in os.listdir(IMG_DIR) if f.lower().endswith('.png')]
print(f"Found {len(pngs)} PNG files\n")

for fname in sorted(pngs):
    src_path  = os.path.join(IMG_DIR, fname)
    stem      = os.path.splitext(fname)[0]
    webp_path = os.path.join(IMG_DIR, stem + '.webp')

    src_kb = os.path.getsize(src_path) // 1024

    try:
        img = Image.open(src_path).convert('RGBA')
        w, h = img.size

        # Resize if wider than MAX_W
        if w > MAX_W:
            ratio   = MAX_W / w
            new_h   = int(h * ratio)
            img     = img.resize((MAX_W, new_h), Image.LANCZOS)
            resized = True
        else:
            resized = False

        img.save(webp_path, 'WEBP', quality=QUALITY, method=6)
        webp_kb = os.path.getsize(webp_path) // 1024
        delta   = src_kb - webp_kb
        saved_kb += delta

        resize_note = f" (resized {w}px -> {MAX_W}px)" if resized else f" (kept {w}px)"
        print(f"  OK  {fname}")
        print(f"      {src_kb}KB PNG -> {webp_kb}KB WebP  (-{delta}KB){resize_note}")
        ok += 1

    except Exception as e:
        print(f"  FAIL  {fname}: {e}")
        failed.append(fname)

# ── Update laptops.js ──────────────────────────────────────────────
js_path = 'laptops.js'
if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    original = js
    js = js.replace("images/laptops/", "images/laptops/")   # no-op, keep path
    # Replace .png extension with .webp in imgUrl values only
    import re
    js = re.sub(
        r"(imgUrl:\s*'images/laptops/[^']+)\.png(')",
        r"\1.webp\2",
        js
    )

    if js != original:
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js)
        print(f"\n  laptops.js  — updated all imgUrl .png -> .webp")
    else:
        print(f"\n  laptops.js  — no changes needed (already .webp or no matches)")
else:
    print(f"\n  WARNING: laptops.js not found, skipping URL update")

# ── Summary ───────────────────────────────────────────────────────
print(f"\n{'='*56}")
print(f"  {ok} images converted   {len(failed)} failed")
print(f"  Total saved: ~{saved_kb}KB ({saved_kb // 1024}MB)")
if failed:
    print(f"\n  Failed files:")
    for f in failed:
        print(f"    - {f}")

print(f"""
Next steps:
  1. Test locally — open index.html and check images still load
  2. Optionally delete the old .png files once you've verified WebP works:
       (PowerShell) Get-ChildItem images\\laptops\\*.png | Remove-Item
  3. Push:
       git add images/laptops/ laptops.js
       git commit -m "perf: compress laptop images to WebP, max 800px wide"
       git push
""")
