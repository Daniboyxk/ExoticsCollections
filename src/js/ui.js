/**
 * Exotics Collections — Shared Global UI Controller
 * Activated on ALL pages:
 *  - Lenis Luxury Inertial Physics Smooth Scroll
 *  - Sticky frosted-glass header on scroll (.scrolled)
 *  - Accessible iPhone/Tablet Drawer with scroll lock & Escape/link close
 *  - Champagne hairline scroll progress bar
 *  - Reusable IntersectionObserver reveal helper (no async race conditions)
 *  - Universal YouTube 16:9 lightbox modal
 */

import Lenis from 'lenis';

let revealObserver = null;
let lenisInstance = null;

export function syncRevealsWithScroll() {
  if (typeof window === 'undefined') return;
  const vh = window.innerHeight;
  const buffer = 80;
  const pending = document.querySelectorAll('[data-reveal].reveal-ready:not(.is-visible)');
  pending.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= vh + buffer && rect.bottom >= -buffer) {
      el.classList.add('is-visible');
    }
  });
}

export function initSmoothScroll() {
  if (typeof window === 'undefined') return null;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    syncTouch: false, // Preserves 100% native iOS / Android touch momentum
    touchMultiplier: 1,
    wheelMultiplier: 0.95,
    infinite: false
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync scroll events, frosted header, hairline progress & reveals directly with Lenis physics
  lenisInstance.on('scroll', ({ scroll, progress }) => {
    const header = document.getElementById('site-header');
    if (header) {
      header.classList.toggle('is-scrolled', scroll > 28);
    }
    document.body.classList.toggle('is-scrolled-past-hero', scroll > 140);
    const progressBar = document.querySelector('.scroll-hairline');
    if (progressBar && typeof progress === 'number') {
      progressBar.style.transform = `scaleX(${progress})`;
    }
    syncRevealsWithScroll();
  });

  // Native scroll fallback for touch devices & instantaneous header state
  window.addEventListener('scroll', () => {
    const header = document.getElementById('site-header');
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 28);
    }
    document.body.classList.toggle('is-scrolled-past-hero', window.scrollY > 140);
  }, { passive: true });

  // Smooth anchor navigation with offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenisInstance.scrollTo(target, { offset: -70, duration: 1.15 });
        }
      }
    });
  });

  return lenisInstance;
}

export function observeReveals(root = document) {
  if (typeof window === 'undefined') return;

  const targets = root.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '100px 0px 40px 0px' }
    );
  }

  targets.forEach((el) => {
    if (!el.classList.contains('reveal-ready')) {
      el.classList.add('reveal-ready');
      revealObserver.observe(el);
    }
  });

  // Immediate check for elements in initial viewport
  syncRevealsWithScroll();
}

