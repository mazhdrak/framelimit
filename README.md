# FRAMELIMIT.com

Independent gaming laptop reviews and affiliate site. RTX 50 series focused. Built and operated by Rumen Mazhdrakov, based in Sofia.

## Stack

- Pure HTML / CSS / JS — no framework, no build tools
- Hosted on **Cloudflare Pages** — auto-deploys on push to `main`
- Source: `github.com/mazhdrak/framelimit`
- Amazon Associates tag: `framelimit20-20`

## Deploy

```bash
git add -A
git commit -m "your message"
git push
# Live in ~30 seconds via Cloudflare Pages
```

## File Structure

```
index.html                          # Homepage (only homepage)
style.css                           # Shared stylesheet — all pages
reviews.html                        # Full reviews page
about.html
contact.html
affiliate-disclosure.html
sitemap.xml
robots.txt
_redirects                          # Cloudflare Pages redirect rules
favicon.ico
og-default.jpg                      # OG social share image (1200×630)

laptops.js                          # Single source of truth — all 30 laptop specs
laptop-cards.js                     # Renders data-fl-* DOM attributes from laptops.js
reviews-sync.js                     # Injects live spec data into review cards

images/
  laptops/                          # WebP laptop images, max 800px wide

guide-best-gaming-laptops-2026.html
guide-gaming-laptop-buying-guide-2026.html
guide-best-gaming-laptop-under-1000.html
guide-best-gaming-laptop-under-1500.html
guide-best-gaming-laptop-under-2000.html
guide-best-gaming-laptop-college-2026.html
guide-best-thin-light-gaming-laptop-2026.html
guide-best-amd-gaming-laptop-2026.html
guide-best-rtx-5080-gaming-laptop-2026.html
guide-best-14-inch-gaming-laptop-2026.html
guide-rtx-vs-amd-2026.html
guide-gaming-laptop-vs-desktop-2026.html
guide-gaming-laptop-cooling-thermals-2026.html
guide-razer-blade-16-vs-legion-pro-7i-2026.html
```

## Data Architecture

`laptops.js` is the single source of truth for all 30 laptops across three tiers:
- `high-end` — RTX 5080 / 5090
- `mid-range` — RTX 5070 / 5070 Ti
- `budget` — RTX 5060 / AMD

Any page can render laptop data using `data-fl-*` attributes:

```html
<!-- Single card -->
<div data-fl-card="lenovo-legion-5i-gen10"></div>

<!-- Spec table (all or by tier) -->
<div data-fl-table="all"></div>
<div data-fl-table="mid-range"></div>

<!-- Hero picks sidebar -->
<div data-fl-picks="lenovo-legion-pro-7i-gen10,asus-rog-scar-16-2026"></div>

<!-- Deals grid -->
<div data-fl-deals="lenovo-legion-5i-gen10,lenovo-legion-pro-7i-gen10"></div>
```

## CSS Class System

Guide pages use two class systems — both are defined in `style.css`:

| Standard (long) | Short alias | Used on |
|---|---|---|
| `.article-wrap` | `.aw` | All guide pages |
| `.article-title` | `.atitle` | All guide pages |
| `.article-subtitle` | `.asub` | All guide pages |
| `.article-meta` | `.ameta` | All guide pages |
| `.quick-picks` | `.qp` | All guide pages |
| `.pick-card` | — | Guide pick sections |

Always use the standard long classes on new pages. Short aliases exist for legacy compatibility only.

## Nav (use on every page)

```html
<nav>
  <a href="index.html" class="nav-logo">FRAME<span>LIMIT</span></a>
  <ul class="nav-links">
    <li><a href="guide-best-gaming-laptops-2026.html">Best Laptops</a></li>
    <li><a href="guide-gaming-laptop-buying-guide-2026.html">Buying Guide</a></li>
    <li><a href="reviews.html">Reviews</a></li>
    <li><a href="index.html#blog">Guides</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
</nav>
```

## Amazon Links

All affiliate links use tag `framelimit20-20`.

- Direct ASIN link (preferred): `https://www.amazon.com/dp/B0XXXXXXXX?tag=framelimit20-20`
- Search fallback: `https://www.amazon.com/s?k=Laptop+Name&tag=framelimit20-20`

Never use `B0EXAMPLE` placeholders — these are dead links.

## Images

All laptop images are WebP format, max 800px wide, stored in `images/laptops/`.
`imgUrl` references in `laptops.js` use `.webp` extension.

To compress new images:
```bash
python compress_images.py
```

## SEO Checklist (new pages)

Every new HTML page must have:
- `<link rel="canonical">` pointing to correct `.html` URL
- `og:title`, `og:description`, `og:image`, `og:url`
- `<script type="application/ld+json">` Article schema with `Rumen Mazhdrakov` as author
- `<link rel="icon" href="favicon.ico">`
- Standard nav with all 6 links

## Key Rules

- Never link to `gaming-laptops-affiliate.html` (deleted)
- Logo always says `FRAMELIMIT` not `FRAMERATE`
- Author attribution: always **Rumen Mazhdrakov** — no fictional names
- No hardcoded prices in buy buttons — use "Check Price on Amazon →"
- PowerShell does not support `&&` — run git commands separately
- Em-dashes and `&` in PowerShell scripts cause encoding errors — use plain hyphens and "and"

## DNS

Namecheap registrar → Cloudflare nameservers (`margot.ns.cloudflare.com` / `vin.ns.cloudflare.com`)
