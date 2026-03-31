"""
framelimit.com — Rename + process all 30 laptop images
Run from your repo root: python rename_and_process.py
Requirements: pip install Pillow numpy
"""

import os, shutil
import numpy as np
from PIL import Image

IN_DIR  = 'images/laptops/new'
OUT_DIR = 'images/laptops'
os.makedirs(OUT_DIR, exist_ok=True)

# Map: exact filename in new/ → target name (no extension, output will be .png)
RENAME_MAP = {
    'Acer Nitro 16.png':                        'acer-nitro-16',
    'Acer Nitro V 16.png':                      'acer-nitro-v-16',
    'Acer Predator Helios Neo 16.png':          'acer-predator-helios-neo-16',
    'Alienware 16X Aurora.png':                 'alienware-16x-aurora-m16',
    'Alienware 18 Area-51.webp':                'alienware-18-area-51',
    'ASUS ROG Strix SCAR 16.png':               'asus-rog-strix-scar-16',
    'ASUS ROG Strix SCAR 18.png':               'asus-rog-strix-scar-18',
    'ASUS ROG Zephyrus G14.png':                'asus-rog-zephyrus-g14',
    'ASUS ROG Zephyrus G16 (High-End config).png':   'asus-rog-zephyrus-g16',
    'ASUS ROG Zephyrus G16 (Mid-range config).png':  'asus-rog-zephyrus-g16',  # same target, will overwrite with last one
    'ASUS TUF A15.png':                         'asus-tuf-a15',
    'ASUS TUF A16 (Entry config).png':          'asus-tuf-gaming-a16-amd-advantage',
    'ASUS TUF Gaming A16 (AMD Advantage).png':  'asus-tuf-gaming-a16-amd-advantage',
    'ASUS TUF Gaming F16.png':                  'asus-tuf-gaming-f16',
    'Dell G15.webp':                            'dell-g15',
    'Gigabyte G6 G5.png':                       'gigabyte-g5',
    'HP Omen 16 (RTX 5070 config).webp':        'hp-omen-16-rtx5070',
    'HP Omen Max 16.png':                       'hp-omen-max-16',
    'HP Victus 16.png':                         'hp-victus-16',
    'Lenovo Legion 5 (AMD).png':                'lenovo-legion-5-amd',
    'Lenovo Legion 5i.png':                     'lenovo-legion-5i',
    'Lenovo Legion Pro 7i Gen 10.png':          'lenovo-legion-pro-7i-gen10',
    'Lenovo LOQ 15 Gen 10.png':                 'lenovo-loq-15-gen10',
    'Lenovo LOQ 16.png':                        'lenovo-loq-16',
    'MSI Katana 15 HX.png':                     'msi-katana-15-hx',
    'MSI Raider 18 HX AI.png':                  'msi-raider-18-hx-ai',
    'MSI Titan 18 HX AI.webp':                  'msi-titan-18-hx-ai',
    'MSI Vector 16 HX AI.png':                  'msi-vector-16-hx-ai',
    'Razer Blade 16 OLED.png':                  'razer-blade-16-oled',
    'Razer Blade 18.png':                       'razer-blade-18',
}

def is_already_transparent(img):
    if img.mode != 'RGBA':
        return False
    arr = np.array(img)
    transparent = (arr[:,:,3] < 128).sum()
    total = arr.shape[0] * arr.shape[1]
    return transparent / total > 0.05

def remove_white_bg(img):
    img = img.convert('RGBA')
    data = np.array(img, dtype=np.float32)
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    brightness = (r + g + b) / 3.0
    max_ch = np.maximum(np.maximum(r, g), b)
    min_ch = np.minimum(np.minimum(r, g), b)
    saturation = (max_ch - min_ch) / (max_ch + 1e-6)
    whiteness = np.clip((brightness - 175) / 80.0, 0, 1)
    low_sat   = np.clip(1.0 - saturation * 5, 0, 1)
    alpha = np.clip(1.0 - whiteness * low_sat, 0, 1)
    data[:,:,3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(data.astype(np.uint8), 'RGBA')

ok, fail, skipped = 0, 0, []

# Check for files not in map
actual_files = set(os.listdir(IN_DIR))
mapped_files = set(RENAME_MAP.keys())
unmapped = actual_files - mapped_files - {'desktop.ini', '.DS_Store'}
if unmapped:
    print(f"⚠️  Unmapped files (will be skipped): {unmapped}\n")

for src_name, target_stem in RENAME_MAP.items():
    src_path = f'{IN_DIR}/{src_name}'
    out_path = f'{OUT_DIR}/{target_stem}.png'

    if not os.path.exists(src_path):
        print(f'⚠️  NOT FOUND: {src_name}')
        skipped.append(src_name)
        continue

    try:
        img = Image.open(src_path)
        w, h = img.size

        if is_already_transparent(img):
            result = img.convert('RGBA')
            mode = 'transparent'
        else:
            result = remove_white_bg(img)
            mode = 'bg removed'

        result.save(out_path, 'PNG', optimize=True)
        kb = os.path.getsize(out_path) // 1024
        print(f'✓  {target_stem}.png  ({w}×{h}, {kb}KB) [{mode}]')
        ok += 1

    except Exception as e:
        print(f'✗  {src_name} → {target_stem}: {e}')
        fail += 1

print(f'\n{"="*60}')
print(f'✅ {ok} processed   ❌ {fail} failed   ⚠️  {len(skipped)} not found')
print(f'\nNow update laptops.js — all images should use .png extension.')
print(f'Run: git add images/laptops/ && git commit -m "feat: all 30 laptop images" && git push')
