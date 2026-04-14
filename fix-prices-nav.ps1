# fix-prices-nav.ps1
# Fixes:
#   1. Removes ~$price from pick cards in index.html renderPicksGrids()
#   2. Removes Deals nav button from all guide-*.html pages
#   3. Fixes avatar initials JK -> RM on guide pages
#
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File fix-prices-nav.ps1

$root = $PSScriptRoot

# ══════════════════════════════════════════
# FIX 1 - Remove price from pick cards in index.html
# ══════════════════════════════════════════
$indexPath = Join-Path $root "index.html"
if (Test-Path $indexPath) {
    $idx = Get-Content $indexPath -Raw -Encoding UTF8

    # Remove the pick-price div entirely (it contains the ~$X,XXX Amazon link)
    # Replace with just a clean Check Price button
    $oldPrice = '<div class="pick-price"><a href="${l.amazonUrl}" class="rc-price-live" rel="nofollow sponsored" target="_blank">~$${l.price.toLocaleString()} · Amazon →</a></div>'
    $newPrice = ''

    if ($idx.Contains($oldPrice)) {
        $idx = $idx.Replace($oldPrice, $newPrice)
        Write-Host "  FIX 1: pick-price div removed from index.html" -ForegroundColor Green
    } else {
        Write-Host "  FIX 1: pick-price pattern not matched - trying regex..." -ForegroundColor Yellow
        $idx = $idx -replace '<div class="pick-price">.*?</div>', ''
        Write-Host "  FIX 1: applied regex fallback" -ForegroundColor Green
    }

    [System.IO.File]::WriteAllText($indexPath, $idx, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  index.html saved" -ForegroundColor Cyan
}

# ══════════════════════════════════════════
# FIX 2 - Remove Deals nav button from all guide pages + reviews
# ══════════════════════════════════════════
$htmlFiles = Get-ChildItem $root -Filter "*.html" | Where-Object { $_.Name -ne "index.html" }

$dealsPattern = '<a href="index.html#deals-section" class="nav-cta"'
$removedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match [regex]::Escape($dealsPattern)) {
        $content = $content -replace '(?s)<a href="index\.html#deals-section" class="nav-cta"[^>]*>[^<]*</a>', ''
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  FIX 2: Deals button removed from $($file.Name)" -ForegroundColor Green
        $removedCount++
    }
}

if ($removedCount -eq 0) {
    Write-Host "  FIX 2: No Deals buttons found (already removed)" -ForegroundColor Yellow
}

# ══════════════════════════════════════════
# FIX 3 - Fix avatar initials JK -> RM on guide pages
# ══════════════════════════════════════════
$fixedAvatars = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content.Contains('>JK<')) {
        $content = $content.Replace('>JK<', '>RM<')
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  FIX 3: Avatar JK->RM fixed in $($file.Name)" -ForegroundColor Green
        $fixedAvatars++
    }
}

if ($fixedAvatars -eq 0) {
    Write-Host "  FIX 3: No JK avatars found (already fixed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor White
Write-Host "  git add -A"
Write-Host "  git commit -m 'fix: remove prices from pick cards, remove deals nav from all guide pages, fix avatar initials'"
Write-Host "  git push"
