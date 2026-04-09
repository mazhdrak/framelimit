# fix-og-tags.ps1
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File fix-og-tags.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$fileMap = @{
    "guide-best-gaming-laptops-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-gaming-laptops-2026"
        correctUrl = "https://framelimit.com/guide-best-gaming-laptops-2026.html"
        ogTitle    = "Best Gaming Laptops 2026 - RTX 50 Series Ranked | FRAMELIMIT"
        ogDesc     = "30 gaming laptops tested. RTX 5090 to RTX 5060, ranked by real benchmark data. Updated weekly."
    }
    "guide-gaming-laptop-buying-guide-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/gaming-laptop-buying-guide-2026"
        correctUrl = "https://framelimit.com/guide-gaming-laptop-buying-guide-2026.html"
        ogTitle    = "Gaming Laptop Buying Guide 2026 | FRAMELIMIT"
        ogDesc     = "Everything you need to know before buying a gaming laptop in 2026. TGP, displays, RAM, GPU tiers explained."
    }
    "guide-best-gaming-laptop-college-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-gaming-laptop-for-college-2026"
        correctUrl = "https://framelimit.com/guide-best-gaming-laptop-college-2026.html"
        ogTitle    = "Best Gaming Laptop for College Students 2026 | FRAMELIMIT"
        ogDesc     = "Light enough to carry daily, powerful enough for AAA games, with all-day battery. Top picks for students."
    }
    "guide-best-gaming-laptop-under-1000.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-gaming-laptop-under-1000"
        correctUrl = "https://framelimit.com/guide-best-gaming-laptop-under-1000.html"
        ogTitle    = "Best Gaming Laptops Under 1000 in 2026 | FRAMELIMIT"
        ogDesc     = "RTX 5060 and RX 7600M XT tested. Real benchmarks, honest verdicts - best sub-1000 gaming laptops ranked."
    }
    "guide-best-amd-gaming-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-amd-gaming-laptop-2026"
        correctUrl = "https://framelimit.com/guide-best-amd-gaming-laptop-2026.html"
        ogTitle    = "Best AMD Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "RX 7900M, 7800M, and 7600M XT tested. AMD laptops ranked by performance, battery, and value vs Nvidia."
    }
    "guide-best-thin-light-gaming-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-thin-light-gaming-laptop-2026"
        correctUrl = "https://framelimit.com/guide-best-thin-light-gaming-laptop-2026.html"
        ogTitle    = "Best Thin and Light Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "Under 2kg with real gaming power. Zephyrus G14, Razer Blade, and MSI Stealth tested and ranked."
    }
    "guide-gaming-laptop-vs-desktop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/gaming-laptop-vs-desktop-2026"
        correctUrl = "https://framelimit.com/guide-gaming-laptop-vs-desktop-2026.html"
        ogTitle    = "Gaming Laptop vs Desktop 2026: Which Should You Buy? | FRAMELIMIT"
        ogDesc     = "Performance gap, price, upgradability, and portability compared honestly. Who should buy which in 2026."
    }
    "guide-best-4k-gaming-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-4k-gaming-laptop-2026"
        correctUrl = "https://framelimit.com/guide-best-4k-gaming-laptop-2026.html"
        ogTitle    = "Best 4K Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "RTX 5080 and 5090 laptops tested at 4K. Which actually deliver smooth framerates at full resolution."
    }
    "guide-best-1440p-gaming-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-1440p-gaming-laptop-2026"
        correctUrl = "https://framelimit.com/guide-best-1440p-gaming-laptop-2026.html"
        ogTitle    = "Best 1440p Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "The sweet spot for gaming laptops in 2026. Best 1440p screens, GPUs, and value picks tested and ranked."
    }
    "guide-best-oled-gaming-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/best-oled-gaming-laptop-2026"
        correctUrl = "https://framelimit.com/guide-best-oled-gaming-laptop-2026.html"
        ogTitle    = "Best OLED Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "The best OLED gaming laptops tested for color accuracy, burn-in risk, brightness, and gaming performance."
    }
    "guide-rtx-vs-amd-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/rtx-vs-amd-2026"
        correctUrl = "https://framelimit.com/guide-rtx-vs-amd-2026.html"
        ogTitle    = "RTX 5000 vs AMD RX 7000 Laptops 2026 | FRAMELIMIT"
        ogDesc     = "Nvidia vs AMD gaming laptops compared honestly - DLSS vs FSR, raster performance, battery, and value."
    }
    "guide-gaming-laptop-cooling-thermals-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/gaming-laptop-cooling-thermals-2026"
        correctUrl = "https://framelimit.com/guide-gaming-laptop-cooling-thermals-2026.html"
        ogTitle    = "Gaming Laptop Cooling and Thermals Guide 2026 | FRAMELIMIT"
        ogDesc     = "Why your laptop throttles, what TGP means in practice, and how to keep your GPU cool."
    }
    "guide-gaming-laptop-display-guide-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/gaming-laptop-display-guide-2026"
        correctUrl = "https://framelimit.com/guide-gaming-laptop-display-guide-2026.html"
        ogTitle    = "Gaming Laptop Display Guide 2026 - IPS vs OLED vs MiniLED | FRAMELIMIT"
        ogDesc     = "Every display type explained. Which resolution, refresh rate, and panel type is right for your games."
    }
    "guide-dlss4-fsr3-laptop-2026.html" = @{
        wrongUrl   = "https://framelimit.com/guides/dlss4-fsr3-laptop-2026"
        correctUrl = "https://framelimit.com/guide-dlss4-fsr3-laptop-2026.html"
        ogTitle    = "DLSS 4 vs FSR 3 on Gaming Laptops 2026 | FRAMELIMIT"
        ogDesc     = "DLSS 4 Multi Frame Gen vs FSR 3 Frame Gen - how upscaling actually performs on RTX 50 and AMD laptops."
    }
    "reviews.html" = @{
        wrongUrl   = ""
        correctUrl = "https://framelimit.com/reviews.html"
        ogTitle    = "Gaming Laptop Reviews 2026 - RTX 50 Series Tested | FRAMELIMIT"
        ogDesc     = "Full gaming laptop reviews with benchmark data, thermal testing, and display analysis. 30 machines tested."
    }
    "about.html" = @{
        wrongUrl   = ""
        correctUrl = "https://framelimit.com/about.html"
        ogTitle    = "About FRAMELIMIT - Independent Gaming Laptop Reviews"
        ogDesc     = "FRAMELIMIT is an independent gaming laptop review site run by Rumen Mazhdrakov. No sponsored rankings."
    }
    "contact.html" = @{
        wrongUrl   = ""
        correctUrl = "https://framelimit.com/contact.html"
        ogTitle    = "Contact FRAMELIMIT"
        ogDesc     = "Get in touch with FRAMELIMIT for spec corrections, review suggestions, or press enquiries."
    }
    "affiliate-disclosure.html" = @{
        wrongUrl   = ""
        correctUrl = "https://framelimit.com/affiliate-disclosure.html"
        ogTitle    = "Affiliate Disclosure - FRAMELIMIT"
        ogDesc     = "How FRAMELIMIT earns revenue through Amazon Associates - and why it never influences our editorial scores."
    }
    "index.html" = @{
        wrongUrl   = ""
        correctUrl = "https://framelimit.com/"
        ogTitle    = "Best Gaming Laptops 2026 - RTX 50 Series Tested | FRAMELIMIT"
        ogDesc     = "30 gaming laptops tested. RTX 5090 to RTX 5060, benchmarked across 11 games. Real TGP numbers. Updated weekly."
    }
}

