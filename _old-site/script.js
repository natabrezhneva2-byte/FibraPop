/* ============================================================
   FIBRA POP — script.js
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   FLAVOR DATA
   ============================================================ */
const flavors = [
  {
    id: 'raspberry-rose',
    name: 'Raspberry Rose',
    tagline: 'Fruity, floral, light',
    description: 'Ripe raspberries meet soft rose petals in a delicate, lightly floral fizz. Sweet enough to feel like a treat, light enough to drink all day.',
    color: '#F5809A',
    colorDark: '#C05070',
    colorLight: '#FDDDE7',
    gradA: '#F5809A',
    gradB: '#F9B8C8',
    emoji: '🌸',
    fruits: ['🍓', '🌹', '✨'],
    fruitPos: [{ x: 10, y: 18, d: 0 }, { x: 78, y: 12, d: 1.2 }, { x: 82, y: 68, d: 0.6 }],
    mood: 'delicate energy',
    keywords: ['fruity', 'floral', 'light'],
    taste: { sweet: 80, citrus: 20, fresh: 60, floral: 90, bold: 30 },
    image: 'raspberry_rose.png'
  },
  {
    id: 'mango-yuzu',
    name: 'Mango Yuzu',
    tagline: 'Tropical, citrusy, bright',
    description: 'Sun-ripened mango collides with sharp Japanese yuzu for a bold citrus hit. Tropical, bright, and impossible to put down.',
    color: '#FFA767',
    colorDark: '#CC7030',
    colorLight: '#FFE4CC',
    gradA: '#FFA767',
    gradB: '#FFD0A0',
    emoji: '🌞',
    fruits: ['🥭', '🍊', '⚡'],
    fruitPos: [{ x: 8, y: 22, d: 0 }, { x: 80, y: 10, d: 1.5 }, { x: 75, y: 72, d: 0.8 }],
    mood: 'sunny energy',
    keywords: ['tropical', 'citrusy', 'bright'],
    taste: { sweet: 70, citrus: 85, fresh: 65, floral: 25, bold: 50 },
    image: 'mango_yuzu.png'
  },
  {
    id: 'cucumber-lime',
    name: 'Cucumber Lime',
    tagline: 'Cool, crisp, refreshing',
    description: 'Garden cucumber with a squeeze of fresh lime — clean, cool, and hydrating. The drink that tastes like a deep breath of fresh air.',
    color: '#ACD980',
    colorDark: '#6AA850',
    colorLight: '#E5F5D0',
    gradA: '#ACD980',
    gradB: '#D0EDB0',
    emoji: '🌿',
    fruits: ['🥒', '🍋', '💚'],
    fruitPos: [{ x: 12, y: 15, d: 0.4 }, { x: 76, y: 14, d: 1.1 }, { x: 80, y: 70, d: 0 }],
    mood: 'cool clarity',
    keywords: ['cool', 'crisp', 'refreshing'],
    taste: { sweet: 30, citrus: 70, fresh: 95, floral: 40, bold: 25 },
    image: 'cucumber_lime.png'
  },
  {
    id: 'blueberry-lavender',
    name: 'Blueberry Lavender',
    tagline: 'Rich, floral, dreamy',
    description: 'Wild blueberries with a whisper of lavender — deep, floral, and quietly calming. For when you want something that feels a little more elevated.',
    color: '#8F83B6',
    colorDark: '#5E5285',
    colorLight: '#E0DCEF',
    gradA: '#8F83B6',
    gradB: '#C0B8DC',
    emoji: '💜',
    fruits: ['🫐', '🌸', '🌙'],
    fruitPos: [{ x: 9, y: 20, d: 0.7 }, { x: 79, y: 11, d: 0 }, { x: 78, y: 69, d: 1.4 }],
    mood: 'calm focus',
    keywords: ['rich', 'floral', 'dreamy'],
    taste: { sweet: 65, citrus: 15, fresh: 45, floral: 88, bold: 55 },
    image: 'blueberry_lavender.png'
  },
  {
    id: 'lemon-ginger',
    name: 'Lemon Ginger',
    tagline: 'Zesty, spicy, bold',
    description: 'Sharp lemon meets a warming ginger kick that lingers. Bold, invigorating, and unapologetically punchy — not for the timid.',
    color: '#F3D13F',
    colorDark: '#B89500',
    colorLight: '#FBF0B0',
    gradA: '#F3D13F',
    gradB: '#F8E580',
    emoji: '⚡',
    fruits: ['🍋', '🔥', '⚡'],
    fruitPos: [{ x: 11, y: 16, d: 0.3 }, { x: 78, y: 13, d: 1.8 }, { x: 82, y: 67, d: 0.9 }],
    mood: 'bold kick',
    keywords: ['zesty', 'spicy', 'bold'],
    taste: { sweet: 45, citrus: 90, fresh: 75, floral: 20, bold: 88 },
    image: 'lemon_ginger.png'
  }
];

