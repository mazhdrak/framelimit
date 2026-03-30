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

    /* ── 7. Inject local image ── */
    if (l.imgUrl) {
      const imgWrap = article.querySelector('.rc-img-wrap');
      if (imgWrap) {
        // Update existing img if present, otherwise create one
        let img = imgWrap.querySelector('img');
        if (img) {
          img.src = l.imgUrl;
          img.alt = l.name;
          img.loading = 'lazy';
          img.removeAttribute('onerror');
          img.removeAttribute('referrerpolicy');
          img.removeAttribute('crossorigin');
          img.style.mixBlendMode = 'multiply';
        } else {
          img = document.createElement('img');
          img.src = l.imgUrl;
          img.alt = l.name;
          img.loading = 'lazy';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;mix-blend-mode:multiply';
          imgWrap.insertBefore(img, imgWrap.firstChild);
        }
        imgWrap.style.background = '#000';
      }
    }

    /* ── 8. Replace ALL buy buttons / price links in this card ── */
    article.querySelectorAll('a[href*="amazon.com"]').forEach(a => {
      a.href = l.amazonUrl;
      /* keep existing label text but update the link */
    });

    /* ── 8. Update the rc-price-live badge — no fake price, just CTA ── */
    const priceLive = article.querySelector('.rc-price-live, .rc-price');
    if (priceLive) {
      priceLive.href = l.amazonUrl;
      priceLive.textContent = 'Check Price on Amazon ↓';
    }

    /* ── 9. Add review link if not already present ── */
    const ctaRow = article.querySelector('.cta-row');
    if (ctaRow && !ctaRow.querySelector('.fl-review-injected')) {
      const reviewUrl = (function() {
        const map = {
          'asus-rog-scar-18-2026':'scar18','asus-rog-scar-16-2026':'scar16',
          'asus-rog-zephyrus-g16-high':'g16','asus-rog-zephyrus-g14-2026':'g14',
          'asus-tuf-a16-entry':'tufa16','asus-tuf-a15-rtx5060':'tufa15',
          'asus-tuf-gaming-f16-rtx5070':'tuff16','lenovo-legion-pro-7i-gen10':'pro7i',
          'lenovo-legion-5i-gen10':'legion5i','lenovo-legion-5-gen10-amd':'legion5amd',
          'lenovo-loq-15-gen10':'loq15','lenovo-loq-16-gen10':'loq16',
          'msi-titan-18-hx-ai':'titan18','msi-raider-18-hx-ai':'raider18',
          'msi-vector-16-hx-ai':'vector16','msi-katana-15-hx':'katana15',
          'razer-blade-18-2026':'blade18','razer-blade-16-oled-2026':'blade16',
          'alienware-18-area-51':'area51-18','dell-alienware-16x-aurora':'aurora16x',
          'hp-omen-max-16-2026':'omenmax5080','hp-omen-16-rtx5070-2026':'omen16',
          'acer-predator-helios-neo-16-2025':'heliosneo16',
          'acer-nitro-16-2025':'nitro16','acer-nitro-v-16':'nitrov16',
        };
        return map[lid] ? `reviews.html#${map[lid]}` : null;
      })();
      // Add affiliate note (no price)
      const note = document.createElement('div');
      note.className = 'fl-review-injected';
      note.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:9px;color:#7A94A8;margin-top:10px';
      note.textContent = '⚠ Affiliate link · framelimit20-20 · Price shown on Amazon';
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
