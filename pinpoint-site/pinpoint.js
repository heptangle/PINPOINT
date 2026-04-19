/* ─────────────────────────────────────────────
   PINPOINT — pinpoint.js
   Shared JS for all pages
   ───────────────────────────────────────────── */

/* ── NAV SCROLL EFFECT ────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
})();

/* ── HAMBURGER MENU ───────────────────────────── */
(function () {
  const btn = document.getElementById('nav-hamburger');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
})();

/* ── ACTIVE NAV LINK ──────────────────────────── */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── FADE-UP ON SCROLL ────────────────────────── */
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── PIN SVG HELPER ───────────────────────────── */
function pinSVG(color = '#C23B3B', size = 22) {
  return `<svg width="${size}" height="${Math.round(size * 1.7)}" viewBox="0 0 22 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="10" r="8.5" fill="${color}" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
    <circle cx="11" cy="10" r="4.5" fill="rgba(255,255,255,0.35)"/>
    <line x1="11" y1="18" x2="11" y2="38" stroke="#999" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

/* Inject pins into .pin-top elements */
document.querySelectorAll('.pin-top').forEach(el => {
  el.innerHTML = pinSVG();
});

/* Decorative pins in sections */
document.querySelectorAll('.deco-pin').forEach(el => {
  const size = parseInt(el.dataset.size || 16);
  const color = el.dataset.color || '#C23B3B';
  el.innerHTML = pinSVG(color, size);
});

/* ── NETWORK CANVAS (homepage hero) ──────────────*/
(function () {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animId;

  const NODE_COUNT = 38;
  const MAX_DIST   = 160;
  const SPEED      = 0.28;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    const isHub = Math.random() < 0.08;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r:  isHub ? 3.5 : (Math.random() * 2 + 1),
      hub: isHub
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.18;
          const isRed = nodes[i].hub || nodes[j].hub;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = isRed
            ? `rgba(194,59,59,${alpha * 1.6})`
            : `rgba(80,76,70,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.hub ? '#C23B3B' : 'rgba(100,96,90,0.55)';
      ctx.fill();
    });

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    init();
    draw();
  });
})();

/* ── PORTRAITS: STRING CANVAS ─────────────────── */
(function () {
  const canvas = document.getElementById('string-canvas');
  if (!canvas) return;

  function drawStrings() {
    const stage = canvas.parentElement;
    const rect  = stage.getBoundingClientRect();

    canvas.width  = stage.offsetWidth;
    canvas.height = stage.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const piCard = document.querySelector('.pi-card .pin-top');
    if (!piCard) return;
    const piRect = piCard.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const piX = piRect.left + piRect.width / 2 - stageRect.left;
    const piY = piRect.top  + 5 - stageRect.top;

    const members = document.querySelectorAll('.member-card .pin-top');
    members.forEach(pin => {
      const pRect = pin.getBoundingClientRect();
      const mx = pRect.left + pRect.width / 2 - stageRect.left;
      const my = pRect.top  + 5 - stageRect.top;

      // Slightly curved string
      const cpX = (piX + mx) / 2 + (Math.random() - 0.5) * 20;
      const cpY = (piY + my) / 2 + Math.abs(mx - piX) * 0.08;

      ctx.beginPath();
      ctx.moveTo(piX, piY);
      ctx.quadraticCurveTo(cpX, cpY, mx, my);
      ctx.strokeStyle = 'rgba(194, 59, 59, 0.25)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([]);
      ctx.stroke();
    });
  }

  // Run after layout
  setTimeout(drawStrings, 300);
  window.addEventListener('resize', drawStrings);

  // Redraw on card hover (slight movement effect)
  document.querySelectorAll('.portrait-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      setTimeout(drawStrings, 50);
    });
  });
})();

/* ── CONTACT FORM (demo handler) ─────────────── */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const orig = btn.textContent;
    btn.textContent = 'Sent ✓';
    btn.style.background = '#4A7A5A';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
})();
