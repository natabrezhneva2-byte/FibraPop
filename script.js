/* ============================================================
   FIBRA POP — script.js
   Fruit in pixels, botanicals in ink.
   ============================================================ */

/* ============================================================
   DATA
   ============================================================ */
const FLAVORS = [
  {
    id: 'cherry-vanilla', fruit: 'Cherry', bot: 'Vanilla',
    color: '#B3263A', soft: '#F6DDE0',
    mood: 'Velvet evening',
    desc: 'Dark, juicy cherries softened by a whisper of vanilla bean. Like the cherry soda you grew up with, all grown up.',
    notes: { sweet: 6, tart: 4, herbal: 4, bold: 5 },
    ingredients: 'Sparkling water, cherry juice from concentrate (8%), chicory root fiber, apple juice, natural vanilla extract, lemon juice.'
  },
  {
    id: 'passionfruit-coconut', fruit: 'Passion Fruit', bot: 'Coconut',
    color: '#7B2D63', soft: '#F0E0EA',
    mood: 'Golden hour',
    desc: 'Sharp, sunny passion fruit rounded off with creamy coconut water. A holiday you can fit in your bag.',
    notes: { sweet: 5, tart: 7, herbal: 3, bold: 6 },
    ingredients: 'Sparkling water, passion fruit juice (7%), coconut water (5%), chicory root fiber, apple juice, natural flavors.'
  },
  {
    id: 'blueberry-lavender', fruit: 'Blueberry', bot: 'Lavender',
    color: '#4F5BC0', soft: '#E2E4F6',
    mood: 'Slow Sunday',
    desc: 'Wild blueberries meet a sprig of French lavender. Calm, floral and quietly fizzy.',
    notes: { sweet: 5, tart: 3, herbal: 7, bold: 3 },
    ingredients: 'Sparkling water, blueberry juice from concentrate (8%), chicory root fiber, apple juice, lavender extract, lemon juice.'
  },
  {
    id: 'lime-basil', fruit: 'Lime', bot: 'Basil',
    art: { bot: { w: 44, r: -6, b: 34, back: true } },   // dense leaves sit behind the can
    color: '#7E9E1C', soft: '#EEF3D2',
    mood: 'Garden party',
    desc: 'Zesty lime squeezed over fresh green basil. Crisp, herby and endlessly refreshing.',
    notes: { sweet: 3, tart: 7, herbal: 6, bold: 4 },
    ingredients: 'Sparkling water, lime juice (6%), chicory root fiber, apple juice, basil extract, natural flavors.'
  },
  {
    id: 'raspberry-rosemary', fruit: 'Raspberry', bot: 'Rosemary',
    color: '#D2365F', soft: '#F8DDE5',
    mood: 'Picnic in the hills',
    desc: 'Tart raspberries with a resinous hint of rosemary. Bright up front, woody on the finish.',
    notes: { sweet: 5, tart: 6, herbal: 5, bold: 5 },
    ingredients: 'Sparkling water, raspberry juice from concentrate (8%), chicory root fiber, apple juice, rosemary extract, lemon juice.'
  },
  {
    id: 'mango-chilli', fruit: 'Mango', bot: 'Chilli',
    art: { fruit: { w: 46, l: 6, t: 14 } },
    color: '#E07B26', soft: '#FBE6D2',
    mood: 'Spicy summer',
    desc: 'Ripe mango with a slow red chilli warmth. Sweet first, then a gentle kick.',
    notes: { sweet: 7, tart: 2, herbal: 3, bold: 8 },
    ingredients: 'Sparkling water, mango purée (9%), chicory root fiber, apple juice, red chilli extract, lime juice.'
  }
];

const PRICE = 2.5;   // 6 cans = €15 box
const BOX_SIZE = 6;
const NOTE_MAX = 8;

const can   = id => `assets/cans/${id}.webp`;
const canSm = id => `assets/cans/${id}-sm.webp`;
const fruit = id => `assets/fruits/${id}.webp`;
const label = id => `assets/labels/${id}.webp`;
const botanical = id => `assets/botanicals/${id}.webp`;
const canTilt = id => `assets/cans/${id}-tilt.webp`;
const canTiltLg = id => `assets/cans/${id}-tilt-lg.webp`;

/* ============================================================
   HELPERS
   ============================================================ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => '€' + n.toFixed(2);

if (reduced) document.documentElement.classList.add('reduced');
if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const loadImg = src => new Promise(res => {
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = () => res(null);
  img.src = src;
});

/* Scramble text through pixel glyphs, then resolve */
const GLYPHS = '#%&*+=<>/\\01XO';
function scramble(el, text, dur = 450) {
  text = text ?? el.dataset.text ?? el.textContent;
  el.dataset.text = text;
  clearInterval(el._scr);
  if (reduced) { el.textContent = text; return; }
  const total = Math.max(1, Math.round(dur / 30));
  let f = 0;
  el._scr = setInterval(() => {
    f++;
    const reveal = Math.floor((f / total) * text.length);
    el.textContent = [...text].map((ch, i) =>
      i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    ).join('');
    if (f >= total) { clearInterval(el._scr); el.textContent = text; }
  }, 30);
}

/* Toast */
const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* Theme: set the flavor color site-wide */
function setTheme(f) {
  const r = document.documentElement.style;
  r.setProperty('--flavor', f.color);
  r.setProperty('--flavor-soft', f.soft);
}

/* ============================================================
   PIXEL CANVAS — images pixelate out, swap, and resolve crisp
   ============================================================ */