export function openVideoModal(youtubeId) {
  if (!youtubeId) return;
  let modal = document.getElementById('video-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Reproductor de vídeo');
    modal.innerHTML = `
      <div class="video-modal__dialog">
        <button type="button" class="video-modal__close" id="video-modal-close" aria-label="Cerrar reproductor">✕</button>
        <div class="video-modal__frame-wrap">
          <iframe
            id="video-iframe"
            class="video-modal__iframe"
            title="Vídeo Exotics Collections"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#video-modal-close');
    closeBtn.addEventListener('click', closeVideoModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVideoModal();
    });
  }

  const iframe = modal.querySelector('#video-iframe');
  if (iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
  }
  modal.classList.add('is-open');
  document.body.classList.add('has-modal-open');
}

export function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  if (!modal || !modal.classList.contains('is-open')) return;
  const iframe = modal.querySelector('#video-iframe');
  if (iframe) iframe.src = '';
  modal.classList.remove('is-open');
  document.body.classList.remove('has-modal-open');
}

export function initGlobalUI() {
  // 1. Header Scroll Frosted Glass + Scroll Progress Hairline
  const header = document.getElementById('site-header');
  let progressBar = document.querySelector('.scroll-hairline');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-hairline';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (header) {
        header.classList.toggle('is-scrolled', y > 28);
      }
      document.body.classList.toggle('is-scrolled-past-hero', y > 140);
      const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docH > 0 ? Math.min(100, Math.max(0, (y / docH) * 100)) : 0;
      progressBar.style.transform = `scaleX(${pct / 100})`;
      syncRevealsWithScroll();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Mobile / Tablet Luxury Navigation Drawer
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  const setDrawerState = (open) => {
    if (!menuToggle || !mobileDrawer) return;
    mobileDrawer.classList.toggle('is-open', open);
    menuToggle.classList.toggle('is-active', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('has-drawer-open', open);
    if (open) {
      lenisInstance?.stop();
    } else {
      lenisInstance?.start();
    }
  };

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const next = !mobileDrawer.classList.contains('is-open');
      setDrawerState(next);
    });

    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawerState(false));
    });
  }

  // Global Escape handler for drawer & video modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setDrawerState(false);
      closeVideoModal();
    }
  });

  // 3. Initialize luxury inertial smooth scroll
  initSmoothScroll();

  // 4. Observe static reveals present in DOM
  observeReveals(document);

  // 5. Initialize discreet RGPD Cookie Consent Bar
  initCookieBanner();

  // 6. Initialize Luxury Theme Mode (Chalk Pearl Light / Obsidian Dark)
  initThemeToggle();
}

function initCookieBanner() {
  if (typeof window !== 'undefined' && window.location.search.includes('nobanner=1')) {
    document.body.classList.add('no-banner');
    return;
  }
  const STORAGE_KEY = 'exotics_cookie_consent_v1';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const acceptBtn = document.getElementById('cookie-accept-btn');
  const rejectBtn = document.getElementById('cookie-reject-btn');
  const settingsBtn = document.getElementById('btn-cookie-settings');

  const showBanner = () => {
    banner.classList.add('is-visible');
    banner.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-cookie-banner');
  };

  const saveChoice = (level) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ consent: level, updatedAt: new Date().toISOString() })
      );
    } catch (_) {
      // Ignore storage quota / private mode restrictions
    }
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-cookie-banner');
  };

  let existing = null;
  try {
    existing = localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    existing = null;
  }

  if (!existing) {
    window.setTimeout(showBanner, 650);
  }

  acceptBtn?.addEventListener('click', () => saveChoice('all'));
  rejectBtn?.addEventListener('click', () => saveChoice('essential'));
  settingsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showBanner();
  });
}

export function initThemeToggle() {
  const THEME_KEY = 'exotics_theme_mode';
  const toggles = document.querySelectorAll('.theme-toggle');
  if (!toggles.length) return;

  const updateUI = (isLight) => {
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
      btn.setAttribute('title', isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');

      const textLabel = btn.querySelector('.theme-toggle__text');
      if (textLabel) {
        textLabel.textContent = isLight ? 'MODO CLARO' : 'MODO OSCURO';
      }

      // Legacy letter labels if present anywhere
      const darkLabel = btn.querySelector('.theme-toggle__label--dark');
      const lightLabel = btn.querySelector('.theme-toggle__label--light');
      if (darkLabel) darkLabel.classList.toggle('is-active', !isLight);
      if (lightLabel) lightLabel.classList.toggle('is-active', isLight);
    });
  };

  const setTheme = (theme, save = true) => {
    const isLight = theme === 'light';
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateUI(isLight);
    if (save) {
      try {
        localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      } catch (_) {}
    }
    window.dispatchEvent(
      new CustomEvent('exotics:themechange', { detail: { theme: isLight ? 'light' : 'dark' } })
    );
  };

  // Sync initial UI state with current document attribute
  const initialIsLight = document.documentElement.getAttribute('data-theme') === 'light';
  updateUI(initialIsLight);

  toggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      setTheme(next, true);
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalUI);
  } else {
    initGlobalUI();
  }
}

