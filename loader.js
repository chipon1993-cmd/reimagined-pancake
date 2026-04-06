// loader.js — renders page content from site-data.js + Firestore overrides

(function () {

  // ── HTML SANITIZATION ──
  function esc(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  // Sanitize a URL: only allow http(s), mailto, tel, and relative paths
  function safeHref(url) {
    if (!url) return '';
    var s = String(url).trim();
    if (/^(https?:\/\/|mailto:|tel:|\/|[a-zA-Z0-9][\w.\-]*\.html(\?[\w=&\-]*)?)/i.test(s)) return esc(s);
    return '';
  }
  // Allow limited safe HTML tags (b, i, br) for admin-authored rich text; strip everything else
  function safeParagraph(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
      .replace(/<(?!\/?(?:b|i|br|strong|em)\s*\/?>)/gi, '&lt;')
      .replace(/on\w+\s*=/gi, '');
  }

  // ── ICON RENDERER (supports emoji + lucide:name) ──
  function renderIcon(val) {
    if (!val) return '';
    if (val.startsWith('lucide:')) {
      var name = esc(val.slice(7)).replace(/[^a-z0-9\-]/gi, '');
      // Return placeholder that lucide.createIcons() will process
      return '<i data-lucide="' + name + '"></i>';
    }
    return esc(val); // emoji or plain text — escaped
  }

  function activateLucideIcons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  function applyCustomColors(cc) {
    if (!cc) return;
    var root = document.documentElement;
    document.documentElement.removeAttribute('data-theme');
    if (cc.accent) {
      root.style.setProperty('--accent', cc.accent);
      // Derive glow from accent
      var r = parseInt(cc.accent.slice(1,3),16), g = parseInt(cc.accent.slice(3,5),16), b = parseInt(cc.accent.slice(5,7),16);
      root.style.setProperty('--glow', '0 0 24px rgba('+r+','+g+','+b+',0.25)');
      root.style.setProperty('--border', 'rgba('+r+','+g+','+b+',0.12)');
      root.style.setProperty('--border-h', 'rgba('+r+','+g+','+b+',0.45)');
      // Grid lines
      var gridEl = document.querySelector('body');
      if (gridEl) {
        root.style.setProperty('--grid-accent', 'rgba('+r+','+g+','+b+',0.04)');
      }
    }
    if (cc.accent2) {
      root.style.setProperty('--accent2', cc.accent2);
      var r2 = parseInt(cc.accent2.slice(1,3),16), g2 = parseInt(cc.accent2.slice(3,5),16), b2 = parseInt(cc.accent2.slice(5,7),16);
      root.style.setProperty('--glow2', '0 0 24px rgba('+r2+','+g2+','+b2+',0.25)');
    }
    if (cc.bg) root.style.setProperty('--bg', cc.bg);
    if (cc.text) root.style.setProperty('--text', cc.text);
  }
  // Expose globally for nav.js to use
  window.applyCustomColors = applyCustomColors;

  // Safe Firestore read — waits for Firebase init, returns null if unavailable
  async function safeGet(collection, docId) {
    // Wait for Firebase to initialize (or fail) before reading
    if (window.firebaseReady) {
      try { await window.firebaseReady; } catch(e) {}
    }
    if (typeof window.fsGet === 'function') {
      try { return await window.fsGet(collection, docId); } catch(e) { return null; }
    }
    return null;
  }

  // Helper: read from cache only if Firestore failed
  function readCache(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch(e) { return null; }
  }
  function writeCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
  }

  async function getData() {
    // Preview mode: admin passed a full snapshot via ac_preview
    if (new URLSearchParams(location.search).has('preview')) {
      try {
        var prev = localStorage.getItem('ac_preview');
        if (prev) return JSON.parse(prev);
      } catch(e) {}
    }

    // 1. Base defaults — always works, no Firebase needed
    var base = JSON.parse(JSON.stringify(window.AC_DEFAULTS));

    // 2. Admin edits from Firestore (cache is offline-only fallback)
    var ruData = await safeGet('content', 'ac_content');
    if (ruData) {
      writeCache('ac_content', ruData);
    } else {
      ruData = readCache('ac_content');
    }
    if (ruData) {
      base = deepMerge(base, ruData);
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

  // Sanitize rich-text HTML: allow only safe formatting tags
  function safeParagraph(html) {
    if (!html) return '';
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b','i','br','strong','em','a','u','span'], ALLOWED_ATTR: ['href','target','rel','class'] });
    }
    // Fallback: strip all tags except safe ones
    return html.replace(/<(?!\/?(?:b|i|br|strong|em|a|u|span)\b)[^>]*>/gi, '');
  }

  // Sanitize plain text for safe insertion
  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function set(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
  function attr(id, a, v) { const el = document.getElementById(id); if (el) el.setAttribute(a, v); }
  function i18n(key, fallback) {
    const t = window.AC_I18N && window.AC_I18N['ru'];
    return (t && t[key]) || fallback;
  }

  function renderFooter(g) {
    const f = document.querySelector('footer');
    if (f) f.innerHTML = `<span>${esc(g.footerLeft)}</span><span>${esc(g.footerRight)}</span><a href="admin.html" class="admin-link" title="Админ-панель">⚙</a>`;
  }

  // ── INDEX ──────────────────────────────────────────
  function renderIndex(d, allData) {
    set('hero-badge-text', esc(d.badge));
    set('hero-tagline', esc(d.tagline));
    set('hero-sub', esc(d.sub));
    set('home-quote-text', esc(d.quote));
    set('home-quote-author', esc(d.quoteAuthor));
    if (d.btnPrimary) { set('btn-primary-text', esc(d.btnPrimary.text)); attr('btn-primary', 'href', safeHref(d.btnPrimary.href)); }
    if (d.btnGhost)   { set('btn-ghost-text', esc(d.btnGhost.text));     attr('btn-ghost',   'href', safeHref(d.btnGhost.href));   }

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
            <div class="hero-meta-num">${esc(s.num)}</div>
            <div class="hero-meta-lbl">${esc(s.lbl)}</div>
          </div>`
        ).join('');
      }
    }

    const nc = document.getElementById('nav-cards');
    if (nc && d.navCards) {
      nc.innerHTML = d.navCards.map(c => `
        <a href="${safeHref(c.href)}" class="nav-card fade-in">
          <div class="nav-card-icon">${renderIcon(c.icon)}</div>
          <div class="nav-card-title">${esc(c.title)}</div>
          <div class="nav-card-desc">${esc(c.desc)}</div>
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
    set('about-section-label', esc(d.sectionLabel || i18n('lbl_about','Обо мне')));
    set('about-page-title', esc(d.pageTitle));
    set('about-page-desc', esc(d.pageDesc));
    const paras = document.getElementById('about-paragraphs');
    if (paras && d.paragraphs) paras.innerHTML = d.paragraphs.map(p => `<p>${safeParagraph(p)}</p>`).join('');
    const stats = document.getElementById('about-stats');
    if (stats && d.stats) stats.innerHTML = d.stats.map(s => `
      <div class="stat-card">
        <div class="num">${esc(s.num)}</div>
        <div class="lbl">${esc(s.label)}</div>
      </div>`).join('');
    const vals = document.getElementById('about-values');
    if (vals && d.values) vals.innerHTML = d.values.map(v => `
      <div class="value-item fade-in">
        <div class="value-icon">${renderIcon(v.icon)}</div>
        <div class="value-text"><h4>${esc(v.title)}</h4><p>${esc(v.desc)}</p></div>
      </div>`).join('');
  }

  // ── JOURNEY ────────────────────────────────────────
  function renderJourney(d) {
    set('journey-section-label', esc(d.sectionLabel || i18n('lbl_journey','Хронология')));
    set('journey-page-title', esc(d.pageTitle));
    set('journey-page-desc', esc(d.pageDesc));
    set('now-title', esc(d.nowTitle));
    set('now-text', safeParagraph(d.nowText));
    const tl = document.getElementById('timeline');
    if (tl && d.items) tl.innerHTML = d.items.map(item => `
      <div class="timeline-item fade-in">
        <div class="timeline-header">
          <span class="timeline-year">${esc(item.year)}</span>
          <span class="timeline-title">${esc(item.title)}</span>
        </div>
        <div class="timeline-location">${esc(item.location)}</div>
        <p class="timeline-desc">${safeParagraph(item.desc)}</p>
        <div class="timeline-tags">${(item.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
      </div>`).join('');
  }

  // ── INTERESTS ──────────────────────────────────────
  function renderInterests(d) {
    set('interests-section-label', esc(d.sectionLabel || i18n('lbl_interests','Интересы')));
    set('interests-page-title', esc(d.pageTitle));
    set('interests-page-desc', esc(d.pageDesc));
    const iconToId = {'🧠':'psychology','🌀':'philosophy','⚡':'tech','🌍':'sociology','🤸':'acrobatics','🚗':'cars'};
    const grid = document.getElementById('interests-grid');
    if (grid && d.cards) grid.innerHTML = d.cards.map(c => {
      const cId  = c.id || iconToId[c.icon] || null;
      const safeId = cId ? esc(cId).replace(/[^a-z0-9_\-]/gi, '') : null;
      const href = safeId ? `interest.html?id=${safeId}` : null;
      const tag  = href ? 'a' : 'div';
      const hAttr = href ? `href="${href}"` : '';
      return `<${tag} class="interest-card fade-in" ${hAttr}>
        <div class="interest-icon">${renderIcon(c.icon)}</div>
        <div class="interest-title">${esc(c.title)}</div>
        <div class="interest-desc">${esc(c.desc)}</div>
        <div class="interest-questions">${(c.questions||[]).map(q=>`<span>${esc(q)}</span>`).join('')}</div>
        ${href ? `<div class="interest-open-link">${esc(i18n('open_board','Открыть доску →'))}</div>` : ''}
      </${tag}>`;
    }).join('');
  }

  // ── CONTACT ────────────────────────────────────────
  // ── VIDEOS ─────────────────────────────────────────
  function getThumb(v) {
    if (v.thumb) return v.thumb;
    if (v.type === 'youtube' && v.embedId)
      return 'https://img.youtube.com/vi/' + v.embedId + '/hqdefault.jpg';
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' style='background:%23050810'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2300d4ff' font-size='56'%3E%E2%96%B6%3C/text%3E%3C/svg%3E";
  }

  function renderVideoCard(v) {
    const thumb  = getThumb(v);
    const views  = parseInt(localStorage.getItem('ac_views_' + v.id) || '0');
    const labels = { youtube: 'YouTube', vimeo: 'Vimeo', file: 'Файл' };
    const typeLabel = labels[v.type] || esc(v.type);
    const safeType = esc(v.type).replace(/[^a-z]/gi,'');
    const tagsHtml  = (v.tags || []).map(t => `<span class="vtag">${esc(t)}</span>`).join('');
    const fallbackSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' style='background:%23050810'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2300d4ff' font-size='56'%3E%E2%96%B6%3C/text%3E%3C/svg%3E";
    return `<div class="vcard fade-in" data-vid="${esc(v.id)}" data-tags="${esc((v.tags||[]).join(','))}" onclick="openVideo(this.dataset.vid)">
      <div class="vthumb">
        <img src="${esc(thumb)}" alt="${esc(v.title)}" loading="lazy"
             onerror="this.onerror=null;this.src='${fallbackSvg}'">
        <div class="vplay-btn"><div class="vplay-icon">▶</div></div>
        ${v.duration ? `<div class="vduration">${esc(v.duration)}</div>` : ''}
        <div class="vtype-badge vtype-${safeType}">${typeLabel}</div>
      </div>
      <div class="vinfo">
        ${tagsHtml ? `<div class="vtags">${tagsHtml}</div>` : ''}
        <div class="vtitle">${esc(v.title)}</div>
        <div class="vmeta">
          ${v.date ? `<span>${esc(v.date)}</span>` : ''}
          ${views ? `<span class="vmeta-views">👁 ${views}</span>` : ''}
        </div>
      </div>
    </div>`;
  }

  function renderVideos(d) {
    set('videos-section-label', esc(d.sectionLabel || i18n('lbl_videos','Контент')));
    set('videos-page-title', esc(d.pageTitle));
    set('videos-page-desc', esc(d.pageDesc));

    const items = (d.items || []).filter(v => v.published !== false);
    window.AC_VIDEOS = items;

    const featured = items.find(v => v.featured);
    const featEl   = document.getElementById('videos-featured');
    if (featEl) {
      if (featured) {
        const thumb = getThumb(featured);
        featEl.innerHTML = `<div class="vfeatured fade-in" data-vid="${esc(featured.id)}" onclick="openVideo(this.dataset.vid)">
          <div class="vthumb"><img src="${esc(thumb)}" alt="${esc(featured.title)}" loading="lazy"></div>
          <div class="vfeatured-overlay">
            <div class="vfeatured-label">${esc(i18n('featured_label','Избранное'))}</div>
            <div class="vfeatured-title">${esc(featured.title)}</div>
            ${featured.desc ? `<div class="vfeatured-desc">${esc(featured.desc)}</div>` : ''}
            <div class="vfeatured-play">${esc(i18n('watch_btn','▶ Смотреть'))}</div>
          </div>
        </div>`;
      } else featEl.innerHTML = '';
    }

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

    if (window.renderVideoFilter) window.renderVideoFilter(items);
  }

  function renderContact(d) {
    set('contact-section-label', esc(d.sectionLabel || i18n('lbl_contact','Контакт')));
    set('contact-page-title', esc(d.pageTitle));
    set('contact-page-desc', esc(d.pageDesc));
    set('contact-text-title', esc(d.textTitle));
    const items = document.getElementById('contact-items');
    if (items && d.items) items.innerHTML = d.items.map(it => {
      const href = safeHref(it.href);
      return `
      <a href="${href}" class="contact-card fade-in" ${href.startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>
        <div class="icon">${renderIcon(it.icon)}</div>
        <div class="info"><div class="label">${esc(it.label)}</div><div class="value">${esc(it.value)}</div></div>
        <div class="arrow">→</div>
      </a>`;
    }).join('');
    const paras = document.getElementById('contact-text-paras');
    if (paras && d.textParagraphs) paras.innerHTML = d.textParagraphs.map(p=>`<p>${safeParagraph(p)}</p>`).join('');
    const topics = document.getElementById('contact-topics');
    if (topics && d.topics) topics.innerHTML = d.topics.map(t=>`<span class="topic-tag">${esc(t)}</span>`).join('');

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

  // ── DYNAMIC NAVIGATION ─────────────────────────
  var _hiddenPages = {};
  async function renderDynamicNav() {
    var navConfig = await safeGet('content', 'ac_navigation');
    if (!navConfig || !navConfig.header || !navConfig.header.length) return;
    var ul = document.getElementById('navLinks');
    if (!ul) return;
    // Map page keys to hrefs for visibility check
    var visMap = {
      'about.html': 'about', 'journey.html': 'journey',
      'interests.html': 'interests', 'videos.html': 'videos',
      'world.html': 'world', 'contact.html': 'contact'
    };
    function isHidden(href) {
      var key = visMap[href];
      return key && _hiddenPages[key] === false;
    }
    // Build new nav HTML from Firestore config
    var html = '';
    navConfig.header.forEach(function(item) {
      var href = safeHref(item.href);
      if (!href) return;
      if (isHidden(href)) return; // skip hidden pages
      if (item.children && item.children.length) {
        var subHtml = '';
        item.children.forEach(function(ch) {
          var chHref = safeHref(ch.href);
          if (isHidden(chHref)) return; // skip hidden children
          subHtml += '<li><a href="' + chHref + '" onclick="closeMenu()">' + esc(ch.label) + '</a></li>';
        });
        html += '<li class="nav-has-sub"><a href="' + href + '" onclick="closeMenu()">' + esc(item.label) + ' <span class="nav-sub-arrow">▼</span></a><ul class="nav-sub">' + subHtml + '</ul></li>';
      } else {
        html += '<li><a href="' + href + '" onclick="closeMenu()">' + esc(item.label) + '</a></li>';
      }
    });
    ul.innerHTML = html;
    // Re-highlight active link
    var cur = (window.location.pathname.split('/').pop() || 'index.html');
    // For page.html?id=x also match with query
    if (window.location.search) cur += window.location.search;
    ul.querySelectorAll('a').forEach(function(a) {
      var h = a.getAttribute('href');
      if (h === cur || h === cur.split('?')[0]) {
        a.classList.add('active');
        var parent = a.closest('.nav-has-sub');
        if (parent) { var pa = parent.querySelector(':scope > a'); if (pa) pa.classList.add('active'); }
      }
    });
  }

  // ── DYNAMIC PAGE (page.html?id=xxx) ────────────
  function renderBlock(b) {
    if (!b || !b.type) return '';
    switch (b.type) {
      case 'text':
        return '<div class="block-text fade-in">' + safeParagraph(b.content || '') + '</div>';
      case 'heading':
        return '<h2 class="block-heading fade-in">' + esc(b.content || '') + '</h2>';
      case 'quote':
        return '<div class="block-quote fade-in"><p>' + esc(b.content || '') + '</p>' +
          (b.author ? '<cite>' + esc(b.author) + '</cite>' : '') + '</div>';
      case 'divider':
        return '<div class="block-divider fade-in"></div>';
      case 'list':
        var items = b.items || [];
        return '<ul class="block-list fade-in">' + items.map(function(it){ return '<li>' + esc(it) + '</li>'; }).join('') + '</ul>';
      case 'stats':
        var stats = b.items || [];
        return '<div class="block-stats fade-in">' + stats.map(function(s){
          return '<div class="stat-card"><div class="stat-num">' + esc(s.num) + '</div><div class="stat-lbl">' + esc(s.label) + '</div></div>';
        }).join('') + '</div>';
      case 'callout':
        return '<div class="block-callout fade-in"><p>' + safeParagraph(b.content || '') + '</p></div>';
      case 'image':
        return '<figure class="block-image fade-in"><img src="' + esc(b.src || '') + '" alt="' + esc(b.alt || '') + '" loading="lazy" />' +
          (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
      case 'video':
        var src = b.src || '';
        var yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (yt) {
          return '<div class="block-video fade-in"><div class="video-wrapper"><iframe src="https://www.youtube.com/embed/' + esc(yt[1]) + '" frameborder="0" allowfullscreen loading="lazy"></iframe></div>' +
            (b.caption ? '<p class="video-caption">' + esc(b.caption) + '</p>' : '') + '</div>';
        }
        return '<div class="block-video fade-in"><div class="video-wrapper"><video src="' + esc(src) + '" controls preload="metadata"></video></div>' +
          (b.caption ? '<p class="video-caption">' + esc(b.caption) + '</p>' : '') + '</div>';
      case 'file':
        var fname = b.content || b.src.split('/').pop().split('?')[0] || 'Файл';
        var ext = fname.split('.').pop().toLowerCase();
        var icon = '📎';
        if (ext === 'pdf') icon = '📄';
        else if (['doc','docx','odt','rtf','txt'].indexOf(ext) >= 0) icon = '📝';
        else if (['xls','xlsx','csv'].indexOf(ext) >= 0) icon = '📊';
        else if (['zip','rar','7z'].indexOf(ext) >= 0) icon = '📦';
        return '<div class="block-file fade-in"><a href="' + esc(b.src || '') + '" target="_blank" rel="noopener" class="file-download">' +
          '<span class="file-icon">' + icon + '</span><div class="file-info"><span class="file-name">' + esc(fname) + '</span>' +
          (b.caption ? '<span class="file-desc">' + esc(b.caption) + '</span>' : '') + '</div><span class="file-action">Скачать ↓</span></a></div>';
      default:
        return '';
    }
  }

  async function renderDynamicPage() {
    var pageId = new URLSearchParams(location.search).get('id');
    if (!pageId) {
      set('dyn-title', 'Страница не найдена');
      set('dyn-desc', 'Укажите ?id= в адресной строке.');
      return;
    }
    pageId = pageId.replace(/[^a-zA-Z0-9_-]/g, '');
    var pageData = await safeGet('pages', pageId);
    if (!pageData) {
      set('dyn-title', 'Страница не найдена');
      set('dyn-desc', 'Страница «' + esc(pageId) + '» не существует.');
      return;
    }
    // Set hero
    set('dyn-label', esc(pageData.label || ''));
    set('dyn-title', esc(pageData.title || ''));
    set('dyn-desc', esc(pageData.desc || ''));
    // Update document title
    if (pageData.title) document.title = pageData.title + ' · Andrii Chepelovskyi';
    var md = document.querySelector('meta[name="description"]');
    if (md && pageData.desc) md.content = pageData.desc;
    // Render blocks
    var blocksEl = document.getElementById('dyn-blocks');
    if (blocksEl && pageData.blocks && pageData.blocks.length) {
      blocksEl.innerHTML = pageData.blocks.map(renderBlock).join('');
    } else if (blocksEl && pageData.status === 'draft') {
      blocksEl.innerHTML = '<div class="page-empty">Черновик — контент пока не добавлен</div>';
    } else if (blocksEl) {
      blocksEl.innerHTML = '<div class="page-empty">Скоро здесь появится контент</div>';
    }
    // Render sub-pages links
    if (blocksEl) {
      try {
        var allPages = await window.fsListCollection('pages');
        var children = allPages.filter(function(p) { return p.parentId === pageId && p.status === 'published'; });
        if (children.length) {
          var subHtml = '<div class="sub-pages fade-in"><div class="sub-pages-title">Подстраницы</div><div class="sub-pages-grid">';
          children.forEach(function(ch) {
            subHtml += '<a href="page.html?id=' + esc(ch.id) + '" class="sub-page-card">';
            subHtml += '<span class="sub-page-name">' + esc(ch.title || ch.id) + '</span>';
            if (ch.desc) subHtml += '<span class="sub-page-desc">' + esc(ch.desc) + '</span>';
            subHtml += '</a>';
          });
          subHtml += '</div></div>';
          blocksEl.innerHTML += subHtml;
        }
        // Show breadcrumb if this is a sub-page
        if (pageData.parentId) {
          var parent = allPages.find(function(p) { return p.id === pageData.parentId; });
          if (parent) {
            var bcEl = document.getElementById('dyn-label');
            if (bcEl) bcEl.innerHTML = '<a href="page.html?id=' + esc(parent.id) + '" style="color:var(--accent);text-decoration:none;">' + esc(parent.title || parent.id) + '</a> / ' + esc(pageData.label || '');
          }
        }
      } catch(e) {}
    }
  }

  // ── PAGE VISIBILITY ────────────────────────────
  function applyPageVisibility(pages, save) {
    const map = {
      about:     'about.html',
      journey:   'journey.html',
      interests: 'interests.html',
      videos:    'videos.html',
      world:     'world.html',
      contact:   'contact.html'
    };
    Object.entries(map).forEach(([key, href]) => {
      const visible = pages[key] !== false;
      document.querySelectorAll(`.nav-links a[href="${href}"]`).forEach(a => {
        const li = a.closest('li');
        if (li) li.style.display = visible ? '' : 'none';
      });
      document.querySelectorAll(`a.nav-card[href="${href}"]`).forEach(c => {
        c.style.display = visible ? '' : 'none';
      });
    });
    if (save) { try { localStorage.setItem('ac_page_vis', JSON.stringify(pages)); } catch(e){} }
  }

  // Apply cached visibility immediately (before Firestore loads)
  try {
    var cachedVis = JSON.parse(localStorage.getItem('ac_page_vis') || '{}');
    if (Object.keys(cachedVis).length) {
      _hiddenPages = cachedVis;
      applyPageVisibility(cachedVis);
    }
  } catch(e) {}

  // ── PREVIEW BANNER ─────────────────────────────
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
        Предпросмотр — несохранённые изменения
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
    if (!document.getElementById('ac-preview-style')) {
      const st = document.createElement('style');
      st.id = 'ac-preview-style';
      st.textContent = '@keyframes pvpulse{0%,100%{opacity:1}50%{opacity:.3}} body { padding-top:38px !important; } body > nav { top:38px !important; }';
      document.head.appendChild(st);
    }
    document.body.prepend(bar);
  }

  // ── INIT ───────────────────────────────────────────
  async function renderPage() {
    const page = document.body.dataset.page;
    if (!page) return;
    injectPreviewBanner();
    const data = await getData();

    // Maintenance mode — block site for visitors
    if (data.global && data.global.maintenance && data.global.maintenance.enabled) {
      var mTitle = data.global.maintenance.title || 'Сайт на обслуживании';
      var mMsg = data.global.maintenance.message || 'Мы скоро вернёмся.';
      document.body.innerHTML = '';
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#050810;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;font-family:Inter,system-ui,sans-serif;';
      overlay.innerHTML = '<div style="font-size:3rem;margin-bottom:20px;opacity:.6;">🔧</div>' +
        '<h1 style="color:#f1f5f9;font-size:clamp(1.4rem,4vw,2rem);font-weight:800;margin-bottom:14px;">' + mTitle + '</h1>' +
        '<p style="color:rgba(148,163,184,0.8);font-size:1rem;max-width:400px;line-height:1.7;">' + mMsg + '</p>';
      document.body.appendChild(overlay);
      var po = document.getElementById('page-overlay');
      if (po) po.style.display = 'none';
      return;
    }

    injectAnalytics(data);

    if (data.seo && data.seo[page]) {
      if (data.seo[page].title) document.title = data.seo[page].title;
      let md = document.querySelector('meta[name="description"]');
      if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
      md.content = data.seo[page].desc || '';
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = document.title;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (ogDesc && metaDesc) ogDesc.content = metaDesc.content;

    if (data.global && data.global.nav) {
      window.AC_NAV_DATA = data.global.nav;
    }

    renderFooter(data.global);

    // ── Load page visibility before building nav ──
    if (data.appearance && data.appearance.pages) {
      _hiddenPages = data.appearance.pages;
    }

    // ── Dynamic Navigation from Firestore ──
    await renderDynamicNav();

    switch (page) {
      case 'index':     renderIndex(data.index, data);    break;
      case 'about':     renderAbout(data.about);          break;
      case 'journey':   renderJourney(data.journey);      break;
      case 'interests': renderInterests(data.interests);  break;
      case 'contact':   renderContact(data.contact);      break;
      case 'videos':    renderVideos(data.videos || { items: [] }); break;
      case 'interest-board': break;
      case 'dynamic':       await renderDynamicPage();  break;
    }

    if (data.appearance && data.appearance.dateFormat) {
      window._acDateFmt = data.appearance.dateFormat;
    }

    if (data.appearance && data.appearance.favicon) {
      var favUrl = data.appearance.favicon;
      var favLink = document.querySelector('link[rel="icon"]');
      if (favLink) { favLink.href = favUrl; }
      else { var fl = document.createElement('link'); fl.rel = 'icon'; fl.href = favUrl; document.head.appendChild(fl); }
    }

    if (data.appearance && data.appearance.pages) {
      applyPageVisibility(data.appearance.pages, true);
    }

    if (!localStorage.getItem('ac_theme') && data.appearance && data.appearance.defaultTheme) {
      const dt = data.appearance.defaultTheme;
      localStorage.setItem('ac_theme', dt);
      if (window.applyTheme) window.applyTheme(dt);
      if (window.updateThemeDots) window.updateThemeDots(dt);
    }

    // Apply custom colors if theme is 'custom'
    if (data.appearance && data.appearance.customColors) {
      var cc = data.appearance.customColors;
      window.AC_CUSTOM_COLORS = cc;
      var currentTheme = localStorage.getItem('ac_theme') || data.appearance.defaultTheme || 'cyan';
      if (currentTheme === 'custom') {
        applyCustomColors(cc);
      }
      // Add custom theme dot to nav if not present
      document.querySelectorAll('.theme-dots').forEach(function(wrap){
        if (!wrap.querySelector('[data-theme="custom"]')) {
          var dot = document.createElement('button');
          dot.className = 'theme-dot t-custom';
          dot.dataset.theme = 'custom';
          dot.title = 'Custom';
          dot.onclick = function(){ switchTheme('custom'); };
          dot.style.background = 'conic-gradient(' + (cc.accent||'#00d4ff') + ', ' + (cc.accent2||'#a855f7') + ', ' + (cc.accent||'#00d4ff') + ')';
          wrap.appendChild(dot);
        }
      });
      if (window.updateThemeDots) window.updateThemeDots(currentTheme);
    }

    setTimeout(() => {
      if (window.acObs) document.querySelectorAll('.fade-in:not(.visible)').forEach(el => window.acObs.observe(el));
    }, 60);

    // Activate Lucide SVG icons after rendering
    activateLucideIcons();
  }

  document.addEventListener('DOMContentLoaded', renderPage);

  window.AC_RERENDER = renderPage;

  // ── LIVE PREVIEW: accept updates from admin iframe parent ──
  window.addEventListener('message', function(e){
    if(!e.data || e.data.type !== 'ac_live_update') return;
    var newData = e.data.data;
    if(!newData) return;
    // Store as preview data and re-render
    localStorage.setItem('ac_preview', JSON.stringify(newData));
    // Re-render all sections with new data
    var pg = (window.location.pathname.split('/').pop() || 'index.html').replace(/\?.*/,'');
    if(pg === 'index.html' || pg === '' || pg === '/') {
      if(newData.index) renderIndex(newData.index, newData);
      if(newData.global) renderFooter(newData.global);
    } else if(pg === 'about.html' && newData.about) {
      renderAbout(newData.about);
    } else if(pg === 'journey.html' && newData.journey) {
      renderJourney(newData.journey);
    } else if(pg === 'interests.html' && newData.interests) {
      renderInterests(newData.interests);
    } else if(pg === 'contact.html' && newData.contact) {
      renderContact(newData.contact);
    } else if(pg === 'videos.html' && newData.videos) {
      renderVideos(newData.videos);
    }
    if(newData.global) renderFooter(newData.global);
    activateLucideIcons();
  });

  // ── ANALYTICS INJECTION (GDPR-gated) ────────────────────
  function injectAnalytics(d) {
    if (new URLSearchParams(location.search).has('preview')) return;
    if (!d) return;
    const analytics = d.global && d.global.analytics;
    if (!analytics) return;

    const domain = analytics.plausible && analytics.plausible.trim();
    // Validate domain format to prevent attribute injection
    if (domain && /^[a-z0-9][a-z0-9.\-]+\.[a-z]{2,}$/i.test(domain) && !document.querySelector('script[data-domain]')) {
      const s = document.createElement('script');
      s.defer = true;
      s.setAttribute('data-domain', domain);
      s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    }

    const gaId = analytics.ga && analytics.ga.trim();
    if (!gaId) return;
    const cbSettings = (d && d.global && d.global.cookieBanner) || {};
    if (cbSettings.enabled === false) { injectGA(gaId); return; }
    const consent = localStorage.getItem('ac_cookie_consent');
    if (consent === 'accepted') {
      injectGA(gaId);
    } else if (!consent) {
      showCookieBanner(gaId, cbSettings);
    }
  }

  function injectGA(gaId) {
    // Validate GA measurement ID format (G-XXXXXXXXXX or UA-XXXXX-X)
    if (!/^(G-[A-Z0-9]{4,15}|UA-\d{4,10}-\d{1,4})$/i.test(gaId)) return;
    if (document.querySelector('script[src*="googletagmanager"]')) return;
    const g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    document.head.appendChild(g);
    const gi = document.createElement('script');
    gi.textContent = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','" + gaId.replace(/[^A-Z0-9\-]/gi, '') + "');";
    document.head.appendChild(gi);
  }

  // ── COOKIE CONSENT BANNER (GDPR) ──────────────────────
  function showCookieBanner(gaId, cbSettings) {
    if (document.getElementById('ac-cookie-banner')) return;
    cbSettings = cbSettings || {};
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
    var cbText = cbSettings.text || 'Этот сайт использует cookies для аналитики (Google Analytics). Данные помогают понять, какие страницы интересны, и улучшить сайт.';
    var cbAccept = cbSettings.acceptText || 'Принять';
    var cbDecline = cbSettings.declineText || 'Отклонить';
    bar.innerHTML = `
      <span>${cbText}</span>
      <div class="cb-btns">
        <button class="cb-btn cb-accept" id="cb-accept">${cbAccept}</button>
        <button class="cb-btn cb-decline" id="cb-decline">${cbDecline}</button>
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
