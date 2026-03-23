/**
 * FRAMELIMIT — reviews-sync.js
 * Injects live spec data from laptops.js into existing review cards.
 * Depends on laptops.js (must load first).
 *
 * HOW IT WORKS:
 *   Each <article class="review-card"> has an id like id="scar18".
 *   Add a data-laptop-id attribute with the laptops.js id:
 *     <article class="review-card" id="scar18" data-laptop-id="asus-rog-scar-18-2026" ...>
 *
 *   On DOMContentLoaded this script:
 *     1. Reads the laptops.js entry for that id
 *     2. Updates .rc-name, .rc-sub, .rc-score-big, sub-scores, .rc-specs
 *     3. Replaces ALL buy buttons in that card with the correct Amazon URL + tag
 *     4. Injects a live price badge
 *
 * ZERO RISK: if data-laptop-id is missing or id not found, card is untouched.
 */

(function () {

  /* ── score colour ── */
  function sc(v) {
    if (v >= 9.0) return 'var(--green)';
    if (v >= 8.0) return 'var(--cyan)';
    if (v >= 7.0) return 'var(--yellow)';
    return 'var(--orange)';
  }

  /* ── sub-score css class (used by existing style.css) ── */
  function ssc(v) {
    if (v >= 9.0) return 'g';
    if (v >= 8.0) return 'm';
    return 'b';
  }

  /* ── tier label html ── */
  function tierLabel(tier) {
    const map = {
      'high-end':  ['FLAGSHIP',  'tier-flagship'],
      'mid-range': ['MID-RANGE', 'tier-mid'],
      'budget':    ['BUDGET',    'tier-budget'],
    };
    const [label, cls] = map[tier] || ['', ''];
    return `<span class="tier-label ${cls}">${label}</span>`;
  }

  /* ── GPU colour for spec pills ── */
  function gpuColor(gpu) {
    if (gpu.startsWith('RTX')) return 'nv';
    if (gpu.startsWith('Radeon') || gpu.startsWith('RX')) return 'am';
    return '';
  }

  /* ── main inject function ── */
  function syncCard(article) {
    const lid = article.dataset.laptopId;
    if (!lid) return;
    const l = window.getLaptop(lid);
    if (!l) { console.warn('[reviews-sync] laptop not found:', lid); return; }

    /* ── 1. rc-name ── */
    const nameEl = article.querySelector('.rc-name');
    if (nameEl) nameEl.textContent = l.name;

    /* ── 2. rc-brand ── */
    const brandEl = article.querySelector('.rc-brand');
    if (brandEl) brandEl.textContent = l.brand.toUpperCase();

    /* ── 3. rc-sub (tier badge + key specs line) ── */
    const subEl = article.querySelector('.rc-sub');
    if (subEl) {
      subEl.innerHTML = `${tierLabel(l.tier)}${l.gpu} ${l.tgp}W · ${l.cpu} · ${l.display.size}" ${l.display.panel} ${l.display.hz}Hz`;
    }

    /* ── 4. Overall score ── */
    const scoreBig = article.querySelector('.rc-score-big');
    if (scoreBig) {
      const [whole, dec] = l.score.toFixed(1).split('.');
      scoreBig.style.color = sc(l.score);
      scoreBig.innerHTML = `${whole}<span>.${dec}</span>`;
    }

    /* ── 5. Sub-scores ── */
    const ssEls = article.querySelectorAll('.ss');
    const subKeys = ['perf', 'display', 'thermals', 'battery', 'build', 'value'];
    const subLabels = ['Perf', 'Display', 'Thermals', 'Battery', 'Build', 'Value'];
    if (ssEls.length >= subKeys.length) {
      subKeys.forEach((key, i) => {
        const val = l.scores[key];
        if (val === undefined) return;
        const labelEl = ssEls[i].querySelector('.ss-label');
        const valEl   = ssEls[i].querySelector('.ss-val');
        if (labelEl) labelEl.textContent = subLabels[i];
        if (valEl) {
          valEl.textContent = val;
          valEl.className = `ss-val ${ssc(val)}`;
        }
      });
    }

    /* ── 6. rc-specs pill row ── */
    const specsEl = article.querySelector('.rc-specs');
    if (specsEl) {
      const ramNote = l.ramUpgradeable ? '' : '<span class="spec warn">✗ Soldered RAM</span>';
      specsEl.innerHTML = `
        <span class="spec ${gpuColor(l.gpu)}">${l.gpu} ${l.gpuVram} ${l.tgp}W</span>
        <span class="spec">${l.cpu}</span>
        <span class="spec">${l.ram}</span>
        <span class="spec">${l.display.size}" ${l.display.panel} ${l.display.res} ${l.display.hz}Hz</span>
        <span class="spec">${l.storage}</span>
        <span class="spec">${l.weight}kg · ${l.battery}Wh</span>
        ${ramNote}`;
    }

    /* ── 7. Replace ALL buy buttons / price links in this card ── */
    article.querySelectorAll('a[href*="amazon.com"]').forEach(a => {
      a.href = l.amazonUrl;
      /* keep existing label text but update the link */
    });

    /* ── 8. Update the rc-price-live badge (top-right price button) ── */
    const priceLive = article.querySelector('.rc-price-live, .rc-price');
    if (priceLive) {
      priceLive.href = l.amazonUrl;
      priceLive.textContent = `~$${l.price.toLocaleString()} · Amazon ↓`;
    }

    /* ── 9. Inject a "Starting from" note below the CTA row if not already there ── */
    const ctaRow = article.querySelector('.cta-row');
    if (ctaRow && !ctaRow.querySelector('.fl-price-from')) {
      const note = document.createElement('div');
      note.className = 'fl-price-from';
      note.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:9px;color:var(--muted);margin-top:10px';
      note.textContent = `Starting ~$${l.price.toLocaleString()} · Prices updated daily · tag: framelimit20-20`;
      ctaRow.appendChild(note);
    }
  }

  /* ── run on DOMContentLoaded ── */
  function init() {
    if (!window.getLaptop) {
      console.error('[reviews-sync] laptops.js not loaded — cannot sync review cards');
      return;
    }
    document.querySelectorAll('.review-card[data-laptop-id]').forEach(syncCard);
    console.log('[reviews-sync] synced', document.querySelectorAll('.review-card[data-laptop-id]').length, 'review cards from laptops.js');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
