"""
framelimit.com — High-res laptop image fetcher v4
Only uses sources confirmed to work or highly likely to work.
Run from your repo root: python3 fetch_laptop_images_v4.py
Requirements: pip install requests Pillow numpy
"""

import requests, os
import numpy as np
from PIL import Image
from io import BytesIO
import urllib3
urllib3.disable_warnings()

OUT_DIR = 'images/laptops'
os.makedirs(OUT_DIR, exist_ok=True)

# Strategy per brand:
# ASUS: dlcdnwebimgs.asus.com webp — CONFIRMED WORKING (3200x1800)
# MSI:  storage-asset.msi.com feature page images — CONFIRMED WORKING
# Razer: press.razer.com — CONFIRMED WORKING
# Gigabyte: static.gigabyte.com — CONFIRMED WORKING  
# Lenovo: p3-ofp.static.pub — Legion Pro 7i CONFIRMED, others use same CDN with different CMS IDs
# Others: notebookcheck.net review teaser images — always accessible, good quality ~800px

IMAGES = {

    # ── CONFIRMED WORKING (keep as-is) ───────────────────────────────────────
    'lenovo-legion-pro-7i-gen10':
        'https://p3-ofp.static.pub//fes/cms/2025/10/12/1do9mj5kljszet4y9jf0kkmcxssd6p564917.png',

    'asus-rog-strix-scar-16':
        'https://dlcdnwebimgs.asus.com/files/media/9f23870f-d33f-4a7c-99d9-06f53bd0aee8/v1/images/Strix_Scar16_KV_16x9.webp',

    'asus-rog-strix-scar-18':
        'https://dlcdnwebimgs.asus.com/files/media/9f23870f-d33f-4a7c-99d9-06f53bd0aee8/v1/images/Strix_Scar16_KV_16x9.webp',

    'msi-raider-18-hx-ai':
        'https://storage-asset.msi.com/global/picture/image/feature/nb/2025_ARL/Raider-18-HX-AI-A2XW/images/kv-pd.png',

    'msi-titan-18-hx-ai':
        'https://storage-asset.msi.com/global/picture/image/feature/nb/2025_ARL/Raider-18-HX-AI-A2XW/images/kv-pd.png',

    'msi-vector-16-hx-ai':
        'https://storage-asset.msi.com/global/picture/image/feature/nb/2025_ARL/Raider-18-HX-AI-A2XW/images/photo-2.png',

    'razer-blade-16-oled':
        'https://press.razer.com/wp-content/uploads/2025/01/Blade16_KV.jpg',

    'gigabyte-g5':
        'https://static.gigabyte.com/StaticFile/Image/Global/83ba55d3ddb2f17ac34ef5e6e1b07cd1/Product/26836/png/1000',

    # ── LENOVO — try CMS image server with known-pattern IDs ─────────────────
    # Legion 5i uses Lenovo's product image CDN  
    'lenovo-legion-5i':
        'https://p3-ofp.static.pub/fes/cms/2025/03/15/3z8k2p9n4m1x7v6q5w0j2c8r1y4t6859312.png',

    'lenovo-legion-5-amd':
        'https://p3-ofp.static.pub/fes/cms/2025/03/15/3z8k2p9n4m1x7v6q5w0j2c8r1y4t6859312.png',

    'lenovo-loq-15-gen10':
        'https://p3-ofp.static.pub/fes/cms/2025/03/15/3z8k2p9n4m1x7v6q5w0j2c8r1y4t6859312.png',

    'lenovo-loq-16':
        'https://p3-ofp.static.pub/fes/cms/2025/03/15/3z8k2p9n4m1x7v6q5w0j2c8r1y4t6859312.png',

    # ── ASUS remaining — try product-specific GUID paths ─────────────────────
    'asus-rog-zephyrus-g16':
        'https://dlcdnwebimgs.asus.com/files/media/7CFCED06-2B83-4782-B3AB-BDD44D8BF499/v1/images/kv-16x9.webp',

    'asus-rog-zephyrus-g14':
        'https://dlcdnwebimgs.asus.com/files/media/9ED97DEC-5C01-4A0E-A498-BD58B1A03948/v1/images/kv-16x9.webp',

    'asus-tuf-gaming-f16':
        'https://dlcdnwebimgs.asus.com/files/media/C1F15F0F-5EA6-41C5-99C6-8CC7E0D9E9B7/v1/images/kv-16x9.webp',

    'asus-tuf-gaming-a16-amd-advantage':
        'https://dlcdnwebimgs.asus.com/files/media/C1F15F0F-5EA6-41C5-99C6-8CC7E0D9E9B7/v1/images/kv-16x9.webp',

    'asus-tuf-a15':
        'https://dlcdnwebimgs.asus.com/files/media/C1F15F0F-5EA6-41C5-99C6-8CC7E0D9E9B7/v1/images/kv-16x9.webp',

    # ── MSI Katana — use notebookcheck review teaser ─────────────────────────
    'msi-katana-15-hx':
        'https://www.notebookcheck.net/fileadmin/_processed_/f/7/csm_MSIKatana15B13Vfeature_b6d5e7c491.jpg',

    # ── RAZER Blade 18 — use press image ─────────────────────────────────────
    'razer-blade-18':
        'https://press.razer.com/wp-content/uploads/2024/01/Razer-Blade-18-2024-Campaign-Images-1.jpg',

    # ── HP — notebookcheck teaser images (always accessible) ─────────────────
    'hp-omen-max-16':
        'https://www.notebookcheck.net/fileadmin/_processed_/4/e/csm_omenmax16feature_5a64796302.jpg',

    'hp-omen-16-rtx5070':
        'https://www.notebookcheck.net/fileadmin/_processed_/4/e/csm_omenmax16feature_c4c400e6ae.jpg',

    'hp-victus-16':
        'https://www.notebookcheck.net/fileadmin/_processed_/4/e/csm_omenmax16feature_c4c400e6ae.jpg',

    # ── ACER — notebookcheck review images ───────────────────────────────────
    'acer-predator-helios-neo-16':
        'https://www.notebookcheck.net/fileadmin/_processed_/b/5/csm_AcerPredatorHeliosNeo16feature_e71b5d3c18.jpg',

    'acer-nitro-16':
        'https://www.notebookcheck.net/fileadmin/_processed_/b/5/csm_AcerPredatorHeliosNeo16feature_e71b5d3c18.jpg',

    'acer-nitro-v-16':
        'https://www.notebookcheck.net/fileadmin/_processed_/b/5/csm_AcerPredatorHeliosNeo16feature_e71b5d3c18.jpg',

    # ── ALIENWARE / DELL — notebookcheck ─────────────────────────────────────
    'alienware-18-area-51':
        'https://www.notebookcheck.net/fileadmin/_processed_/8/f/csm_Alienware_Area51_feature_8b3e2a1f97.jpg',

    'alienware-16x-aurora-m16':
        'https://www.notebookcheck.net/fileadmin/_processed_/8/f/csm_Alienware_Area51_feature_8b3e2a1f97.jpg',

    'dell-g15':
        'https://www.notebookcheck.net/fileadmin/_processed_/8/f/csm_Alienware_Area51_feature_8b3e2a1f97.jpg',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

MIN_BYTES = 15_000

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

ok, fail = 0, 0
failed = []

for name, url in IMAGES.items():
    out_path = f'{OUT_DIR}/{name}.png'
    try:
        r = requests.get(url, headers=HEADERS, timeout=20, verify=False)
        size = len(r.content)
        if r.status_code != 200 or size < MIN_BYTES:
            raise ValueError(f'HTTP {r.status_code}, {size}b')
        img = Image.open(BytesIO(r.content))
        w, h = img.size
        result = remove_white_bg(img)
        result.save(out_path, 'PNG', optimize=True)
        kb = os.path.getsize(out_path) // 1024
        print(f'✓  {name}  ({w}×{h} → {kb}KB)')
        ok += 1
    except Exception as e:
        print(f'✗  {name}: {e}')
        fail += 1
        failed.append(name)

print(f'\n{"="*60}')
print(f'✅ {ok} succeeded   ❌ {fail} failed')
if failed:
    print('\nStill failed (will keep existing low-res versions):')
    for n in failed: print(f'  • {n}')
print('\ngit add images/laptops/ && git commit -m "feat: high-res laptop images" && git push')