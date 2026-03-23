/**
 * FRAMELIMIT.COM — Laptop Card & Table Renderer
 * Depends on: laptops.js (must be loaded first)
 *
 * FIXES v2:
 *   - Removed fake prices from all rendered elements
 *   - Added "Read Review →" link to full cards and hero picks
 *   - Comparison tables collapse to 4 rows with "Show all" expand button
 *   - Synth/stutter tables also collapse to 4 rows
 *   - Deal cards show no price, just "Check Price" CTA
 */

/* ── Score colour ── */
function flScoreColor(v) {
  if (v >= 9.0) return 'var(--green)';
  if (v >= 8.0) return 'var(--cyan)';
  if (v >= 7.0) return 'var(--yellow)';
  return 'var(--orange)';
}

/* ── Tier label ── */
function flTierLabel(tier) {
  const map = {
    'high-end':  { label: 'FLAGSHIP',  color: 'var(--orange)' },
    'mid-range': { label: 'MID-RANGE', color: 'var(--cyan)'   },
    'budget':    { label: 'BUDGET',    color: 'var(--green)'  },
  };
  return map[tier] || { label: tier.toUpperCase(), color: 'var(--muted)' };
}

/* ── GPU badge colour ── */
function flGpuColor(gpu) {
  if (gpu.startsWith('RTX')) return 'var(--cyan)';
  if (gpu.startsWith('Radeon') || gpu.startsWith('RX')) return 'var(--orange)';
  return 'var(--muted)';
}

/* ── Review anchor link ── */
function flReviewLink(id) {
  // Map laptops.js id → reviews.html anchor
  const map = {
    'asus-rog-scar-18-2026':            'scar18',
    'asus-rog-scar-16-2026':            'scar16',
    'asus-rog-zephyrus-g16-high':       'g16',
    'asus-rog-zephyrus-g16-mid':        'g16',
    'asus-rog-zephyrus-g14-2026':       'g14',
    'asus-tuf-a16-entry':               'tufa16',
    'asus-tuf-a15-rtx5060':             'tufa15',
    'asus-tuf-gaming-f16-rtx5070':      'tuff16',
    'lenovo-legion-pro-7i-gen10':       'pro7i',
    'lenovo-legion-5i-gen10':           'legion5i',
    'lenovo-legion-5-gen10-amd':        'legion5amd',
    'lenovo-loq-15-gen10':              'loq15',
    'lenovo-loq-16-gen10':              'loq16',
    'msi-titan-18-hx-ai':               'titan18',
    'msi-raider-18-hx-ai':              'raider18',
    'msi-vector-16-hx-ai':              'vector16',
    'msi-katana-15-hx':                 'katana15',
    'razer-blade-18-2026':              'blade18',
    'razer-blade-16-oled-2026':         'blade16',
    'alienware-18-area-51':             'area51-18',
    'dell-alienware-16x-aurora':        'aurora16x',
    'hp-omen-max-16-2026':              'omenmax5080',
    'hp-omen-16-rtx5070-2026':          'omen16',
    'acer-predator-helios-neo-16-2025': 'heliosneo16',
    'acer-nitro-16-2025':               'nitro16',
    'acer-nitro-v-16':                  'nitrov16',
    'hp-victus-16-rtx5060':             null,
    'gigabyte-g6-rtx5060':              null,
    'dell-g15-rtx5060':                 null,
  };
  const anchor = map[id];
  return anchor ? `reviews.html#${anchor}` : null;
}

/* ══════════════════════════════════════════════════════
   1. FULL AFFILIATE CARD
   ══════════════════════════════════════════════════════ */
