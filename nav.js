/**
 * FRAMELIMIT — nav.js
 * Injects shared nav + mobile drawer into every page.
 * Usage: add <div id="nav-root"></div> near top of <body>,
 *        then <script src="nav.js"></script> before </body>.
 */
(function () {
  const root = document.getElementById('nav-root');
  if (!root) return;

  root.innerHTML = `
<div class="aff-ribbon">⚠ This site contains affiliate links. We earn commissions on purchases at no extra cost to you. <a href="affiliate-disclosure.html" style="color:var(--yellow)">Disclosure</a> — Never influences our scores or recommendations.</div>

<nav>
  <a href="index.html" class="nav-logo">FRAME<span>LIMIT</span></a>
  <ul class="nav-links">
    <li><a href="guide-best-gaming-laptops-2026.html">Best Laptops</a></li>
    <li><a href="guide-gaming-laptop-buying-guide-2026.html">Buying Guide</a></li>
    <li><a href="reviews.html">Reviews</a></li>
    <li><a href="compare.html">Compare</a></li>
    <li><a href="index.html#blog">Guides</a></li>
    <li><a href="about.html">About</a></li>
  </ul>
  <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" onclick="window.__flToggleNav()">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="mobile-drawer" id="fl-mobile-drawer">
  <div class="md-section">
    <div class="md-label">Main</div>
    <ul class="md-links">
      <li><a href="index.html" onclick="window.__flToggleNav()">🏠 Home</a></li>
      <li><a href="reviews.html" onclick="window.__flToggleNav()">⭐ Full Reviews</a></li>
      <li><a href="compare.html" onclick="window.__flToggleNav()">⚖️ Compare Laptops</a></li>
      <li><a href="about.html" onclick="window.__flToggleNav()">👤 About</a></li>
      <li><a href="contact.html" onclick="window.__flToggleNav()">✉️ Contact</a></li>
      <li><a href="affiliate-disclosure.html" onclick="window.__flToggleNav()">⚠️ Affiliate Disclosure</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">Best Picks</div>
    <ul class="md-links">
      <li><a href="guide-best-gaming-laptops-2026.html" onclick="window.__flToggleNav()">Best Laptops 2026</a></li>
      <li><a href="guide-gaming-laptop-buying-guide-2026.html" onclick="window.__flToggleNav()">Buying Guide</a></li>
      <li><a href="guide-best-gaming-laptop-under-1000.html" onclick="window.__flToggleNav()">Under $1,000</a></li>
      <li><a href="guide-best-gaming-laptop-under-1500.html" onclick="window.__flToggleNav()">Under $1,500</a></li>
      <li><a href="guide-best-gaming-laptop-under-2000.html" onclick="window.__flToggleNav()">Under $2,000</a></li>
      <li><a href="guide-best-rtx-5080-gaming-laptop-2026.html" onclick="window.__flToggleNav()">Best RTX 5080</a></li>
      <li><a href="guide-best-thin-light-gaming-laptop-2026.html" onclick="window.__flToggleNav()">Best Thin &amp; Light</a></li>
      <li><a href="guide-best-14-inch-gaming-laptop-2026.html" onclick="window.__flToggleNav()">Best 14-inch</a></li>
      <li><a href="guide-best-amd-gaming-laptop-2026.html" onclick="window.__flToggleNav()">Best AMD</a></li>
      <li><a href="guide-best-gaming-laptop-college-2026.html" onclick="window.__flToggleNav()">Best for College</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">Use Case Guides</div>
    <ul class="md-links">
      <li><a href="guide-best-gaming-laptop-video-editing-2026.html" onclick="window.__flToggleNav()">Video Editing</a></li>
      <li><a href="guide-best-gaming-laptop-streaming-2026.html" onclick="window.__flToggleNav()">Streaming</a></li>
      <li><a href="guide-best-gaming-laptop-fortnite-2026.html" onclick="window.__flToggleNav()">Fortnite</a></li>
      <li><a href="guide-best-gaming-laptop-minecraft-2026.html" onclick="window.__flToggleNav()">Minecraft</a></li>
      <li><a href="guide-best-gaming-laptop-college-budget-2026.html" onclick="window.__flToggleNav()">College Budget</a></li>
    </ul>
  </div>
  <div class="md-section">
    <div class="md-label">Tools &amp; Guides</div>
    <ul class="md-links">
      <li><a href="compare.html" onclick="window.__flToggleNav()">⚖️ Compare Laptops</a></li>
      <li><a href="guide-rtx-vs-amd-2026.html" onclick="window.__flToggleNav()">RTX vs AMD</a></li>
      <li><a href="guide-gaming-laptop-vs-desktop-2026.html" onclick="window.__flToggleNav()">Laptop vs Desktop</a></li>
      <li><a href="guide-gaming-laptop-cooling-thermals-2026.html" onclick="window.__flToggleNav()">Cooling Guide</a></li>
    </ul>
  </div>
  <a href="guide-best-gaming-laptops-2026.html" class="md-cta" onclick="window.__flToggleNav()">🏆 See Best Laptops 2026</a>
</div>
<div class="drawer-overlay" id="fl-drawer-overlay" onclick="window.__flToggleNav()"></div>
`;

  // Toggle function — safe to call from any page
  window.__flToggleNav = function () {
    const drawer = document.getElementById('fl-mobile-drawer');
    const overlay = document.getElementById('fl-drawer-overlay');
    if (!drawer) return;
    drawer.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  };

  // Mark active nav link based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  root.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('#')[0] === path) {
      a.style.color = 'var(--cyan)';
    }
  });
})();
