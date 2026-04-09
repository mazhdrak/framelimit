# fix-schema.ps1
# Replaces thin Schema JSON-LD with full Article schema on all guide pages
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File fix-schema.ps1

$root = $PSScriptRoot

# Per-file schema data: filename -> headline, description, datePublished, url
$pages = @(
    @{
        file          = "guide-best-gaming-laptops-2026.html"
        headline      = "Best Gaming Laptops 2026 - RTX 50 Series Ranked and Tested"
        description   = "30 gaming laptops tested across 11 games. RTX 5090 to RTX 5060 ranked by real TGP numbers, benchmark data, and honest verdicts. Updated weekly."
        datePublished = "2026-03-01"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-gaming-laptops-2026.html"
    },
    @{
        file          = "guide-gaming-laptop-buying-guide-2026.html"
        headline      = "Gaming Laptop Buying Guide 2026"
        description   = "Everything you need to know before buying a gaming laptop in 2026. TGP explained, GPU tiers, display types, RAM, upscaling, and budget ladder."
        datePublished = "2026-03-01"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-gaming-laptop-buying-guide-2026.html"
    },
    @{
        file          = "guide-best-gaming-laptop-under-1000.html"
        headline      = "Best Gaming Laptops Under 1000 Dollars in 2026"
        description   = "The best gaming laptops under 1000 dollars in 2026. RTX 5060 and RX 7600M XT tested at 1080p with real benchmark data and honest verdicts."
        datePublished = "2026-03-08"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-gaming-laptop-under-1000.html"
    },
    @{
        file          = "guide-best-gaming-laptop-under-1500.html"
        headline      = "Best Gaming Laptops Under 1500 Dollars in 2026"
        description   = "The best gaming laptops under 1500 dollars in 2026 tested and ranked. Top pick delivers RTX 5070 plus OLED at exactly 1499 dollars."
        datePublished = "2026-02-20"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-gaming-laptop-under-1500.html"
    },
    @{
        file          = "guide-best-gaming-laptop-under-2000.html"
        headline      = "Best Gaming Laptops Under 2000 Dollars in 2026"
        description   = "The best gaming laptops under 2000 dollars in 2026. RTX 5070 Ti, OLED displays, and 1440p dominance - the 5 best in the 1500 to 2000 bracket."
        datePublished = "2026-03-11"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-gaming-laptop-under-2000.html"
    },
    @{
        file          = "guide-best-amd-gaming-laptop-2026.html"
        headline      = "Best AMD Gaming Laptops 2026"
        description   = "The best AMD gaming laptops in 2026. RX 7900M, 7800M, and 7600M XT tested for battery life, FSR 3, thermals, and value versus Nvidia."
        datePublished = "2026-03-08"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-amd-gaming-laptop-2026.html"
    },
    @{
        file          = "guide-best-thin-light-gaming-laptop-2026.html"
        headline      = "Best Thin and Light Gaming Laptops 2026"
        description   = "The best thin and light gaming laptops in 2026. Under 2kg with real gaming power. Zephyrus G14, Razer Blade, and MSI Stealth tested and ranked."
        datePublished = "2026-03-09"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-thin-light-gaming-laptop-2026.html"
    },
    @{
        file          = "guide-best-gaming-laptop-college-2026.html"
        headline      = "Best Gaming Laptop for College Students 2026"
        description   = "The best gaming laptops for college in 2026. Light enough to carry daily, powerful enough for AAA games, with all-day battery. 5 picks tested and ranked."
        datePublished = "2026-03-07"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-gaming-laptop-college-2026.html"
    },
    @{
        file          = "guide-gaming-laptop-vs-desktop-2026.html"
        headline      = "Gaming Laptop vs Desktop 2026 - Which Should You Buy?"
        description   = "Gaming laptop vs desktop PC in 2026. Performance gap, price, upgradability, and portability compared honestly. Who should buy which and when."
        datePublished = "2026-03-08"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-gaming-laptop-vs-desktop-2026.html"
    },
    @{
        file          = "guide-gaming-laptop-cooling-thermals-2026.html"
        headline      = "Gaming Laptop Cooling and Thermals Guide 2026"
        description   = "Why your gaming laptop throttles, what TGP means in practice, and how cooling systems differ across price tiers. Thermal data from 30 laptops tested."
        datePublished = "2026-03-09"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-gaming-laptop-cooling-thermals-2026.html"
    },
    @{
        file          = "guide-rtx-vs-amd-2026.html"
        headline      = "RTX 5000 vs AMD RX 7000 Gaming Laptops 2026"
        description   = "Nvidia RTX 5000 versus AMD RX 7000 gaming laptops compared honestly. DLSS 4 vs FSR 3, raster performance, ray tracing, battery life, and value."
        datePublished = "2026-03-09"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-rtx-vs-amd-2026.html"
    },
    @{
        file          = "guide-best-14-inch-gaming-laptop-2026.html"
        headline      = "Best 14-inch Gaming Laptops 2026"
        description   = "The best 14-inch gaming laptops in 2026. ASUS Zephyrus G14, Razer Blade 14, Acer Predator Triton 14 AI tested for portable high-performance gaming."
        datePublished = "2026-03-11"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-14-inch-gaming-laptop-2026.html"
    },
    @{
        file          = "guide-best-rtx-5080-gaming-laptop-2026.html"
        headline      = "Best RTX 5080 Gaming Laptops 2026"
        description   = "Seven RTX 5080 laptops tested. Legion Pro 7i, Zephyrus G16, MSI Vector, HP Omen Max compared by TGP, thermals, and real benchmark performance."
        datePublished = "2026-03-11"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/guide-best-rtx-5080-gaming-laptop-2026.html"
    },
    @{
        file          = "reviews.html"
        headline      = "Gaming Laptop Reviews 2026 - RTX 50 Series Tested"
        description   = "Full gaming laptop reviews with benchmark data, thermal testing, and display analysis. 30 machines tested across flagship, mid-range, and budget tiers."
        datePublished = "2026-03-01"
        dateModified  = "2026-04-09"
        url           = "https://framelimit.com/reviews.html"
    }
)