function flRenderCard(laptop) {
  const tier    = flTierLabel(laptop.tier);
  const scoreC  = flScoreColor(laptop.score);
  const gpuC    = flGpuColor(laptop.gpu);
  const reviewUrl = flReviewLink(laptop.id);

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

  const reviewBtn = reviewUrl
    ? `<a href="${reviewUrl}" class="fl-btn-review">Read Full Review →</a>`
    : '';

  const imgHtml = laptop.imgUrl
    ? `<div class="fl-img-wrap" style="background:${laptop.imgBg || '#0d1117'}">
        <img src="${laptop.imgUrl}" alt="${laptop.name}" onerror="this.parentElement.style.display='none'" loading="lazy">
        <div class="fl-img-overlay"></div>
        <span class="fl-img-badge" style="background:${tier.color};color:var(--black)">${tier.label}</span>
      </div>`
    : `<div class="fl-img-placeholder" style="background:${laptop.imgBg || '#0d1117'}">
        <span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--muted);letter-spacing:2px">${laptop.brand}</span>
      </div>`;

  return `
<article class="fl-card" id="fl-${laptop.id}" data-tier="${laptop.tier}">
  ${imgHtml}

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
    ${reviewBtn}
  </div>
  <div class="fl-aff-note">⚠ Affiliate link · FRAMELIMIT earns a commission at no extra cost to you</div>
</article>`;
}

/* ══════════════════════════════════════════════════════
   2. COMPARISON TABLE — collapses to 4 rows, expandable
   ══════════════════════════════════════════════════════ */
let _tableCounter = 0;
function flRenderTable(laptops) {
  const tid = 'flt-' + (++_tableCounter);
  const rows = laptops.map((l, i) => {
    const sc = flScoreColor(l.score);
    const gc = flGpuColor(l.gpu);
    const highlight = i === 0 ? 'fl-table-top' : '';
    const hidden = i >= 4 ? ' class="fl-table-hidden" style="display:none"' : '';
    const reviewUrl = flReviewLink(l.id);
    const reviewLink = reviewUrl
      ? `<a href="${reviewUrl}" style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);text-decoration:none;display:block;margin-top:2px" onmouseover="this.style.color='var(--cyan)'" onmouseout="this.style.color='var(--muted)'">Review →</a>`
      : '';
    return `<tr class="${highlight}"${hidden}>
      <td class="fl-td-name">
        <span class="fl-td-brand">${l.brand}</span>
        <span class="fl-td-model">${l.name}</span>
        ${reviewLink}
      </td>
      <td><span style="color:${gc};font-family:'JetBrains Mono',monospace;font-size:12px">${l.gpu}</span></td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.tgp}W</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.cpu.replace('Intel Core ', '').replace('AMD ', '')}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.display.size}" ${l.display.hz}Hz ${l.display.panel}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px">${l.weight}kg</td>
      <td style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${sc}">${l.score}</td>
      <td>
        <a href="${l.amazonUrl}" class="fl-table-buy" rel="nofollow sponsored" target="_blank">Amazon →</a>
      </td>
    </tr>`;
  }).join('');

  const hasMore = laptops.length > 4;
  const expandBtn = hasMore ? `
<button class="fl-expand-btn" id="${tid}-btn" onclick="flToggleTable('${tid}')">
  Show all ${laptops.length} laptops ▼
</button>` : '';

  return `
<div class="fl-table-wrap">
  <table class="fl-table" id="${tid}">
    <thead>
      <tr>
        <th>Laptop</th>
        <th>GPU</th>
        <th>TGP</th>
        <th>CPU</th>
        <th>Display</th>
        <th>Weight</th>
        <th>Score</th>
        <th>Buy</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
${expandBtn}
<div class="fl-table-note">Sorted by score · Click Amazon → to check current price · Affiliate links</div>`;
}

function flToggleTable(tid) {
  const table = document.getElementById(tid);
  const btn   = document.getElementById(tid + '-btn');
  if (!table || !btn) return;
  const hidden = table.querySelectorAll('.fl-table-hidden');
  if (!hidden.length) return;
  const isCollapsed = hidden[0].style.display === 'none' || hidden[0].style.display === '';
  hidden.forEach(row => { row.style.display = isCollapsed ? 'table-row' : 'none'; });
  const total = table.querySelectorAll('tbody tr').length;
  btn.textContent = isCollapsed ? 'Show fewer ▲' : `Show all ${total} laptops ▼`;
}

