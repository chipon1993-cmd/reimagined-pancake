// loader.js — рендерит контент страниц из site-data.js + переопределения из localStorage

(function () {

  function getData() {
    // Preview mode: admin passed a full snapshot via ac_preview
    if (new URLSearchParams(location.search).has('preview')) {
      try {
        const prev = localStorage.getItem('ac_preview');
        if (prev) return JSON.parse(prev);
      } catch(e) {}
    }

    const lang = localStorage.getItem('ac_lang') || 'ru';

    // 1. Base defaults
    let base = JSON.parse(JSON.stringify(window.AC_DEFAULTS));

    // 2. Merge language-specific translations (UK / NO)
    if (lang !== 'ru' && window.AC_TRANSLATIONS && window.AC_TRANSLATIONS[lang]) {
      base = deepMerge(base, window.AC_TRANSLATIONS[lang]);
    }

    // 3. Russian admin edits apply to ALL languages (master content)
    //    This way, any change made in admin is visible in every language.
    const ruSaved = localStorage.getItem('ac_content');
    if (ruSaved) {
      try { base = deepMerge(base, JSON.parse(ruSaved)); }
      catch (e) {}
    }

    // 4. Language-specific admin fine-tuning on top (optional, set via admin lang switcher)
    if (lang !== 'ru') {
      const langSaved = localStorage.getItem('ac_content_' + lang);
      if (langSaved) {
        try { base = deepMerge(base, JSON.parse(langSaved)); }
        catch (e) {}
      }
    }

    // 5. Restore nav translations lost during RU master merge (step 3).
    //    Per-key: only fill keys the admin hasn't explicitly overridden in step 4.
    if (lang !== 'ru' && window.AC_TRANSLATIONS && window.AC_TRANSLATIONS[lang]) {
      const transNav = window.AC_TRANSLATIONS[lang].global && window.AC_TRANSLATIONS[lang].global.nav;
      if (transNav && base.global) {
        let adminNav = {};
        try {
          const ld = JSON.parse(localStorage.getItem('ac_content_' + lang) || '{}');
          adminNav = (ld.global && ld.global.nav) || {};
        } catch(e) {}
        Object.keys(transNav).forEach(k => { if (!adminNav[k]) base.global.nav[k] = transNav[k]; });
      }
    }

    return base;
  }

  function deepMerge(base, over) {
    if (!over) return base;
    const r = Object.assign({}, base);
    for (const k of Object.keys(over)) {
      if (Array.isArray(over[k])) r[k] = over[k];
      else if (over[k] && typeof over[k] === 'object') r[k] = deepMerge(base[k] || {}, over[k]);
      else r[k] = over[k];
    }
    return r;
  }

  function set(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
  function attr(id, a, v) { const el = document.getElementById(id); if (el) el.setAttribute(a, v); }
  function i18n(key, fallback) {
    const lang = localStorage.getItem('ac_lang') || 'ru';
    const t = window.AC_I18N && window.AC_I18N[lang];
    return (t && t[key]) || fallback;
  }

  function renderFooter(g) {
    const f = document.querySelector('footer');
    if (f) f.innerHTML = `<span>${g.footerLeft}</span><span>${g.footerRight}</span><a href="admin.html" class="admin-link" title="Админ-панель">⚙</a>`;
  }

  // ── INDEX ──────────────────────────────────────────
  function renderIndex(d, allData) {
    set('hero-badge-text', d.badge);
    set('hero-tagline', d.tagline);
    set('hero-sub', d.sub);
    set('home-quote-text', d.quote);
    set('home-quote-author', d.quoteAuthor);
    if (d.btnPrimary) { set('btn-primary-text', d.btnPrimary.text); attr('btn-primary', 'href', d.btnPrimary.href); }
    if (d.btnGhost)   { set('btn-ghost-text', d.btnGhost.text);     attr('btn-ghost',   'href', d.btnGhost.href);   }

    // Hero stats (editable)
    const hm = document.getElementById('hero-meta');
    if (hm) {
      const showStats = !allData || !allData.appearance || allData.appearance.showHeroStats !== false;
      if (!showStats) {
        hm.style.display = 'none';
      } else if (d.heroStats && d.heroStats.length) {
        hm.innerHTML = d.heroStats.map((s, i) =>
          (i > 0 ? '<div class="hero-meta-sep"></div>' : '') +
          `<div class="hero-meta-item">
            <div class="hero-meta-num">${s.num}</div>
            <div class="hero-meta-lbl">${s.lbl}</div>
          </div>`
        ).join('');
      }
    }

    const nc = document.getElementById('nav-cards');
    if (nc && d.navCards) {
      nc.innerHTML = d.navCards.map(c => `
        <a href="${c.href}" class="nav-card fade-in">
          <div class="nav-card-icon">${c.icon}</div>
          <div class="nav-card-title">${c.title}</div>
          <div class="nav-card-desc">${c.desc}</div>
          <div class="nav-card-arrow">→</div>
        </a>`).join('');
    }

    // Newsletter (Buttondown)
    const nlWrap = document.getElementById('nl-wrap');
    if (nlWrap && allData && allData.global && allData.global.newsletter) {
      const bdId = allData.global.newsletter.buttondownId && allData.global.newsletter.buttondownId.trim();
      if (bdId) {
        const nlForm = document.getElementById('nl-form');
        if (nlForm) nlForm.dataset.bdid = bdId;
        nlWrap.style.display = '';
      }
    }
  }

  // ── ABOUT ──────────────────────────────────────────
  function renderAbout(d) {
    set('about-section-label', d.sectionLabel || i18n('lbl_about','Обо мне'));
    set('about-page-title', d.pageTitle);
    set('about-page-desc', d.pageDesc);
    const paras = document.getElementById('about-paragraphs');
    if (paras && d.paragraphs) paras.innerHTML = d.paragraphs.map(p => `<p>${p}</p>`).join('');
    const stats = document.getElementById('about-stats');
    if (stats && d.stats) stats.innerHTML = d.stats.map(s => `
      <div class="stat-card">
        <div class="num">${s.num}</div>
        <div class="lbl">${s.label}</div>
      </div>`).join('');
    const vals = document.getElementById('about-values');
    if (vals && d.values) vals.innerHTML = d.values.map(v => `
      <div class="value-item fade-in">
        <div class="value-icon">${v.icon}</div>
        <div class="value-text"><h4>${v.title}</h4><p>${v.desc}</p></div>
      </div>`).join('');
  }

  // ── JOURNEY ────────────────────────────────────────
  function renderJourney(d) {
    set('journey-section-label', d.sectionLabel || i18n('lbl_journey','Хронология'));
    set('journey-page-title', d.pageTitle);
    set('journey-page-desc', d.pageDesc);
    set('now-title', d.nowTitle);
    set('now-text', d.nowText);
    const tl = document.getElementById('timeline');
    if (tl && d.items) tl.innerHTML = d.items.map(item => `
      <div class="timeline-item fade-in">
        <div class="timeline-header">
          <span class="timeline-year">${item.year}</span>
          <span class="timeline-title">${item.title}</span>
        </div>
        <div class="timeline-location">${item.location}</div>
        <p class="timeline-desc">${item.desc}</p>
        <div class="timeline-tags">${(item.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>`).join('');
  }

  // ── INTERESTS ──────────────────────────────────────
  function renderInterests(d) {
    set('interests-section-label', d.sectionLabel || i18n('lbl_interests','Интересы'));
    set('interests-page-title', d.pageTitle);
    set('interests-page-desc', d.pageDesc);
    // Fallback map: icon → id (works even if localStorage cards have no id field)
    const iconToId = {'🧠':'psychology','🌀':'philosophy','⚡':'tech','🌍':'sociology','🤸':'acrobatics','🚗':'cars'};
    const grid = document.getElementById('interests-grid');
    if (grid && d.cards) grid.innerHTML = d.cards.map(c => {
      const cId  = c.id || iconToId[c.icon] || null;
      const href = cId ? `interest.html?id=${cId}` : null;
      const tag  = href ? 'a' : 'div';
      const hAttr = href ? `href="${href}"` : '';
      return `<${tag} class="interest-card fade-in" ${hAttr}>
        <div class="interest-icon">${c.icon}</div>
        <div class="interest-title">${c.title}</div>
        <div class="interest-desc">${c.desc}</div>
        <div class="interest-questions">${(c.questions||[]).map(q=>`<span>${q}</span>`).join('')}</div>
        ${href ? `<div class="interest-open-link">${i18n('open_board','Открыть доску →')}</div>` : ''}
      </${tag}>`;
    }).join('');
  }

  // ── CONTACT ────────────────────────────────────────
  // ── VIDEOS ─────────────────────────────────────────
  function getThumb(v) {
    if (v.thumb) return v.thumb;
    if (v.type === 'youtube' && v.embedId)
      return 'https://img.youtube.com/vi/' + v.embedId + '/hqdefault.jpg';
    // SVG placeholder
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' style='background:%23050810'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2300d4ff' font-size='56'%3E%E2%96%B6%3C/text%3E%3C/svg%3E";
  }

  function renderVideoCard(v) {
    const thumb  = getThumb(v);
    const views  = parseInt(localStorage.getItem('ac_views_' + v.id) || '0');
    const labels = { youtube: 'YouTube', vimeo: 'Vimeo', file: 'Файл' };
    const typeLabel = labels[v.type] || v.type;
    const tagsHtml  = (v.tags || []).map(t => `<span class="vtag">${t}</span>`).join('');
    return `<div class="vcard fade-in" data-vid="${v.id}" data-tags="${(v.tags||[]).join(',')}" onclick="openVideo('${v.id}')">
      <div class="vthumb">
        <img src="${thumb}" alt="${v.title}" loading="lazy"
             onerror="this.src=${JSON.stringify("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' style='background:%23050810'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2300d4ff' font-size='56'%3E%E2%96%B6%3C/text%3E%3C/svg%3E")}">
        <div class="vplay-btn"><div class="vplay-icon">▶</div></div>
        ${v.duration ? `<div class="vduration">${v.duration}</div>` : ''}
        <div class="vtype-badge vtype-${v.type}">${typeLabel}</div>
      </div>
      <div class="vinfo">
        ${tagsHtml ? `<div class="vtags">${tagsHtml}</div>` : ''}
        <div class="vtitle">${v.title}</div>
        <div class="vmeta">
          ${v.date ? `<span>${v.date}</span>` : ''}
          ${views ? `<span class="vmeta-views">👁 ${views}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  function renderVideos(d) {
    set('videos-section-label', d.sectionLabel || i18n('lbl_videos','Контент'));
    set('videos-page-title', d.pageTitle);
    set('videos-page-desc', d.pageDesc);

    const items = (d.items || []).filter(v => v.published !== false);
    window.AC_VIDEOS = items; // expose for modal JS

    // Featured banner
    const featured = items.find(v => v.featured);
    const featEl   = document.getElementById('videos-featured');
    if (featEl) {
      if (featured) {
        const thumb = getThumb(featured);
        featEl.innerHTML = `<div class="vfeatured fade-in" onclick="openVideo('${featured.id}')">
          <div class="vthumb"><img src="${thumb}" alt="${featured.title}" loading="lazy"></div>
          <div class="vfeatured-overlay">
            <div class="vfeatured-label">${i18n('featured_label','Избранное')}</div>
            <div class="vfeatured-title">${featured.title}</div>
            ${featured.desc ? `<div class="vfeatured-desc">${featured.desc}</div>` : ''}
            <div class="vfeatured-play">${i18n('watch_btn','▶ Смотреть')}</div>
          </div>
        </div>`;
      } else featEl.innerHTML = '';
    }

    // Grid
    const gridItems = featured ? items.filter(v => !v.featured) : items;
    const gridEl    = document.getElementById('videos-grid');
    const emptyEl   = document.getElementById('videos-empty');
    if (gridEl) {
      if (!items.length) {
        gridEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = '';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        gridEl.innerHTML = gridItems.map(v => renderVideoCard(v)).join('');
      }
    }

    // Filter bar — delegate to inline script
    if (window.renderVideoFilter) window.renderVideoFilter(items);
  }

  function renderContact(d) {
    set('contact-section-label', d.sectionLabel || i18n('lbl_contact','Контакт'));
    set('contact-page-title', d.pageTitle);
    set('contact-page-desc', d.pageDesc);
    set('contact-text-title', d.textTitle);
    const items = document.getElementById('contact-items');
    if (items && d.items) items.innerHTML = d.items.map(it => `
      <a href="${it.href}" class="contact-card fade-in" ${it.href.startsWith('http')?'target="_blank"':''}>
        <div class="icon">${it.icon}</div>
        <div class="info"><div class="label">${it.label}</div><div class="value">${it.value}</div></div>
        <div class="arrow">→</div>
      </a>`).join('');
    const paras = document.getElementById('contact-text-paras');
    if (paras && d.textParagraphs) paras.innerHTML = d.textParagraphs.map(p=>`<p>${p}</p>`).join('');
    const topics = document.getElementById('contact-topics');
    if (topics && d.topics) topics.innerHTML = d.topics.map(t=>`<span class="topic-tag">${t}</span>`).join('');

    // Web3Forms — show only when an access key is configured
    const formWrap = document.getElementById('contact-form-wrap');
    if (formWrap) {
      const w3key = d.form && d.form.web3formsKey && d.form.web3formsKey.trim();
      if (w3key) {
        const keyEl = document.getElementById('cf-access-key');
        if (keyEl) { keyEl.value = w3key; keyEl.dataset.key = w3key; }
        formWrap.style.display = '';
      } else {
        formWrap.style.display = 'none';
      }
    }
  }

  // ── PAGE VISIBILITY ────────────────────────────────
  function applyPageVisibility(pages) {
    const map = {
      about:     'about.html',
      journey:   'journey.html',
      interests: 'interests.html',
      videos:    'videos.html',
      contact:   'contact.html'
    };
    Object.entries(map).forEach(([key, href]) => {
      const visible = pages[key] !== false;
      // Hide / show nav menu link
      document.querySelectorAll(`.nav-links a[href="${href}"]`).forEach(a => {
        const li = a.closest('li');
        if (li) li.style.display = visible ? '' : 'none';
      });
      // Hide / show index nav cards
      document.querySelectorAll(`a.nav-card[href="${href}"]`).forEach(c => {
        c.style.display = visible ? '' : 'none';
      });
    });
  }

  // ── PREVIEW BANNER ─────────────────────────────────
  function injectPreviewBanner() {
    if (!new URLSearchParams(location.search).has('preview')) return;
    if (document.getElementById('ac-preview-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'ac-preview-bar';
    bar.style.cssText = [
      'position:fixed','top:0','left:0','right:0','z-index:99999',
      'display:flex','align-items:center','justify-content:space-between',
      'padding:7px 20px',
      'background:rgba(15,5,30,0.88)',
      'border-bottom:1px solid rgba(168,85,247,0.55)',
      'backdrop-filter:blur(12px)',
      'font-family:Inter,system-ui,sans-serif',
      'font-size:.75rem','font-weight:700','letter-spacing:.1em','text-transform:uppercase',
      'color:#c084fc',
      'box-shadow:0 2px 20px rgba(168,85,247,0.15)'
    ].join(';');
    bar.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px;">
        <span style="width:7px;height:7px;border-radius:50%;background:#c084fc;box-shadow:0 0 8px #c084fc;animation:pvpulse 1.5s infinite;display:inline-block;flex-shrink:0;"></span>
        👁 Предпросмотр — несохранённые изменения
      </span>
      <button id="ac-preview-close"
        style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.4);color:#c084fc;
               border-radius:4px;padding:4px 14px;cursor:pointer;font-size:.7rem;font-weight:700;
               letter-spacing:.1em;font-family:inherit;transition:.2s;"
        onmouseover="this.style.background='rgba(168,85,247,0.3)'"
        onmouseout="this.style.background='rgba(168,85,247,0.15)'"
        onclick="localStorage.removeItem('ac_preview');window.close();">
        ✕ Закрыть
      </button>`;
    // Pulse animation
    if (!document.getElementById('ac-preview-style')) {
      const st = document.createElement('style');
      st.id = 'ac-preview-style';
      st.textContent = '@keyframes pvpulse{0%,100%{opacity:1}50%{opacity:.3}} #ac-preview-bar~* { } body { padding-top:38px !important; }';
      document.head.appendChild(st);
    }
    document.body.prepend(bar);
  }

  // ── INIT ───────────────────────────────────────────
  function renderPage() {
    const page = document.body.dataset.page;
    if (!page) return;
    injectPreviewBanner();
    injectAnalytics();
    const data = getData();

    // Apply SEO + lang attribute
    const lang = localStorage.getItem('ac_lang') || 'ru';
    document.documentElement.lang = lang;
    if (data.seo && data.seo[page]) {
      if (data.seo[page].title) document.title = data.seo[page].title;
      let md = document.querySelector('meta[name="description"]');
      if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
      md.content = data.seo[page].desc || '';
    }
    // Update OG tags dynamically
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = document.title;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (ogDesc && metaDesc) ogDesc.content = metaDesc.content;

    // Expose nav data for translateNav() in nav.js
    if (data.global && data.global.nav) {
      window.AC_NAV_DATA = data.global.nav;
    }

    renderFooter(data.global);
    switch (page) {
      case 'index':     renderIndex(data.index, data);    break;
      case 'about':     renderAbout(data.about);          break;
      case 'journey':   renderJourney(data.journey);      break;
      case 'interests': renderInterests(data.interests);  break;
      case 'contact':   renderContact(data.contact);      break;
      case 'videos':    renderVideos(data.videos || { items: [] }); break;
      case 'interest-board': break; // hero/board handled by inline script; footer below
    }

    // Apply page visibility (hide pages not ready yet)
    if (data.appearance && data.appearance.pages) {
      applyPageVisibility(data.appearance.pages);
    }

    // Apply default theme for first-time visitors
    if (!localStorage.getItem('ac_theme') && data.appearance && data.appearance.defaultTheme) {
      const dt = data.appearance.defaultTheme;
      localStorage.setItem('ac_theme', dt);
      if (window.applyTheme) window.applyTheme(dt);
      if (window.updateThemeDots) window.updateThemeDots(dt);
    }

    setTimeout(() => {
      if (window.acObs) document.querySelectorAll('.fade-in:not(.visible)').forEach(el => window.acObs.observe(el));
    }, 60);
  }

  document.addEventListener('DOMContentLoaded', renderPage);

  // Expose for language switcher
  window.AC_RERENDER = renderPage;

  // ── ANALYTICS INJECTION (GDPR-gated) ────────────────────
  // GA only loads after cookie consent. Plausible is cookie-free → no consent needed.
  function injectAnalytics() {
    if (new URLSearchParams(location.search).has('preview')) return;
    try {
      const d = getData();
      const analytics = d.global && d.global.analytics;
      if (!analytics) return;

      // Plausible (no cookies → always OK)
      const domain = analytics.plausible && analytics.plausible.trim();
      if (domain && !document.querySelector('script[data-domain]')) {
        const s = document.createElement('script');
        s.defer = true;
        s.setAttribute('data-domain', domain);
        s.src = 'https://plausible.io/js/script.js';
        document.head.appendChild(s);
      }

      // Google Analytics 4 (needs cookie consent)
      const gaId = analytics.ga && analytics.ga.trim();
      if (!gaId) return;
      const consent = localStorage.getItem('ac_cookie_consent');
      if (consent === 'accepted') {
        injectGA(gaId);
      } else if (!consent) {
        showCookieBanner(gaId);
      }
      // consent === 'declined' → do nothing
    } catch(e) {}
  }

  function injectGA(gaId) {
    if (document.querySelector('script[src*="googletagmanager"]')) return;
    const g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(g);
    const gi = document.createElement('script');
    gi.textContent = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','" + gaId + "');";
    document.head.appendChild(gi);
  }

  // ── COOKIE CONSENT BANNER (GDPR) ──────────────────────
  function showCookieBanner(gaId) {
    if (document.getElementById('ac-cookie-banner')) return;
    const style = document.createElement('style');
    style.textContent = `
      #ac-cookie-banner {
        position:fixed; bottom:0; left:0; right:0; z-index:99998;
        background:rgba(5,8,16,0.96); border-top:1px solid rgba(0,212,255,0.15);
        backdrop-filter:blur(16px); padding:18px 24px;
        display:flex; align-items:center; justify-content:space-between; gap:16px;
        font-family:Inter,system-ui,sans-serif; font-size:.85rem;
        color:rgba(241,245,249,0.75); line-height:1.5;
        animation:cb-slide .35s ease-out;
      }
      @keyframes cb-slide { from { transform:translateY(100%); } to { transform:translateY(0); } }
      #ac-cookie-banner a { color:var(--accent,#00d4ff); text-decoration:underline; text-underline-offset:2px; }
      .cb-btns { display:flex; gap:8px; flex-shrink:0; }
      .cb-btn {
        border:none; border-radius:8px; padding:9px 20px;
        font-size:.8rem; font-weight:700; letter-spacing:.06em;
        cursor:pointer; font-family:inherit; transition:opacity .2s;
      }
      .cb-btn:hover { opacity:.85; }
      .cb-accept { background:var(--accent,#00d4ff); color:#050810; }
      .cb-decline { background:transparent; border:1px solid rgba(255,255,255,0.15); color:rgba(241,245,249,0.6); }
      @media(max-width:600px) {
        #ac-cookie-banner { flex-direction:column; text-align:center; padding:16px 18px; }
        .cb-btns { width:100%; justify-content:center; }
      }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'ac-cookie-banner';
    bar.innerHTML = `
      <span>Этот сайт использует cookies для аналитики (Google Analytics).
        Данные помогают понять, какие страницы интересны, и улучшить сайт.</span>
      <div class="cb-btns">
        <button class="cb-btn cb-accept" id="cb-accept">Принять</button>
        <button class="cb-btn cb-decline" id="cb-decline">Отклонить</button>
      </div>`;
    document.body.appendChild(bar);

    document.getElementById('cb-accept').addEventListener('click', function() {
      localStorage.setItem('ac_cookie_consent', 'accepted');
      bar.remove();
      injectGA(gaId);
    });
    document.getElementById('cb-decline').addEventListener('click', function() {
      localStorage.setItem('ac_cookie_consent', 'declined');
      bar.remove();
    });
  }

})();
