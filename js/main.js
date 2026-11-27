/* ============================================
   GAS NOIR — Main JavaScript
   Loader | 3D Hero | Scroll | Cursor | Nav
============================================ */

(function () {
  'use strict';

  /* ─── LOADER — jeen-yuhs style ─── */
  function initLoader() {
    const loader   = document.getElementById('loader');
    const counter  = document.getElementById('loaderCounter');
    const barFill  = document.getElementById('loaderBarFill');
    const statusEl = document.getElementById('loaderStatus');
    const brandCycle = document.getElementById('loaderBrandCycle');

    document.body.style.overflow = 'hidden';

    // Font cycling effect — "Gas Noir" rapidly shifts between fonts
    const cycleFonts = [
      "'Great Vibes', cursive",
      "'VT323', monospace",
      "'Bebas Neue', cursive",
      "'Playfair Display', serif",
      "'Dancing Script', cursive",
      "'Share Tech Mono', monospace",
      "'Oswald', sans-serif",
      "'Abril Fatface', cursive",
      "Georgia, serif",
      "Impact, sans-serif",
      "'Montserrat', sans-serif",
      "'Times New Roman', serif",
      "'Courier New', monospace",
      "'Arial Black', sans-serif",
    ];

    let fontCycleInterval = null;
    if (brandCycle) {
      fontCycleInterval = setInterval(() => {
        const f = cycleFonts[Math.floor(Math.random() * cycleFonts.length)];
        brandCycle.style.fontFamily = f;
      }, 75);
    }

    const statusMessages = [
      { at: 0,  text: 'INITIALIZING' },
      { at: 20, text: 'LOADING ASSETS' },
      { at: 55, text: 'CALIBRATING STUDIO' },
      { at: 80, text: 'ENTERING GAS NOIR' },
      { at: 99, text: 'READY' },
    ];

    const duration = 2600;
    const startTime = performance.now();

    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function glitchCounter() {
      if (Math.random() < 0.15) {
        counter.style.textShadow = `${(Math.random() - 0.5) * 6}px 0 rgba(70,130,180,0.9), ${(Math.random() - 0.5) * 4}px 0 rgba(255,80,80,0.5)`;
        setTimeout(() => { counter.style.textShadow = 'none'; }, 80);
      }
    }

    function tick(now) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const progress = easeInOut(rawProgress);
      const val = Math.floor(progress * 100);

      counter.textContent = String(val).padStart(3, '0');
      barFill.style.width = val + '%';
      glitchCounter();

      for (let i = statusMessages.length - 1; i >= 0; i--) {
        if (val >= statusMessages[i].at) {
          if (statusEl.textContent !== statusMessages[i].text) {
            statusEl.textContent = statusMessages[i].text;
          }
          break;
        }
      }

      if (rawProgress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = '100';
        barFill.style.width = '100%';
        statusEl.textContent = 'READY';

        if (fontCycleInterval) {
          clearInterval(fontCycleInterval);
          fontCycleInterval = null;
        }
        if (brandCycle) brandCycle.style.fontFamily = "'Great Vibes', cursive";

        setTimeout(() => {
          loader.classList.add('reveal');

          setTimeout(() => {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            heroReveal();
          }, 1150);
        }, 400);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ─── CURSOR ─── */
  const cursor = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .collection-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '6px';
      cursor.style.height = '6px';
      cursorRing.style.width = '60px';
      cursorRing.style.height = '60px';
      cursorRing.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      cursorRing.style.width = '40px';
      cursorRing.style.height = '40px';
      cursorRing.style.opacity = '0.6';
    });
  });

  /* ─── IMAGE TRAIL ─── */
  const TRAIL_CONFIG = {
    maxItems: 12,
    imageW: 160,
    imageH: 210,
    triggerDistance: 80,
    lifetime: 900,
  };

  const trailColors = [
    'rgba(70,130,180,0.18)',
    'rgba(40,40,43,0.9)',
    'rgba(70,130,180,0.12)',
    'rgba(60,60,65,0.85)',
    'rgba(70,130,180,0.22)',
    'rgba(50,50,54,0.9)',
  ];

  const trailImages = [];

  let trailPool = [];
  let trailIndex = 0;
  let lastTrailX = 0, lastTrailY = 0;

  function createTrailPool() {
    for (let i = 0; i < TRAIL_CONFIG.maxItems; i++) {
      const el = document.createElement('div');
      el.className = 'trail-item';
      el.style.width = TRAIL_CONFIG.imageW + 'px';
      el.style.height = TRAIL_CONFIG.imageH + 'px';

      if (trailImages.length > 0) {
        const img = document.createElement('img');
        img.src = trailImages[i % trailImages.length];
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        el.appendChild(img);
      } else {
        el.style.background = trailColors[i % trailColors.length];
        const label = document.createElement('span');
        label.textContent = 'GN';
        label.style.cssText = `
          position: absolute;
          bottom: 12px;
          right: 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3em;
          color: rgba(70,130,180,0.4);
        `;
        el.appendChild(label);
      }

      document.body.appendChild(el);
      trailPool.push({ el, active: false, timeout: null });
    }
  }

  function spawnTrailItem(x, y) {
    const item = trailPool[trailIndex % TRAIL_CONFIG.maxItems];
    trailIndex++;

    if (item.timeout) clearTimeout(item.timeout);

    const el = item.el;
    const angle = (Math.random() - 0.5) * 16;
    const scaleInit = 0.7 + Math.random() * 0.2;

    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.zIndex = 9000 + (trailIndex % 100);
    el.style.transform = `translate(-50%, -50%) scale(0) rotate(${angle}deg)`;
    el.style.opacity = '0';
    el.style.transition = 'none';

    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease';
      el.style.transform = `translate(-50%, -50%) scale(${scaleInit}) rotate(${angle}deg)`;
      el.style.opacity = '0.85';
    });

    item.timeout = setTimeout(() => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.4,0,1,1), opacity 0.5s ease';
      el.style.transform = `translate(-50%, -50%) scale(${scaleInit * 0.85}) rotate(${angle}deg)`;
      el.style.opacity = '0';
    }, TRAIL_CONFIG.lifetime);
  }

  function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  function initTrail() {
    createTrailPool();

    const hero = document.querySelector('.hero');

    document.addEventListener('mousemove', (e) => {
      const heroRect = hero.getBoundingClientRect();
      const inHero = e.clientY >= heroRect.top && e.clientY <= heroRect.bottom;
      if (!inHero) return;

      if (dist(e.clientX, e.clientY, lastTrailX, lastTrailY) > TRAIL_CONFIG.triggerDistance) {
        lastTrailX = e.clientX;
        lastTrailY = e.clientY;
        spawnTrailItem(e.clientX, e.clientY);
      }
    });
  }

  /* ─── HERO CINEMATIC REVEAL ─── */
  function heroReveal() {
    const hero = document.querySelector('.hero');
    setTimeout(() => {
      hero.classList.add('revealed');
    }, 300);
  }

  /* ─── 3D HERO SCENE — Studio Room Interior ─── */
  function initHero3D() {
    if (!window.THREE) return;

    const canvas = document.getElementById('hero3dCanvas');
    const heroSection = document.querySelector('.hero');
    if (!canvas || !heroSection) return;

    let W = heroSection.offsetWidth;
    let H = heroSection.offsetHeight;

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    /* Camera — positioned at room entrance, looking in */
    const cam = new THREE.PerspectiveCamera(68, W / H, 0.1, 60);
    cam.position.set(0.5, 1.7, 7.0);
    cam.lookAt(-0.5, 1.3, -2);

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;

    /* ── Materials ── */
    function m(color, metalness = 0.7, roughness = 0.3) {
      return new THREE.MeshStandardMaterial({ color, metalness, roughness });
    }
    function emm(emissive, intensity = 0.5) {
      return new THREE.MeshStandardMaterial({
        color: 0x020204,
        emissive,
        emissiveIntensity: intensity,
        metalness: 0,
        roughness: 0.2,
      });
    }

    /* ── Lighting ── */
    scene.add(new THREE.AmbientLight(0x1a1a3a, 0.9));


    /* ── Screen Panel Builder ── */
    function makeScreen(w, h, emissiveCol, intensity) {
      const g = new THREE.Group();

      // Bezel
      g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), m(0x080810, 0.9, 0.1)));

      // Screen surface
      const scr = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.93, h * 0.9, 0.015),
        emm(emissiveCol, intensity)
      );
      scr.position.z = 0.037;
      g.add(scr);

      // Editing timeline bars on screen
      const barData = [
        { w: 0.72, c: 0x4682B4, y:  0.24 },
        { w: 0.45, c: 0xff5520, y:  0.13 },
        { w: 0.60, c: 0x22cc66, y:  0.02 },
        { w: 0.80, c: 0x8844cc, y: -0.09 },
        { w: 0.38, c: 0x4682B4, y: -0.20 },
      ];
      barData.forEach(b => {
        const bw = b.w * w * 0.88;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(bw, 0.028, 0.01),
          new THREE.MeshStandardMaterial({ color: b.c, emissive: b.c, emissiveIntensity: 0.55 })
        );
        bar.position.set(-w * 0.43 + bw / 2, b.y * h, 0.05);
        g.add(bar);
      });

      // Playhead line
      const ph = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, h * 0.65, 0.01),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
      );
      ph.position.set(-w * 0.43 + w * 0.88 * 0.42, 0, 0.055);
      g.add(ph);

      // Screen glow light
      const sg = new THREE.PointLight(emissiveCol, 0.7, 3);
      sg.position.set(0, 0, 0.4);
      g.add(sg);

      return g;
    }

    /* ── Main Editing Station ── */
    function makeEditingStation() {
      const g = new THREE.Group();

      // Desk surface
      const deskTop = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.09, 1.7), m(0x181820, 0.5, 0.65));
      deskTop.position.y = 0.88;
      g.add(deskTop);

      // Desk legs
      const legM = m(0x141418, 0.85, 0.4);
      [[-2.35, -0.72], [2.35, -0.72], [-2.35, 0.72], [2.35, 0.72]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.88, 0.065), legM);
        leg.position.set(lx, 0.44, lz);
        g.add(leg);
      });
      // Cross-brace
      const xbar = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.04, 0.04), legM);
      xbar.position.set(0, 0.14, 0);
      g.add(xbar);

      // Large center monitor (main edit display)
      const mainMon = makeScreen(2.8, 1.65, 0x3a6090, 0.42);
      mainMon.position.set(0.1, 2.05, -0.55);
      g.add(mainMon);

      // Left monitor — angled
      const leftMon = makeScreen(1.9, 1.15, 0x4682B4, 0.5);
      leftMon.position.set(-2.08, 1.82, -0.4);
      leftMon.rotation.y = 0.3;
      g.add(leftMon);

      // Right monitor — angled
      const rightMon = makeScreen(1.9, 1.15, 0x4070a0, 0.44);
      rightMon.position.set(2.08, 1.82, -0.4);
      rightMon.rotation.y = -0.3;
      g.add(rightMon);

      // Keyboard
      const kb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 0.47), m(0x10101a, 0.6, 0.75));
      kb.position.set(-0.1, 0.918, 0.48);
      g.add(kb);

      // Keyboard backlight
      const kbGlow = new THREE.PointLight(0x4682B4, 0.25, 1.5);
      kbGlow.position.set(-0.1, 0.95, 0.48);
      g.add(kbGlow);

      // Desk mic (podcasting/VO setup)
      const micArm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 6), m(0x252530, 0.9, 0.15));
      micArm.position.set(-1.6, 1.28, 0.3);
      g.add(micArm);
      const micHead = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 12), m(0x1a1a22, 0.85, 0.2));
      micHead.position.set(-1.6, 1.66, 0.3);
      g.add(micHead);

      // External drives stack
      const driveM = m(0x16161e, 0.8, 0.25);
      [0, 0.16, 0.32].forEach((dy, i) => {
        const drv = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.13, 0.46), driveM);
        drv.position.set(2.1, 0.94 + dy, 0.44);
        g.add(drv);
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012),
          new THREE.MeshStandardMaterial({ color: 0x4682B4, emissive: 0x4682B4, emissiveIntensity: i === 1 ? 0.9 : 0.2 }));
        led.position.set(1.76, 0.99 + dy, 0.44);
        g.add(led);
      });

      // Coffee mug
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.13, 14), m(0x1e1e26, 0.15, 0.85));
      mug.position.set(-2.1, 0.945, 0.5);
      g.add(mug);
      // Mug top (liquid surface)
      const mugTop = new THREE.Mesh(new THREE.CircleGeometry(0.055, 14), m(0x0a0a12, 0, 0.95));
      mugTop.rotation.x = -Math.PI / 2;
      mugTop.position.set(-2.1, 1.01, 0.5);
      g.add(mugTop);

      return g;
    }

    /* ── Camera on Tripod ── */
    function makeCameraRig() {
      const g = new THREE.Group();

      // Tripod legs
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.013, 2.1, 6),
          m(0x242430, 0.9, 0.12)
        );
        leg.position.set(Math.sin(a) * 0.36, 1.05, Math.cos(a) * 0.36);
        leg.rotation.z = Math.sin(a) * 0.22;
        leg.rotation.x = -Math.cos(a) * 0.18;
        g.add(leg);

        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), m(0x3a6080, 0.6, 0.4));
        foot.position.set(Math.sin(a) * 0.6, 0.04, Math.cos(a) * 0.6);
        g.add(foot);
      }

      // Tripod head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.22), m(0x1e1e28, 0.85, 0.2));
      head.position.y = 1.98;
      g.add(head);

      // Camera body (cinema-style)
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.9, 0.88), m(0x121218, 0.92, 0.12));
      body.position.set(0, 2.55, 0);
      g.add(body);

      // Lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.29, 0.7, 22), m(0x0d0d12, 0.95, 0.07));
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 2.55, 0.73);
      g.add(lens);

      // Lens glass
      const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.2, 22), emm(0x4682B4, 0.35));
      lensGlass.position.set(0, 2.55, 1.09);
      g.add(lensGlass);

      // Lens ring
      const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 6, 22), m(0x3a6080, 0.75, 0.2));
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.set(0, 2.55, 0.65);
      g.add(lensRing);

      // Top handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.9), m(0x1a1a22, 0.8, 0.3));
      handle.position.set(0, 3.06, -0.05);
      g.add(handle);
      [[-0.35], [0.3]].forEach(([hz]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), m(0x1a1a22, 0.8, 0.3));
        post.position.set(0, 2.97, hz);
        g.add(post);
      });

      // Side monitor (small director's monitor)
      const dirMon = makeScreen(0.85, 0.55, 0x4682B4, 0.5);
      dirMon.position.set(0.85, 2.65, -0.05);
      dirMon.rotation.y = -0.45;
      g.add(dirMon);

      return g;
    }

    /* ── Equipment Shelf (left wall) ── */
    function makeEquipmentShelf() {
      const g = new THREE.Group();
      const shM = m(0x14141c, 0.7, 0.45);

      // Uprights
      [-0.85, 0.85].forEach(sx => {
        const up = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.6, 0.28), shM);
        up.position.set(sx, 1.3, 0);
        g.add(up);
      });

      // Shelf boards
      [0.25, 0.88, 1.52, 2.15].forEach(sy => {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.04, 0.3), shM);
        sh.position.y = sy;
        g.add(sh);
      });

      // Hard drives (row 1)
      [0, 1, 2, 3].forEach(i => {
        const hd = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.2), m(0x16161e, 0.82, 0.22));
        hd.position.set(-0.62 + i * 0.41, 0.44, 0);
        g.add(hd);
        const hdLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.018, 0.005),
          new THREE.MeshStandardMaterial({ color: 0x4682B4, emissive: 0x4682B4, emissiveIntensity: i % 2 === 0 ? 0.85 : 0.15 }));
        hdLed.position.set(-0.62 + i * 0.41, 0.52, 0.1);
        g.add(hdLed);
      });

      // Film canister + reel (row 2)
      const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24), m(0x1c1c24, 0.7, 0.45));
      reel.rotation.x = Math.PI / 2;
      reel.position.set(-0.42, 1.07, 0);
      g.add(reel);
      const reelHub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 12), m(0x3a6080, 0.7, 0.3));
      reelHub.rotation.x = Math.PI / 2;
      reelHub.position.set(-0.42, 1.07, 0);
      g.add(reelHub);

      // Small tablet/preview monitor
      const tab = makeScreen(0.78, 0.52, 0x4682B4, 0.45);
      tab.position.set(0.4, 1.68, -0.04);
      tab.rotation.y = -0.15;
      g.add(tab);

      // Clapperboard (leaning)
      const clap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.46, 0.06), m(0x12121a, 0.65, 0.5));
      clap.position.set(-0.5, 2.4, 0.04);
      clap.rotation.z = 0.08;
      g.add(clap);
      // Clapper stripes
      [0, 1, 2, 3].forEach(si => {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.12, 0.07),
          new THREE.MeshStandardMaterial({ color: si % 2 === 0 ? 0xe8e4de : 0x080810, metalness: 0, roughness: 0.9 })
        );
        stripe.position.set(-0.32 + si * 0.135 + 0.06, 0.69, 0.045);
        clap.add(stripe);
      });

      return g;
    }

    /* ── Rolling Equipment Cart ── */
    function makeRollingCart() {
      const g = new THREE.Group();
      const cM = m(0x181820, 0.78, 0.38);

      // Body
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.8, 0.58), cM));

      // Drawers
      [0.25, 0, -0.25].forEach((dy, i) => {
        const drw = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.055), m(0x1c1c26, 0.82, 0.28));
        drw.position.set(0, dy, 0.3);
        g.add(drw);
        const hdl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.03), m(0x38383e, 0.9, 0.1));
        hdl.position.set(0, dy, 0.32);
        g.add(hdl);
      });

      // Wheels
      [[-0.42, -0.28], [0.42, -0.28], [-0.42, 0.28], [0.42, 0.28]].forEach(([wx, wz]) => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), m(0x0c0c14, 0.2, 0.9));
        wh.position.set(wx, -0.45, wz);
        g.add(wh);
      });

      // Top: audio interface / mixer
      const mixer = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.5), m(0x121218, 0.85, 0.2));
      mixer.position.y = 0.45;
      g.add(mixer);
      // Faders
      [0, 1, 2, 3, 4].forEach(fi => {
        const fader = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.06, 0.22), m(0x2a2a35, 0.8, 0.3));
        fader.position.set(-0.28 + fi * 0.14, 0.53, -0.02);
        g.add(fader);
        const faderCap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), m(0x3a3a46, 0.7, 0.35));
        faderCap.position.set(-0.28 + fi * 0.14, 0.59, -0.02 + (fi % 3 === 0 ? 0.04 : fi % 2 === 0 ? -0.04 : 0));
        g.add(faderCap);
      });

      // LED level meters
      [0, 1].forEach(col => {
        [0, 1, 2, 3, 4, 5].forEach(row => {
          const dot = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.005),
            new THREE.MeshStandardMaterial({
              color: row < 3 ? 0x22cc44 : row < 5 ? 0xddaa00 : 0xff3300,
              emissive: row < 3 ? 0x22cc44 : row < 5 ? 0xddaa00 : 0xff3300,
              emissiveIntensity: row < 4 ? 0.7 : 0.15,
            }));
          dot.position.set(0.3 + col * 0.04, 0.52 + row * 0.022, 0.18);
          g.add(dot);
        });
      });

      return g;
    }

    /* ── Room Architecture ── */
    function makeRoom() {
      const g = new THREE.Group();
      const ROOM_W  = 6.5;
      const ROOM_D  = 9.0;
      const ROOM_H  = 4.0;
      const ROOM_FW = ROOM_W * 2 + 2;

      const wallM  = new THREE.MeshStandardMaterial({ color: 0x0e0e1e, metalness: 0.2, roughness: 0.85 });
      const floorM = new THREE.MeshStandardMaterial({ color: 0x090912, metalness: 0.45, roughness: 0.6 });
      const ceilM  = new THREE.MeshStandardMaterial({ color: 0x0a0a18, metalness: 0.1, roughness: 0.95 });

      // 5 surface planes — cheap
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_FW, ROOM_D * 2), floorM);
      floor.rotation.x = -Math.PI / 2; g.add(floor);

      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_FW, ROOM_D * 2), ceilM);
      ceil.rotation.x = Math.PI / 2; ceil.position.y = ROOM_H; g.add(ceil);

      const dblSide = new THREE.MeshStandardMaterial({ color: 0x0e0e1e, metalness: 0.2, roughness: 0.85, side: THREE.DoubleSide });
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_FW, ROOM_H + 2), dblSide);
      backWall.position.set(0, ROOM_H / 2, -ROOM_D); g.add(backWall);
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D * 2, ROOM_H + 2), dblSide);
      leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-ROOM_W, ROOM_H / 2, 0); g.add(leftWall);
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D * 2, ROOM_H + 2), dblSide);
      rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(ROOM_W, ROOM_H / 2, 0); g.add(rightWall);

      // ── Ceiling track rails — 2 rails, no per-spot lights ──
      const trackM = new THREE.MeshStandardMaterial({ color: 0x1c1c2c, metalness: 0.8, roughness: 0.2 });
      const bulbM  = new THREE.MeshStandardMaterial({ color: 0xfff8e8, emissive: 0xfff8e8, emissiveIntensity: 1.0 });
      const bulbGeo = new THREE.SphereGeometry(0.04, 6, 6);
      [-2.0, 2.0].forEach(tx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, ROOM_D * 2), trackM);
        rail.position.set(tx, ROOM_H - 0.03, 0); g.add(rail);
        // 4 bulbs per rail (instead of 8) — pure emissive, no PointLight
        [-6, -2, 2, 6].forEach(bz => {
          const bulb = new THREE.Mesh(bulbGeo, bulbM);
          bulb.position.set(tx, ROOM_H - 0.18, bz); g.add(bulb);
        });
      });

      // ── Floor grid — single LineSegments draw call ──
      function makeLineGrid(step, rangeX, rangeZ, y, col) {
        const pts = [];
        const xMin = -rangeX, xMax = rangeX, zMin = -rangeZ, zMax = rangeZ;
        // depth lines
        for (let x = xMin; x <= xMax; x += step) {
          pts.push(x, y, zMin,  x, y, zMax);
        }
        // cross lines
        for (let z = zMin; z <= zMax; z += step) {
          pts.push(xMin, y, z,  xMax, y, z);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        return new THREE.LineSegments(geo,
          new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 }));
      }

      // Minor grid
      const floorGridMinor = makeLineGrid(1.2, ROOM_W + 1, ROOM_D, 0.003, 0x2a4a7a);
      g.add(floorGridMinor);
      // Major grid (every 4 steps = 4.8 units)
      const floorGridMajor = makeLineGrid(4.8, ROOM_W + 1, ROOM_D, 0.004, 0x4682B4);
      g.add(floorGridMajor);

      // ── Back wall grid — single LineSegments ──
      const bwPts = [];
      const bwZ = -ROOM_D + 0.02;
      for (let x = -ROOM_W; x <= ROOM_W; x += 1.2)  bwPts.push(x, 0, bwZ,  x, ROOM_H, bwZ);
      for (let y = 0;       y <= ROOM_H;  y += 0.8)  bwPts.push(-ROOM_W, y, bwZ,  ROOM_W, y, bwZ);
      const bwGeo = new THREE.BufferGeometry();
      bwGeo.setAttribute('position', new THREE.Float32BufferAttribute(bwPts, 3));
      g.add(new THREE.LineSegments(bwGeo, new THREE.LineBasicMaterial({ color: 0x2a4a6a, transparent: true, opacity: 0.4 })));

      // ── Side wall grids — one LineSegments each ──
      [-ROOM_W, ROOM_W].forEach(wx => {
        const pts = [];
        for (let z = -ROOM_D; z <= ROOM_D;  z += 1.2) pts.push(wx, 0, z,  wx, ROOM_H, z);
        for (let y = 0;       y <= ROOM_H;   y += 0.8) pts.push(wx, y, -ROOM_D,  wx, y, ROOM_D);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x1e3050, transparent: true, opacity: 0.35 })));
      });

      // ── Baseboard glow — 3 thin boxes ──
      const baseM = new THREE.MeshStandardMaterial({ color: 0x4682B4, emissive: 0x4682B4, emissiveIntensity: 0.5 });
      const bb = new THREE.Mesh(new THREE.BoxGeometry(ROOM_FW, 0.04, 0.04), baseM);
      bb.position.set(0, 0.02, -ROOM_D + 0.02); g.add(bb);
      const blb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, ROOM_D * 2), baseM);
      blb.position.set(-ROOM_W + 0.02, 0.02, 0); g.add(blb);
      const brb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, ROOM_D * 2), baseM);
      brb.position.set(ROOM_W - 0.02, 0.02, 0); g.add(brb);

      return g;
    }

    /* ── Assemble Scene ── */
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // Room shell
    sceneGroup.add(makeRoom());

    // Overhead warm key lights (inside sceneGroup so they rotate with parallax)
    const overhead1 = new THREE.PointLight(0xfff3d0, 4.0, 12);
    overhead1.position.set(-1.0, 3.85, -3.5);
    sceneGroup.add(overhead1);

    const overhead2 = new THREE.PointLight(0xfff3d0, 3.0, 10);
    overhead2.position.set(-1.0, 3.85, -6.5);
    sceneGroup.add(overhead2);

    // Monitor blue fill
    const monitorFill = new THREE.PointLight(0x4682B4, 5.5, 6.5);
    monitorFill.position.set(-1.5, 1.6, -2.5);
    sceneGroup.add(monitorFill);

    // Rim / edge light
    const rimLight = new THREE.PointLight(0x4060a0, 2.0, 10);
    rimLight.position.set(5, 3, -2);
    sceneGroup.add(rimLight);

    // Front fill — lights scene from camera side
    const frontFill = new THREE.PointLight(0x6080b0, 2.5, 14);
    frontFill.position.set(2.2, 3.0, 7.0);
    sceneGroup.add(frontFill);

    // Main editing station
    const editStation = makeEditingStation();
    editStation.position.set(-1.0, 0, -4.5);
    sceneGroup.add(editStation);

    // Camera rig (right, middle-distance)
    const camRig = makeCameraRig();
    camRig.position.set(4.5, 0, -5.5);
    camRig.rotation.y = -0.7;
    sceneGroup.add(camRig);

    // Equipment shelf (left wall)
    const shelf = makeEquipmentShelf();
    shelf.position.set(-7.8, 0, -5.5);
    shelf.rotation.y = Math.PI / 2;
    sceneGroup.add(shelf);

    // Rolling cart (foreground right)
    const cart = makeRollingCart();
    cart.position.set(4.2, 0.4, -1.8);
    cart.rotation.y = -0.5;
    sceneGroup.add(cart);

    /* ── Shader warmup — compiles all GPU programs during loader so first frame is instant ── */
    renderer.compile(scene, cam);
    // Force two pre-renders to warm up the GPU draw calls
    renderer.render(scene, cam);
    renderer.render(scene, cam);

    /* ── Mouse parallax (subtle camera pan) ── */
    let targetRX = 0, targetRY = 0;
    let currentRX = 0, currentRY = 0;

    document.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRY =  nx * 0.12;
      targetRX = -ny * 0.07;
    });

    /* ── Animation loop ── */
    function animate() {
      requestAnimationFrame(animate);

      currentRX += (targetRX - currentRX) * 0.04;
      currentRY += (targetRY - currentRY) * 0.04;
      sceneGroup.rotation.x = currentRX;
      sceneGroup.rotation.y = currentRY;


      renderer.render(scene, cam);
    }
    animate();

    /* Resize */
    window.addEventListener('resize', () => {
      W = heroSection.offsetWidth;
      H = heroSection.offsetHeight;
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }

  /* ─── STAGGER DELAYS FOR GRID ─── */
  function initStaggerDelays() {
    document.querySelectorAll('.collection-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.1}s`;
    });
  }

  /* ─── NAV SCROLL EFFECT ─── */
  function initNav() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ─── PARALLAX CINEMATIC BAND ─── */
  function initParallax() {
    const band = document.querySelector('.cinematic-bg');
    if (!band) return;

    window.addEventListener('scroll', () => {
      const section = band.closest('.cinematic-band');
      const rect = section.getBoundingClientRect();
      const progress = -rect.top / window.innerHeight;
      band.style.transform = `scale(1.05) translateY(${progress * 30}px)`;
    }, { passive: true });
  }

  /* ─── MARQUEE DUPLICATE ─── */
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    const clone = track.cloneNode(true);
    track.parentNode.appendChild(clone);
  }

  /* ─── LOGO SCROLL SHOWCASE — 3D orbit ─── */
  function initLogoScroll() {
    const section = document.querySelector('.lss-section');
    const track = document.getElementById('lssTrack');
    if (!section || !track) return;

    const cards = Array.from(track.querySelectorAll('.lss-card'));
    if (!cards.length) return;

    const N = cards.length;
    const angleStep = 360 / N;
    const cardH = cards[0].offsetHeight || 430;
    const radius = ((cardH + 80) * N) / (2 * Math.PI);

    cards.forEach((card, i) => {
      card.style.transform = `rotateX(${i * angleStep}deg) translateZ(${radius}px)`;
    });

    function update() {
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const scrollable = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      track.style.transform = `rotateX(${-progress * 360}deg)`;
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ─── MOBILE NAV ─── */
  function initMobileNav() {
    const btn = document.querySelector('.nav-hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!btn || !mobileNav) return;

    function toggle() {
      const isOpen = btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
      mobileNav.classList.toggle('open', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    btn.addEventListener('click', toggle);

    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', true);
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SMOOTH ANCHOR ─── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ─── CARD TILT EFFECT ─── */
  function initCardTilt() {
    document.querySelectorAll('.collection-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      });
    });
  }

  /* ─── COLLECTION CARD REVEAL ─── */
  function initCollectionReveal() {
    const cards = document.querySelectorAll('.collection-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, parseInt(entry.target.dataset.delay || 0));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = `opacity 0.8s ease ${i * 0.1}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`;
      card.dataset.delay = i * 100;
      observer.observe(card);
    });
  }

  /* ─── INIT ─── */
  window.addEventListener('DOMContentLoaded', () => {
    initLoader();
    try { initHero3D(); } catch (e) { console.error('[GN] 3D scene error:', e); }
    initTrail();
    initScrollReveal();
    initStaggerDelays();
    initNav();
    initParallax();
    initMarquee();
    initLogoScroll();
    initMobileNav();
    initSmoothScroll();
    initCardTilt();
    initCollectionReveal();
    initNewsletter();
  });

  /* ─── NEWSLETTER ───────────────────────────────────────────────
     Was onsubmit="return false;" — the field collected an address
     and threw it away. Hands off to a real email until a form
     backend URL is set below.
  ──────────────────────────────────────────────────────────────── */
  function initNewsletter() {
    const EMAIL    = 'hello@gasnoir.digital';
    const FORM_URL = '';   // Google Form — newsletter/lead capture

    document.querySelectorAll('.newsletter-form').forEach(form => {
      form.removeAttribute('onsubmit');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (!input || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) {
          if (input) input.style.borderColor = '#e5484d';
          return;
        }
        input.style.borderColor = '';

        if (FORM_URL) { window.location.href = FORM_URL; return; }

        window.location.href = `mailto:${EMAIL}`
          + `?subject=${encodeURIComponent('Newsletter signup — gasnoir.digital')}`
          + `&body=${encodeURIComponent('Please add me to the list: ' + input.value)}`;
      });
    });
  }

})();