/* ══════════════════════════════════════════════════════
   3. HERO PICKS (compact sidebar cards)
   ══════════════════════════════════════════════════════ */
function flRenderHeroPicks(ids) {
  return ids.map((id, i) => {
    const l = getLaptop(id);
    if (!l) return `<!-- laptop not found: ${id} -->`;
    const reviewUrl = flReviewLink(l.id);
    const href = reviewUrl || l.amazonUrl;
    const rel  = reviewUrl ? '' : 'rel="nofollow sponsored" target="_blank"';
    const imgEl = l.imgUrl
      ? `<div class="hp-img" style="background:${l.imgBg||'#0d1117'}"><img src="${l.imgUrl}" alt="${l.shortName}" onerror="this.parentElement.style.display='none'" loading="lazy"></div>`
      : '';
    return `
<a href="${href}" class="hp-card" ${rel} style="text-decoration:none">
  ${imgEl}
  <div class="hp-rank">0${i+1} — ${l.badge}</div>
  <div class="hp-name">${l.shortName}</div>
  <div class="hp-spec">${l.gpu} · ${l.display.panel} ${l.display.hz}Hz · Score ${l.score}</div>
  <div class="hp-price" style="color:var(--cyan)">${reviewUrl ? 'Read Review →' : 'Check on Amazon →'}</div>
</a>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════
   4. DEALS GRID (3-up deal cards — no fake prices)
   ══════════════════════════════════════════════════════ */
function flRenderDeals(ids) {
  const badgeMap = {
    'high-end':  ['⭐ FLAGSHIP',   'badge-hot'],
    'mid-range': ['🔥 BEST VALUE', 'badge-new'],
    'budget':    ['💰 BUDGET PICK','badge-sale'],
  };
  return ids.map(id => {
    const l = getLaptop(id);
    if (!l) return `<!-- laptop not found: ${id} -->`;
    const [badgeText, badgeClass] = badgeMap[l.tier] || ['PICK', 'badge-new'];
    const reviewUrl = flReviewLink(l.id);
    const reviewBtn = reviewUrl
      ? `<a href="${reviewUrl}" class="deal-review-btn">Read Review →</a>`
      : '';
    const imgEl = l.imgUrl
      ? `<div class="deal-img" style="background:${l.imgBg||'#0d1117'}"><img src="${l.imgUrl}" alt="${l.name}" onerror="this.parentElement.style.display='none'" loading="lazy"></div>`
      : '';
    return `
<div class="deal-card">
  <span class="deal-badge ${badgeClass}">${badgeText}</span>
  ${imgEl}
  <div class="deal-brand">${l.brand.toUpperCase()}</div>
  <div class="deal-name">${l.name}</div>
  <div class="deal-spec">${l.gpu} ${l.tgp}W · ${l.display.size}" ${l.display.panel} ${l.display.hz}Hz · ${l.ram}</div>
  <div class="deal-prices" style="margin-bottom:12px">
    <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted)">Score: </span>
    <span style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${flScoreColor(l.score)}">${l.score}</span>
  </div>
  <a href="${l.amazonUrl}" class="deal-btn" rel="nofollow sponsored" target="_blank">Check Price on Amazon →</a>
  ${reviewBtn}
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
/* ── FL CARD IMAGE ── */
.fl-img-wrap{position:relative;height:220px;overflow:hidden;margin:-24px -24px 20px -24px;background:#0d1117}
.fl-img-wrap img{width:100%;height:100%;object-fit:contain;object-position:center;padding:20px;transition:transform .5s ease;display:block}
.fl-card:hover .fl-img-wrap img{transform:scale(1.04)}
.fl-img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,#111820 100%);pointer-events:none}
.fl-img-badge{position:absolute;top:12px;left:12px;font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;letter-spacing:1.5px;padding:4px 10px;text-transform:uppercase;z-index:2}
.fl-img-placeholder{height:120px;display:flex;align-items:center;justify-content:center;margin:-24px -24px 20px -24px;border-bottom:1px solid #1E2A36;background:#0d1117}

/* ── HERO PICK IMAGE ── */
.hp-img{height:90px;overflow:hidden;margin:-16px -18px 12px -18px;background:#0d1117;border-bottom:1px solid #1E2A36}
.hp-img img{width:100%;height:100%;object-fit:contain;object-position:center;padding:10px;display:block;transition:transform .4s}
.hp-card:hover .hp-img img{transform:scale(1.05)}

/* ── DEAL CARD IMAGE ── */
.deal-img{height:140px;overflow:hidden;margin:-20px -20px 16px -20px;border-bottom:1px solid #1E2A36;background:#0d1117}
.deal-img img{width:100%;height:100%;object-fit:contain;object-position:center;padding:14px;display:block;transition:transform .4s}
.deal-card:hover .deal-img img{transform:scale(1.04)}

/* ── FL CARD ── */
.fl-card{background:var(--panel,#111820);border:1px solid var(--border,#1E2A36);padding:24px;margin-bottom:24px;transition:border-color .2s;position:relative}
.fl-card:hover{border-color:var(--cyan,#00D4FF)}
.fl-card-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.fl-card-meta{display:flex;flex-direction:column;gap:6px}
.fl-tier-badge{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:2px;padding:3px 10px}
.fl-badge-text{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted,#7A94A8)}
.fl-score-wrap{text-align:right}
.fl-score{font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1}
.fl-score-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted,#7A94A8);letter-spacing:2px}
.fl-brand{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted,#7A94A8);letter-spacing:2px;margin-bottom:4px}
.fl-name{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--white,#F2F8FF);letter-spacing:1px;margin-bottom:14px}
.fl-specs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.fl-spec-tag{font-family:'JetBrains Mono',monospace;font-size:10px;background:var(--deep,#0D1117);border:1px solid var(--border,#1E2A36);color:var(--text,#D8E8F4);padding:3px 9px}
.fl-spec-ok{color:var(--green,#00FF88)!important;border-color:rgba(0,255,136,.3)!important}
.fl-spec-warn{color:var(--yellow,#FFD600)!important;border-color:rgba(255,214,0,.3)!important}
.fl-subscores{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;padding:14px;background:var(--deep,#0D1117);border:1px solid var(--border,#1E2A36)}
.fl-ss{text-align:center;min-width:52px}
.fl-ss-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted,#7A94A8);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
.fl-ss-val{font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1}
.fl-verdict-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.fl-verdict{padding:12px;border:1px solid var(--border,#1E2A36)}
.fl-verdict-best{border-left:3px solid var(--green,#00FF88);background:rgba(0,255,136,.04)}
.fl-verdict-avoid{border-left:3px solid var(--orange,#FF4500);background:rgba(255,69,0,.04)}
.fl-verdict-label{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1.5px;color:var(--muted,#7A94A8);margin-bottom:6px;text-transform:uppercase}
.fl-verdict-text{font-size:13px;color:var(--text,#D8E8F4);line-height:1.5}
.fl-cta-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border,#1E2A36)}
.fl-btn-buy{background:var(--orange,#FF4500);color:var(--white,#F2F8FF);font-family:'Barlow',sans-serif;font-weight:700;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;padding:12px 24px;text-decoration:none;transition:filter .2s;display:inline-block}
.fl-btn-buy:hover{filter:brightness(1.15)}
.fl-btn-review{background:transparent;color:var(--cyan,#00D4FF);font-family:'Barlow',sans-serif;font-weight:600;font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:12px 20px;text-decoration:none;border:1px solid rgba(0,212,255,.3);transition:all .2s;display:inline-block}
.fl-btn-review:hover{background:rgba(0,212,255,.07);border-color:var(--cyan,#00D4FF)}
.fl-aff-note{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted,#7A94A8);margin-top:10px}

/* ── FL TABLE ── */
.fl-table-wrap{overflow-x:auto;margin-bottom:8px}
.fl-table{width:100%;border-collapse:collapse}
.fl-table th{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted,#7A94A8);letter-spacing:1.5px;text-transform:uppercase;padding:12px 14px;background:var(--panel,#111820);border-bottom:2px solid var(--border,#1E2A36);text-align:left;white-space:nowrap}
.fl-table td{padding:12px 14px;border-bottom:1px solid rgba(30,42,54,.5);vertical-align:middle;color:var(--text,#D8E8F4)}
.fl-table tr:hover td{background:rgba(0,212,255,.02)}
.fl-table-top td{background:rgba(0,212,255,.03)}
.fl-table-top td:first-child{border-left:2px solid var(--cyan,#00D4FF)}
.fl-table-hidden{display:none!important}
.fl-td-brand{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted,#7A94A8);letter-spacing:1px;display:block;margin-bottom:2px}
.fl-td-model{font-family:'Bebas Neue',sans-serif;font-size:17px;color:var(--white,#F2F8FF);display:block;line-height:1.2}
.fl-table-buy{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--cyan,#00D4FF);font-weight:700;text-decoration:none;white-space:nowrap}
.fl-table-buy:hover{color:var(--white,#F2F8FF)}
.fl-table-note{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted,#7A94A8);margin-bottom:8px}
.fl-expand-btn{background:var(--deep,#0D1117);border:1px solid var(--border,#1E2A36);color:var(--cyan,#00D4FF);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;padding:10px 20px;cursor:pointer;width:100%;margin:8px 0;transition:all .2s}
.fl-expand-btn:hover{background:rgba(0,212,255,.07);border-color:var(--cyan,#00D4FF)}

/* ── DEAL REVIEW LINK ── */
.deal-review-btn{display:block;text-align:center;margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted,#7A94A8);text-decoration:none;letter-spacing:1px}
.deal-review-btn:hover{color:var(--cyan,#00D4FF)}

@media(max-width:768px){
  .fl-verdict-grid{grid-template-columns:1fr}
}
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════════════════
   AUTO-INIT
   ══════════════════════════════════════════════════════ */
function flInit() {
  flInjectStyles();

  document.querySelectorAll('[data-fl-cards]').forEach(el => {
    const val = el.dataset.flCards;
    let list;
    if (['high-end','mid-range','budget'].includes(val)) {
      list = sortByScore(LAPTOPS_BY_TIER[val]);
    } else {
      const tags = val.split(',').map(t => t.trim());
      list = sortByScore(getLaptopsByTag(...tags));
    }
    el.innerHTML = list.map(flRenderCard).join('');
  });

  document.querySelectorAll('[data-fl-card]').forEach(el => {
    const l = getLaptop(el.dataset.flCard);
    el.innerHTML = l ? flRenderCard(l) : `<p style="color:var(--muted)">Laptop not found: ${el.dataset.flCard}</p>`;
  });

  document.querySelectorAll('[data-fl-table]').forEach(el => {
    const val = el.dataset.flTable;
    const list = val === 'all' ? sortByScore(LAPTOPS) : sortByScore(LAPTOPS_BY_TIER[val] || []);
    el.innerHTML = flRenderTable(list);
  });

  document.querySelectorAll('[data-fl-picks]').forEach(el => {
    const ids = el.dataset.flPicks.split(',').map(s => s.trim());
    el.innerHTML = flRenderHeroPicks(ids);
  });

  document.querySelectorAll('[data-fl-deals]').forEach(el => {
    const ids = el.dataset.flDeals.split(',').map(s => s.trim());
    el.innerHTML = `<div class="deals-grid">${flRenderDeals(ids)}</div>`;
  });
}

document.addEventListener('DOMContentLoaded', flInit);

window.flRenderCard      = flRenderCard;
window.flRenderTable     = flRenderTable;
window.flRenderDeals     = flRenderDeals;
window.flRenderHeroPicks = flRenderHeroPicks;
window.flToggleTable     = flToggleTable;
window.flInit            = flInit;
window.flScoreColor      = flScoreColor;
window.flTierLabel       = flTierLabel;
window.flGpuColor        = flGpuColor;
window.flReviewLink      = flReviewLink;
