"""
fix_prices_nav.py
Fixes:
  1. Removes ~$price line from pick cards in index.html
  2. Removes Deals nav button from all guide/review HTML pages
  3. Fixes avatar initials JK -> RM on all pages

Run from repo root:
  python fix_prices_nav.py
"""

import os
import re

root = os.path.dirname(os.path.abspath(__file__))

# ══════════════════════════════════════════
# FIX 1 - Remove price from pick cards in index.html
# ══════════════════════════════════════════
index_path = os.path.join(root, 'index.html')
if os.path.exists(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Remove the pick-price div which contains ~$X,XXX · Amazon →
    content = re.sub(r'<div class="pick-price">.*?</div>', '', content, flags=re.DOTALL)

    if content != original:
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('  FIX 1: price removed from pick cards in index.html')
    else:
        print('  FIX 1: pick-price div not found in index.html (may already be removed)')
else:
    print('  SKIP: index.html not found')

# ══════════════════════════════════════════
# FIX 2 + 3 - All other HTML files
# ══════════════════════════════════════════
all_html = [f for f in os.listdir(root) if f.endswith('.html') and f != 'index.html']

deals_removed = 0
avatars_fixed = 0

for filename in sorted(all_html):
    path = os.path.join(root, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changed = False

    # FIX 2: Remove Deals nav-cta button
    new_content = re.sub(
        r'\s*<a\s+href="index\.html#deals-section"\s+class="nav-cta"[^>]*>.*?</a>',
        '',
        content,
        flags=re.DOTALL
    )
    if new_content != content:
        content = new_content
        changed = True
        deals_removed += 1
        print(f'  FIX 2: Deals button removed from {filename}')

    # FIX 3: Fix avatar initials JK -> RM
    if '>JK<' in content:
        content = content.replace('>JK<', '>RM<')
        changed = True
        avatars_fixed += 1
        print(f'  FIX 3: Avatar JK->RM fixed in {filename}')

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

print()
print(f'Done.')
print(f'  Deals buttons removed: {deals_removed} files')
print(f'  Avatar initials fixed: {avatars_fixed} files')
print()
print('Now run:')
print('  git add -A')
print('  git commit -m "fix: remove prices from pick cards, deals nav sitewide, avatar initials"')
print('  git push')
