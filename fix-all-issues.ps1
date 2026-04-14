# fix-all-issues.ps1
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File fix-all-issues.ps1

$root = $PSScriptRoot

# ══════════════════════════════════════════
# FIX 1 - ASINs in laptops.js
# ══════════════════════════════════════════
$jsPath = Join-Path $root "laptops.js"
if (Test-Path $jsPath) {
    $js = Get-Content $jsPath -Raw -Encoding UTF8
    $changed = $false

    $replacements = @(
        @("s?k=Lenovo+Legion+5i+Gen+10+RTX+5070&tag=framelimit20-20",     "dp/B0F6NRYPPG?tag=framelimit20-20"),
        @("s?k=Lenovo+LOQ+15+Gen+10+RTX+5060&tag=framelimit20-20",        "dp/B0GLN1C5PD?tag=framelimit20-20"),
        @("s?k=ASUS+ROG+Zephyrus+G14+2026+RTX+5070&tag=framelimit20-20",  "dp/B0FHY9D1M2?tag=framelimit20-20"),
        @("s?k=ASUS+TUF+Gaming+A16+RTX+5060+2026&tag=framelimit20-20",    "dp/B0GVK97DK5?tag=framelimit20-20"),
        @("s?k=Lenovo+Legion+Pro+7i+Gen+10+RTX+5080&tag=framelimit20-20", "dp/B0FL4HLJ56?tag=framelimit20-20"),
        @("s?k=HP+Omen+Max+16+RTX+5080+2026&tag=framelimit20-20",         "dp/B0GW7F1B7Z?tag=framelimit20-20"),
        @("s?k=MSI+Raider+18+HX+AI+RTX+5080&tag=framelimit20-20",         "dp/B0F4PHGLW3?tag=framelimit20-20")
    )

    foreach ($pair in $replacements) {
        $old = "https://www.amazon.com/" + $pair[0]
        $new = "https://www.amazon.com/" + $pair[1]
        if ($js -match [regex]::Escape($old)) {
            $js = $js -replace [regex]::Escape($old), $new
            Write-Host "  ASIN: $($pair[1].Split('/')[1].Split('?')[0])" -ForegroundColor Green
            $changed = $true
        }
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($jsPath, $js, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  laptops.js saved" -ForegroundColor Cyan
    } else {
        Write-Host "  laptops.js - no URL matches found (may already be updated)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  SKIP: laptops.js not found" -ForegroundColor Yellow
}

# ══════════════════════════════════════════
# FIX 2 + 3 - laptop-cards.js
# ══════════════════════════════════════════
$cardsPath = Join-Path $root "laptop-cards.js"
if (Test-Path $cardsPath) {
    $cards = Get-Content $cardsPath -Raw -Encoding UTF8

    # FIX 2: Expand button - switch from class-based to index-based row detection
    $old2a = "const hidden = table.querySelectorAll('.fl-table-hidden');"
    $new2a = "const hidden = Array.from(table.querySelectorAll('tbody tr')).filter(function(_,i){return i>=4;});"
    if ($cards.Contains($old2a)) {
        $cards = $cards.Replace($old2a, $new2a)
        Write-Host "  FIX 2a: hidden row selector patched" -ForegroundColor Green
    }

    $old2b = "const isCollapsed = hidden[0].style.display !== 'table-row';"
    $new2b = "const isCollapsed = hidden[0].style.display === 'none' || hidden[0].style.display === '';"
    if ($cards.Contains($old2b)) {
        $cards = $cards.Replace($old2b, $new2b)
        Write-Host "  FIX 2b: collapsed check patched" -ForegroundColor Green
    }

    # FIX 3: Remove price display from deal cards
    # Find and remove the deal-prices div that shows ~$X,XXX
    $old3 = '<div class="deal-prices" style="margin-bottom:12px">'
    if ($cards.Contains($old3)) {
        # Remove the entire deal-prices block (score display) - replace with nothing
        # The block ends before the deal-btn anchor
        $cards = $cards -replace '(?s)<div class="deal-prices"[^<]*<[^<]*<[^<]*<[^<]*</div>', ''
        Write-Host "  FIX 3: deal price display removed" -ForegroundColor Green
    } else {
        Write-Host "  FIX 3: deal-prices div not found - may already be removed" -ForegroundColor Yellow
    }

    [System.IO.File]::WriteAllText($cardsPath, $cards, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  laptop-cards.js saved" -ForegroundColor Cyan
} else {
    Write-Host "  SKIP: laptop-cards.js not found" -ForegroundColor Yellow
}

# ══════════════════════════════════════════
# FIX 4 - Remove Deals button from reviews.html nav
# ══════════════════════════════════════════
$reviewsPath = Join-Path $root "reviews.html"
if (Test-Path $reviewsPath) {
    $rv = Get-Content $reviewsPath -Raw -Encoding UTF8

    $old4 = '<a href="index.html#deals-section" class="nav-cta"'
    if ($rv -match [regex]::Escape($old4)) {
        $rv = $rv -replace '(?s)<a href="index\.html#deals-section" class="nav-cta"[^>]*>.*?</a>', ''
        [System.IO.File]::WriteAllText($reviewsPath, $rv, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  FIX 4: Deals button removed from reviews.html" -ForegroundColor Green
    } else {
        Write-Host "  FIX 4: Deals button not found in reviews.html (may already be removed)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  SKIP: reviews.html not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor White
Write-Host "  git add -A"
Write-Host "  git commit -m 'fix: ASINs, expand button, deal prices, remove deals nav'"
Write-Host "  git push"
