/**
 * FRAMELIMIT.COM — Laptop Card & Table Renderer
 * Depends on: laptops.js (must be loaded first)
 *
 * USAGE ON ANY PAGE:
 *   <script src="laptops.js"></script>
 *   <script src="laptop-cards.js"></script>
 *
 * AFFILIATE CARDS — drop a container anywhere:
 *   <div data-fl-cards="high-end"></div>          ← renders all high-end
 *   <div data-fl-cards="mid-range"></div>          ← renders all mid-range
 *   <div data-fl-cards="budget"></div>             ← renders all budget
 *   <div data-fl-card="lenovo-legion-pro-7i-gen10"></div>  ← single card by ID
 *   <div data-fl-cards="oled,thin"></div>          ← filter by tags (comma-sep)
 *
 * COMPARISON TABLE — drop a container anywhere:
 *   <div data-fl-table="high-end"></div>
 *   <div data-fl-table="mid-range"></div>
 *   <div data-fl-table="budget"></div>
 *   <div data-fl-table="all"></div>
 *
 * HERO PICKS (small cards for homepage top-5):
 *   <div data-fl-picks="legion-pro-7i-gen10,razer-blade-16-oled-2026,..."></div>
 *
 * DEALS GRID (3-up deal cards):
 *   <div data-fl-deals="lenovo-loq-15-gen10,lenovo-legion-5i-gen10,asus-rog-scar-16-2026"></div>
 */

/* ── Score colour helper ─────────────────────────────── */
function flScoreColor(v) {
  if (v >= 9.0) return 'var(--green)';
  if (v >= 8.0) return 'var(--cyan)';
  if (v >= 7.0) return 'var(--yellow)';
  return 'var(--orange)';
}

/* ── Tier label helper ───────────────────────────────── */
function flTierLabel(tier) {
  const map = {
    'high-end':  { label: 'FLAGSHIP',   color: 'var(--orange)' },
    'mid-range': { label: 'MID-RANGE',  color: 'var(--cyan)'   },
    'budget':    { label: 'BUDGET',     color: 'var(--green)'  },
  };
  return map[tier] || { label: tier.toUpperCase(), color: 'var(--muted)' };
}

/* ── GPU badge colour ────────────────────────────────── */
function flGpuColor(gpu) {
  if (gpu.startsWith('RTX')) return 'var(--cyan)';
  if (gpu.startsWith('Radeon') || gpu.startsWith('RX')) return 'var(--orange)';
  return 'var(--muted)';
}

/* ══════════════════════════════════════════════════════
   1. FULL AFFILIATE CARD
   ══════════════════════════════════════════════════════ */