/* ============================================================
   CAN SVG GENERATOR
   ============================================================ */
function makeCan(flavor, h = 260) {
  const W = Math.round(h * 0.455);
  const H = h;
  const cx = W / 2;
  const ry = Math.round(H * 0.054);
  const rx = cx - 4;
  const bodyY = ry;
  const bodyH = H - ry * 2;
  const id = `c${Math.random().toString(36).slice(2, 8)}`;

  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}g" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="rgba(0,0,0,0.28)"/>
      <stop offset="18%"  stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="52%"  stop-color="rgba(0,0,0,0.02)"/>
      <stop offset="82%"  stop-color="rgba(0,0,0,0.1)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.38)"/>
    </linearGradient>
    <linearGradient id="${id}t" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#E2E2E2"/>
      <stop offset="100%" stop-color="#9A9A9A"/>
    </linearGradient>
    <linearGradient id="${id}b" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ADADAD"/>
      <stop offset="100%" stop-color="#767676"/>
    </linearGradient>
    <linearGradient id="${id}lb" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
    </linearGradient>
    <clipPath id="${id}cl">
      <rect x="4" y="${bodyY}" width="${W - 8}" height="${bodyH}" rx="9"/>
    </clipPath>
  </defs>

  <!-- Body color -->
  <rect x="4" y="${bodyY}" width="${W - 8}" height="${bodyH}" rx="9" fill="${flavor.color}"/>

  <!-- Body lighting gradient -->
  <rect x="4" y="${bodyY}" width="${W - 8}" height="${bodyH}" rx="9" fill="url(#${id}g)"/>

  <!-- Label band -->
  <rect x="10" y="${Math.round(H * 0.22)}" width="${W - 20}" height="${Math.round(H * 0.52)}"
    rx="3" fill="url(#${id}lb)" clip-path="url(#${id}cl)"/>

  <!-- FIBRA text -->
  <text x="${cx}" y="${Math.round(H * 0.41)}" text-anchor="middle"
    font-family="Arial Black, Impact, sans-serif" font-weight="900"
    font-size="${Math.round(W * 0.24)}" fill="white" letter-spacing="-0.8">FIBRA</text>

  <!-- POP text -->
  <text x="${cx}" y="${Math.round(H * 0.535)}" text-anchor="middle"
    font-family="Arial Black, Impact, sans-serif" font-weight="900"
    font-size="${Math.round(W * 0.24)}" fill="rgba(255,255,255,0.72)" letter-spacing="-0.8">POP</text>

  <!-- Emoji -->
  <text x="${cx}" y="${Math.round(H * 0.68)}" text-anchor="middle"
    font-size="${Math.round(W * 0.18)}">${flavor.emoji}</text>

  <!-- Highlight stripe -->
  <rect x="12" y="${bodyY}" width="5" height="${bodyH}"
    fill="rgba(255,255,255,0.13)" clip-path="url(#${id}cl)"/>

  <!-- Top ellipse -->
  <ellipse cx="${cx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="url(#${id}t)"/>

  <!-- Top inner plate -->
  <ellipse cx="${cx}" cy="${ry - 1}" rx="${Math.round(rx * 0.62)}" ry="${Math.round(ry * 0.58)}"
    fill="#C8C8C8"/>

  <!-- Pull tab ring -->
  <ellipse cx="${cx - 2}" cy="${Math.round(ry * 0.32)}" rx="4" ry="1.8"
    fill="none" stroke="#8A8A8A" stroke-width="1.6"/>
  <!-- Pull tab arm -->
  <path d="M${cx + 2} ${Math.round(ry * 0.32)} L${cx + 8} ${Math.round(ry * 0.82)}"
    stroke="#9A9A9A" stroke-width="2.2" stroke-linecap="round"/>

  <!-- Bottom ellipse -->
  <ellipse cx="${cx}" cy="${H - ry}" rx="${rx}" ry="${ry}" fill="url(#${id}b)"/>

  <!-- Bottom inner -->
  <ellipse cx="${cx}" cy="${H - ry - 2}" rx="${Math.round(rx * 0.76)}" ry="${Math.round(ry * 0.58)}"
    fill="#8E8E8E"/>
</svg>`;
}

function makeCanEl(flavor, h = 260) {
  if (flavor.image) {
    const w = Math.round(h * 0.5625);
    return `<img src="${flavor.image}" alt="${flavor.name}" class="can-img" style="height:${h}px;width:${w}px;">`;
  }
  return makeCan(flavor, h);
}

/* ============================================================
   BUBBLE CANVAS SYSTEM
   ============================================================ */
class Bubbles {
  constructor(canvas, color = 'rgba(255,255,255,0.35)') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.color = color;
    this.list = [];
    this.raf = null;
    this._resize = () => this.resize();
    window.addEventListener('resize', this._resize);
    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement
      ? this.canvas.parentElement.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };
    this.canvas.width = rect.width || window.innerWidth;
    this.canvas.height = rect.height || window.innerHeight;
  }

  spawn() {
    this.list.push({
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + 16,
      r: Math.random() * 13 + 4,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(Math.random() * 1.4 + 0.5),
      alpha: Math.random() * 0.38 + 0.12
    });
  }

  tick() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.14) this.spawn();

    for (let i = this.list.length - 1; i >= 0; i--) {
      const b = this.list[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.y < -b.r * 2) { this.list.splice(i, 1); continue; }

      const fade = Math.min((canvas.height - b.y) / (canvas.height * 0.15), 1);
      ctx.globalAlpha = b.alpha * fade;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(() => this.tick());
  }

  preSpawn() {
    for (let i = 0; i < 22; i++) {
      this.spawn();
      const b = this.list[this.list.length - 1];
      b.y = Math.random() * this.canvas.height;
    }
  }

  start() {
    this.preSpawn();
    this.tick();
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._resize);
  }

  setColor(c) { this.color = c; }
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav = document.getElementById('nav');
  const visible = new Set();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visible.add(entry.target.id);
      } else {
        visible.delete(entry.target.id);
      }
    });
    nav.classList.toggle('on-pink', visible.size > 0);
  }, { threshold: 0.15 });

  observer.observe(document.getElementById('inside'));
  observer.observe(document.getElementById('cta'));
}

/* ============================================================
   HERO
   ============================================================ */
function initHero() {
  // Entrance timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-headline .word', { y: '105%', opacity: 0, duration: 0.65, stagger: 0.1 })
    .from('.hero-body', { y: 16, opacity: 0, duration: 0.55 }, '-=0.3')
    .from('.hero-actions', { y: 16, opacity: 0, duration: 0.5 }, '-=0.25')
    .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.1');

  // Bubbles in accent color on beige bg
  const canvas = document.getElementById('heroCanvas');
  new Bubbles(canvas, 'rgba(184, 17, 107, 0.22)').start();
}

/* ============================================================
   INSIDE
   ============================================================ */
function initInside() {
  const cansWrap = document.getElementById('insideCans');

  // 3 cans: Raspberry Rose, Cucumber Lime, Blueberry Lavender
  const chosen = [flavors[0], flavors[2], flavors[3]];
  const configs = [
    { size: 220, rotate: -13, left: '6%',  top: '8%'  },
    { size: 195, rotate:   9, left: '50%', top: '26%' },
    { size: 240, rotate:  -5, left: '14%', top: '50%' },
  ];
  const parallax = [
    { from: -60, to: 160 },
    { from:  40, to: -70 },
    { from: -20, to: 130 },
  ];

  chosen.forEach((fl, i) => {
    const div = document.createElement('div');
    div.className = 'falling-can';
    div.innerHTML = makeCanEl(fl, configs[i].size);
    div.style.left    = configs[i].left;
    div.style.top     = configs[i].top;
    div.style.rotate  = configs[i].rotate + 'deg';
    cansWrap.appendChild(div);

    gsap.fromTo(div,
      { y: parallax[i].from },
      {
        y: parallax[i].to,
        ease: 'none',
        scrollTrigger: {
          trigger: '#inside',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.8,
        }
      }
    );
  });

  // Animate ingredients on scroll
  const items = document.querySelectorAll('.ingredient');
  items.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 68%',
      onEnter: () => {
        el.classList.add('active');
        if (el.dataset.step === '2') {
          setTimeout(() => {
            document.getElementById('fiberFill').style.width = '75%';
          }, 200);
        }
      },
      onLeaveBack: () => {
        el.classList.remove('active');
        if (el.dataset.step === '2') {
          document.getElementById('fiberFill').style.width = '0%';
        }
      }
    });
  });
}

/* ============================================================
   FLAVORS SCROLL JOURNEY
   ============================================================ */
function initFlavors() {
  let current = -1;
  let flavorBubbles = null;

  // Build nav dots
  const nav = document.getElementById('flavorNav');
  flavors.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'f-dot' + (i === 0 ? ' active' : '');
    nav.appendChild(dot);
  });

  function applyFlavor(index, animated) {
    if (index === current) return;
    current = index;
    const fl = flavors[index];

    // CSS variable so text/dots pick up the flavor accent
    document.documentElement.style.setProperty('--flavor-color', fl.color);

    // Can
    const side = document.getElementById('flavorCanSide');
    const existingEl = side.querySelector('svg, img');
    if (animated && existingEl) {
      gsap.to(existingEl, {
        opacity: 0, scale: 0.78, rotationY: 70, duration: 0.28, ease: 'power2.in',
        onComplete: () => {
          side.innerHTML = makeCanEl(fl, 380);
          const newEl = side.querySelector('svg, img');
          gsap.fromTo(newEl,
            { opacity: 0, scale: 0.78, rotationY: -70 },
            { opacity: 1, scale: 1, rotationY: 0, duration: 0.5, ease: 'back.out(1.4)' });
        }
      });
    } else {
      side.innerHTML = makeCanEl(fl, 380);
      if (animated) {
        gsap.fromTo(side.querySelector('svg, img'),
          { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 });
      }
    }

    // Text
    const textEl = document.getElementById('flavorText');
    const chipsEl = document.getElementById('flavorChips');
    const textHTML = `
      <div class="flavor-name">${fl.name}</div>
      <div class="flavor-desc">${fl.description}</div>
    `;
    const chipsHTML = fl.keywords.map(k => `<span class="chip">${k}</span>`).join('');

    if (animated) {
      gsap.to([textEl, chipsEl], {
        opacity: 0, y: 14, duration: 0.2,
        onComplete: () => {
          textEl.innerHTML = textHTML;
          chipsEl.innerHTML = chipsHTML;
          gsap.fromTo([textEl, chipsEl],
            { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)', stagger: 0.07 });
        }
      });
    } else {
      textEl.innerHTML = textHTML;
      chipsEl.innerHTML = chipsHTML;
    }

    // Dots
    document.querySelectorAll('.f-dot').forEach((d, i) =>
      d.classList.toggle('active', i === index));

    // Update bubble color to match new flavor
    if (flavorBubbles) flavorBubbles.setColor(fl.color);
  }

  // Initial render
  applyFlavor(0, false);

  // Poppable DOM bubbles
  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = 'flavor-bubbles-wrap';
  document.querySelector('.flavors-sticky').appendChild(bubbleWrap);

  flavorBubbles = {
    color: flavors[0].color,
    timerId: null,
    setColor(c) {
      this.color = c;
      bubbleWrap.querySelectorAll('.flavor-bubble').forEach(b => {
        b.style.borderColor = c;
      });
    },
    spawn() {
      const el = document.createElement('div');
      el.className = 'flavor-bubble';
      const size = Math.random() * 60 + 40;
      const bw = Math.round(size * 0.06 + 1.5);
      el.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*85+5}%;bottom:-${size}px;background:transparent;border:${bw}px solid ${this.color};`;
      bubbleWrap.appendChild(el);
      gsap.fromTo(el,
        { y: 0, opacity: 0 },
        { y: -(window.innerHeight + size + 60), opacity: Math.random() * 0.35 + 0.3,
          duration: Math.random() * 5 + 6, ease: 'none', onComplete: () => el.remove() }
      );
      el.addEventListener('click', () => {
        gsap.killTweensOf(el);
        const tl = gsap.timeline({ onComplete: () => el.remove() });
        tl.to(el, { scale: 1.6, duration: 0.12, ease: 'power2.out' })
          .to(el, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
      });
    },
    start() {
      this.spawn();
      this.timerId = setInterval(() => this.spawn(), 950);
    }
  };
  flavorBubbles.start();

  // ScrollTrigger pin — pin the sticky element itself
  ScrollTrigger.create({
    trigger: '.flavors-sticky',
    start: 'top top',
    end: `+=${flavors.length * window.innerHeight}`,
    pin: true,
    pinSpacing: true,
    scrub: true,
    onUpdate(self) {
      const idx = Math.min(
        Math.floor(self.progress * flavors.length),
        flavors.length - 1
      );
      applyFlavor(idx, true);
    }
  });
}