class PixelCanvas {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.off = document.createElement('canvas');
    this.octx = this.off.getContext('2d');
    this.img = null;
    this.p = 1;
    new ResizeObserver(() => this.resize()).observe(canvas);
  }
  resize() {
    const r = this.c.getBoundingClientRect();
    if (!r.width) return;
    this.c.width = Math.round(r.width * DPR);
    this.c.height = Math.round(r.height * DPR);
    this.draw();
  }
  draw() {
    const { c, ctx, img } = this;
    ctx.clearRect(0, 0, c.width, c.height);
    if (!img) return;
    const s = Math.min(c.width / img.width, c.height / img.height);
    const w = img.width * s, h = img.height * s;
    const x = (c.width - w) / 2, y = (c.height - h) / 2;
    if (this.p <= 1.05) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    const sw = Math.max(1, Math.round(w / this.p));
    const sh = Math.max(1, Math.round(h / this.p));
    this.off.width = sw; this.off.height = sh;
    this.octx.drawImage(img, 0, 0, sw, sh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.off, 0, 0, sw, sh, x, y, w, h);
  }
  swap(img) {
    if (!img) return;
    if (reduced || !hasGSAP) { this.img = img; this.p = 1; this.draw(); return; }
    gsap.killTweensOf(this);
    const max = 26 * DPR;
    const draw = () => this.draw();
    const tl = gsap.timeline();
    if (this.img) tl.to(this, { p: max, duration: .32, ease: 'steps(5)', onUpdate: draw });
    else this.p = max;
    tl.add(() => { this.img = img; draw(); });
    tl.to(this, { p: 1, duration: .7, ease: 'steps(9)', onUpdate: draw });
    return tl;
  }
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
let lenis = null;
if (window.Lenis && !reduced) {
  lenis = new Lenis({ lerp: .1, smoothWheel: true });
  if (hasGSAP) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}

function scrollToTarget(target) {
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.4 });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  const target = id === '#top' ? document.body : $(id);
  if (!target) return;
  e.preventDefault();
  scrollToTarget(target);
});

/* ============================================================
   NAV
   ============================================================ */
(() => {
  const nav = $('#nav');
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > last && y > 400);
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  $$('[data-scramble]').forEach(el => {
    el.addEventListener('mouseenter', () => scramble(el, null, 380));
    el.addEventListener('focus', () => scramble(el, null, 380));
  });
})();

/* ============================================================
   HERO
   ============================================================ */
const hero = (() => {
  const canvas = $('#heroCan');
  const pix = new PixelCanvas(canvas);
  const fruitEl = $('#heroFruit');
  const botEl = $('#heroBot');
  const fruitName = $('#heroFruitName');
  const botName = $('#heroBotName');
  const swatchWrap = $('#heroSwatches');
  const cache = {};
  let index = 0;
  let timer = null;

  FLAVORS.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.setProperty('--c', f.color);
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `${f.fruit} ${f.bot}`);
    b.setAttribute('aria-selected', i === 0);
    b.addEventListener('click', () => { select(i); restart(); });
    swatchWrap.appendChild(b);
  });
  const swatches = $$('.swatch', swatchWrap);

  async function getCan(id) {
    if (!cache[id]) cache[id] = loadImg(can(id));
    return cache[id];
  }

  async function select(i, first = false) {
    index = (i + FLAVORS.length) % FLAVORS.length;
    const f = FLAVORS[index];
    setTheme(f);
    swatches.forEach((s, j) => s.setAttribute('aria-selected', j === index));
    scramble(fruitName, f.fruit.toUpperCase(), 420);
    botName.textContent = f.bot;
    if (hasGSAP && !first && !reduced) gsap.fromTo(botName, { clipPath: 'inset(-30% 100% -30% -10%)' }, { clipPath: 'inset(-30% -10% -30% -10%)', duration: .9, ease: 'power2.inOut', clearProps: 'clipPath' });

    // fruit pixel-pops out and in
    if (hasGSAP && !first && !reduced) {
      gsap.to(fruitEl, {
        scale: .6, opacity: 0, duration: .25, ease: 'steps(3)',
        onComplete: () => {
          fruitEl.src = fruit(f.id);
          gsap.to(fruitEl, { scale: 1, opacity: .55, duration: .5, ease: 'steps(5)' });
        }
      });
      // watercolor botanical dissolves softly (ink, not pixels)
      gsap.to(botEl, {
        opacity: 0, filter: 'blur(8px)', duration: .35, ease: 'power2.in',
        onComplete: () => {
          botEl.src = botanical(f.id);
          gsap.to(botEl, { opacity: .6, filter: 'blur(0px)', duration: .9, ease: 'power2.out' });
        }
      });
    } else { fruitEl.src = fruit(f.id); botEl.src = botanical(f.id); }

    const img = await getCan(f.id);
    if (FLAVORS[index].id === f.id) pix.swap(img);
  }

  function restart() {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(() => {
      if (document.hidden || window.scrollY > innerHeight * .8 || stage.matches(':hover')) return;
      select(index + 1);
    }, 5000);
  }

  const stage = $('#heroStage');
  $('#heroCanBtn').addEventListener('click', () => { select(index + 1); restart(); });

  // preload all cans
  FLAVORS.forEach(f => getCan(f.id));

  return { select, restart, get index() { return index; } };
})();

/* Hero type: split the pixel line into chars */
const heroPx = $('.hero-line--px');
heroPx.innerHTML = heroPx.textContent.trim().split(' ').map(word =>
  `<span class="word">${[...word].map(ch => `<span class="ch">${ch}</span>`).join('')}</span>`
).join(' ');