function flRenderCard(laptop) {
  const tier   = flTierLabel(laptop.tier);
  const scoreC = flScoreColor(laptop.score);
  const gpuC   = flGpuColor(laptop.gpu);

  const subScoreHtml = Object.entries(laptop.scores).map(([k, v]) => {
    const c = flScoreColor(v);
    return `<div class="fl-ss">
      <div class="fl-ss-label">${k.charAt(0).toUpperCase() + k.slice(1)}</div>
      <div class="fl-ss-val" style="color:${c}">${v}</div>
    </div>`;
  }).join('');

  const ramNote = laptop.ramUpgradeable
    ? `<span class="fl-spec-tag fl-spec-ok">✓ Upgradeable RAM</span>`
    : `<span class="fl-spec-tag fl-spec-warn">✗ Soldered RAM</span>`;

  return `
<article class="fl-card" id="fl-${laptop.id}" data-tier="${laptop.tier}">
  <div class="fl-card-head">
    <div class="fl-card-meta">
      <span class="fl-tier-badge" style="background:${tier.color};color:var(--black)">${tier.label}</span>
      <span class="fl-badge-text">${laptop.badge}</span>
    </div>
    <div class="fl-score-wrap">
      <div class="fl-score" style="color:${scoreC}">${laptop.score}</div>
      <div class="fl-score-label">FL SCORE</div>
    </div>
  </div>

  <div class="fl-card-title">
    <div class="fl-brand">${laptop.brand.toUpperCase()}</div>
    <div class="fl-name">${laptop.name}</div>
  </div>

  <div class="fl-specs">
    <span class="fl-spec-tag" style="color:${gpuC};border-color:${gpuC}40">${laptop.gpu} ${laptop.gpuVram} · ${laptop.tgp}W</span>
    <span class="fl-spec-tag">${laptop.cpu}</span>
    <span class="fl-spec-tag">${laptop.ram}</span>
    <span class="fl-spec-tag">${laptop.display.size}" ${laptop.display.res} ${laptop.display.hz}Hz ${laptop.display.panel}</span>
    <span class="fl-spec-tag">${laptop.storage}</span>
    <span class="fl-spec-tag">${laptop.weight}kg · ${laptop.battery}Wh</span>
    ${ramNote}
  </div>

  <div class="fl-subscores">${subScoreHtml}</div>

  <div class="fl-verdict-grid">
    <div class="fl-verdict fl-verdict-best">
      <div class="fl-verdict-label">✅ Best For</div>
      <div class="fl-verdict-text">${laptop.bestFor}</div>
    </div>
    <div class="fl-verdict fl-verdict-avoid">
      <div class="fl-verdict-label">❌ Avoid If</div>
      <div class="fl-verdict-text">${laptop.avoidIf}</div>
    </div>
  </div>

  <div class="fl-cta-row">
    <a href="${laptop.amazonUrl}" class="fl-btn-buy" rel="nofollow sponsored" target="_blank">
      Check Price on Amazon →
    </a>
    <div class="fl-price-note">Starting ~$${laptop.price.toLocaleString()} · Prices updated daily</div>
  </div>
  <div class="fl-aff-note">⚠ Affiliate link · FRAMELIMIT earns a commission at no extra cost to you</div>
</article>`;
}

/* ══════════════════════════════════════════════════════
   2. COMPARISON TABLE
   ══════════════════════════════════════════════════════ */
function flRenderTable(laptops) {
  const rows = laptops.map((l, i) => {
    const sc = flScoreColor(l.score);
    const gc = flGpuColor(l.gpu);
    const highlight = i === 0 ? 'fl-table-top' : '';
    return `<tr class="${highlight}">
      <td class="fl-td-name">
        <span class="fl-td-brand">${l.brand}</span>
        <span class="fl-td-model">${l.name}</span>
      </td>
      <td><span style="color:${gc};font-family:'JetBrains Mono',monospace;font-size:12px">${l.gpu}</span></td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.tgp}W</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.cpu.replace('Intel Core ', '').replace('AMD ', '')}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.display.size}" ${l.display.hz}Hz ${l.display.panel}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.weight}kg</td>
      <td style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${sc}">${l.score}</td>
      <td>
        <a href="${l.amazonUrl}" class="fl-table-buy" rel="nofollow sponsored" target="_blank">~$${l.price.toLocaleString()}</a>
      </td>
    </tr>`;
  }).join('');

  return `
<div class="fl-table-wrap">
  <table class="fl-table">
    <thead>
      <tr>
        <th>Laptop</th>
        <th>GPU</th>
        <th>TGP</th>
        <th>CPU</th>
        <th>Display</th>
        <th>Weight</th>
        <th>Score</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div class="fl-table-note">Prices as of March 2026 · Click price to check current Amazon listing · Affiliate links</div>`;
}

/* ══════════════════════════════════════════════════════
   3. HERO PICKS (compact cards — for homepage sidebar)
   ══════════════════════════════════════════════════════ */
