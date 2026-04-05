/* =============================================
   EFFECTS.JS — Futuristic Interactive Effects
   (Optimized: merged observers, cached theme,
    reduced save/restore, visibility-pause, no shadows)
   ============================================= */
(function () {
  'use strict';

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // ─────────────────────────────────────────────
  // CACHED THEME STATE
  // Updated via MutationObserver on <html> attributes.
  // ─────────────────────────────────────────────
  let cachedTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  let isLightTheme = cachedTheme === 'light';

  const themeObs = new MutationObserver(() => {
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    if (t !== cachedTheme) {
      cachedTheme = t;
      isLightTheme = t === 'light';
    }
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ─────────────────────────────────────────────
  // VISIBILITY STATE (pause rAF when tab hidden)
  // ─────────────────────────────────────────────
  let tabVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    tabVisible = !document.hidden;
    if (tabVisible) {
      // Restart loops when tab becomes visible again
      if (_particleLoopRunning) _particleLoop();
      if (_heroParallaxRunning) _heroParallaxLoop();
    }
  });

  // Flags so we don't double-start loops
  let _particleLoopRunning = false;
  let _heroParallaxRunning = false;

  // ─────────────────────────────────────────────
  // 1. PAGE TRANSITION
  // ─────────────────────────────────────────────
  function initTransitions() {
    const overlay = document.getElementById('page-overlay');
    if (!overlay) return;

    requestAnimationFrame(() => { overlay.classList.add('hidden'); });
    setTimeout(() => { overlay.classList.add('hidden'); }, 120);
    setTimeout(() => { overlay.classList.add('hidden'); }, 1500);

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;

      e.preventDefault();
      overlay.classList.remove('hidden');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  }

  // ─────────────────────────────────────────────
  // 2. SCROLL PROGRESS BAR
  // ─────────────────────────────────────────────
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  // ─────────────────────────────────────────────
  // 3. CUSTOM CURSOR
  // ─────────────────────────────────────────────
  function initCursor() {
    if (isMobile) return;

    const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    function animRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    }
    animRing();

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .nav-card, .interest-card, .contact-card, .value-item, .stat-card, .timeline-item')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', () => {
      document.body.classList.remove('cursor-hover');
    });
  }

  // ─────────────────────────────────────────────
  // 4. PARTICLE FIELD (optimized)
  // ─────────────────────────────────────────────
  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let W, H, particles = [], mouse = { x: -999, y: -999 };
    const COUNT = isMobile ? 35 : 70;
    const CONNECT_DIST = 130;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class P {
      constructor() { this.init(); }
      init() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.r  = Math.random() * 1.4 + 0.4;
        // Use cached theme instead of querying DOM
        this.a  = isLightTheme ? Math.random() * 0.2 + 0.05 : Math.random() * 0.4 + 0.1;
        this.c  = Math.random() > 0.65 ? (isLightTheme ? '#0077ed' : '#00d4ff') : (isLightTheme ? '#7c3aed' : '#a855f7');
      }
      update() {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        this.vx *= 0.99; this.vy *= 0.99;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
      }
      draw() {
        // No ctx.save/restore, no shadowBlur — just simple fill
        ctx.globalAlpha = this.a;
        ctx.fillStyle   = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawLines() {
      // Cache theme check ONCE per frame, set stroke style ONCE
      const lt = isLightTheme;
      const alphaScale = lt ? 0.06 : 0.12;
      ctx.strokeStyle = lt ? '#0077ed' : '#00d4ff';
      ctx.lineWidth   = 0.6;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            ctx.globalAlpha = (1 - d / CONNECT_DIST) * alphaScale;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function _particleLoop() {
      if (!tabVisible) { _particleLoopRunning = true; return; }
      _particleLoopRunning = false;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      drawLines();
      // Reset globalAlpha after draw
      ctx.globalAlpha = 1;
      requestAnimationFrame(_particleLoop);
    }
    // Expose to outer scope for visibility handler
    window._particleLoop = _particleLoop;

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    for (let i = 0; i < COUNT; i++) particles.push(new P());
    _particleLoop();
  }

  // ─────────────────────────────────────────────
  // 5. 3D CARD TILT
  // ─────────────────────────────────────────────
  function initTilt() {
    if (isMobile) return;
    const selectors = '.nav-card, .interest-card, .contact-card, .stat-card, .value-item, .now-block, .home-quote';

    function applyTilt(el) {
      el.addEventListener('mousemove', (e) => {
        const r   = el.getBoundingClientRect();
        const x   = e.clientX - r.left;
        const y   = e.clientY - r.top;
        const cx  = r.width  / 2;
        const cy  = r.height / 2;
        const rotX = ((y - cy) / cy) * -7;
        const rotY = ((x - cx) / cx) *  7;
        el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        el.style.transition = 'transform 0.1s ease';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s ease';
      });
    }

    document.querySelectorAll(selectors).forEach(el => {
      el.dataset.tilt = '1';
      applyTilt(el);
    });

    // Handler for shared MutationObserver
    _sharedMutHandlers.push(() => {
      document.querySelectorAll(selectors).forEach(el => {
        if (!el.dataset.tilt) { el.dataset.tilt = '1'; applyTilt(el); }
      });
    });
  }

  // ─────────────────────────────────────────────
  // 6. GLITCH EFFECT
  // ─────────────────────────────────────────────
  function initGlitch() {
    const style = document.createElement('style');
    style.textContent = `
      .glitch { position: relative; }
      .glitch::before, .glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: transparent;
      }
      .glitch::before {
        color: #00d4ff;
        animation: glitch-a 4s infinite steps(1);
        clip-path: polygon(0 0,100% 0,100% 30%,0 30%);
        text-shadow: none;
      }
      .glitch::after {
        color: #a855f7;
        animation: glitch-b 4s infinite steps(1);
        clip-path: polygon(0 70%,100% 70%,100% 100%,0 100%);
        text-shadow: none;
      }
      @keyframes glitch-a {
        0%,89%,100% { transform: none; opacity: 0; }
        90%          { transform: translateX(-3px) skewX(-2deg); opacity: 0.7; }
        92%          { transform: translateX(3px);  opacity: 0.7; }
        94%          { transform: translateX(-2px); opacity: 0; }
      }
      @keyframes glitch-b {
        0%,89%,100% { transform: none; opacity: 0; }
        90%          { transform: translateX(3px) skewX(2deg); opacity: 0.7; }
        92%          { transform: translateX(-3px); opacity: 0.7; }
        94%          { transform: none; opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('[data-glitch]').forEach(el => {
      el.setAttribute('data-text', el.textContent);
      el.classList.add('glitch');
    });
  }

  // ─────────────────────────────────────────────
  // 7. TYPEWRITER
  // ─────────────────────────────────────────────
  function typeWriter(el, speed = 45) {
    const text = el.textContent;
    el.textContent = '';
    el.style.borderRight = '2px solid var(--accent)';
    el.style.animation = 'blink-caret 0.8s step-end infinite';

    const blink = document.createElement('style');
    blink.textContent = '@keyframes blink-caret{0%,100%{border-color:transparent}50%{border-color:var(--accent)}}';
    document.head.appendChild(blink);

    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed + Math.random() * 20);
      } else {
        setTimeout(() => { el.style.borderRight = 'none'; el.style.animation = 'none'; }, 1200);
      }
    }
    setTimeout(type, 600);
  }

  // ─────────────────────────────────────────────
  // 8. NUMBER COUNTER ANIMATION
  // ─────────────────────────────────────────────
  function animateCounter(el) {
    const text = el.textContent.trim();
    const match = text.match(/^(\d+)/);
    if (!match) return;
    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '');
    let start = null;
    const duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─────────────────────────────────────────────
  // 9. INTERSECTION OBSERVER (fade-in + counters)
  // ─────────────────────────────────────────────
  function initObserver() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        setTimeout(() => el.classList.add('visible'), i * 90);
        if (el.classList.contains('num') || el.classList.contains('stat-num')) {
          animateCounter(el);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.12 });

    window.acObs = obs;

    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

    // Handler for shared MutationObserver
    _sharedMutHandlers.push(() => {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
    });
  }

  // ─────────────────────────────────────────────
  // 10. NEON HOVER ON NAV CARDS (rainbow border scan)
  // Styles injected in initAll() via shared style block.
  // ─────────────────────────────────────────────
  function initNeonCards() {
    // All CSS is now in the shared style block injected in initAll().
    // This function is kept for structural clarity; nothing to do at runtime.
  }

  // ─────────────────────────────────────────────
  // 11. HERO MOUSE PARALLAX (multi-layer depth)
  // ─────────────────────────────────────────────
  function initHeroParallax() {
    if (isMobile) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const depths = [
      { sel: '.hero-badge',   d: 0.022 },
      { sel: '.hero-name',    d: 0.016 },
      { sel: '.hero-tagline', d: 0.010 },
      { sel: '.hero-sub',     d: 0.007 },
      { sel: '.hero-actions', d: 0.013 },
      { sel: '.hero-meta',    d: 0.004 },
    ];

    const layers = depths
      .map(({ sel, d }) => ({ el: hero.querySelector(sel), d }))
      .filter(l => l.el);

    let tx = 0, ty = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX - window.innerWidth  / 2;
      ty = e.clientY - window.innerHeight / 2;
    });

    function _heroParallaxLoop() {
      if (!tabVisible) { _heroParallaxRunning = true; return; }
      _heroParallaxRunning = false;
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      layers.forEach(({ el, d }) => {
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      requestAnimationFrame(_heroParallaxLoop);
    }
    // Expose to outer scope for visibility handler
    window._heroParallaxLoop = _heroParallaxLoop;
    _heroParallaxLoop();
  }

  // ─────────────────────────────────────────────
  // 12. MAGNETIC BUTTONS
  // ─────────────────────────────────────────────
  function initMagneticButtons() {
    if (isMobile) return;

    function applyMag(el) {
      if (el.dataset.mag) return;
      el.dataset.mag = '1';

      el.addEventListener('mousemove', (e) => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        el.style.transform  = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'transform 0.12s ease';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform  = '';
        el.style.transition = 'transform 0.55s cubic-bezier(.23,1,.32,1)';
      });
    }

    const applyAll = () => document.querySelectorAll('.btn, .back-link').forEach(applyMag);
    applyAll();

    // Handler for shared MutationObserver
    _sharedMutHandlers.push(applyAll);
  }

  // ─────────────────────────────────────────────
  // 13. CLICK SHOCKWAVE
  // ─────────────────────────────────────────────
  function initClickShockwave() {
    const css = document.createElement('style');
    css.textContent = `
      .sw-ring {
        position: fixed; border-radius: 50%;
        border: 1.5px solid rgba(0,212,255,0.55);
        pointer-events: none; z-index: 9995;
        transform: translate(-50%,-50%) scale(0);
        animation: sw-expand 0.55s cubic-bezier(.2,.6,.35,1) forwards;
      }
      @keyframes sw-expand {
        to { transform: translate(-50%,-50%) scale(4.5); opacity: 0; }
      }
    `;
    document.head.appendChild(css);

    document.addEventListener('click', (e) => {
      const ring = document.createElement('div');
      ring.className = 'sw-ring';
      ring.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:36px;height:36px;`;
      document.body.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    });
  }

  // ─────────────────────────────────────────────
  // 14. CARD SPOTLIGHT (cursor glow follows mouse)
  // ─────────────────────────────────────────────
  function initCardSpotlight() {
    if (isMobile) return;

    const SEL = '.nav-card,.interest-card,.contact-card,.stat-card,.value-item,.now-block,.home-quote,.timeline-item';

    const css = document.createElement('style');
    css.textContent = `
      .sp-layer {
        position: absolute; inset: 0; border-radius: inherit;
        pointer-events: none; z-index: 0;
        opacity: 0; transition: opacity 0.35s;
        will-change: background;
      }
      .sp-active .sp-layer { opacity: 1; }
    `;
    document.head.appendChild(css);

    function attach(card) {
      if (card.dataset.sp) return;
      card.dataset.sp = '1';
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

      const layer = document.createElement('div');
      layer.className = 'sp-layer';
      card.appendChild(layer);

      card.addEventListener('mouseenter', () => card.classList.add('sp-active'));
      card.addEventListener('mouseleave', () => card.classList.remove('sp-active'));
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        layer.style.background =
          `radial-gradient(220px circle at ${x}px ${y}px, rgba(0,212,255,0.07), transparent 65%)`;
      });
    }

    const attachAll = () => document.querySelectorAll(SEL).forEach(attach);
    attachAll();

    // Handler for shared MutationObserver
    _sharedMutHandlers.push(attachAll);
  }

  // ─────────────────────────────────────────────
  // 15. SCROLL PARALLAX (hero cinematic fade)
  // ─────────────────────────────────────────────
  function initScrollParallax() {
    if (isMobile) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y  = window.scrollY;
        const vh = window.innerHeight;
        if (y < vh * 1.2) {
          const ratio = y / vh;
          hero.style.transform = `translateY(${y * 0.18}px)`;
          hero.style.opacity   = Math.max(0, 1 - ratio * 1.4);
        } else {
          hero.style.transform = '';
          hero.style.opacity   = '';
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // ─────────────────────────────────────────────
  // 16. BACK TO TOP BUTTON
  // ─────────────────────────────────────────────
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '&#8593;';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
    }, { passive: true });
  }

  // ─────────────────────────────────────────────
  // SHARED MUTATION OBSERVER
  // All handlers registered by initTilt, initObserver,
  // initMagneticButtons, and initCardSpotlight are called
  // from a single MutationObserver.
  // ─────────────────────────────────────────────
  const _sharedMutHandlers = [];

  function initSharedMutationObserver() {
    const obs = new MutationObserver(() => {
      for (let i = 0; i < _sharedMutHandlers.length; i++) {
        _sharedMutHandlers[i]();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  function initAll() {
    // ── Inject shared neon-card styles (no !important) ──
    // Uses `body` prefix for higher specificity to avoid !important.
    const neonStyle = document.createElement('style');
    neonStyle.textContent = `
      body .nav-card, body .interest-card {
        background: rgba(10,16,30,0.75);
        border: 1px solid rgba(0,212,255,0.12);
        backdrop-filter: blur(12px);
        position: relative;
        overflow: hidden;
      }
      body .nav-card::after, body .interest-card::after {
        content: '';
        position: absolute;
        inset: -1px;
        background: linear-gradient(135deg,
          rgba(0,212,255,0) 0%,
          rgba(0,212,255,0.2) 40%,
          rgba(168,85,247,0.2) 60%,
          rgba(0,212,255,0) 100%);
        opacity: 0;
        transition: opacity 0.4s;
        border-radius: inherit;
        pointer-events: none;
      }
      body .nav-card:hover::after, body .interest-card:hover::after { opacity: 1; }
      body .nav-card:hover, body .interest-card:hover {
        border-color: rgba(0,212,255,0.5);
        box-shadow: 0 0 30px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.04);
      }
      /* Timeline dots */
      body .timeline::before {
        background: linear-gradient(to bottom, #00d4ff, #a855f7, transparent);
        box-shadow: 0 0 8px rgba(0,212,255,0.4);
      }
      body .timeline-item::before {
        border-color: #00d4ff;
        box-shadow: 0 0 10px rgba(0,212,255,0.5);
      }
      body .timeline-item:hover::before { background: #00d4ff; box-shadow: 0 0 16px rgba(0,212,255,0.8); }
      /* Stat cards */
      body .stat-card { background: rgba(10,16,30,0.8); border: 1px solid rgba(0,212,255,0.1); backdrop-filter:blur(12px); }
      body .stat-card:hover { border-color: rgba(0,212,255,0.4); box-shadow: 0 0 20px rgba(0,212,255,0.12); }
      body .stat-card .num { color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.6); }
      /* Value items */
      body .value-item { background: rgba(10,16,30,0.75); border: 1px solid rgba(0,212,255,0.1); backdrop-filter:blur(12px); }
      body .value-item:hover { border-color: rgba(168,85,247,0.5); box-shadow: 0 0 20px rgba(168,85,247,0.1); }
      /* Contact cards */
      body .contact-card { background: rgba(10,16,30,0.75); border: 1px solid rgba(0,212,255,0.1); backdrop-filter:blur(12px); }
      body .contact-card:hover { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 20px rgba(0,212,255,0.12); }
      /* Now block */
      body .now-block { background: rgba(10,16,30,0.8); border: 1px solid rgba(168,85,247,0.25); backdrop-filter:blur(12px); box-shadow: 0 0 20px rgba(168,85,247,0.08); }
      /* Quote */
      body .home-quote { background: rgba(10,16,30,0.7); border: 1px solid rgba(168,85,247,0.2); border-left: 3px solid #a855f7; backdrop-filter:blur(16px); }
      /* Tags */
      body .tag { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.15); color: rgba(0,212,255,0.7); }
      body .topic-tag { background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.2); }
      /* Timeline year badge */
      body .timeline-year { color: #00d4ff; background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2); text-shadow: 0 0 8px rgba(0,212,255,0.4); }
      /* Interest questions */
      body .interest-questions span { color: #00d4ff; }
      /* Nav card arrow */
      body .nav-card-arrow { color: #00d4ff; }

      /* ── LIGHT THEME OVERRIDES ── */
      [data-theme="light"] body .nav-card,
      body[data-theme="light"] .nav-card,
      [data-theme="light"] .nav-card,
      [data-theme="light"] body .interest-card,
      body[data-theme="light"] .interest-card,
      [data-theme="light"] .interest-card { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.08); }
      [data-theme="light"] body .nav-card:hover,
      [data-theme="light"] .nav-card:hover,
      [data-theme="light"] body .interest-card:hover,
      [data-theme="light"] .interest-card:hover { border-color: rgba(0,119,237,0.4); box-shadow: 0 4px 24px rgba(0,119,237,0.1); }
      [data-theme="light"] body .stat-card,
      [data-theme="light"] .stat-card { background: rgba(255,255,255,0.85); border-color: rgba(0,0,0,0.08); }
      [data-theme="light"] body .stat-card:hover,
      [data-theme="light"] .stat-card:hover { border-color: rgba(0,119,237,0.3); box-shadow: 0 4px 20px rgba(0,119,237,0.08); }
      [data-theme="light"] body .stat-card .num,
      [data-theme="light"] .stat-card .num { color: #0077ed; text-shadow: none; }
      [data-theme="light"] body .value-item,
      [data-theme="light"] .value-item { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.08); }
      [data-theme="light"] body .value-item:hover,
      [data-theme="light"] .value-item:hover { border-color: rgba(124,58,237,0.35); box-shadow: 0 4px 20px rgba(124,58,237,0.08); }
      [data-theme="light"] body .contact-card,
      [data-theme="light"] .contact-card { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.08); }
      [data-theme="light"] body .contact-card:hover,
      [data-theme="light"] .contact-card:hover { border-color: rgba(0,119,237,0.35); box-shadow: 0 4px 20px rgba(0,119,237,0.08); }
      [data-theme="light"] body .now-block,
      [data-theme="light"] .now-block { background: rgba(255,255,255,0.85); border-color: rgba(124,58,237,0.2); box-shadow: 0 4px 20px rgba(124,58,237,0.06); }
      [data-theme="light"] body .home-quote,
      [data-theme="light"] .home-quote { background: rgba(255,255,255,0.8); border-color: rgba(124,58,237,0.15); border-left-color: #7c3aed; }
      [data-theme="light"] body .tag,
      [data-theme="light"] .tag { background: rgba(0,119,237,0.06); border-color: rgba(0,119,237,0.15); color: #0077ed; }
      [data-theme="light"] body .topic-tag,
      [data-theme="light"] .topic-tag { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.15); }
      [data-theme="light"] body .timeline-year,
      [data-theme="light"] .timeline-year { color: #0077ed; background: rgba(0,119,237,0.08); border-color: rgba(0,119,237,0.2); text-shadow: none; }
      [data-theme="light"] body .timeline-item::before,
      [data-theme="light"] .timeline-item::before { border-color: #0077ed; box-shadow: 0 0 6px rgba(0,119,237,0.25); }
      [data-theme="light"] body .interest-questions span,
      [data-theme="light"] .interest-questions span { color: #0077ed; }
      [data-theme="light"] body .nav-card-arrow,
      [data-theme="light"] .nav-card-arrow { color: #0077ed; }
    `;
    document.head.appendChild(neonStyle);

    initTransitions();
    initScrollProgress();
    initCursor();
    initParticles();
    initGlitch();
    initNeonCards();
    initTilt();
    initObserver();
    initHeroParallax();
    initMagneticButtons();
    initClickShockwave();
    initCardSpotlight();
    initScrollParallax();
    initBackToTop();

    // Start the single shared MutationObserver after all handlers registered
    initSharedMutationObserver();

    // Typewriter on heroes
    const tw = document.querySelector('[data-typewriter]');
    if (tw) typeWriter(tw);
  }

  // Support both eager and lazy loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