/* Hero: pointer parallax + chars that duck under the cursor */
(() => {
  if (reduced || !hasGSAP) return;
  const heroEl = $('#hero');
  const stage = $('#heroCanBtn');
  const fruitEl = $('#heroFruit');
  const pxLine = $('.hero-line--px');
  const scLine = $('.hero-line--script');
  const chars = $$('.ch', pxLine);

  const qs = {
    canX: gsap.quickTo(stage, 'x', { duration: .8, ease: 'power3' }),
    canR: gsap.quickTo(stage, 'rotation', { duration: .8, ease: 'power3' }),
    frX:  gsap.quickTo(fruitEl, 'xPercent', { duration: 1.2, ease: 'power3' }),
    frY:  gsap.quickTo(fruitEl, 'yPercent', { duration: 1.2, ease: 'power3' }),
    btX:  gsap.quickTo('#heroBot', 'xPercent', { duration: 1.6, ease: 'power3' }),
    btY:  gsap.quickTo('#heroBot', 'yPercent', { duration: 1.6, ease: 'power3' }),
    pxX:  gsap.quickTo(pxLine, 'x', { duration: 1, ease: 'power3' }),
    scX:  gsap.quickTo(scLine, 'x', { duration: 1.2, ease: 'power3' })
  };

  heroEl.addEventListener('pointermove', e => {
    const nx = e.clientX / innerWidth - .5;
    const ny = e.clientY / innerHeight - .5;
    qs.canX(nx * 30); qs.canR(nx * 6);
    qs.frX(nx * -18); qs.frY(ny * -14);
    qs.btX(nx * 14); qs.btY(ny * 10);
    qs.pxX(nx * -40); qs.scX(nx * 50);

    // font-size play: pixel letters grow & lift near the cursor
    chars.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const k = clamp(1 - d / 260, 0, 1);
      gsap.to(c, { scale: 1 + k * .35, yPercent: -k * 18, duration: .4, ease: 'steps(3)', overwrite: 'auto' });
    });
  });
  heroEl.addEventListener('pointerleave', () => {
    gsap.to(chars, { scale: 1, yPercent: 0, duration: .5, ease: 'steps(4)' });
  });

  // scroll: type pushes apart & scales, can lifts away
  gsap.timeline({ scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } })
    .to(pxLine, { scale: 1.35, opacity: 0, yPercent: -60, ease: 'none' }, 0)
    .to(scLine, { scale: 1.2, yPercent: 50, ease: 'none' }, 0)
    .to('#heroStage', { yPercent: -18, rotation: -6, ease: 'none' }, 0);
})();

/* ============================================================
   CROSS-STITCH CURSOR TRAIL (hero)
   ============================================================ */
(() => {
  if (reduced || matchMedia('(pointer: coarse)').matches) return;
  const heroEl = $('#hero');
  const c = $('#trail');
  const ctx = c.getContext('2d');
  const G = 12;            // grid size (css px)
  const LIFE = 900;
  let marks = [];
  let lastKey = '';
  let running = false;

  const size = () => {
    c.width = heroEl.clientWidth * DPR;
    c.height = heroEl.clientHeight * DPR;
  };
  size();
  new ResizeObserver(size).observe(heroEl);

  heroEl.addEventListener('pointermove', e => {
    const r = heroEl.getBoundingClientRect();
    const gx = Math.floor((e.clientX - r.left) / G);
    const gy = Math.floor((e.clientY - r.top) / G);
    const key = gx + ',' + gy;
    if (key === lastKey) return;
    lastKey = key;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--flavor').trim();
    marks.push({ x: gx * G, y: gy * G, t: performance.now(), color });
    if (!running) { running = true; requestAnimationFrame(loop); }
  });

  function loop(now) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    marks = marks.filter(m => now - m.t < LIFE);
    ctx.lineCap = 'square';
    for (const m of marks) {
      const life = 1 - (now - m.t) / LIFE;
      ctx.globalAlpha = life * .85;
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 2.5;
      const p = 3;
      ctx.beginPath();
      ctx.moveTo(m.x + p, m.y + p); ctx.lineTo(m.x + G - p, m.y + G - p);
      ctx.moveTo(m.x + G - p, m.y + p); ctx.lineTo(m.x + p, m.y + G - p);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (marks.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, c.width, c.height); }
  }
})();

/* ============================================================
   MARQUEE — speed reacts to scroll velocity
   ============================================================ */
(() => {
  const words = [
    ['px', '5g fiber'], ['script', 'real fruit'], ['px', 'low sugar'], ['script', 'prebiotic'],
    ['px', 'nothing artificial'], ['script', 'only 48 kcal']
  ];
  const html = words.map(([t, w]) => `<span class="m-${t}">${w}</span><span class="m-x">✕</span>`).join('');
  const rows = [$('#marqueeA'), $('#marqueeB')];
  rows.forEach(r => { r.innerHTML = html + html + html + html; });
  if (reduced) return;

  const pos = [0, 0];
  let vel = 0, lastY = window.scrollY;
  const tick = () => {
    const y = window.scrollY;
    vel += ((y - lastY) - vel) * .1;
    lastY = y;
    const speed = .6 + Math.min(Math.abs(vel) * .25, 8);
    rows.forEach((r, i) => {
      const half = r.scrollWidth / 2;
      pos[i] = (pos[i] + (i ? speed * .7 : speed)) % half;
      r.style.transform = `translate3d(${i ? pos[i] - half : -pos[i]}px,0,0)`;
    });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

/* ============================================================
   MANIFESTO — words resolve from pixel to ink as you scroll
   ============================================================ */
(() => {
  const el = $('#manifesto');
  const KEYS = ['30', 'half.', 'five', 'back.'];
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w =>
    `<span class="w${KEYS.includes(w.toLowerCase()) ? ' key' : ''}">${w}</span>`
  ).join(' ');
  const spans = $$('.w', el);

  if (!hasGSAP || reduced) { spans.forEach(s => s.classList.add('ink')); return; }

  ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    end: 'bottom 45%',
    scrub: true,
    onUpdate: self => {
      const n = Math.round(self.progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle('ink', i < n));
    }
  });

  // counters
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count;
    const from = to === 0 ? 100 : 0;
    const o = { v: from };
    el.textContent = String(from);
    gsap.to(o, {
      v: to, duration: 1.4, ease: 'steps(12)',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = String(Math.round(o.v)); }
    });
  });

  // benefits rise in one after another
  gsap.from('.benefit', {
    y: 50, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out',
    scrollTrigger: { trigger: '.benefits', start: 'top 85%' }
  });
})();

/* ============================================================
   MIND THE GAP — daily fiber calculator
   ============================================================ */
