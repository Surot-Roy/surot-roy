(() => {
  const horizontalWrapper = document.getElementById('horizontal-wrapper');
  const horizontalSlider = document.getElementById('horizontal-slider');
  if (!horizontalWrapper || !horizontalSlider) return;

  let maxTranslate = 0;
  let startScroll = 0;
  let endScroll = 0;
  let isTicking = false;
  let currentScrollY = 0;

  // Cache layout metrics only when layout actually changes (resize, load, fonts)
  // This completely eliminates layout thrashing (forced reflow) during scroll!
  function measureMetrics() {
    const rect = horizontalWrapper.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const absTop = rect.top + scrollY;
    const wrapperHeight = horizontalWrapper.offsetHeight;
    const windowHeight = window.innerHeight;
    const sliderWidth = horizontalSlider.scrollWidth;
    const windowWidth = window.innerWidth;

    maxTranslate = Math.max(0, sliderWidth - windowWidth + (windowWidth * 0.12));
    startScroll = absTop;
    endScroll = absTop + wrapperHeight - windowHeight;

    applyScrollPosition(window.pageYOffset || document.documentElement.scrollTop || 0);
  }

  function applyScrollPosition(scrollY) {
    if (endScroll <= startScroll) return;
    const rawProgress = (scrollY - startScroll) / (endScroll - startScroll);
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const targetX = progress * maxTranslate;
    horizontalSlider.style.transform = `translate3d(-${targetX.toFixed(2)}px, 0, 0)`;
  }

  function onScrollUpdate(scrollY) {
    currentScrollY = scrollY;
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(() => {
        applyScrollPosition(currentScrollY);
        isTicking = false;
      });
    }
  }

  // Direct swipe / drag gesture support for touch and precision trackpads
  let isDragging = false;
  let startPointerX = 0;
  let startScrollY = 0;

  horizontalSlider.addEventListener('pointerdown', (e) => {
    // Only drag with primary mouse button on desktop; leave touch devices to native scroll
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    isDragging = true;
    startPointerX = e.clientX;
    startScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }, { passive: true });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPointerX;
    const scrollRange = endScroll - startScroll;
    if (maxTranslate > 0 && scrollRange > 0) {
      const scrollDelta = -(dx * (scrollRange / maxTranslate)) * 0.9;
      const targetScroll = Math.max(0, startScrollY + scrollDelta);
      if (window.__lenis) {
        window.__lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        window.scrollTo({
          top: targetScroll,
          behavior: 'instant'
        });
      }
    }
  }, { passive: true });

  window.addEventListener('pointerup', () => { isDragging = false; }, { passive: true });
  window.addEventListener('pointercancel', () => { isDragging = false; }, { passive: true });

  // Passive event listeners for layout shifts
  window.addEventListener('resize', measureMetrics, { passive: true });
  window.addEventListener('orientationchange', measureMetrics, { passive: true });
  window.addEventListener('load', measureMetrics, { passive: true });

  // ResizeObserver for dynamic image loading and card size shifts
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      measureMetrics();
    });
    ro.observe(horizontalSlider);
    ro.observe(horizontalWrapper);
  }

  // Hook into native scroll as base fallback
  window.addEventListener('scroll', () => {
    onScrollUpdate(window.pageYOffset || document.documentElement.scrollTop || 0);
  }, { passive: true });

  // Connect to Lenis smooth scroll engine for real-time 120FPS synchronization
  function connectLenis() {
    if (window.__lenis) {
      window.__lenis.on('scroll', (e) => {
        onScrollUpdate(typeof e.scroll === 'number' ? e.scroll : (window.pageYOffset || document.documentElement.scrollTop || 0));
      });
    } else {
      setTimeout(connectLenis, 60);
    }
  }
  connectLenis();

  // Initial calculation
  measureMetrics();
})();