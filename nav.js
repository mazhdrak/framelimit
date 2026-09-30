/**
 * FRAMELIMIT — nav.js
 * Injects shared nav + mobile drawer into every page.
 * Usage: add <div id="nav-root"></div> near top of <body>,
 *        then <script src="nav.js"></script> before </body>.
 */
(function () {
  if (!window.FL_BENCHMARK_STANDARD && !document.querySelector('script[data-fl-benchmark]')) {
    const benchmarkScript = document.createElement('script');
    benchmarkScript.src = 'benchmark-data.js?v=20260930-1';
    benchmarkScript.dataset.flBenchmark = 'true';
    document.head.appendChild(benchmarkScript);
  }

  const root = document.getElementById('nav-root');
  if (!root) return;

  root.innerHTML = `
<div class="aff-ribbon">This site contains affiliate links: we may earn a commission at no extra cost to you. It never changes our picks. <a href="affiliate-disclosure">Disclosure</a></div>

<nav>
  <a href="/" class="nav-logo">FRAME<span>LIMIT</span></a>
  <ul class="nav-links">
    <li><a href="guide-best-gaming-laptops-2026">Best Laptops</a></li>
    <li><a href="reviews">Reviews</a></li>
    <li><a href="compare">Compare</a></li>
    <li><a href="guides">Guides</a></li>
    <li><a href="upgrades">Upgrades</a></li>
    <li><a href="about">About</a></li>
  </ul>
  <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false" onclick="window.__flToggleNav()">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="mobile-drawer" id="fl-mobile-drawer">
  <div class="md-section">
    <div class="md-label">Shop by budget</div>
    <ul class="md-links">
      <li><a href="guide-best-gaming-laptops-2026" onclick="window.__flToggleNav()">Best laptops 2026</a></li>
      <li><a href="guide-best-gaming-laptop-under-1000" onclick="window.__flToggleNav()">Under $1,000</a></li>
      <li><a href="guide-best-gaming-laptop-under-1500" onclick="window.__flToggleNav()">Under $1,500</a></li>
      <li><a href="guide-best-gaming-laptop-under-2000" onclick="window.__flToggleNav()">Under $2,000</a></li>
      <li><a href="guide-best-gaming-laptop-under-2500" onclick="window.__flToggleNav()">Under $2,500</a></li>
      <li><a href="guide-best-gaming-laptop-under-3000" onclick="window.__flToggleNav()">Under $3,000</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">Find a laptop</div>
    <ul class="md-links">
      <li><a href="/" onclick="window.__flToggleNav()">Home</a></li>
      <li><a href="reviews" onclick="window.__flToggleNav()">All reviews</a></li>
      <li><a href="compare" onclick="window.__flToggleNav()">Compare two laptops</a></li>
      <li><a href="guide-best-rtx-5080-gaming-laptop-2026" onclick="window.__flToggleNav()">Best RTX 5080</a></li>
      <li><a href="guide-best-thin-light-gaming-laptop-2026" onclick="window.__flToggleNav()">Best thin &amp; light</a></li>
      <li><a href="guide-best-14-inch-gaming-laptop-2026" onclick="window.__flToggleNav()">Best 14-inch</a></li>
      <li><a href="guide-best-amd-gaming-laptop-2026" onclick="window.__flToggleNav()">Best AMD</a></li>
      <li><a href="guide-best-gaming-laptop-college-2026" onclick="window.__flToggleNav()">Best for college</a></li>
      <li><a href="guides" onclick="window.__flToggleNav()">All guides</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">Upgrades &amp; data</div>
    <ul class="md-links">
      <li><a href="upgrades" onclick="window.__flToggleNav()">RAM &amp; SSD upgrades</a></li>
      <li><a href="guide-rtx-50-laptop-tgp-database" onclick="window.__flToggleNav()">RTX 50 TGP database</a></li>
      <li><a href="guide-gaming-laptop-display-database" onclick="window.__flToggleNav()">Display database</a></li>
      <li><a href="guide-dlss-fsr-frame-generation-database" onclick="window.__flToggleNav()">DLSS / FSR benchmarks</a></li>
      <li><a href="guide-gaming-laptop-price-report-july-2026" onclick="window.__flToggleNav()">Retail coverage report</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">About</div>
    <ul class="md-links">
      <li><a href="about" onclick="window.__flToggleNav()">About us</a></li>
      <li><a href="methodology" onclick="window.__flToggleNav()">How we review</a></li>
      <li><a href="affiliate-disclosure" onclick="window.__flToggleNav()">Affiliate disclosure</a></li>
      <li><a href="contact" onclick="window.__flToggleNav()">Contact</a></li>
    </ul>
  </div>
  <a href="guide-best-gaming-laptops-2026" class="md-cta" onclick="window.__flToggleNav()">See the best laptops of 2026</a>
</div>
<div class="drawer-overlay" id="fl-drawer-overlay" onclick="window.__flToggleNav()"></div>
`;

  // Toggle function — safe to call from any page
  window.__flToggleNav = function () {
    const drawer = document.getElementById('fl-mobile-drawer');
    const overlay = document.getElementById('fl-drawer-overlay');
    if (!drawer) return;
    const open = drawer.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open', open);
    const button = document.getElementById('nav-hamburger');
    if (button) {
      button.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
    }
  };

  // Mark the active section: reviews and guides pages light up their hub link
  const path = window.location.pathname.split('/').pop().replace(/\.html$/, '') || '/';
  const section = path.startsWith('review-') ? 'reviews'
    : (path.startsWith('guide-') && path !== 'guide-best-gaming-laptops-2026') ? 'guides'
    : path;
  root.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === section) a.setAttribute('aria-current', 'page');
  });

  // Re-align deep links after async benchmark blocks above the target finish rendering.
  // Without this, layout growth can push a review's upgrade section below the viewport.
  function alignHashTarget() {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  if (window.location.hash) {
    window.addEventListener('load', function () {
      let alignTimer;
      const layoutObserver = new MutationObserver(function () {
        window.clearTimeout(alignTimer);
        alignTimer = window.setTimeout(alignHashTarget, 80);
      });
      layoutObserver.observe(document.body, { childList: true, subtree: true });
      alignHashTarget();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignHashTarget);
      window.setTimeout(function () {
        layoutObserver.disconnect();
        alignHashTarget();
      }, 1800);
    });
    window.addEventListener('hashchange', alignHashTarget);
  }
})();