(() => {
  const GOAL = 30;
  const FOODS = [
    { name: 'Croissant', g: 1, on: true },
    { name: 'White-bread sandwich', g: 2, on: true },
    { name: 'Banana', g: 3, on: true },
    { name: 'Side salad', g: 2, on: true },
    { name: 'Pasta dinner', g: 3, on: true },
    { name: 'Apple', g: 4, on: true },
    { name: 'Bowl of oats', g: 4 },
    { name: 'Wholegrain toast', g: 3 },
    { name: 'Handful of almonds', g: 3 },
    { name: 'Lentil soup', g: 8 },
    { name: 'Berries', g: 3 },
    { name: 'Raw veggies & hummus', g: 4 }
  ];
  const MAX_CANS = 4;
  const foodsEl = $('#gapFoods');
  const grid = $('#gapGrid');
  const totalEl = $('#gapTotal');
  const msg = $('#gapMsg');
  const qty = $('#gapCanQty');
  const tray = $('#gapTray');
  let cans = 0;
  let prevFilled = 0;

  foodsEl.innerHTML = FOODS.map((f, i) =>
    `<button class="chip" aria-pressed="${!!f.on}" data-food="${i}">${f.name} <small>${f.g}g</small></button>`
  ).join('');
  grid.innerHTML = '<i></i>'.repeat(GOAL);
  const squares = $$('i', grid);

  function render() {
    const food = FOODS.reduce((a, f) => a + (f.on ? f.g : 0), 0);
    const canG = cans * 5;
    const total = food + canG;
    const filled = Math.min(GOAL, total);

    squares.forEach((sq, i) => {
      const cls = i < Math.min(food, GOAL) ? 'food' : i < filled ? 'can' : '';
      const was = sq.className.replace(' new', '');
      sq.className = cls;
      if (cls && cls !== was) { sq.classList.add('new'); sq.style.setProperty('--d', Math.max(0, i - prevFilled)); }
    });
    prevFilled = filled;

    totalEl.textContent = total;
    qty.textContent = cans;
    // one tilted can per can added
    while (tray.children.length > cans) tray.lastElementChild.remove();
    while (tray.children.length < cans) {
      const n = tray.children.length;
      const f = FLAVORS[(hero.index + n) % FLAVORS.length];
      const img = new Image();
      img.src = canTilt(f.id);
      img.alt = '';
      img.style.setProperty('--r', (n % 2 ? 8 : -6) + 'deg');
      tray.appendChild(img);
    }
    $('#gapCanDec').disabled = cans === 0;
    $('#gapCanInc').disabled = cans >= MAX_CANS;

    const gap = GOAL - total;
    const need = Math.ceil(gap / 5);
    const word = n => ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][n] ?? String(n);
    const cansTxt = n => `${word(n)} can${n === 1 ? '' : 's'}`;
    if (gap <= 0) {
      msg.innerHTML = cans
        ? `<strong>${total} g</strong>. Your garden is full tonight, and ${canG} g of it arrived with bubbles.`
        : `<strong>${total} g</strong>, all on your own. Your garden is thriving. Keep a can close for the days that aren't like this one.`;
    } else if (cans === 0) {
      msg.innerHTML = `Your garden received <strong>${total} g</strong> today. It was hoping for thirty. ${cansTxt(need)} would close the distance.`;
    } else {
      msg.innerHTML = `${cansTxt(cans)} in, and your garden is <strong>${canG} g</strong> richer. ${gap} g more and it blooms.`;
    }
  }

  foodsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-food]');
    if (!b) return;
    const f = FOODS[+b.dataset.food];
    f.on = !f.on;
    b.setAttribute('aria-pressed', f.on);
    render();
  });
  $('#gapCanInc').addEventListener('click', () => { cans = Math.min(MAX_CANS, cans + 1); render(); });
  $('#gapCanDec').addEventListener('click', () => { cans = Math.max(0, cans - 1); render(); });

  render();
})();

/* ============================================================
   FLAVORS — horizontal journey
   ============================================================ */