$fakeAuthors = @("Sarah Chen","James Kowalski","Alex Rivera","Mike Torres","Jordan Park")
$faviconTag  = '<link rel="icon" href="favicon.ico" type="image/x-icon">'
$fixed   = 0
$skipped = 0

foreach ($filename in $fileMap.Keys) {
    $path = Join-Path $root $filename
    if (-not (Test-Path $path)) {
        Write-Host "  SKIP (not found): $filename" -ForegroundColor Yellow
        $skipped++
        continue
    }

    $info    = $fileMap[$filename]
    $content = Get-Content $path -Raw -Encoding UTF8
    $changed = $false

    # 1. Fix wrong og:url and canonical paths
    if ($info.wrongUrl -ne "" -and $content -match [regex]::Escape($info.wrongUrl)) {
        $content = $content -replace [regex]::Escape($info.wrongUrl), $info.correctUrl
        $changed = $true
    }

    # 2. Fix fake author names in Schema JSON-LD
    foreach ($fake in $fakeAuthors) {
        if ($content -match [regex]::Escape($fake)) {
            $content = $content -replace [regex]::Escape($fake), "Rumen Mazhdrakov"
            $changed = $true
        }
    }

    # 3. Add og:image if missing
    if ($content -notmatch 'og:image') {
        $ogImg = '<meta property="og:image" content="https://framelimit.com/og-default.jpg">'
        if ($content -match '<meta name="twitter:card"') {
            $content = $content -replace '(<meta name="twitter:card")', "$ogImg`n`$1"
        } elseif ($content -match '<link rel="canonical"') {
            $content = $content -replace '(<link rel="canonical")', "$ogImg`n`$1"
        }
        $changed = $true
    }

    # 4. Add favicon link if missing
    if ($content -notmatch 'rel="icon"') {
        $content = $content -replace '(<link rel="preconnect")', "$faviconTag`n`$1"
        $changed = $true
    }

    # 5. Inject full OG block into index.html if og:title is missing
    if ($filename -eq "index.html" -and $content -notmatch 'og:title') {
        $ogBlock = "`n<!-- Open Graph / Social -->`n" +
            "<meta property=`"og:type`" content=`"website`">`n" +
            "<meta property=`"og:url`" content=`"https://framelimit.com/`">`n" +
            "<meta property=`"og:title`" content=`"Best Gaming Laptops 2026 - RTX 50 Series Tested | FRAMELIMIT`">`n" +
            "<meta property=`"og:description`" content=`"30 gaming laptops tested. RTX 5090 to RTX 5060, benchmarked across 11 games. Real TGP numbers. Updated weekly.`">`n" +
            "<meta property=`"og:image`" content=`"https://framelimit.com/og-default.jpg`">`n" +
            "<meta property=`"og:site_name`" content=`"FRAMELIMIT`">`n" +
            "<meta name=`"twitter:card`" content=`"summary_large_image`">`n" +
            "<meta name=`"twitter:title`" content=`"Best Gaming Laptops 2026 | FRAMELIMIT`">`n" +
            "<meta name=`"twitter:description`" content=`"30 gaming laptops tested across 11 games. Real TGP numbers, honest scores. No sponsored rankings.`">`n" +
            "<meta name=`"theme-color`" content=`"#00D4FF`">`n"
        $content = $content -replace '(<link rel="preconnect" href="https://fonts)', "$ogBlock`$1"
        $changed = $true
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  FIXED: $filename" -ForegroundColor Green
        $fixed++
    } else {
        Write-Host "  OK (no changes needed): $filename" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Done. $fixed files updated, $skipped not found." -ForegroundColor White
Write-Host ""
Write-Host "Next: git add -A && git commit -m 'fix: OG tags, canonical URLs, author names' && git push" -ForegroundColor Yellow
