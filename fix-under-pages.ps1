# fix-under-pages.ps1
# Fixes guide-best-gaming-laptop-under-1500.html and guide-best-gaming-laptop-under-2000.html
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File fix-under-pages.ps1

$root = $PSScriptRoot

$files = @(
    @{
        name       = "guide-best-gaming-laptop-under-1500.html"
        wrongUrl   = "https://framelimit.com/guides/best-gaming-laptop-under-1500"
        correctUrl = "https://framelimit.com/guide-best-gaming-laptop-under-1500.html"
    },
    @{
        name       = "guide-best-gaming-laptop-under-2000.html"
        wrongUrl   = "https://framelimit.com/guides/best-gaming-laptop-under-2000"
        correctUrl = "https://framelimit.com/guide-best-gaming-laptop-under-2000.html"
    }
)

$fakeAuthors = @("Sarah Chen","James Kowalski","Alex Rivera","Mike Torres","Jordan Park")

foreach ($f in $files) {
    $path = Join-Path $root $f.name
    if (-not (Test-Path $path)) {
        Write-Host "SKIP (not found): $($f.name)" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $path -Raw -Encoding UTF8
    $changed = $false

    # 1. Fix canonical and og:url
    if ($content -match [regex]::Escape($f.wrongUrl)) {
        $content = $content -replace [regex]::Escape($f.wrongUrl), $f.correctUrl
        $changed = $true
    }

    # 2. Fix fake author names everywhere (JSON-LD AND visible HTML)
    foreach ($fake in $fakeAuthors) {
        if ($content -match [regex]::Escape($fake)) {
            $content = $content -replace [regex]::Escape($fake), "Rumen Mazhdrakov"
            $changed = $true
        }
    }

    # 3. Fix avatar initials SC -> RM
    if ($content -match '>SC<') {
        $content = $content -replace '>SC<', '>RM<'
        $changed = $true
    }

    # 4. Fix invisible related links - replace u-related-title-lg with inline style
    if ($content -match 'u-related-title-lg') {
        $content = $content -replace 'class="u-related-title-lg"', 'style="font-size:15px;font-weight:600;color:var(--white);line-height:1.4"'
        $changed = $true
    }

    # 5. Fix u-mono-cyan class if missing styles
    if ($content -match 'class="u-mono-cyan"') {
        $content = $content -replace 'class="u-mono-cyan"', 'style="font-family:''JetBrains Mono'',monospace;font-size:9px;color:var(--cyan);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px"'
        $changed = $true
    }

    # 6. Add og:image if missing
    if ($content -notmatch 'og:image') {
        $ogImg = '<meta property="og:image" content="https://framelimit.com/og-default.jpg">'
        if ($content -match '<meta name="twitter:card"') {
            $content = $content -replace '(<meta name="twitter:card")', "$ogImg`n`$1"
        } elseif ($content -match '<link rel="canonical"') {
            $content = $content -replace '(<link rel="canonical")', "$ogImg`n`$1"
        }
        $changed = $true
    }

    # 7. Add favicon if missing
    if ($content -notmatch 'rel="icon"') {
        $content = $content -replace '(<link rel="preconnect")', '<link rel="icon" href="favicon.ico" type="image/x-icon">'+"`n`$1"
        $changed = $true
    }

    if ($changed) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "FIXED: $($f.name)" -ForegroundColor Green
    } else {
        Write-Host "OK (no changes): $($f.name)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Done. Now run:" -ForegroundColor Yellow
Write-Host "  git add -A"
Write-Host "  git commit -m 'fix: under-1500 and under-2000 author names, canonical URLs, related links'"
Write-Host "  git push"