(() => {
  const track = $('#flavorsTrack');
  const prog = $('#flavorsProgress');

  // per-flavor artwork placement (percent of the visual box)
  const artVars = f => {
    const a = f.art || {}, fr = a.fruit || {}, bt = a.bot || {};
    return [
      fr.w != null && `--fw:${fr.w}%`, fr.l != null && `--fl:${fr.l}%`, fr.t != null && `--ft:${fr.t}%`,
      bt.w != null && `--bw:${bt.w}%`, bt.r != null && `--br:${bt.r}%`, bt.b != null && `--bb:${bt.b}%`
    ].filter(Boolean).join(';');
  };

  track.innerHTML = FLAVORS.map((f, i) => `
    <article class="panel${f.art?.bot?.back ? ' bot-back' : ''}" style="--c:${f.color};--s:${f.soft};${artVars(f)}" data-i="${i}" aria-label="${f.fruit} ${f.bot}">
      <span class="panel-bg-word" aria-hidden="true"><span class="panel-bg-inner">${f.bot}</span></span>
      <div class="panel-visual">
        <img class="panel-fruit" src="${fruit(f.id)}" alt="" loading="lazy">
        <img class="panel-can" src="${canTiltLg(f.id)}" alt="${f.fruit} ${f.bot} can" loading="lazy">
        <img class="panel-bot" src="${botanical(f.id)}" alt="" loading="lazy">
      </div>
      <div class="panel-info">
        <p class="panel-num">${String(i + 1).padStart(2, '0')} / ${String(FLAVORS.length).padStart(2, '0')}</p>
        <h3 class="panel-name"><span class="px">${f.fruit}</span><span class="script">${f.bot}</span></h3>
        <p class="panel-mood">${f.mood}</p>
        <p class="panel-desc">${f.desc}</p>
        <div class="notes">
          ${Object.entries(f.notes).map(([k, v]) => `
            <div class="note"><span>${k}</span>
              <span class="note-bar" role="img" aria-label="${k} ${v} of ${NOTE_MAX}">
                ${Array.from({ length: NOTE_MAX }, (_, j) => `<i class="${j < v ? 'on' : ''}" style="--i:${j}"></i>`).join('')}
              </span>
            </div>`).join('')}
        </div>
        <div class="panel-actions">
          <span class="panel-price">${fmt(PRICE)} <small>/ can</small></span>
          <button class="btn" data-add="${f.id}">Add to box +</button>
          <button class="link-label" data-label="${f.id}">Read the label</button>
        </div>
      </div>
    </article>`).join('');

  prog.innerHTML = FLAVORS.map(() => '<i></i>').join('');
  const pips = $$('i', prog);
  const panels = $$('.panel', track);

  // scale each background word to fit the panel (long words like "Rosemary" were overflowing)
  const fitWords = () => panels.forEach(p => {
    const w = $('.panel-bg-word', p);
    w.style.fontSize = '100px';
    const natural = w.scrollWidth;
    const target = p.clientWidth * .8;
    w.style.fontSize = Math.min(innerWidth * .3, 100 * target / natural) + 'px';
  });
  fitWords();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitWords);
  window.addEventListener('resize', fitWords);

  const activate = i => {
    panels.forEach((p, j) => { if (j === i) p.classList.add('is-in'); });
    pips.forEach((p, j) => p.classList.toggle('on', j <= i));
    setTheme(FLAVORS[i]);
  };

  if (!hasGSAP) { panels.forEach(p => p.classList.add('is-in')); return; }

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#flavorsPin',
        start: 'top top',
        end: () => '+=' + dist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        snap: reduced ? false : { snapTo: 1 / (FLAVORS.length - 1), duration: { min: .2, max: .6 }, ease: 'power2.inOut', delay: .05 },
        onUpdate: self => activate(Math.round(self.progress * (FLAVORS.length - 1))),
        onLeaveBack: () => setTheme(FLAVORS[hero.index])
      }
    });

    // per-panel parallax inside the horizontal scroll
    panels.forEach(p => {
      const st = { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true };
      gsap.fromTo($('.panel-fruit', p), { xPercent: -30, rotation: -10 }, { xPercent: 30, rotation: 10, ease: 'none', scrollTrigger: st });
      gsap.fromTo($('.panel-bg-inner', p), { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { ...st } });
      gsap.fromTo($('.panel-can', p), { yPercent: 8, rotation: 4 }, { yPercent: -4, rotation: -3, ease: 'none', scrollTrigger: { ...st } });
      gsap.fromTo($('.panel-bot', p), { xPercent: 25, yPercent: 15, rotation: 12 }, { xPercent: -15, yPercent: -10, rotation: -8, ease: 'none', scrollTrigger: { ...st } });
    });
  });

  mm.add('(max-width: 900px)', () => {
    panels.forEach((p, i) => ScrollTrigger.create({
      trigger: p, start: 'top 60%', end: 'bottom 40%',
      onToggle: s => s.isActive && activate(i)
    }));
  });
})();

/* ============================================================
   LABEL DIALOG
   ============================================================ */
(() => {
  const dlg = $('#labelDialog');
  const body = $('#labelBody');

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-label]');
    if (!b) return;
    const f = FLAVORS.find(x => x.id === b.dataset.label);
    body.style.setProperty('--c', f.color);
    body.innerHTML = `
      <div class="label-art"><img src="${label(f.id)}" alt="${f.fruit} ${f.bot} label artwork"></div>
      <div class="label-text">
        <h3><span class="px">${f.fruit}</span><span class="script">${f.bot}</span></h3>
        <p><strong>Ingredients:</strong> ${f.ingredients}</p>
        <table class="nutri">
          <caption>Per can · 330 ml</caption>
          <tr><td>Energy</td><td>48 kcal</td></tr>
          <tr><td>Sugars</td><td>8 g</td></tr>
          <tr class="hl"><td>Fiber</td><td>5 g</td></tr>
          <tr><td>Fat</td><td>0 g</td></tr>
          <tr><td>Salt</td><td>0.02 g</td></tr>
        </table>
        <div class="panel-actions" style="margin-top:1.8rem">
          <button class="btn btn--flavor" style="--b:${f.color}" data-add="${f.id}">Add to box +</button>
        </div>
      </div>`;
    if (lenis) lenis.stop();
    dlg.showModal();
  });

  const close = () => dlg.close();
  $('#labelClose').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => lenis && lenis.start());
})();

/* ============================================================
   STITCH A FRUIT — mini game
   ============================================================ */