/* ============================================================
   GALLERY
   ============================================================ */
function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const panel = document.getElementById('galleryPanel');
  const inner = document.getElementById('panelInner');
  flavors.forEach((fl, i) => {
    const card = document.createElement('div');
    card.className = 'g-card';
    card.dataset.index = i;
    card.innerHTML = `
      ${makeCanEl(fl, 170)}
      <div class="g-card-name" style="color:${fl.colorDark}">${fl.name}</div>
    `;
    card.addEventListener('click', () => select(i));
    grid.appendChild(card);

    gsap.from(card, {
      y: 44, opacity: 0, scale: 0.88, duration: 0.6, delay: i * 0.09,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: '#gallery', start: 'top 72%', once: true }
    });
  });

  function select(idx) {
    const fl = flavors[idx];

    document.querySelectorAll('.g-card').forEach((c, i) => {
      c.classList.toggle('active', i === idx);
      c.style.setProperty('--flavor-color', fl.color);
      gsap.to(c, { scale: i === idx ? 1.04 : 1, duration: 0.35, ease: 'back.out(1.5)' });
    });

    const keys = Object.keys(fl.taste);
    inner.innerHTML = `
      <div class="panel-info">
        <div class="panel-name">${fl.name}</div>
        <div class="panel-tagline">${fl.tagline}</div>
        <span class="panel-mood-tag" style="background:${fl.color}">${fl.mood}</span>
        <div class="taste-label">Taste Profile</div>
        ${keys.map(k => `
          <div class="taste-row">
            <span class="taste-key">${k}</span>
            <div class="taste-track">
              <div class="taste-fill" data-val="${fl.taste[k]}" style="background:${fl.color}"></div>
            </div>
          </div>`).join('')}
      </div>
      <div>${makeCanEl(fl, 200)}</div>
    `;

    panel.classList.add('visible');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      inner.querySelectorAll('.taste-fill').forEach((bar) => {
        gsap.to(bar, {
          width: bar.dataset.val + '%',
          duration: 0.9, ease: 'back.out(1.3)'
        });
      });
    }));
  }

  ScrollTrigger.create({
    trigger: '#gallery',
    start: 'top 55%',
    once: true,
    onEnter: () => setTimeout(() => select(0), 400)
  });

  gsap.from('.gallery-header h2, .gallery-header p', {
    y: 28, opacity: 0, duration: 0.7, stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#gallery', start: 'top 75%', once: true }
  });
}