$fixed = 0
$skipped = 0

foreach ($p in $pages) {
    $path = Join-Path $root $p.file
    if (-not (Test-Path $path)) {
        Write-Host "  SKIP (not found): $($p.file)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    $content = Get-Content $path -Raw -Encoding UTF8

    # Build the full schema block
    $schema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "$($p.url)"
  },
  "headline": "$($p.headline)",
  "description": "$($p.description)",
  "image": {
    "@type": "ImageObject",
    "url": "https://framelimit.com/og-default.jpg",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "Rumen Mazhdrakov",
    "url": "https://framelimit.com/about.html"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FRAMELIMIT",
    "url": "https://framelimit.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://framelimit.com/og-default.jpg",
      "width": 1200,
      "height": 630
    }
  },
  "datePublished": "$($p.datePublished)",
  "dateModified": "$($p.dateModified)",
  "url": "$($p.url)"
}
</script>
"@

    # Replace existing script[type=application/ld+json] block
    # Handles both inline (single-line) and multi-line JSON-LD blocks
    $changed = $false

    if ($content -match '(?s)<script type="application/ld\+json">.*?</script>') {
        $content = $content -replace '(?s)<script type="application/ld\+json">.*?</script>', $schema.Trim()
        $changed = $true
    } else {
        # No existing schema - inject before closing </head>
        $content = $content -replace '</head>', "$($schema.Trim())`n</head>"
        $changed = $true
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  FIXED: $($p.file)" -ForegroundColor Green
        $fixed++
    }
}

Write-Host ""
Write-Host "Done. $fixed files updated, $skipped not found." -ForegroundColor White
Write-Host ""
Write-Host "Validate at: https://search.google.com/test/rich-results" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then push:" -ForegroundColor Yellow
Write-Host "  git add -A"
Write-Host "  git commit -m 'feat: full Article schema markup on all guide pages'"
Write-Host "  git push"