function flRenderHeroPicks(ids) {
  return ids.map((id, i) => {
    const l = getLaptop(id);
    if (!l) return `<!-- laptop not found: ${id} -->`;
    const tier = flTierLabel(l.tier);
    return `
<a href="${l.amazonUrl}" class="hp-card" rel="nofollow sponsored" target="_blank" style="text-decoration:none">
  <div class="hp-rank">0${i+1} — ${l.badge}</div>
  <div class="hp-name">${l.shortName}</div>
  <div class="hp-spec">${l.gpu} · ${l.display.panel} ${l.display.hz}Hz · Score ${l.score}</div>
  <div class="hp-price" style="color:var(--green)">~$${l.price.toLocaleString()} · Check on Amazon →</div>
</a>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   4. DEALS GRID (3-up deal cards — for homepage deals section)
   ══════════════════════════════════════════════════════ */
function flRenderDeals(ids) {
  const badgeMap = { 'high-end': ['⭐ FLAGSHIP', 'badge-hot'], 'mid-range': ['🔥 BEST VALUE', 'badge-new'], 'budget': ['💰 BUDGET PICK', 'badge-sale'] };
  return ids.map(id => {
    const l = getLaptop(id);
    if (!l) return `<!-- laptop not found: ${id} -->`;
    const [badgeText, badgeClass] = badgeMap[l.tier] || ['PICK', 'badge-new'];
    return `
<div class="deal-card">
  <span class="deal-badge ${badgeClass}">${badgeText}</span>
  <div class="deal-brand">${l.brand.toUpperCase()}</div>
  <div class="deal-name">${l.name}</div>
  <div class="deal-spec">${l.gpu} ${l.tgp}W · ${l.display.size}" ${l.display.panel} ${l.display.hz}Hz · ${l.ram} · ${l.storage}</div>
  <div class="deal-prices"><span class="deal-price">~$${l.price.toLocaleString()}</span></div>
  <a href="${l.amazonUrl}" class="deal-btn" rel="nofollow sponsored" target="_blank">Check Price on Amazon →</a>
</div>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   CSS — injected once into <head>
   ══════════════════════════════════════════════════════ */
function flInjectStyles() {
  if (document.getElementById('fl-styles')) return;
  const style = document.createElement('style');
  style.id = 'fl-styles';
  style.textContent = `
/* ── FL CARD ───────────────────────────────────────── */
.fl-card {
  background: var(--panel, #111820);
  border: 1px solid var(--border, #1E2A36);
  padding: 24px;
  margin-bottom: 24px;
  transition: border-color .2s;
  position: relative;
}
.fl-card:hover { border-color: var(--cyan, #00D4FF); }

.fl-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.fl-card-meta { display: flex; flex-direction: column; gap: 6px; }
.fl-tier-badge {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 3px 10px;
}
.fl-badge-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--muted, #7A94A8);
}

.fl-score-wrap { text-align: right; }
.fl-score {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 52px;
  line-height: 1;
}
.fl-score-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: var(--muted, #7A94A8);
  letter-spacing: 2px;
}

.fl-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--muted, #7A94A8);
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.fl-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  color: var(--white, #F2F8FF);
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.fl-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.fl-spec-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  background: var(--deep, #0D1117);
  border: 1px solid var(--border, #1E2A36);
  color: var(--text, #D8E8F4);
  padding: 3px 9px;
}
.fl-spec-ok  { color: var(--green,  #00FF88) !important; border-color: rgba(0,255,136,.3)  !important; }
.fl-spec-warn{ color: var(--yellow, #FFD600) !important; border-color: rgba(255,214,0,.3)  !important; }

.fl-subscores {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 14px;
  background: var(--deep, #0D1117);
  border: 1px solid var(--border, #1E2A36);
}
.fl-ss { text-align: center; min-width: 52px; }
.fl-ss-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: var(--muted, #7A94A8);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.fl-ss-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  line-height: 1;
}

.fl-verdict-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
.fl-verdict {
  padding: 12px;
  border: 1px solid var(--border, #1E2A36);
}
.fl-verdict-best  { border-left: 3px solid var(--green,  #00FF88); background: rgba(0,255,136,.04); }
.fl-verdict-avoid { border-left: 3px solid var(--orange, #FF4500); background: rgba(255,69,0,.04);  }
.fl-verdict-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 1.5px;
  color: var(--muted, #7A94A8);
  margin-bottom: 6px;
  text-transform: uppercase;
}
.fl-verdict-text { font-size: 13px; color: var(--text, #D8E8F4); line-height: 1.5; }

.fl-cta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--border, #1E2A36);
}
.fl-btn-buy {
  background: var(--orange, #FF4500);
  color: var(--white, #F2F8FF);
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 12px 24px;
  text-decoration: none;
  transition: filter .2s;
  display: inline-block;
}
.fl-btn-buy:hover { filter: brightness(1.15); }
.fl-price-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--green, #00FF88);
}
.fl-aff-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted, #7A94A8);
  margin-top: 10px;
}

/* ── FL TABLE ──────────────────────────────────────── */
.fl-table-wrap { overflow-x: auto; margin-bottom: 8px; }
.fl-table {
  width: 100%;
  border-collapse: collapse;
}
.fl-table th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: var(--muted, #7A94A8);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 12px 14px;
  background: var(--panel, #111820);
  border-bottom: 2px solid var(--border, #1E2A36);
  text-align: left;
  white-space: nowrap;
}
.fl-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(30,42,54,.5);
  vertical-align: middle;
  color: var(--text, #D8E8F4);
}
.fl-table tr:hover td { background: rgba(0,212,255,.02); }
.fl-table-top td { background: rgba(0,212,255,.03); }
.fl-table-top td:first-child { border-left: 2px solid var(--cyan, #00D4FF); }

.fl-td-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted, #7A94A8);
  letter-spacing: 1px;
  display: block;
  margin-bottom: 2px;
}
.fl-td-model {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 17px;
  color: var(--white, #F2F8FF);
  display: block;
  line-height: 1.2;
}
.fl-table-buy {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--green, #00FF88);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}
.fl-table-buy:hover { color: var(--white, #F2F8FF); }
.fl-table-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted, #7A94A8);
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .fl-verdict-grid { grid-template-columns: 1fr; }
}
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════════════════
   AUTO-INIT — scans DOM and renders all data-fl-* elements
   ══════════════════════════════════════════════════════ */
function flInit() {
  flInjectStyles();

  /* data-fl-cards="tier | tag,tag" */
  document.querySelectorAll('[data-fl-cards]').forEach(el => {
    const val = el.dataset.flCards;
    let list;
    if (['high-end', 'mid-range', 'budget'].includes(val)) {
      list = sortByScore(LAPTOPS_BY_TIER[val]);
    } else {
      // treat as comma-separated tags
      const tags = val.split(',').map(t => t.trim());
      list = sortByScore(getLaptopsByTag(...tags));
    }
    el.innerHTML = list.map(flRenderCard).join('');
  });

  /* data-fl-card="laptop-id" — single card */
  document.querySelectorAll('[data-fl-card]').forEach(el => {
    const l = getLaptop(el.dataset.flCard);
    el.innerHTML = l ? flRenderCard(l) : `<p style="color:var(--muted)">Laptop not found: ${el.dataset.flCard}</p>`;
  });

  /* data-fl-table="tier | all" */
  document.querySelectorAll('[data-fl-table]').forEach(el => {
    const val = el.dataset.flTable;
    const list = val === 'all' ? sortByScore(LAPTOPS) : sortByScore(LAPTOPS_BY_TIER[val] || []);
    el.innerHTML = flRenderTable(list);
  });

  /* data-fl-picks="id1,id2,id3" — hero picks */
  document.querySelectorAll('[data-fl-picks]').forEach(el => {
    const ids = el.dataset.flPicks.split(',').map(s => s.trim());
    el.innerHTML = flRenderHeroPicks(ids);
  });

  /* data-fl-deals="id1,id2,id3" — deals grid */
  document.querySelectorAll('[data-fl-deals]').forEach(el => {
    const ids = el.dataset.flDeals.split(',').map(s => s.trim());
    el.innerHTML = `<div class="deals-grid">${flRenderDeals(ids)}</div>`;
  });
}

document.addEventListener('DOMContentLoaded', flInit);

/* Expose for manual calls */
window.flRenderCard      = flRenderCard;
window.flRenderTable     = flRenderTable;
window.flRenderDeals     = flRenderDeals;
window.flRenderHeroPicks = flRenderHeroPicks;
window.flInit            = flInit;
window.flScoreColor      = flScoreColor;
window.flTierLabel       = flTierLabel;
window.flGpuColor        = flGpuColor;
