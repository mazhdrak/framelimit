"""
fix_guide_classes.py
Replaces all broken short CSS class names with the standard classes
that are properly styled in style.css.

Run from repo root:
  python fix_guide_classes.py
"""

import os
import re

root = os.path.dirname(os.path.abspath(__file__))

# Files that use the broken short classes
TARGET_FILES = [
    'guide-best-gaming-laptop-under-1000.html',
    'guide-best-gaming-laptop-under-2000.html',
    'guide-best-14-inch-gaming-laptop-2026.html',
    'guide-best-rtx-5080-gaming-laptop-2026.html',
    'guide-razer-blade-16-vs-legion-pro-7i-2026.html',
    'guide-best-amd-gaming-laptop-2026.html',
    'guide-gaming-laptop-vs-desktop-2026.html',
    'guide-gaming-laptop-cooling-thermals-2026.html',
    'guide-rtx-vs-amd-2026.html',
    'guide-best-gaming-laptop-college-2026.html',
]

# ── class="X" → class="Y" replacements ──────────────────────────
# Order matters: do longer/more specific patterns first
CLASS_REPLACEMENTS = [
    # Pick card outer wrapper
    ('class="pc"',      'class="pick-card"'),
    # Pick card header row
    ('class="pch"',     'class="pick-card-header"'),
    # Pick badge
    ('class="pcb"',     'class="pick-rank-badge"'),
    # Pick laptop name
    ('class="pcn"',     'class="pick-name"'),
    # Pick GPU/spec line
    ('class="pcs"',     'class="pick-gpu"'),
    # Pick score number
    ('class="psc"',     'class="pick-score"'),
    # Pick score label
    ('class="pscl"',    'class="pick-score-label"'),
    # Pick card body
    ('class="pcbd"',    'class="pick-body"'),
    # Specs grid
    ('class="sp"',      'class="pick-specs"'),
    # Individual spec item
    ('class="spi"',     'class="ps"'),
    # Spec label
    ('class="spl"',     'class="ps-label"'),
    # Spec value
    ('class="spv"',     'class="ps-val"'),
    # Pros/cons container
    ('class="ppc"',     'class="pick-pros-cons"'),
    # Pros column
    ('class="pro"',     'class="pros-col"'),
    # Cons column
    ('class="con"',     'class="cons-col"'),
    # Pros/cons label
    ('class="pcl"',     'class="pros-cons-label"'),
    # Pros/cons list
    ('class="pcli"',    'class="pros-cons-list"'),
    # Verdict box
    ('class="verd"',    'class="pick-verdict"'),
    # CTA row
    ('class="ctar"',    'class="pick-cta-row"'),
    # Buy button
    ('class="bb"',      'class="btn-buy am"'),
    # Secondary button
    ('class="bs"',      'class="btn-sec"'),
    # Affiliate note (just hide it — the footer already has disclosure)
    ('class="an2"',     'class="aff-note"'),
    # Ad placeholder
    ('class="ad"',      'class="ad-inline"'),
    # Footer / article footer
    ('class="tf"',      'class="article-footer"'),
]

# ── Inline price removal from buy buttons ────────────────────────
# Strips "Amazon — $X,XXX →" pattern and replaces with clean CTA
# Handles both . and , as decimal/thousand separators
PRICE_PATTERN = re.compile(
    r'(class="btn-buy[^"]*"[^>]*>)\s*(?:Amazon|Best Buy|Check Price)[^<]*?(?:\$[\d,]+[^<]*)?(→|&rarr;)',
    re.IGNORECASE
)

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    changed = False

    # 1. Replace broken class names
    for old, new in CLASS_REPLACEMENTS:
        if old in content:
            content = content.replace(old, new)
            changed = True

    # 2. Fix buy button text — remove inline prices
    # Pattern: any link with btn-buy that has "Amazon — $X,XXX →" text
    def clean_btn(m):
        return m.group(1) + 'Check Price on Amazon \u2192'

    new_content = re.sub(
        r'(?<=class="btn-buy am">)[^<]+(?=</a>)',
        'Check Price on Amazon \u2192',
        content
    )
    if new_content != content:
        content = new_content
        changed = True

    # Also clean secondary button prices
    new_content = re.sub(
        r'(?<=class="btn-sec">)[^<]+(?= →</a>)',
        lambda m: m.group(0).split('—')[0].strip() if '—' in m.group(0) else m.group(0),
        content
    )
    if new_content != content:
        content = new_content
        changed = True

    # 3. Fix avatar SC → RM
    if '>SC<' in content:
        content = content.replace('>SC<', '>RM<')
        changed = True

    # 4. Wrap body content in article-body div if not already wrapped
    # (ensures h2/h3/p get guide page typography)
    if 'class="article-body"' not in content and 'class="pick-card"' in content:
        # Find first h2 after the ameta/qp sections and wrap from there to
        # the continue-reading block
        # Simple approach: wrap the main content block
        content = content.replace(
            '\n  <h2>',
            '\n  <div class="article-body">\n  <h2>',
            1  # only first occurrence
        )
        # Close before the continue-reading block
        content = content.replace(
            '\n  <div style="margin-top:48px',
            '\n  </div>\n\n  <div style="margin-top:48px',
            1
        )
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


fixed = 0
skipped = 0

for filename in TARGET_FILES:
    path = os.path.join(root, filename)
    if not os.path.exists(path):
        print(f'  SKIP (not found): {filename}')
        skipped += 1
        continue

    if fix_file(path):
        print(f'  FIXED: {filename}')
        fixed += 1
    else:
        print(f'  OK (no changes): {filename}')

print()
print(f'Done. {fixed} files updated, {skipped} not found.')
print()
print('Now run:')
print('  git add -A')
print('  git commit -m "fix: standardise CSS classes across all guide pages"')
print('  git push')