(() => {
  const canvas = $('#stitchCanvas');
  const ctx = canvas.getContext('2d');
  const picker = $('#stitchPicker');
  const bar = $('#stitchBar');
  const pctEl = $('#stitchPct');
  const reward = $('#stitchReward');
  const PATTERNS = window.FIBRA_PATTERNS || { n: 40, fruits: {} };
  const N = PATTERNS.n;               // cells across
  const hint = $('#stitchHint');

  let cells = [];                     // per cell: null or {r,g,b}
  let revealed = new Uint8Array(N * N);
  let targets = 0, done = 0, finished = false;
  let cs = 10;                        // cell size in device px
  let current = FLAVORS[0].id;
  let last = null, pressed = false;

  FLAVORS.forEach((f, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', i === 0);
    b.setAttribute('aria-label', f.fruit);
    b.innerHTML = `<img src="${fruit(f.id)}" alt="" loading="lazy">`;
    b.addEventListener('click', () => {
      $$('button', picker).forEach(x => x.setAttribute('aria-checked', x === b));
      load(f.id);
    });
    picker.appendChild(b);
  });

  function load(id) {
    current = id;
    const raw = (PATTERNS.fruits[id] || '').split(',');
    cells = []; targets = 0;
    for (let i = 0; i < N * N; i++) {
      const hex = raw[i];
      if (hex) {
        cells.push({ r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) });
        targets++;
      } else cells.push(null);
    }
    reset();
  }

  function reset() {
    revealed = new Uint8Array(N * N);
    done = 0; finished = false;
    reward.hidden = true;
    hint.classList.remove('gone');
    progress();
    redraw();
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    canvas.width = canvas.height = Math.round(r.width * DPR);
    cs = canvas.width / N;
    canvas.style.setProperty('--cell', (r.width / N) + 'px');
    redraw();
  }

  function drawHint(i) {
    const c = cells[i];
    const x = (i % N) * cs, y = Math.floor(i / N) * cs;
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},.35)`;
    const d = cs * .4;
    ctx.fillRect(x + (cs - d) / 2, y + (cs - d) / 2, d, d);
  }

  function drawStitch(i) {
    const c = cells[i];
    const x = (i % N) * cs, y = Math.floor(i / N) * cs;
    const p = cs * .14;
    ctx.clearRect(x, y, cs, cs);
    ctx.lineCap = 'round';
    // thread
    ctx.strokeStyle = `rgb(${c.r},${c.g},${c.b})`;
    ctx.lineWidth = cs * .32;
    ctx.beginPath();
    ctx.moveTo(x + p, y + p); ctx.lineTo(x + cs - p, y + cs - p);
    ctx.moveTo(x + cs - p, y + p); ctx.lineTo(x + p, y + cs - p);
    ctx.stroke();
    // sheen on the top thread
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = cs * .09;
    ctx.beginPath();
    ctx.moveTo(x + cs - p * 1.6, y + p * 1.6); ctx.lineTo(x + p * 1.6, y + cs - p * 1.6);
    ctx.stroke();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cells.forEach((c, i) => { if (c) revealed[i] ? drawStitch(i) : drawHint(i); });
  }

  function progress() {
    const p = targets ? done / targets : 0;
    bar.style.width = (p * 100) + '%';
    pctEl.textContent = String(Math.round(p * 100)).padStart(3, '0') + '%';
  }

  function stitchAt(px, py) {
    const R = 2.2;
    const gx = px / cs, gy = py / cs;
    for (let y = Math.floor(gy - R); y <= gy + R; y++) for (let x = Math.floor(gx - R); x <= gx + R; x++) {
      if (x < 0 || y < 0 || x >= N || y >= N) continue;
      if (Math.hypot(x + .5 - gx, y + .5 - gy) > R) continue;
      const i = y * N + x;
      if (cells[i] && !revealed[i]) { revealed[i] = 1; done++; drawStitch(i); }
    }
  }

  function onMove(e) {
    if (finished || !cells.length) return;
    if (e.pointerType !== 'mouse' && !pressed) return;
    const r = canvas.getBoundingClientRect();
    const pt = { x: (e.clientX - r.left) * DPR, y: (e.clientY - r.top) * DPR };
    // interpolate so fast strokes don't skip cells
    if (last) {
      const d = Math.hypot(pt.x - last.x, pt.y - last.y);
      const steps = Math.ceil(d / (cs * .5));
      for (let s = 1; s <= steps; s++) stitchAt(last.x + (pt.x - last.x) * s / steps, last.y + (pt.y - last.y) * s / steps);
    } else stitchAt(pt.x, pt.y);
    last = pt;
    progress();
    if (done) hint.classList.add('gone');
    if (done / targets >= .85) finish();
  }

  function finish() {
    finished = true;
    const rest = [];
    cells.forEach((c, i) => { if (c && !revealed[i]) rest.push(i); });
    rest.sort(() => Math.random() - .5);
    const batch = Math.max(4, Math.ceil(rest.length / 30));
    const step = () => {
      rest.splice(0, batch).forEach(i => { revealed[i] = 1; done++; drawStitch(i); });
      progress();
      if (rest.length) requestAnimationFrame(step);
      else {
        // let the finished fruit be admired for a moment, then hang the tag
        setTimeout(() => {
          if (!finished) return;
          reward.hidden = false;
          if (hasGSAP && !reduced) gsap.from(reward, { y: -30, opacity: 0, duration: .6, ease: 'steps(6)' });
        }, reduced ? 0 : 900);
      }
    };
    requestAnimationFrame(step);
  }

  canvas.addEventListener('pointerdown', e => { pressed = true; last = null; canvas.setPointerCapture(e.pointerId); onMove(e); });
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', () => { pressed = false; last = null; });
  canvas.addEventListener('pointerleave', () => { last = null; });

  $('#stitchReset').addEventListener('click', reset);
  $('#stitchCode').addEventListener('click', () => {
    navigator.clipboard?.writeText('STITCH10');
    toast('Code STITCH10 copied ✕');
  });

  new ResizeObserver(resize).observe(canvas);
  load(current);
})();

/* ============================================================
   PIXEL DISSOLVE / ASSEMBLE
   'out': an image breaks into growing pixels and blinks out
   'in' : scattered big pixels blink in and sharpen into the image
   The canvas lives inside the image's own container, so it scrolls
   with it and never draws over the nav.
   ============================================================ */
async function pixelFx(img, mode = 'out', dur = 750) {
  if (reduced || !img) return;
  if (!img.complete || !img.naturalWidth) { try { await img.decode(); } catch { return; } }
  const host = img.offsetParent;
  if (!host || !img.offsetWidth) return;

  const c = document.createElement('canvas');
  const w = img.offsetWidth, h = img.offsetHeight;
  c.width = Math.max(1, Math.round(w * DPR));
  c.height = Math.max(1, Math.round(h * DPR));
  Object.assign(c.style, {
    position: 'absolute', left: img.offsetLeft + 'px', top: img.offsetTop + 'px',
    width: w + 'px', height: h + 'px', pointerEvents: 'none', zIndex: 2
  });
  host.appendChild(c);
  img.style.visibility = 'hidden';

  const ctx = c.getContext('2d');
  const off = document.createElement('canvas');
  const octx = off.getContext('2d');
  const seed = Math.random() * 1000;
  const cell = 6 * DPR;                            // holes keyed to a fixed grid so they persist
  const rand = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453; return v - Math.floor(v); };
  const t0 = performance.now();

  await new Promise(done => {
    const frame = now => {
      const t = Math.min(1, (now - t0) / dur);
      const stepped = Math.floor(t * 9) / 9;       // stepped, like the rest of the pixel motion
      const k = mode === 'out' ? stepped : 1 - stepped;   // 0 = crisp & whole, 1 = gone
      const p = Math.max(1, Math.round((1 + k * 15) * DPR));
      ctx.clearRect(0, 0, c.width, c.height);
      if (p <= DPR) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, c.width, c.height);
      } else {
        const sw = Math.ceil(c.width / p), sh = Math.ceil(c.height / p);
        off.width = sw; off.height = sh;
        octx.drawImage(img, 0, 0, sw, sh);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, 0, 0, sw, sh, 0, 0, sw * p, sh * p);
        for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
          if (rand(Math.floor(x * p / cell), Math.floor(y * p / cell)) < k * 1.15) ctx.clearRect(x * p, y * p, p, p);
        }
      }
      c.style.transform = `translateY(${(mode === 'out' ? -1 : 1) * k * 16}px)`;
      if (t < 1) requestAnimationFrame(frame);
      else done();
    };
    requestAnimationFrame(frame);
  });

  c.remove();
  if (mode === 'in') img.style.visibility = '';
}
const pixelDissolve = img => pixelFx(img, 'out');
const pixelAssemble = img => pixelFx(img, 'in');

/* ============================================================
   BUILD A BOX
   ============================================================ */
const box = (() => {
  const list = $('#boxList');
  const crate = $('#crate');
  const navPips = $('#navPips');
  const navCount = $('#navCount');
  const navBox = $('.nav-box');
  let items = [];
  try { items = JSON.parse(localStorage.getItem('fibrapop-box') || '[]').filter(id => FLAVORS.some(f => f.id === id)); } catch { items = []; }

  list.innerHTML = FLAVORS.map(f => `
    <li class="box-item" style="--c:${f.color}">
      <img src="${canSm(f.id)}" alt="" loading="lazy">
      <div class="box-item-name">
        <span class="px">${f.fruit}</span><span class="script">${f.bot}</span>
        <small>${f.mood} · ${fmt(PRICE)}</small>
      </div>
      <div class="stepper">
        <button data-dec="${f.id}" aria-label="Remove one ${f.fruit} ${f.bot}">−</button>
        <output data-qty="${f.id}">0</output>
        <button data-inc="${f.id}" aria-label="Add one ${f.fruit} ${f.bot}">+</button>
      </div>
    </li>`).join('');

  navPips.innerHTML = '<i></i>'.repeat(BOX_SIZE);
  crate.innerHTML = '<div class="slot"></div>'.repeat(BOX_SIZE);

  function render(fresh = -1) {
    const slots = $$('.slot', crate);
    slots.forEach((s, i) => {
      const id = items[i];
      const had = s.dataset.id;
      if (id === had) return;
      s.dataset.id = id || '';
      s.classList.toggle('filled', !!id);
      s.innerHTML = id ? `<img src="${canSm(id)}" alt="${FLAVORS.find(f => f.id === id).fruit} can"${i === fresh ? ' class="fresh"' : ''}>` : '';
      s.setAttribute('aria-label', id ? 'Remove this can' : 'Empty slot');
      if (i === fresh) pixelAssemble($('img', s));
    });
    $$('i', navPips).forEach((p, i) => {
      const f = FLAVORS.find(x => x.id === items[i]);
      p.classList.toggle('on', !!f);
      p.style.setProperty('--c', f ? f.color : '');
    });
    FLAVORS.forEach(f => {
      const n = items.filter(x => x === f.id).length;
      $(`[data-qty="${f.id}"]`).textContent = n;
      $(`[data-dec="${f.id}"]`).disabled = n === 0;
      $(`[data-inc="${f.id}"]`).disabled = items.length >= BOX_SIZE;
    });
    navCount.textContent = `${items.length}/${BOX_SIZE}`;
    $('#crateCount').textContent = `${items.length} / ${BOX_SIZE}`;
    $('#cratePrice').textContent = fmt(items.length * PRICE);
    $('#crateCheckout').disabled = items.length < BOX_SIZE;
    $('#crateSurprise').textContent = items.length >= BOX_SIZE ? 'Empty box' : 'Surprise me';
    localStorage.setItem('fibrapop-box', JSON.stringify(items));
  }

  function bump() {
    navBox.classList.remove('bump');
    void navBox.offsetWidth;
    navBox.classList.add('bump');
  }

  function add(id, fromEl) {
    if (items.length >= BOX_SIZE) { toast('Your box is full: 6/6'); return false; }
    items.push(id);
    render(items.length - 1);
    if (fromEl) fly(fromEl, id); else bump();
    if (items.length === BOX_SIZE) toast('Box complete ✕ ready to checkout');
    return true;
  }

  let busy = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* remove the can in slot i: it dissolves in pixels, then the rest slide up */
  async function removeAt(i) {
    if (busy || i < 0 || i >= items.length) return;
    busy = true;
    const slots = $$('.slot', crate);
    await pixelDissolve(slots[i].querySelector('img'));
    items.splice(i, 1);
    slots.forEach((x, j) => { if (j >= i) x.dataset.id = '__'; });
    render();
    busy = false;
  }

  function remove(id) { removeAt(items.lastIndexOf(id)); }

  async function emptyBox() {
    if (busy) return;
    busy = true;
    const imgs = $$('.slot img', crate);
    await Promise.all(imgs.map((img, k) => wait(k * 90).then(() => pixelDissolve(img))));
    items = [];
    render();
    busy = false;
  }

  /* the can flies into the nav box */
  function fly(fromEl, id) {
    if (!hasGSAP || reduced) { bump(); return; }
    const src = fromEl.getBoundingClientRect();
    const dst = navBox.getBoundingClientRect();
    $('#nav').classList.remove('is-hidden');
    const img = new Image();
    img.src = canTilt(id);
    const h = Math.min(src.height, 220);
    Object.assign(img.style, {
      position: 'fixed', zIndex: 500, pointerEvents: 'none',
      left: src.left + src.width / 2 + 'px', top: src.top + src.height / 2 + 'px',
      height: h + 'px', transform: 'translate(-50%,-50%)'
    });
    document.body.appendChild(img);
    gsap.to(img, {
      left: dst.left + dst.width / 2, top: dst.top + dst.height / 2,
      scale: .12, rotation: -25, duration: .85, ease: 'power3.in',
      onComplete: () => { img.remove(); bump(); }
    });
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-add]');
    if (a) {
      const f = FLAVORS.find(x => x.id === a.dataset.add);
      const panelCan = a.closest('.panel')?.querySelector('.panel-can');
      if (add(f.id, panelCan || a)) toast(`${f.fruit} ${f.bot} added ✕ ${items.length}/${BOX_SIZE}`);
    }
  });

  list.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) add(inc.dataset.inc);
    if (dec) remove(dec.dataset.dec);
  });

  crate.addEventListener('click', e => {
    const s = e.target.closest('.slot.filled');
    if (!s) return;
    removeAt($$('.slot', crate).indexOf(s));
  });

  $('#crateSurprise').addEventListener('click', () => {
    if (items.length >= BOX_SIZE) { emptyBox(); return; }
    if (busy) return;
    const fill = () => {
      if (items.length >= BOX_SIZE) return;
      items.push(FLAVORS[(Math.random() * FLAVORS.length) | 0].id);
      render(items.length - 1); bump();
      setTimeout(fill, reduced ? 0 : 140);
    };
    fill();
  });

  $('#crateCheckout').addEventListener('click', () => {
    toast(`Checkout ✕ ${fmt(items.length * PRICE)} · coming soon`);
  });

  render();
  return { add };
})();

/* ============================================================
   FOOTER — the logo plays with you
   ============================================================ */
(() => {
  const pxEl = $('#fwPx');
  pxEl.innerHTML = [...'Fibra'].map(ch => `<span>${ch}</span>`).join('');
  const word = $('#footerWord');
  const pop = $('.fw-script', word);

  if (hasGSAP && !reduced) {
    const rot = gsap.quickTo(pop, 'rotation', { duration: .8, ease: 'power3' });
    const sc  = gsap.quickTo(pop, 'scale', { duration: .8, ease: 'power3' });
    $('.footer').addEventListener('pointermove', e => {
      const r = word.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = clamp((e.clientY - r.top) / r.height, 0, 1);
      rot(nx * 14);
      sc(1 + (1 - ny) * .12);
    });

    const letters = $$('span', pxEl);
    gsap.from(letters, {
      yPercent: 100, opacity: 0, stagger: .06, duration: .6, ease: 'steps(5)',
      scrollTrigger: { trigger: word, start: 'top 95%' }
    });
    letters.forEach(l => {
      l.addEventListener('mouseenter', () => gsap.to(l, { yPercent: -14, scale: 1.08, duration: .3, ease: 'steps(3)', overwrite: true }));
      l.addEventListener('mouseleave', () => gsap.to(l, { yPercent: 0, scale: 1, duration: .4, ease: 'steps(4)', overwrite: true }));
    });
    gsap.from(pop, {
      clipPath: 'inset(-20% 100% -20% -20%)', duration: 1.4, ease: 'power2.inOut', clearProps: 'clipPath',
      scrollTrigger: { trigger: word, start: 'top 85%' }
    });
  }

  $('#newsletter').addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast('Welcome to the stitch club ✕');
  });
})();

/* ============================================================
   LOADER + INTRO
   ============================================================ */
(() => {
  const loader = $('#loader');
  const grid = $('#loaderGrid');
  const count = $('#loaderCount');

  const intro = () => {
    hero.select(0, true);
    hero.restart();
    if (!hasGSAP || reduced) return;
    const tl = gsap.timeline();
    tl.from('.hero-line--px .ch', { yPercent: 120, opacity: 0, stagger: .03, duration: .5, ease: 'steps(4)' })
      .fromTo('.hero-line--script', { clipPath: 'inset(-30% 100% -30% -10%)' },
        { clipPath: 'inset(-30% -10% -30% -10%)', duration: 1.6, ease: 'power2.inOut', clearProps: 'clipPath' }, .2)
      .from('#heroFruit', { scale: 0, rotation: -40, duration: .8, ease: 'steps(6)' }, .3)
      .from('.hero-kicker, .hero-switch, .hero-scroll, #nav', { opacity: 0, y: 16, stagger: .08, duration: .7, ease: 'power3.out' }, .6);
  };

  if (!hasGSAP || reduced) { loader.remove(); intro(); return; }

  document.body.classList.add('is-loading');
  const cols = innerWidth < 700 ? 6 : 12;
  const size = innerWidth / cols;
  const rows = Math.ceil(innerHeight / size);
  grid.style.setProperty('--cols', cols);
  grid.innerHTML = '<span></span>'.repeat(cols * rows);

  // real progress: preload cans + first fruit
  const srcs = [...FLAVORS.map(f => can(f.id)), fruit(FLAVORS[0].id), 'assets/logo/logo-ink.png'];
  let loaded = 0;
  const shown = { v: 0 };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const imgsReady = Promise.all(srcs.map(s => loadImg(s).then(() => {
    loaded++;
    gsap.to(shown, { v: (loaded / srcs.length) * 100, duration: .3, ease: 'steps(4)', onUpdate: () => {
      count.textContent = String(Math.round(shown.v)).padStart(3, '0');
    } });
  })));
  const minTime = new Promise(r => setTimeout(r, 900));
  const maxTime = new Promise(r => setTimeout(r, 4000));

  Promise.race([Promise.all([imgsReady, fontsReady, minTime]), maxTime]).then(() => {
    count.textContent = '100';
    const tl = gsap.timeline({
      onComplete: () => {
        loader.remove();
        document.body.classList.remove('is-loading');
        ScrollTrigger.refresh();
      }
    });
    tl.to('.loader-mark', { opacity: 0, scale: .9, duration: .3, ease: 'steps(3)' }, .15)
      .to($$('span', grid), { scale: 0, duration: .25, ease: 'steps(2)', stagger: { each: .006, from: 'random' } }, .3)
      .add(intro, .55);
  });
})();