/* ============================================================
   CTA
   ============================================================ */
function initCTA() {
  const canvas = document.getElementById('ctaCanvas');

  function resizeCTA() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCTA();
  window.addEventListener('resize', resizeCTA, { passive: true });

  const ctx = canvas.getContext('2d');
  const parts = [];

  function spawnPart() {
    const fl = flavors[Math.floor(Math.random() * flavors.length)];
    parts.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 18,
      r: Math.random() * 14 + 5,
      vx: (Math.random() - 0.5) * 0.9,
      vy: -(Math.random() * 1.8 + 0.6),
      color: fl.color,
      alpha: Math.random() * 0.48 + 0.18
    });
  }

  function ctaTick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Math.random() < 0.09) spawnPart();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -p.r * 2) { parts.splice(i, 1); continue; }
      const fade = Math.min((canvas.height - p.y) / (canvas.height * 0.12), 1);
      ctx.globalAlpha = p.alpha * fade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(ctaTick);
  }
  ctaTick();

  // Pre-seed
  for (let i = 0; i < 18; i++) {
    spawnPart();
    parts[parts.length - 1].y = Math.random() * canvas.height;
  }

  gsap.from('.cta-headline', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#cta', start: 'top 65%' }
  });
  gsap.from('.cta-body, #cta .btn-primary', {
    y: 26, opacity: 0, duration: 0.8, stagger: 0.14, ease: 'power3.out',
    scrollTrigger: { trigger: '#cta', start: 'top 60%' }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero();
  initInside();
  initFlavors();
  initGallery();
  initCTA();
});
window.addEventListener('load', () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
});