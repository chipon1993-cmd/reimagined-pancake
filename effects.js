/* =============================================
   EFFECTS.JS — Futuristic Interactive Effects
   ============================================= */
(function () {
  'use strict';

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // ─────────────────────────────────────────────
  // 1. PAGE TRANSITION
  // ─────────────────────────────────────────────
  function initTransitions() {
    const overlay = document.getElementById('page-overlay');
    if (!overlay) return;

    // Fade in on page load (double-trigger for reliability)
    requestAnimationFrame(() => { overlay.classList.add('hidden'); });
    setTimeout(() => { overlay.classList.add('hidden'); }, 120);

    // Intercept internal link clicks
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

    // Hover state on interactive elements
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
  // 4. PARTICLE FIELD
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
        this.a  = Math.random() * 0.4 + 0.1;
        this.c  = Math.random() > 0.65 ? '#00d4ff' : '#a855f7';
      }
      update() {
        // Subtle mouse repulsion
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.5;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        // Dampen
        this.vx *= 0.99; this.vy *= 0.99;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.a;
        ctx.shadowColor = this.c;
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CONNECT_DIST) {
            ctx.save();
            ctx.globalAlpha = (1 - d / CONNECT_DIST) * 0.12;
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth   = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    for (let i = 0; i < COUNT; i++) particles.push(new P());
    loop();
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

    // Apply to existing elements and observe new ones
    document.querySelectorAll(selectors).forEach(applyTilt);
    const obs = new MutationObserver(() => {
      document.querySelectorAll(selectors).forEach(el => {
        if (!el.dataset.tilt) { el.dataset.tilt = '1'; applyTilt(el); }
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
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
    // Upgrade the observer created by nav.js to also handle counter animations.
    // Re-use the same instance so all existing subscriptions stay intact.
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

    // Re-observe dynamically added content (loader.js, boards, etc.)
    const mutObs = new MutationObserver(() => {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
    });
    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  // ─────────────────────────────────────────────
  // 10. NEON HOVER ON NAV CARDS (rainbow border scan)
  // ─────────────────────────────────────────────
  function initNeonCards() {
    const style = document.createElement('style');
    style.textContent = `
      .nav-card, .interest-card {
        background: rgba(10,16,30,0.75) !important;
        border: 1px solid rgba(0,212,255,0.12) !important;
        backdrop-filter: blur(12px);
        position: relative;
        overflow: hidden;
      }
      .nav-card::after, .interest-card::after {
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
      .nav-card:hover::after, .interest-card:hover::after { opacity: 1; }
      .nav-card:hover, .interest-card:hover {
        border-color: rgba(0,212,255,0.5) !important;
        box-shadow: 0 0 30px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.04) !important;
      }
      /* Timeline dots */
      .timeline::before {
        background: linear-gradient(to bottom, #00d4ff, #a855f7, transparent) !important;
        box-shadow: 0 0 8px rgba(0,212,255,0.4);
      }
      .timeline-item::before {
        border-color: #00d4ff !important;
        box-shadow: 0 0 10px rgba(0,212,255,0.5);
      }
      .timeline-item:hover::before { background: #00d4ff !important; box-shadow: 0 0 16px rgba(0,212,255,0.8); }
      /* Stat cards */
      .stat-card { background: rgba(10,16,30,0.8) !important; border: 1px solid rgba(0,212,255,0.1) !important; backdrop-filter:blur(12px); }
      .stat-card:hover { border-color: rgba(0,212,255,0.4) !important; box-shadow: 0 0 20px rgba(0,212,255,0.12) !important; }
      .stat-card .num { color: #00d4ff !important; text-shadow: 0 0 20px rgba(0,212,255,0.6); }
      /* Value items */
      .value-item { background: rgba(10,16,30,0.75) !important; border: 1px solid rgba(0,212,255,0.1) !important; backdrop-filter:blur(12px); }
      .value-item:hover { border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 20px rgba(168,85,247,0.1) !important; }
      /* Contact cards */
      .contact-card { background: rgba(10,16,30,0.75) !important; border: 1px solid rgba(0,212,255,0.1) !important; backdrop-filter:blur(12px); }
      .contact-card:hover { border-color: rgba(0,212,255,0.5) !important; box-shadow: 0 0 20px rgba(0,212,255,0.12) !important; }
      /* Now block */
      .now-block { background: rgba(10,16,30,0.8) !important; border: 1px solid rgba(168,85,247,0.25) !important; backdrop-filter:blur(12px); box-shadow: 0 0 20px rgba(168,85,247,0.08); }
      /* Quote */
      .home-quote { background: rgba(10,16,30,0.7) !important; border: 1px solid rgba(168,85,247,0.2) !important; border-left: 3px solid #a855f7 !important; backdrop-filter:blur(16px); }
      /* Tags */
      .tag { background: rgba(0,212,255,0.05) !important; border: 1px solid rgba(0,212,255,0.15) !important; color: rgba(0,212,255,0.7) !important; }
      .topic-tag { background: rgba(168,85,247,0.08) !important; border: 1px solid rgba(168,85,247,0.2) !important; }
      /* Timeline year badge */
      .timeline-year { color: #00d4ff !important; background: rgba(0,212,255,0.08) !important; border: 1px solid rgba(0,212,255,0.2) !important; text-shadow: 0 0 8px rgba(0,212,255,0.4); }
      /* Interest questions */
      .interest-questions span { color: #00d4ff !important; }
      /* Nav card arrow */
      .nav-card-arrow { color: #00d4ff !important; }
    `;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  // 11. HERO MOUSE PARALLAX (multi-layer depth)
  // ─────────────────────────────────────────────
  function initHeroParallax() {
    if (isMobile) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Each element moves at a different depth factor
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

    (function tick() {
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      layers.forEach(({ el, d }) => {
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      requestAnimationFrame(tick);
    })();
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

    // Apply to current + future buttons
    const applyAll = () => document.querySelectorAll('.btn, .back-link').forEach(applyMag);
    applyAll();
    new MutationObserver(applyAll).observe(document.body, { childList: true, subtree: true });
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
    new MutationObserver(attachAll).observe(document.body, { childList: true, subtree: true });
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
  // INIT
  // ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
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

    // Typewriter на героях
    const tw = document.querySelector('[data-typewriter]');
    if (tw) typeWriter(tw);
  });

})();
