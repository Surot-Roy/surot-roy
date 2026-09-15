(function () {
  'use strict';

  // ── Ultra-Smooth Studio Momentum Scroll Engine (Lenis Gold Standard) ──
  let lenis = null;
  let smoothScrollTo = null;

  function setupSmoothScroll() {
    // Mobile phones & touch devices have native 120Hz GPU-accelerated touch momentum.
    // Lenis should ONLY control desktop mouse wheel / trackpad to eliminate mobile touch lag and unresponsiveness!
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    if (isTouchDevice) {
      window.__lenis = null;
      smoothScrollTo = function (destY) {
        window.scrollTo({ top: destY, behavior: 'smooth' });
      };
      return;
    }

    // If Lenis is loaded, initialize the global high-performance studio engine
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        lerp: 0.1, // Optimal silky damping: instantaneous reaction, zero lagging delay
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0, // 100% natural 1:1 wheel translation
        touchMultiplier: 1.0,
        syncTouch: false, // Let mobile/tablet touch momentum run at hardware 120Hz without hitching
        infinite: false,
        autoRaf: false
      });

      window.__lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      smoothScrollTo = function (destY, duration = null) {
        if (!lenis) return;
        lenis.scrollTo(destY, {
          duration: duration ? duration / 1000 : 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          offset: 0
        });
      };
      return;
    }

    // High-performance fallback if Lenis is ever unavailable
    let targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let currentY = targetY;
    let isRunning = false;
    let animFrameId = null;

    function lerpScroll() {
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.3) {
        currentY += diff * 0.075;
        window.scrollTo({ top: currentY, behavior: 'instant' });
        animFrameId = requestAnimationFrame(lerpScroll);
      } else {
        currentY = targetY;
        window.scrollTo({ top: currentY, behavior: 'instant' });
        isRunning = false;
      }
    }

    window.addEventListener('wheel', (e) => {
      if (window.innerWidth <= 768) return;
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.closest('.mobile-drawer'))) return;

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 38;
      else if (e.deltaMode === 2) delta *= window.innerHeight;

      const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));
      e.preventDefault();

      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(lerpScroll);
      }
    }, { passive: false });

    window.addEventListener('scroll', () => {
      if (!isRunning) {
        targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
        currentY = targetY;
      }
    }, { passive: true });

    smoothScrollTo = function (destY) {
      window.scrollTo({ top: destY, behavior: 'smooth' });
    };
  }

  // ── Custom Glowing Cursor Controller ──
  function setupCursor() {
    // Only run on fine mouse pointers; touch/mobile screens don't use a cursor
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const glow = document.getElementById('cursor-glow');
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let glowX = -100;
    let glowY = -100;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.classList.remove('cursor-hidden');
        ring.classList.remove('cursor-hidden');
        if (glow) glow.classList.remove('cursor-hidden');
        ringX = mouseX;
        ringY = mouseY;
        glowX = mouseX;
        glowY = mouseY;
      }

      // Direct instant position update for crisp center dot
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      dot.classList.add('cursor-hidden');
      ring.classList.add('cursor-hidden');
      if (glow) glow.classList.add('cursor-hidden');
    });

    const LERP = 0.15;
    const GLOW_LERP = 0.08;

    function animateCursor() {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      glowX += (mouseX - glowX) * GLOW_LERP;
      glowY += (mouseY - glowY) * GLOW_LERP;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (glow) {
        glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Interactive Hover States
    const interactiveSelectors = 'a, button, input, textarea, select, .project-card, .pricing-card, .faq-question, .toggle-btn, .testimonial-card, .plan-toggle-pill, .interactive, [role="button"], .feature-card, .contact-card';

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        document.body.classList.add('cursor-hover');
        if (target.classList.contains('project-card') || target.classList.contains('pricing-card') || target.classList.contains('feature-card')) {
          document.body.classList.add('cursor-card-hover');
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        document.body.classList.remove('cursor-hover');
        document.body.classList.remove('cursor-card-hover');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-active');
    });
  }

  // ── Infinite Projects Stock Ticker Engine (Continuous Non-Stop Flow) ──
  function setupProjectsCarousel() {
    const section = document.getElementById('projects');
    const wrapper = document.querySelector('.projects-carousel-wrapper');
    const track = document.getElementById('projects-scroll-track');
    if (!section || !wrapper || !track) return;

    const originalCards = Array.from(track.querySelectorAll('.project-card'));
    const totalOriginalCards = originalCards.length;
    if (!totalOriginalCards) return;

    // 1. Clone cards to form the seamless infinite second loop (Set A + Set B)
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('project-card-clone');
      track.appendChild(clone);
    });

    let currentX = 0;
    let targetX = 0;
    let halfWidth = 0;
    let isPointerDown = false;
    let startX = 0;
    let dragStartX = 0;
    let dragVelocity = 0;
    let lastDragX = 0;
    let lastDragTime = 0;
    const baseSpeed = 0.95; // Butter-smooth continuous flow (~57px/sec)

    function measureMetrics() {
      const allCards = track.querySelectorAll('.project-card');
      if (allCards.length > totalOriginalCards) {
        const firstCardLeft = allCards[0].offsetLeft;
        const cloneCardLeft = allCards[totalOriginalCards].offsetLeft;
        const diff = cloneCardLeft - firstCardLeft;
        if (diff > 100) {
          halfWidth = diff;
        }
      }
      if (!halfWidth || halfWidth <= 0) {
        halfWidth = track.scrollWidth / 2;
      }
    }

    measureMetrics();
    window.addEventListener('resize', measureMetrics, { passive: true });
    window.addEventListener('load', measureMetrics, { passive: true });

    // Interactive grab & swipe gestures with inertia
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isPointerDown = true;
      startX = e.clientX;
      dragStartX = currentX;
      lastDragX = e.clientX;
      lastDragTime = performance.now();
      dragVelocity = 0;
      track.classList.add('is-dragging');
    }, { passive: true });

    window.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      targetX = dragStartX - dx;
      currentX = targetX;

      const now = performance.now();
      const dt = now - lastDragTime;
      if (dt > 8) {
        dragVelocity = (lastDragX - e.clientX) / dt * 16;
        lastDragX = e.clientX;
        lastDragTime = now;
      }
    }, { passive: true });

    function onPointerRelease() {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.classList.remove('is-dragging');
      targetX = currentX + dragVelocity * 6;
    }

    window.addEventListener('pointerup', onPointerRelease, { passive: true });
    window.addEventListener('pointercancel', onPointerRelease, { passive: true });

    // Viewport-aware 60/120FPS High-Precision Animation Loop
    let lastTime = performance.now();
    let tickerAnimId = null;
    let isTickerActive = false;

    function tickerLoop(now) {
      if (!isTickerActive) return;

      const dt = Math.min(32, Math.max(10, now - lastTime)) / 16.666;
      lastTime = now;

      if (!isPointerDown) {
        const diff = targetX - currentX;
        if (Math.abs(diff) > 0.08) {
          currentX += diff * 0.085;
        } else {
          currentX += baseSpeed * dt;
          targetX = currentX;
        }
      }

      // Seamless wrap when Set A scrolls through
      if (halfWidth > 0) {
        while (currentX >= halfWidth) {
          currentX -= halfWidth;
          targetX -= halfWidth;
          if (isPointerDown) dragStartX -= halfWidth;
        }
        while (currentX < 0) {
          currentX += halfWidth;
          targetX += halfWidth;
          if (isPointerDown) dragStartX += halfWidth;
        }
      }

      track.style.transform = `translate3d(-${currentX.toFixed(3)}px, 0, 0)`;

      tickerAnimId = requestAnimationFrame(tickerLoop);
    }

    function startTicker() {
      if (isTickerActive) return;
      isTickerActive = true;
      lastTime = performance.now();
      tickerAnimId = requestAnimationFrame(tickerLoop);
    }

    function stopTicker() {
      isTickerActive = false;
      if (tickerAnimId) {
        cancelAnimationFrame(tickerAnimId);
        tickerAnimId = null;
      }
    }

    // Only run ticker loop when in or near viewport
    const projectsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startTicker();
        } else {
          stopTicker();
        }
      });
    }, { rootMargin: '200px 0px 200px 0px' });

    projectsObserver.observe(section);
  }

  // ── Our Work Interactive Project Showcase Engine ──
  function setupOurWorkShowcase() {
    const workItems = document.querySelectorAll('.our-work-item');
    if (workItems.length === 0) return;

    // Hover effect strictly activates when the cursor is directly over the element
    workItems.forEach((item) => {
      item.classList.remove('active');
    });
  }

  // ── Hero Section Typewriter Role Rotator ──
  function setupHeroTypewriter() {
    if (window.__heroTypewriterStarted) return;
    window.__heroTypewriterStarted = true;

    const textEl = document.getElementById('heroTypewriterText');
    if (!textEl) return;

    const wrap = document.getElementById('heroTypewriterWrap');
    let roles = ['Developer', 'Creator', 'Editor'];
    if (wrap && wrap.dataset.roles) {
      try {
        const parsed = JSON.parse(wrap.dataset.roles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          roles = parsed;
        }
      } catch (e) {
        // fallback to default
      }
    }

    let roleIdx = 0;
    let charIdx = roles[0].length;
    let isDeleting = true;

    function tick() {
      const currentWord = roles[roleIdx];

      if (isDeleting) {
        charIdx--;
        textEl.textContent = currentWord.substring(0, Math.max(0, charIdx));
      } else {
        charIdx++;
        textEl.textContent = currentWord.substring(0, Math.min(charIdx, currentWord.length));
      }

      let speed = isDeleting ? 45 : 95;

      if (!isDeleting && charIdx >= currentWord.length) {
        // Finished typing word, hold display for 2.1s
        speed = 2100;
        isDeleting = true;
      } else if (isDeleting && charIdx <= 0) {
        // Finished deleting, move to next role with brief pause
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        charIdx = 0;
        speed = 450;
      }

      setTimeout(tick, speed);
    }

    setTimeout(tick, 1800);
  }

  // ── Hero CTA Moving Multicolor Interactive Click System ──
  function setupHeroCTA() {
    const enrollBtn = document.querySelector('.btn-freedom-enroll');
    if (!enrollBtn) return;

    enrollBtn.addEventListener('click', function(e) {
      this.classList.toggle('is-multicolor-clicked');
    });
  }

  // ── Luxury Falling Stardust & Ember Particles System ──
  function setupFallingParticles() {
    const canvas = document.getElementById('bg-falling-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let animId = null;
    let isTabActive = true;
    const mouse = { x: -1000, y: -1000, active: false };

    // Atmospheric luxury palette: Warm Gold/Amber, Ruby Crimson, Champagne Starlight
    const COLOR_PALETTES = [
      { r: 253, g: 217, b: 140 }, // Warm Gold
      { r: 254, g: 232, b: 185 }, // Light Champagne Gold
      { r: 205, g: 4,   b: 4   }, // Crimson Ruby
      { r: 244, g: 63,  b: 94  }, // Rose Ember
      { r: 255, g: 248, b: 235 }  // Pure Starlight
    ];

    function resize() {
      const isMobile = window.innerWidth < 768;
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Ultra-light particle density on mobile to ensure zero dropped frames
      const count = isMobile ? 12 : Math.min(50, Math.max(25, Math.floor(width * 0.038)));
      initParticles(count);
    }

    class Particle {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : -15 - Math.random() * 25;
        
        // 3-layer depth simulation (far, mid, near)
        const depthRoll = Math.random();
        if (depthRoll < 0.5) {
          // Far delicate motes
          this.radius = 0.8 + Math.random() * 0.7;
          this.baseVy = 0.35 + Math.random() * 0.35;
          this.baseAlpha = 0.25 + Math.random() * 0.3;
          this.swayAmp = 0.4 + Math.random() * 0.5;
        } else if (depthRoll < 0.85) {
          // Mid ground ambient particles
          this.radius = 1.3 + Math.random() * 0.9;
          this.baseVy = 0.55 + Math.random() * 0.45;
          this.baseAlpha = 0.35 + Math.random() * 0.35;
          this.swayAmp = 0.6 + Math.random() * 0.6;
        } else {
          // Foreground sparkling particles
          this.radius = 1.8 + Math.random() * 1.2;
          this.baseVy = 0.75 + Math.random() * 0.55;
          this.baseAlpha = 0.5 + Math.random() * 0.35;
          this.swayAmp = 0.8 + Math.random() * 0.8;
        }

        this.color = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
        this.isStarGlint = Math.random() < 0.18; // ~18% are 4-pointed shimmering micro-stars
        this.swaySpeed = 0.015 + Math.random() * 0.02;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.035;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.035;

        this.vxExtra = 0;
        this.vyExtra = 0;
      }

      update(time) {
        // Natural downward fall with gentle sinusoidal sway
        const sway = Math.sin(time * this.swaySpeed + this.swayPhase) * this.swayAmp;
        this.x += sway * 0.5 + this.vxExtra;
        this.y += this.baseVy + this.vyExtra;

        // Smooth momentum dissipation
        this.vxExtra *= 0.94;
        this.vyExtra *= 0.94;

        this.rotation += this.rotSpeed;

        // Interactive mouse breeze deflection
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 120;
          if (distSq < maxDist * maxDist && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 0.7;
            this.vxExtra += (dx / dist) * force * 1.5;
            this.vyExtra += (dy / dist) * force * 0.7;
          }
        }

        // Loop / recycle at screen boundaries
        if (this.y > height + 25) {
          this.reset(false);
        }
        if (this.x < -30) this.x = width + 20;
        else if (this.x > width + 30) this.x = -20;
      }

      draw(time) {
        // Twinkle pulse calculation
        const twinkle = 0.72 + 0.28 * Math.sin(time * this.twinkleSpeed + this.twinklePhase);
        const alpha = Math.min(1, Math.max(0, this.baseAlpha * twinkle));
        const { r, g, b } = this.color;

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.isStarGlint) {
          // 4-pointed shimmering micro-star glint
          ctx.rotate(this.rotation);
          const s = this.radius * 1.4;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();

          // Spark core
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft ambient stardust aura (zero GC allocations for 120FPS smoothness)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.28})`;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * 2.0, 0, Math.PI * 2);
          ctx.fill();

          // Bright center point
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.6, this.radius * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    function initParticles(count) {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(true));
      }
    }

    let time = 0;
    function animate() {
      if (!isTabActive) return;

      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(time);
        particles[i].draw(time);
      }

      animId = requestAnimationFrame(animate);
    }

    // Passive pointer tracking for atmospheric mouse breeze
    let mouseTimeout = null;
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (mouseTimeout) clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        mouse.active = false;
      }, 1400);
    }, { passive: true });

    // Handle Tab Visibility (Pause animation to conserve CPU/Battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isTabActive = false;
        if (animId) cancelAnimationFrame(animId);
      } else {
        isTabActive = true;
        animId = requestAnimationFrame(animate);
      }
    });

    // Resize Handler with Debounce
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
      }, 120);
    }, { passive: true });

    // Initial Start
    resize();
    animId = requestAnimationFrame(animate);
  }

  // ── Interactive Ambient Gradient Movement ──
  function setupAmbientGradientMovement() {
    const ambientWrap = document.getElementById('bg-ambient-gradient');
    if (!ambientWrap || window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isRunning = false;

    window.addEventListener('pointermove', (e) => {
      const cx = e.clientX / window.innerWidth - 0.5;
      const cy = e.clientY / window.innerHeight - 0.5;
      targetX = cx * 40;
      targetY = cy * 30;
      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(renderParallax);
      }
    }, { passive: true });

    function renderParallax() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      ambientWrap.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.04 || Math.abs(targetY - currentY) > 0.04) {
        requestAnimationFrame(renderParallax);
      } else {
        isRunning = false;
      }
    }
  }

  // ── Color Theme Switcher Engine ──
  const THEME_PRESETS = [
    {
      id: 'crimson',
      name: 'Vivid Crimson Rose',
      color: '#FF0000',
      vars: {
        '--accent-primary': '#FF0000',
        '--accent-secondary': '#fdd98c',
        '--accent-light': '#fdd98c',
        '--accent-lighter': '#fff1f2',
        '--accent-hover': '#d90000',
        '--accent-rgb': '255, 0, 0',
        '--accent-dark-rgb': '180, 0, 0',
        '--accent-deep-rgb': '120, 0, 0'
      }
    },
    {
      id: 'emerald',
      name: 'Emerald Matrix',
      color: '#00FF00',
      vars: {
        '--accent-primary': '#00FF00',
        '--accent-secondary': '#16a34a',
        '--accent-light': '#4ade80',
        '--accent-lighter': '#f0fdf4',
        '--accent-hover': '#00dd00',
        '--accent-rgb': '0, 255, 0',
        '--accent-dark-rgb': '0, 180, 0',
        '--accent-deep-rgb': '0, 100, 0'
      }
    },
    {
      id: 'gold',
      name: 'Sunset Amber / Gold',
      color: '#FFA500',
      vars: {
        '--accent-primary': '#FFA500',
        '--accent-secondary': '#c2410c',
        '--accent-light': '#fcd34d',
        '--accent-lighter': '#fffbeb',
        '--accent-hover': '#e69500',
        '--accent-rgb': '255, 165, 0',
        '--accent-dark-rgb': '190, 110, 0',
        '--accent-deep-rgb': '120, 65, 0'
      }
    },
    {
      id: 'magenta',
      name: 'Blush Pink',
      color: '#FFC0CB',
      vars: {
        '--accent-primary': '#FFC0CB',
        '--accent-secondary': '#f472b6',
        '--accent-light': '#fce7f3',
        '--accent-lighter': '#fff1f2',
        '--accent-hover': '#ffb0be',
        '--accent-rgb': '255, 192, 203',
        '--accent-dark-rgb': '219, 130, 145',
        '--accent-deep-rgb': '150, 75, 90'
      }
    },
    {
      id: 'blue',
      name: 'Electric Royal Blue',
      color: '#0000FF',
      vars: {
        '--accent-primary': '#0000FF',
        '--accent-secondary': '#1d4ed8',
        '--accent-light': '#60a5fa',
        '--accent-lighter': '#eff6ff',
        '--accent-hover': '#0000d6',
        '--accent-rgb': '0, 0, 255',
        '--accent-dark-rgb': '0, 0, 180',
        '--accent-deep-rgb': '0, 0, 110'
      }
    },
    {
      id: 'violet',
      name: 'Sky Blue',
      color: '#87CEEB',
      vars: {
        '--accent-primary': '#87CEEB',
        '--accent-secondary': '#0284c7',
        '--accent-light': '#bae6fd',
        '--accent-lighter': '#f0f9ff',
        '--accent-hover': '#70bfe0',
        '--accent-rgb': '135, 206, 235',
        '--accent-dark-rgb': '70, 150, 185',
        '--accent-deep-rgb': '30, 95, 125'
      }
    }
  ];

  function setupThemeSwitcher() {
    const toggleBtns = document.querySelectorAll('.theme-switcher .theme-toggle-btn');
    const currentDots = document.querySelectorAll('.theme-current-dot');
    if (toggleBtns.length === 0) return;

    // Default theme is ALWAYS #FF0000 (Index 0: Vivid Crimson Rose)
    // Always resets to this default when user refreshes the page
    let currentThemeIdx = 0;
    try {
      localStorage.removeItem('surot_theme_idx');
    } catch (e) {}

    function applyTheme(idx, animate = true) {
      currentThemeIdx = idx;
      const theme = THEME_PRESETS[currentThemeIdx];
      if (!theme) return;

      const root = document.documentElement;
      Object.entries(theme.vars).forEach(([prop, val]) => {
        root.style.setProperty(prop, val);
      });

      // Update dot color indicator across desktop and mobile
      currentDots.forEach(dot => {
        dot.style.backgroundColor = theme.color;
        dot.style.boxShadow = `0 0 8px ${theme.color}`;
      });

      toggleBtns.forEach(btn => {
        btn.setAttribute('title', `Theme: ${theme.name} (Click to switch)`);
        btn.setAttribute('aria-label', `Theme: ${theme.name}`);
        if (animate) {
          const svg = btn.querySelector('.theme-icon-svg');
          if (svg) {
            svg.style.transform = 'rotate(360deg)';
            setTimeout(() => {
              svg.style.transform = '';
            }, 450);
          }
        }
      });

      // Update swatch active state in all dropdowns
      document.querySelectorAll('.theme-swatch-dot').forEach(dot => {
        const dIdx = parseInt(dot.getAttribute('data-theme-idx'), 10);
        dot.classList.toggle('active', dIdx === currentThemeIdx);
      });
    }

    // Apply active default theme immediately on load
    applyTheme(0, false);

    // Toggle button click cycles to the next theme
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentThemeIdx + 1) % THEME_PRESETS.length;
        applyTheme(nextIdx, true);
      });
    });

    // Swatch direct clicks across all switchers
    document.querySelectorAll('.theme-swatch-dot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-theme-idx'), 10);
        if (!isNaN(idx)) {
          applyTheme(idx, true);
        }
      });
    });

    // Close any active mobile dropdowns on document click
    document.addEventListener('click', () => {
      document.querySelectorAll('.theme-switcher.active-dropdown').forEach(sw => {
        sw.classList.remove('active-dropdown');
      });
    });
  }

  // ── Dark / White Mode Engine ──
  function setupModeToggle() {
    const modeBtns = document.querySelectorAll('.mode-toggle-btn');
    if (modeBtns.length === 0) return;

    // Default mode is ALWAYS Dark Mode
    // Always resets to dark mode when user refreshes the page
    let currentMode = 'dark';
    try {
      localStorage.removeItem('surot_color_mode');
    } catch (e) {}

    function applyMode(mode, animate = true) {
      currentMode = mode;
      const isLight = currentMode === 'light';

      if (isLight) {
        document.body.classList.add('light-mode');
        document.documentElement.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
        document.documentElement.classList.remove('light-mode');
      }

      modeBtns.forEach(btn => {
        if (isLight) {
          btn.setAttribute('title', 'Switch to Dark Mode');
          btn.setAttribute('aria-label', 'Switch to Dark Mode');
        } else {
          btn.setAttribute('title', 'Switch to White Mode');
          btn.setAttribute('aria-label', 'Switch to White Mode');
        }

        if (animate) {
          const activeIcon = btn.querySelector(isLight ? '.mode-icon-moon' : '.mode-icon-sun');
          if (activeIcon) {
            activeIcon.style.transform = 'rotate(360deg) scale(1.15)';
            setTimeout(() => {
              activeIcon.style.transform = '';
            }, 450);
          }
        }
      });
    }

    // Apply default dark mode immediately on load
    applyMode('dark', false);

    // Toggle mode on button click across all instances
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextMode = currentMode === 'light' ? 'dark' : 'light';
        applyMode(nextMode, true);
      });
    });
  }

  // ── UI Interactions Setup ──
  function setupUI() {
    // 0. Moving Ambient Gradient & Falling Particles System
    setupAmbientGradientMovement();
    setupFallingParticles();

    // 0.1 Color Theme & Mode Switchers
    setupThemeSwitcher();
    setupModeToggle();

    // 1. Global Smooth Inertial Scroll Engine
    setupSmoothScroll();

    // 1.1 Hero Section Typewriter Role Rotator
    setupHeroTypewriter();
    setupHeroCTA();

    // 2. FAQ Accordion toggle
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question');
      if (btn) {
        btn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          faqItems.forEach(i => {
            i.classList.remove('active');
            const icon = i.querySelector('.faq-icon');
            if (icon) icon.textContent = '+';
          });

          if (!isActive) {
            item.classList.add('active');
            const icon = item.querySelector('.faq-icon');
            if (icon) icon.textContent = '−';
          }
        });
      }
    });

    // 3. Mobile Menu Drawer with Animated Close Hamburger
    const hamburger = document.getElementById('nav-hamburger');
    const drawer = document.getElementById('mobile-drawer');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = drawer.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.querySelectorAll('.mobile-link, .mobile-actions a').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      // Close when clicking outside the drawer
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !hamburger.contains(e.target) && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 4. Smooth Anchor Links Navigation with Responsive Header Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;

        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          const isMobileScreen = window.innerWidth <= 768;
          const headerOffset = isMobileScreen ? 60 : 72;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + (window.pageYOffset || document.documentElement.scrollTop) - headerOffset;

          if (smoothScrollTo) {
            smoothScrollTo(offsetPosition, isMobileScreen ? 500 : 700);
          } else {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // 5. Setup Horizontal Projects Carousel
    setupProjectsCarousel();

    // 5.1 Setup Our Work Interactive Showcase
    setupOurWorkShowcase();

    // 6. Setup Contact Form Interactive Handler
    setupContactForm();

    // 7. Setup YouTube / Instagram Style Community Comments Section
    setupCommentsSection();

    // 8. Setup UPI Payment Flow (surotroy794@okicici) & Pricing Plan Selector
    setupUpiPayment();
    setupPricingBillingToggle();

    // 9. Initialize Custom Glowing Cursor
    setupCursor();


    // 11. Initialize Universal Scroll Reveal Engine
    setupScrollReveal();
  }

  // ── Pricing Billing Frequency Toggle Engine ──
  function setupPricingBillingToggle() {
    const toggleBtn = document.getElementById('billing-switch-btn');
    const monthlyLabel = document.getElementById('billing-monthly');
    const yearlyLabel = document.getElementById('billing-yearly');
    if (!toggleBtn) return;

    let isYearly = false;

    function updateBilling(yearly) {
      isYearly = yearly;
      toggleBtn.classList.toggle('yearly', isYearly);
      if (monthlyLabel) monthlyLabel.classList.toggle('active', !isYearly);
      if (yearlyLabel) yearlyLabel.classList.toggle('active', isYearly);

      const priceVals = document.querySelectorAll('.pricing-card .price-val');
      const pricingBtns = document.querySelectorAll('.pricing-card .pricing-plan-btn');

      priceVals.forEach(valEl => {
        const basePrice = parseFloat(valEl.getAttribute('data-base-price') || '8000');
        const finalPrice = isYearly ? Math.round(basePrice * 0.8) : basePrice;
        valEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
      });

      pricingBtns.forEach(btn => {
        const card = btn.closest('.pricing-card');
        const valEl = card ? card.querySelector('.price-val') : null;
        if (valEl) {
          const base = parseFloat(valEl.getAttribute('data-base-price') || '8000');
          btn.setAttribute('data-price', isYearly ? Math.round(base * 0.8) : base);
        }
      });
    }

    toggleBtn.addEventListener('click', () => updateBilling(!isYearly));
    if (monthlyLabel) monthlyLabel.addEventListener('click', () => updateBilling(false));
    if (yearlyLabel) yearlyLabel.addEventListener('click', () => updateBilling(true));
  }

  // ── UPI Payment Flow (surotroy794@okicici) & Pricing Plan Selector Engine ──
  function setupUpiPayment() {
    const modal = document.getElementById('upi-payment-modal');
    const closeBtn = document.getElementById('upi-modal-close');
    const planNameEl = document.getElementById('upi-modal-plan-name');
    const priceValEl = document.getElementById('upi-modal-price-val');
    const qrImageEl = document.getElementById('upi-qr-image');
    const copyBtn = document.getElementById('upi-copy-btn');
    const copyText = document.getElementById('upi-copy-text');
    const directPayLink = document.getElementById('upi-direct-pay-link');

    const UPI_ID = 'surotroy794@okicici';
    const PAYEE_NAME = 'Surot Roy';

    const pricingButtons = document.querySelectorAll('.pricing-card button, .pricing-plan-btn, .pricing-card .btn-glass, .pricing-card .btn-primary');

    if (!pricingButtons.length) return;

    function openUpiModal(planName, priceText) {
      if (!modal) return;

      const rawNumeric = (priceText || '').replace(/[^0-9.]/g, '') || '8000';
      const cleanPrice = parseFloat(rawNumeric) || 8000;

      // Update modal text values
      if (planNameEl) planNameEl.textContent = planName || 'Selected Plan';
      if (priceValEl) priceValEl.textContent = `₹${cleanPrice.toLocaleString('en-IN')}`;

      // Build standard UPI Payment Intent URI
      const transactionNote = `${planName || 'Portfolio Plan'} - Surot Roy`;
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${cleanPrice}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

      if (directPayLink) {
        directPayLink.href = upiUrl;
      }

      // Generate dynamic QR Code for instant mobile scanning
      if (qrImageEl) {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&margin=8&color=000000&bgcolor=FFFFFF`;
        qrImageEl.src = qrApiUrl;
      }

      // Open Modal
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('upi-modal-open');
      document.body.style.overflow = 'hidden';
      const header = document.querySelector('.header');
      if (header) header.style.display = 'none';

      // On Mobile Touch Devices, automatically prompt the UPI intent
      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth <= 768;
      if (isMobile) {
        // Attempt native UPI App trigger
        try {
          window.location.href = upiUrl;
        } catch (err) { }
      }
    }

    function closeUpiModal() {
      if (!modal) return;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('upi-modal-open');
      document.body.style.overflow = '';
      const header = document.querySelector('.header');
      if (header) header.style.display = '';
    }

    // Attach click listeners to all pricing buttons
    pricingButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.pricing-card');
        let plan = btn.getAttribute('data-plan');
        let price = btn.getAttribute('data-price');

        if (!plan && card) {
          const nameEl = card.querySelector('.plan-name');
          if (nameEl) plan = nameEl.textContent.trim();
        }

        if (!price && card) {
          const priceEl = card.querySelector('.price-val');
          if (priceEl) price = priceEl.textContent.trim();
        }

        openUpiModal(plan || 'Pro Plan', price || '2800');
      });
    });

    // Close on Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeUpiModal();
      });
    }

    // Close on Backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeUpiModal();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
        closeUpiModal();
      }
    });

    // Copy UPI ID functionality with instant visual feedback
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(UPI_ID).then(() => {
            if (copyText) copyText.textContent = '✓ Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              if (copyText) copyText.textContent = 'Copy';
              copyBtn.classList.remove('copied');
            }, 2200);
          }).catch(() => {
            fallbackCopy();
          });
        } else {
          fallbackCopy();
        }

        function fallbackCopy() {
          const tempInput = document.createElement('input');
          tempInput.value = UPI_ID;
          document.body.appendChild(tempInput);
          tempInput.select();
          try {
            document.execCommand('copy');
          } catch (err) { }
          document.body.removeChild(tempInput);
          if (copyText) copyText.textContent = '✓ Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            if (copyText) copyText.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2200);
        }
      });
    }
  }

  // ── Interactive Dual Contact Service & Budget Selector & WhatsApp Controller ──
  function setupContactForm() {
    const whatsappActionBtn = document.getElementById('contact-start-whatsapp');
    const whatsappLink = document.getElementById('contact-whatsapp-btn');
    const whatsappPhone = '918822898336';

    let selectedService = 'Custom Web Applications';
    let selectedBudget = '₹20,000 – ₹40,000 (Standard)';

    function updateWhatsAppLinks() {
      const message = `Hi Surot, I would like to discuss a project:\n\n` +
        `• *Service:* ${selectedService}\n` +
        `• *Budget / Timeline:* ${selectedBudget}`;
      const encodedMsg = encodeURIComponent(message);
      const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodedMsg}`;

      if (whatsappActionBtn) {
        whatsappActionBtn.href = url;
      }
      if (whatsappLink) {
        whatsappLink.href = url;
      }
    }

    function initDropdown(containerId, triggerId, textId, listId, onSelect) {
      const container = document.getElementById(containerId);
      const trigger = document.getElementById(triggerId);
      const selectedText = document.getElementById(textId);
      const list = document.getElementById(listId);
      if (!container || !trigger || !list) return;

      const options = list.querySelectorAll('.service-option');

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Close any other open dropdown first
        document.querySelectorAll('.service-select-container').forEach(c => {
          if (c !== container) {
            c.classList.remove('open');
            const otherTrig = c.querySelector('.service-select-trigger');
            if (otherTrig) otherTrig.setAttribute('aria-expanded', 'false');
          }
        });

        const isOpen = container.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          options.forEach(o => {
            o.classList.remove('active');
            o.removeAttribute('aria-selected');
          });

          opt.classList.add('active');
          opt.setAttribute('aria-selected', 'true');

          const chosen = opt.getAttribute('data-value') || opt.textContent.trim();
          if (selectedText) selectedText.textContent = chosen;

          onSelect(chosen);
          updateWhatsAppLinks();

          container.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Initialize Dropdown 1: Service
    initDropdown(
      'service-select-container-1',
      'service-select-trigger-1',
      'service-selected-text-1',
      'service-options-list-1',
      (val) => { selectedService = val; }
    );

    // Initialize Dropdown 2: Budget / Timeline
    initDropdown(
      'service-select-container-2',
      'service-select-trigger-2',
      'service-selected-text-2',
      'service-options-list-2',
      (val) => { selectedBudget = val; }
    );

    // Click outside handler for all dropdowns
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.service-select-container').forEach(c => {
        if (!c.contains(e.target)) {
          c.classList.remove('open');
          const trig = c.querySelector('.service-select-trigger');
          if (trig) trig.setAttribute('aria-expanded', 'false');
        }
      });
    });

    updateWhatsAppLinks();

    // Contact Form submission (opens WhatsApp with user name, email, and message)
    window.handleContactSubmit = function (e) {
      if (e) e.preventDefault();
      const name = (document.getElementById('contact-name')?.value || '').trim();
      const email = (document.getElementById('contact-email')?.value || '').trim();
      const msg = (document.getElementById('contact-message')?.value || '').trim();

      const text = `Hi Surot, I'm ${name} (${email}):\n\n${msg}`;
      const url = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', window.handleContactSubmit);
    }
  }

  // ── YouTube & Instagram Style Community Comments & Live Discussion Engine ──
  function setupCommentsSection() {
    const commentsWrapper = document.getElementById('comments');
    if (!commentsWrapper) return;

    const feedContainer = document.getElementById('comments-feed');
    const countBadge = document.getElementById('comments-count-badge');
    const nameInput = document.getElementById('comment-name-input');
    const roleInput = document.getElementById('comment-role-input');
    const msgInput = document.getElementById('comment-msg-input');
    const submitBtn = document.getElementById('comment-submit-btn');
    const clearBtn = document.getElementById('comment-clear-btn');
    const charsLeft = document.getElementById('comment-chars-left');
    const avatarPreview = document.getElementById('comment-avatar-preview');
    const avatarText = document.getElementById('comment-avatar-text');
    const sortNewestBtn = document.getElementById('sort-newest-btn');
    const sortTopBtn = document.getElementById('sort-top-btn');
    const toast = document.getElementById('comment-toast');
    const toastText = document.getElementById('comment-toast-text');
    const moreWrap = document.getElementById('comments-more-wrap');
    const moreBtn = document.getElementById('comments-more-btn');
    const moreText = document.getElementById('comments-more-text');

    const INITIAL_VISIBLE_COUNT = 3;
    let isExpanded = false;

    const STORAGE_KEY = 'surot_portfolio_comments_v1';
    const LIKED_KEY = 'surot_portfolio_liked_comments';
    const USER_NAME_KEY = 'surot_portfolio_user_name';
    const USER_ROLE_KEY = 'surot_portfolio_user_role';
    const MY_COMMENTS_KEY = 'surot_portfolio_my_comment_ids';

    const GRADIENTS = [
      'linear-gradient(135deg, #6c80a8 0%, #54668D 50%, #3e4d6d 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)'
    ];

    const DEFAULT_COMMENTS = [
      {
        id: 'comment-pinned-1',
        author: 'Surot Roy',
        role: 'Creator & Developer',
        isCreator: true,
        isPinned: true,
        isVerified: true,
        avatarText: 'SR',
        avatarGradient: 'linear-gradient(135deg, #6c80a8 0%, #54668D 50%, #3e4d6d 100%)',
        message: "Welcome to the community space! 🎉 Feel free to leave your thoughts, project feedback, or ask any questions about my work and tech stack. Let's build something epic together! 🚀",
        likes: 48,
        createdAt: Date.now() - 2 * 86400000
      },
      {
        id: 'comment-seed-2',
        author: 'Vikramaditya S.',
        role: 'Founder / Client',
        isCreator: false,
        isPinned: false,
        isVerified: true,
        avatarText: 'VS',
        avatarGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        message: 'The ABVP LALA Unit portal crafted by Surot is outstanding! Ultra-smooth navigation, great responsiveness, and the animations are buttery smooth. Highly recommend working with him! 🔥👏',
        likes: 19,
        createdAt: Date.now() - 18 * 3600000
      },
      {
        id: 'comment-seed-3',
        author: 'Aarav Roy',
        role: 'Developer',
        isCreator: false,
        isPinned: false,
        isVerified: false,
        avatarText: 'AR',
        avatarGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        message: 'The glassmorphism card physics and horizontal project scroll are top tier. Love the attention to detail on the micro-interactions! 💯✨',
        likes: 12,
        createdAt: Date.now() - 5 * 3600000
      },
      {
        id: 'comment-seed-4',
        author: 'Elena Rostova',
        role: 'UI/UX Designer',
        isCreator: false,
        isPinned: false,
        isVerified: true,
        avatarText: 'ER',
        avatarGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
        message: 'Sleek color palette, crystal clear typography hierarchy, and effortless responsive design. Great job @SurotRoy! 😍⚡',
        likes: 9,
        createdAt: Date.now() - 1 * 3600000
      }
    ];

    let commentsList = [];
    let currentSort = 'newest';
    let likedCommentIds = new Set();
    let myCommentIds = new Set();
    let toastTimeout = null;

    // Load Liked & My Comment IDs from LocalStorage
    try {
      const storedLikes = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]');
      if (Array.isArray(storedLikes)) likedCommentIds = new Set(storedLikes);

      const storedMyComments = JSON.parse(localStorage.getItem(MY_COMMENTS_KEY) || '[]');
      if (Array.isArray(storedMyComments)) myCommentIds = new Set(storedMyComments);

      // Pre-fill name and role if saved
      const savedName = localStorage.getItem(USER_NAME_KEY);
      if (savedName && nameInput) {
        nameInput.value = savedName;
        updateAvatarPreview(savedName);
      }
      const savedRole = localStorage.getItem(USER_ROLE_KEY);
      if (savedRole && roleInput) {
        roleInput.value = savedRole;
      }
    } catch (e) { }

    // Generate Initials from name
    function getInitials(name) {
      if (!name || !name.trim()) return 'YOU';
      const clean = name.trim().replace(/^@/, '');
      const parts = clean.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Generate Gradient from name hash
    function getGradient(name) {
      if (!name || !name.trim()) return GRADIENTS[0];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % GRADIENTS.length;
      return GRADIENTS[index];
    }

    // Update Avatar Preview
    function updateAvatarPreview(name) {
      if (!avatarPreview || !avatarText) return;
      const initials = getInitials(name);
      const gradient = getGradient(name);
      avatarText.textContent = initials;
      avatarPreview.style.background = gradient;
    }

    // Show Toast Notification
    function showToast(msg) {
      if (!toast) return;
      if (toastText) toastText.textContent = msg;
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    // Format Relative Time
    function formatTimeAgo(time) {
      const now = Date.now();
      const diff = Math.max(0, now - time);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 45) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 30) return `${days}d ago`;
      return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    // Sanitize and format message HTML
    function formatMessageText(text) {
      const div = document.createElement('div');
      div.textContent = text;
      let sanitized = div.innerHTML;

      // Highlight @mentions (e.g. @SurotRoy or @user)
      sanitized = sanitized.replace(/@([a-zA-Z0-9_\u00C0-\u017F]+)/g, '<span class="comment-mention">@$1</span>');
      return sanitized;
    }

    // Save comments to local storage and sync with server
    function persistComments() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(commentsList));
        localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(likedCommentIds)));
        localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(Array.from(myCommentIds)));
      } catch (e) { }
    }

    // Render Comments Feed
    function renderComments(newCommentId = null) {
      if (!feedContainer) return;

      if (countBadge) {
        countBadge.textContent = commentsList.length;
      }

      if (!commentsList.length) {
        feedContainer.innerHTML = `
          <div class="comments-empty-state">
            <div class="comments-empty-icon">💬</div>
            <div class="comments-empty-text">No comments yet. Be the first to share your thoughts!</div>
          </div>
        `;
        return;
      }

      // Separate Pinned and Non-Pinned Comments
      const pinned = commentsList.filter(c => c.isPinned);
      const nonPinned = commentsList.filter(c => !c.isPinned);

      if (currentSort === 'top') {
        nonPinned.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else {
        nonPinned.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }

      const displayList = [...pinned, ...nonPinned];

      // Handle Pagination / Show More Logic (> 3 comments)
      let itemsToRender = displayList;
      if (displayList.length > INITIAL_VISIBLE_COUNT) {
        if (moreWrap) moreWrap.style.display = 'flex';
        if (moreBtn && moreText) {
          if (!isExpanded) {
            itemsToRender = displayList.slice(0, INITIAL_VISIBLE_COUNT);
            const remaining = displayList.length - INITIAL_VISIBLE_COUNT;
            moreText.textContent = `View more comments (${remaining} remaining)`;
            moreBtn.classList.remove('is-expanded');
          } else {
            itemsToRender = displayList;
            moreText.textContent = 'Show fewer comments';
            moreBtn.classList.add('is-expanded');
          }
        }
      } else {
        if (moreWrap) moreWrap.style.display = 'none';
      }

      feedContainer.innerHTML = itemsToRender.map(comment => {
        const isLiked = likedCommentIds.has(comment.id);
        const isMine = myCommentIds.has(comment.id);
        const isJustAdded = comment.id === newCommentId;

        return `
          <div class="comment-item-card ${comment.isPinned ? 'is-pinned' : ''} ${isJustAdded ? 'is-new-comment' : ''}" id="card-${comment.id}" data-id="${comment.id}">
            <div class="comment-item-avatar-col">
              <div class="comment-item-avatar" style="background: ${comment.avatarGradient || getGradient(comment.author)};">
                ${comment.avatarText || getInitials(comment.author)}
              </div>
            </div>
            <div class="comment-item-body">
              ${comment.isPinned ? `
                <div class="comment-pinned-badge">
                  <span>📌</span>
                  <span>Pinned by Surot Roy</span>
                </div>
              ` : ''}
              <div class="comment-meta-row">
                <span class="comment-author-name">${comment.author}</span>
                ${comment.isVerified ? `<span class="comment-verified-check" title="Verified Member">✓</span>` : ''}
                ${comment.isCreator ? `<span class="comment-creator-badge">Creator 👑</span>` : ''}
                <span class="comment-role-tag">${comment.role || 'Visitor'}</span>
                <span class="comment-time-ago">${formatTimeAgo(comment.createdAt)}</span>
              </div>
              <div class="comment-message-content">${formatMessageText(comment.message)}</div>
              <div class="comment-actions-row">
                <button type="button" class="comment-action-btn comment-like-btn ${isLiked ? 'liked' : ''}" data-id="${comment.id}" aria-label="Like comment">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="${isLiked ? '#ff4b4b' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span class="like-counter">${comment.likes || 0}</span>
                </button>
                <button type="button" class="comment-action-btn comment-reply-btn" data-author="${comment.author}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Reply</span>
                </button>
                <button type="button" class="comment-action-btn comment-share-btn" data-id="${comment.id}" data-text="${comment.message.replace(/"/g, '&quot;')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Share</span>
                </button>
                ${isMine ? `
                  <button type="button" class="comment-action-btn comment-delete-btn" data-id="${comment.id}" title="Delete your comment">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete</span>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');

      attachFeedEventListeners();
    }

    // Attach Event Listeners to rendered cards
    function attachFeedEventListeners() {
      // Like Buttons
      feedContainer.querySelectorAll('.comment-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          const comment = commentsList.find(c => c.id === id);
          if (!comment) return;

          const isCurrentlyLiked = likedCommentIds.has(id);
          if (isCurrentlyLiked) {
            likedCommentIds.delete(id);
            comment.likes = Math.max(0, (comment.likes || 1) - 1);
          } else {
            likedCommentIds.add(id);
            comment.likes = (comment.likes || 0) + 1;
            showToast('Liked comment! ❤️');
          }

          persistComments();
          renderComments();

          // Sync with server if running
          fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'like', id, delta: isCurrentlyLiked ? -1 : 1 })
          }).catch(() => { });
        });
      });

      // Reply Buttons
      feedContainer.querySelectorAll('.comment-reply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const author = btn.getAttribute('data-author');
          if (msgInput) {
            const mention = `@${author.replace(/\s+/g, '')} `;
            if (!msgInput.value.includes(mention)) {
              msgInput.value = mention + msgInput.value;
            }
            msgInput.focus();
            msgInput.setSelectionRange(msgInput.value.length, msgInput.value.length);
            updateCharCounter();
            commentsWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });

      // Share Buttons
      feedContainer.querySelectorAll('.comment-share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const text = btn.getAttribute('data-text') || '';
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
              showToast('Comment text copied! 📋');
            }).catch(() => {
              showToast('Link ready to share! 🚀');
            });
          } else {
            showToast('Link ready to share! 🚀');
          }
        });
      });

      // Delete Buttons
      feedContainer.querySelectorAll('.comment-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          if (!confirm('Are you sure you want to delete your comment?')) return;

          commentsList = commentsList.filter(c => c.id !== id);
          myCommentIds.delete(id);
          likedCommentIds.delete(id);
          persistComments();
          renderComments();
          showToast('Comment deleted. 🗑️');

          fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
          }).catch(() => { });
        });
      });
    }

    // Update Char Counter
    function updateCharCounter() {
      if (!msgInput || !charsLeft) return;
      const remaining = 600 - msgInput.value.length;
      charsLeft.textContent = remaining;
      if (remaining < 50) {
        charsLeft.style.color = '#ff4b4b';
      } else {
        charsLeft.style.color = '';
      }
    }

    // Name Input Listener
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        const val = nameInput.value.trim();
        updateAvatarPreview(val);
        try {
          localStorage.setItem(USER_NAME_KEY, val);
        } catch (e) { }
      });
    }

    // Role Input Listener
    if (roleInput) {
      roleInput.addEventListener('change', () => {
        try {
          localStorage.setItem(USER_ROLE_KEY, roleInput.value);
        } catch (e) { }
      });
    }

    // Message Input Listener
    if (msgInput) {
      msgInput.addEventListener('input', updateCharCounter);
    }

    // Quick Emoji Reaction Buttons
    commentsWrapper.querySelectorAll('.quick-emoji-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const emoji = btn.getAttribute('data-emoji');
        if (!msgInput || !emoji) return;

        const start = msgInput.selectionStart || msgInput.value.length;
        const end = msgInput.selectionEnd || msgInput.value.length;
        const text = msgInput.value;
        msgInput.value = text.substring(0, start) + emoji + text.substring(end);
        msgInput.focus();
        msgInput.setSelectionRange(start + emoji.length, start + emoji.length);
        updateCharCounter();
      });
    });

    // Clear Button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (msgInput) {
          msgInput.value = '';
          updateCharCounter();
        }
      });
    }

    // Sort Toggle Buttons
    if (sortNewestBtn) {
      sortNewestBtn.addEventListener('click', () => {
        if (currentSort === 'newest') return;
        currentSort = 'newest';
        sortNewestBtn.classList.add('active');
        if (sortTopBtn) sortTopBtn.classList.remove('active');
        renderComments();
      });
    }

    if (sortTopBtn) {
      sortTopBtn.addEventListener('click', () => {
        if (currentSort === 'top') return;
        currentSort = 'top';
        sortTopBtn.classList.add('active');
        if (sortNewestBtn) sortNewestBtn.classList.remove('active');
        renderComments();
      });
    }

    // View More / Show Fewer Comments Toggle Button
    if (moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isExpanded = !isExpanded;
        renderComments();
        if (!isExpanded && commentsWrapper) {
          commentsWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Submit / Post Comment Handler
    function handlePostComment() {
      const author = (nameInput ? nameInput.value : '').trim();
      const message = (msgInput ? msgInput.value : '').trim();
      const role = (roleInput ? roleInput.value : 'Visitor');

      if (!author) {
        showToast('Please enter your name or handle! ✍️');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!message || message.length < 2) {
        showToast('Please write a comment message! 💬');
        if (msgInput) msgInput.focus();
        return;
      }

      const newId = 'comment-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      const newComment = {
        id: newId,
        author: author,
        role: role,
        isCreator: false,
        isPinned: false,
        isVerified: false,
        avatarText: getInitials(author),
        avatarGradient: getGradient(author),
        message: message,
        likes: 0,
        createdAt: Date.now()
      };

      // Ensure full list is visible when new comment is added
      isExpanded = true;

      // Insert comment immediately after pinned items
      const pinnedCount = commentsList.filter(c => c.isPinned).length;
      commentsList.splice(pinnedCount, 0, newComment);
      myCommentIds.add(newId);

      persistComments();
      renderComments(newId);

      showToast('Comment uploaded live! 🎉');

      if (msgInput) {
        msgInput.value = '';
        updateCharCounter();
      }

      // Smooth scroll to the newly posted comment card
      setTimeout(() => {
        const newCard = document.getElementById(`card-${newId}`);
        if (newCard) {
          newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Async sync to server
      fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      }).catch(() => { });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handlePostComment();
      });
    }

    if (msgInput) {
      msgInput.addEventListener('keydown', (e) => {
        // Post on Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handlePostComment();
        }
      });
    }

    // Real-Time Multi-Device Live Sync Engine (SSE + Cloud Sync + Smart Polling)
    let sseEventSource = null;
    const liveBadge = document.getElementById('comments-live-badge');

    function updateLiveBadgeStatus(isConnected, text = 'LIVE SYNC') {
      if (!liveBadge) return;
      const label = liveBadge.querySelector('.live-text-label');
      if (isConnected) {
        liveBadge.classList.remove('connecting');
        if (label) label.textContent = text;
      } else {
        liveBadge.classList.add('connecting');
        if (label) label.textContent = text;
      }
    }

    function initRealtimeStream() {
      // 1. Check if browser supports Server-Sent Events
      if (typeof EventSource !== 'undefined') {
        try {
          if (sseEventSource) {
            sseEventSource.close();
          }

          sseEventSource = new EventSource('/api/comments/stream');

          sseEventSource.addEventListener('init', () => {
            updateLiveBadgeStatus(true, 'LIVE SYNC');
          });

          sseEventSource.addEventListener('open', () => {
            updateLiveBadgeStatus(true, 'LIVE SYNC');
          });

          // Incoming new comment from another user/device in real-time
          sseEventSource.addEventListener('new_comment', (e) => {
            try {
              const incoming = JSON.parse(e.data);
              if (!incoming || !incoming.id) return;

              // If already present, don't duplicate
              const existingIdx = commentsList.findIndex(c => c.id === incoming.id);
              if (existingIdx !== -1) return;

              // Insert after pinned comments
              const pinnedCount = commentsList.filter(c => c.isPinned).length;
              commentsList.splice(pinnedCount, 0, incoming);

              persistComments();
              renderComments(incoming.id);

              // If posted by someone else, show friendly live notification
              if (!myCommentIds.has(incoming.id)) {
                showToast(`💬 New comment from ${incoming.author}!`);
                const incomingCard = document.getElementById(`card-${incoming.id}`);
                if (incomingCard) {
                  incomingCard.classList.add('is-live-incoming');
                  setTimeout(() => incomingCard.classList.remove('is-live-incoming'), 3000);
                }
              }
            } catch (err) { }
          });

          // Incoming live like update from another device
          sseEventSource.addEventListener('like_comment', (e) => {
            try {
              const data = JSON.parse(e.data);
              if (!data || !data.id) return;

              const target = commentsList.find(c => c.id === data.id);
              if (target) {
                target.likes = data.likes;
                persistComments();

                const card = document.getElementById(`card-${data.id}`);
                if (card) {
                  const counterEl = card.querySelector('.like-counter');
                  if (counterEl) {
                    counterEl.textContent = data.likes;
                    counterEl.style.transform = 'scale(1.35)';
                    counterEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    setTimeout(() => { counterEl.style.transform = 'scale(1)'; }, 220);
                  }
                }
              }
            } catch (err) { }
          });

          // Incoming delete comment from another device
          sseEventSource.addEventListener('delete_comment', (e) => {
            try {
              const data = JSON.parse(e.data);
              if (!data || !data.id) return;

              commentsList = commentsList.filter(c => c.id !== data.id);
              myCommentIds.delete(data.id);
              likedCommentIds.delete(data.id);
              persistComments();
              renderComments();
            } catch (err) { }
          });

          let sseRetryCount = 0;
          sseEventSource.onerror = () => {
            sseRetryCount++;
            if (sseRetryCount > 1) {
              // Immediately close SSE to stop mobile browsers from endlessly reconnecting in background
              if (sseEventSource) {
                sseEventSource.close();
                sseEventSource = null;
              }
              updateLiveBadgeStatus(false, 'LOCAL DB');
              return;
            }
            updateLiveBadgeStatus(false, 'SYNCING');
          };
        } catch (e) {
          updateLiveBadgeStatus(false, 'LOCAL DB');
        }
      }

      // 2. High-speed Smart Polling Fallback (every 3.5s) to guarantee zero desync
      let pollFailures = 0;
      let pollInterval = setInterval(() => {
        if (pollFailures >= 2) {
          clearInterval(pollInterval);
          return;
        }
        fetch('/api/comments')
          .then(res => {
            if (!res.ok) throw new Error('API unavailable');
            return res.json();
          })
          .then(serverComments => {
            pollFailures = 0;
            if (Array.isArray(serverComments) && serverComments.length > 0) {
              const currentIds = new Set(commentsList.map(c => c.id));
              let hasChanges = false;

              // Check for newly added comments
              serverComments.forEach(sc => {
                if (!currentIds.has(sc.id)) {
                  hasChanges = true;
                }
              });

              // Check for likes or deletions difference
              if (serverComments.length !== commentsList.length) {
                hasChanges = true;
              } else {
                for (const sc of serverComments) {
                  const local = commentsList.find(c => c.id === sc.id);
                  if (local && local.likes !== sc.likes) {
                    local.likes = sc.likes;
                    const card = document.getElementById(`card-${sc.id}`);
                    if (card) {
                      const counterEl = card.querySelector('.like-counter');
                      if (counterEl) counterEl.textContent = sc.likes;
                    }
                  }
                }
              }

              if (hasChanges) {
                const serverIds = new Set(serverComments.map(c => c.id));
                const localOnly = commentsList.filter(c => myCommentIds.has(c.id) && !serverIds.has(c.id));
                commentsList = [...serverComments, ...localOnly];
                persistComments();
                renderComments();
              }
              updateLiveBadgeStatus(true, 'LIVE SYNC');
            }
          })
          .catch(() => {
            pollFailures++;
            updateLiveBadgeStatus(false, 'LOCAL DB');
            if (pollFailures >= 2) {
              clearInterval(pollInterval);
            }
          });
      }, 3500);
    }

    // Initial Data Fetch & Load
    function initData() {
      // 1. Try local storage first for instantaneous UI
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            commentsList = parsed;
            renderComments();
          }
        }
      } catch (e) { }

      if (!commentsList.length) {
        commentsList = [...DEFAULT_COMMENTS];
        renderComments();
        persistComments();
      }

      // 2. Fetch from /api/comments if available on server
      fetch('/api/comments')
        .then(res => res.json())
        .then(serverComments => {
          if (Array.isArray(serverComments) && serverComments.length > 0) {
            const serverIds = new Set(serverComments.map(c => c.id));
            const localOnly = commentsList.filter(c => myCommentIds.has(c.id) && !serverIds.has(c.id));
            commentsList = [...serverComments, ...localOnly];
            persistComments();
            renderComments();
          }
        })
        .catch(() => { });

      // 3. Launch Multi-Device Real-Time SSE Stream
      initRealtimeStream();
    }

    initData();
  }

  // ── Universal Multi-Type Scroll Reveal Animations Engine ──
  function setupScrollReveal() {
    const observedElements = new Set();

    // Exclusion filter: skip particles, backgrounds, modals, horizontal carousel track, mobile drawer, interactive controls
    function isExcluded(el) {
      return (
        el.closest('#projects-scroll-track') ||
        el.closest('.mobile-drawer') ||
        el.closest('.upi-modal-backdrop') ||
        el.id === 'bg-falling-particles' ||
        el.id === 'bg-ambient-gradient' ||
        el.classList.contains('bg-ambient-gradient') ||
        el.classList.contains('ambient-glow-orb') ||
        el.classList.contains('footer-glow-bar') ||
        el.classList.contains('faq-center-glow') ||
        el.classList.contains('pricing-bg-glow') ||
        el.classList.contains('hero-freedom-glow') ||
        el.classList.contains('hero-showcase-glow') ||
        el.classList.contains('cursor-dot') ||
        el.classList.contains('cursor-glow') ||
        el.classList.contains('cursor-ring') ||
        el.classList.contains('code-editor-flare') ||
        el.classList.contains('code-editor-dots') ||
        el.classList.contains('dot') ||
        el.classList.contains('ring-1') ||
        el.classList.contains('ring-2') ||
        el.classList.contains('ring-3') ||
        el.classList.contains('ring-4') ||
        el.classList.contains('ripple-ring') ||
        el.classList.contains('faq-orbital-ripple') ||
        el.classList.contains('pricing-orbital-arc') ||
        el.classList.contains('theme-palette-dropdown') ||
        el.classList.contains('theme-swatch-dot') ||
        el.classList.contains('theme-switcher') ||
        el.classList.contains('btn-freedom-arrow-circle') ||
        el.id === 'nav-hamburger'
      );
    }

    // Helper to safely register elements
    function registerReveal(selector, className) {
      document.querySelectorAll(selector).forEach(el => {
        if (isExcluded(el)) return;
        if (!el.className || !el.className.includes('reveal-')) {
          el.classList.add(className);
        }
        observedElements.add(el);
      });
    }

    // 1. Navigation Container (Curtain Drop)
    registerReveal('.header .nav-container', 'reveal-nav');

    // 2. Every Section (Atmospheric Horizon Unfold)
    registerReveal('section, .footer', 'reveal-section');

    // 3. Every Article (Parallax Dossier Elevation)
    registerReveal('article', 'reveal-article');

    // 4. Every Heading (h1, h2, h3, h4, h5, h6 - Kinetic 3D Letterpress Drift)
    registerReveal('h1, h2, h3, h4, h5, h6, .hero-title, .hero-freedom-display, .section-title, .split-title, .plan-name, .cta-title, .about-statement-text, .card-title, .timeline-title, .contact-col-title', 'reveal-heading');

    // 5. Every Paragraph (p - Liquid Fluid Shimmer Rise)
    registerReveal('p, .hero-subtitle, .hero-freedom-desc, .hero-freedom-social-proof, .section-subtitle, .split-desc, .plan-sub, .about-desc-text, .project-desc, .card-desc, .timeline-desc', 'reveal-text');

    // 6. Badges, Pills & Spans (Spring Kinetic Pop)
    registerReveal('.badge-pill, .hero-smm-eyebrow, .featured-badge, .project-tag, .plan-tag, .tag-pill, .hero-intro-script', 'reveal-pill');

    // 7. Every Link (a) and Action Button (Kinetic Magnetic Elevation & Ambient Glow)
    document.querySelectorAll('a, button').forEach(el => {
      if (isExcluded(el) || el.closest('.header .nav-logo') || el.classList.contains('faq-question')) return;

      if (
        el.classList.contains('contact-pill-card') ||
        el.classList.contains('project-card') ||
        el.classList.contains('service-card') ||
        el.classList.contains('feature-card') ||
        el.classList.contains('pricing-card')
      ) {
        el.classList.add('reveal-card-3d');
      } else {
        el.classList.add('reveal-btn');
      }
      observedElements.add(el);
    });

    // 8. Every Div (Gyroscopic 3D Perspective Lift)
    // Register visual blocks, cards, bento containers, and structural content divs
    const divCardSelectors = [
      '.feature-card',
      '.timeline-item',
      '.glass-card',
      '.pricing-card',
      '.step-card',
      '.code-editor-card',
      '.hero-showcase-card',
      '.hero-typewriter-wrap',
      '.compare-container',
      '.faq-item',
      '.contact-glass-card',
      '.contact-field-wrap',
      '.contact-form-wrap',
      '.contact-info-cards',
      '.contact-left-col',
      '.contact-right-col',
      '.contact-layout-grid',
      '.pill-card',
      '.service-card',
      '.service-card-stack',
      '.card-content',
      '.card-graphic',
      '.card-stat-box',
      '.step-pyramid',
      '.section-header',
      '.timeline-body',
      '.timeline-track-wrap',
      '.tag-pill-group',
      '.footer-col',
      '.footer-brand',
      '.hero-freedom-cta-wrap',
      '.hero-freedom-social-proof',
      '.feature-split-row',
      '.projects-header-row',
      '.projects-sticky-container',
      '.pricing-grid',
      '.cards-grid-2x2',
      '.cards-grid-3',
      '.process-steps-grid',
      '.faq-list',
      '.footer-grid',
      '.contact-cards-grid',
      '.our-work-item',
      '.our-work-grid',
      '.about-statement-grid',
      '.about-statement-col',
      '.about-desc-col',
      '.about-tag-col',
      '.tech-ticker-wrapper',
      '.horizontal-header'
    ].join(', ');
    registerReveal(divCardSelectors, 'reveal-card-3d');

    // Register all child divs of containers, lists and grids
    document.querySelectorAll('.container > div, .cards-grid-2x2 > div, .cards-grid-3 > div, .pricing-grid > div, .process-steps-grid > div, .faq-list > div, .contact-cards-grid > div, .footer-grid > div, .contact-info-cards > div, .timeline-list > div, .our-work-list > div').forEach(el => {
      if (isExcluded(el)) return;
      if (!el.className || !el.className.includes('reveal-')) {
        el.classList.add('reveal-card-3d');
      }
      observedElements.add(el);
    });

    // Directional Split Columns (Lateral 3D Inflow)
    document.querySelectorAll('.feature-split-row:not(.single-col)').forEach(row => {
      const textCol = row.querySelector('.split-text-col');
      const mediaCol = row.querySelector('.split-media-col');
      if (textCol && mediaCol) {
        textCol.classList.add('reveal-left');
        observedElements.add(textCol);
        mediaCol.classList.add('reveal-right');
        observedElements.add(mediaCol);
      }
    });

    // Auto stagger child items in grid & list containers (80% reduced stagger delay on mobile devices)
    const isMobileDevice = window.innerWidth <= 768;
    const staggerStep = isMobileDevice ? 0.015 : 0.075;
    const maxStagger = isMobileDevice ? 0.08 : 0.45;

    document.querySelectorAll('.cards-grid-3, .cards-grid-2x2, .pricing-grid, .process-steps-grid, .faq-list, .footer-grid, .contact-cards-grid, .contact-info-cards, .timeline-list, .our-work-list').forEach(grid => {
      Array.from(grid.children).forEach((child, index) => {
        child.style.transitionDelay = `${Math.min(index * staggerStep, maxStagger).toFixed(3)}s`;
      });
    });

    // Stagger Hero Entrance Sequence for hero elements
    const heroElements = document.querySelectorAll(
      '.hero-section .hero-smm-eyebrow, .hero-section .hero-freedom-display, .hero-section .hero-typewriter-wrap, .hero-section .hero-freedom-desc, .hero-section .hero-freedom-cta-wrap, .hero-section .hero-freedom-social-proof, .hero-section .hero-showcase-card'
    );
    const heroStep = isMobileDevice ? 0.015 : 0.06;
    const heroBase = isMobileDevice ? 0.01 : 0.03;
    heroElements.forEach((el, idx) => {
      el.style.transitionDelay = `${(idx * heroStep + heroBase).toFixed(3)}s`;
    });

    const observerOptions = {
      root: null,
      rootMargin: isMobileDevice ? '180px 0px 180px 0px' : '0px 0px -40px 0px',
      threshold: isMobileDevice ? 0.01 : 0.05
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Initial paint check: activate in-view elements, observe others
    if (isMobileDevice) {
      // Synchronous zero-delay reveal for top sections on mobile
      observedElements.forEach(el => {
        const isHeroOrTop = el.closest('.hero-section') || el.closest('.header');
        const rect = el.getBoundingClientRect();
        if (isHeroOrTop || rect.top < window.innerHeight * 1.6) {
          el.classList.add('revealed');
        } else {
          observer.observe(el);
        }
      });

      // Rapid mobile safety pass to ensure no content stays hidden
      setTimeout(() => {
        observedElements.forEach(el => {
          if (!el.classList.contains('revealed') && el.getBoundingClientRect().top < window.innerHeight * 1.4) {
            el.classList.add('revealed');
          }
        });
      }, 200);
    } else {
      requestAnimationFrame(() => {
        setTimeout(() => {
          observedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.94) {
              el.classList.add('revealed');
            } else {
              observer.observe(el);
            }
          });
        }, 40);
      });
    }
  }


  // Initialize UI on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUI);
  } else {
    setupUI();
  }
})();
