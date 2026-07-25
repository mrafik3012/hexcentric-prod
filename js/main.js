/**
 * Hexcentric Roof Structures — Main JS
 * Handles: Navigation, scroll animations, glassmorphism header
 */

(function () {
  'use strict';

  /* ─── Header glassmorphism on scroll ─── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Active nav link ─── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ─── Mobile nav toggle ─── */
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');

  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }

  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);

  // Close when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('open')) {
      closeMobileNav();
      mobileBtn?.focus();
    }
  });

  /* ─── Scroll animations (IntersectionObserver) ─── */
  const animatedEls = document.querySelectorAll('.fade-up, .scale-in');
  if (animatedEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    animatedEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    animatedEls.forEach(el => el.classList.add('visible'));
  }

  /* ─── Smooth scroll for anchor links ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── FAQ accordion ─── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ─── Animated counter ─── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(c => cObserver.observe(c));
  }

  /* ─── Project filter (projects page)
         Note: active class switching now handled inside initFilterPill().
         This block only manages the card show/hide logic.
  ─── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const filter = this.dataset.filter;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        if (show) {
          card.style.display = '';
          card.style.animation = 'none';
          requestAnimationFrame(() => {
            card.style.animation = 'fadeIn 0.45s var(--ease-premium) forwards';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ═══════════════════════════════════════════════════════
     21ST.DEV PATTERN UPGRADES
     Pattern 3 — Animated Filter Pill (Animated Tabs Bg [id:8315])
     Pattern 2 — Cursor-Follow Glow on Cards (Glowing Card [id:5328])
     Pattern 4 — Staggered nav already in CSS; scroll progress here
     Pattern 9 — Scroll Progress Bar
  ═══════════════════════════════════════════════════════ */

  /* ─── Scroll Progress Bar ─── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  /* ─── Animated Filter Pill (Adapted from 21st.dev Animated Tabs Background [id:8315]) ─── */
  function initFilterPill() {
    const filterBars = document.querySelectorAll('.filter-bar');
    filterBars.forEach(bar => {
      // Inject the sliding pill background element
      const pill = document.createElement('div');
      pill.className = 'filter-pill-bg';
      pill.setAttribute('aria-hidden', 'true');
      bar.insertBefore(pill, bar.firstChild);

      function movePillTo(btn) {
        // Get position relative to the filter-bar container
        const barRect = bar.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        pill.style.left   = (btnRect.left - barRect.left - 4 + bar.scrollLeft) + 'px';
        pill.style.width  = btnRect.width + 'px';
        pill.style.height = btnRect.height + 'px';
        pill.style.top    = (btnRect.top - barRect.top) + 'px';
        pill.style.opacity = '1';
      }

      // Position pill on initial active button
      const initialActive = bar.querySelector('.filter-btn.active');
      if (initialActive) {
        // Small delay to ensure layout is complete
        requestAnimationFrame(() => {
          pill.style.transition = 'none'; // no animation on first position
          movePillTo(initialActive);
          requestAnimationFrame(() => {
            // Re-enable spring transition
            pill.style.transition = '';
          });
        });
      }

      // Move pill on click
      bar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          movePillTo(this);
        });
      });

      // Handle resize — reposition pill
      const resizeObs = new ResizeObserver(() => {
        const active = bar.querySelector('.filter-btn.active');
        if (active) movePillTo(active);
      });
      resizeObs.observe(bar);
    });
  }

  initFilterPill();

  /* ─── Cursor-Follow Glow on Cards (Adapted from Glowing Card [id:5328]) ─── */
  function initCardGlow() {
    document.querySelectorAll('.card, .service-card, .compliance-badge, .testimonial-card').forEach(card => {
      // Add 21st.dev glow class
      card.classList.add('card-glow');

      // Inject scan line elements (from Glowing Card .line pattern)
      const lines = document.createElement('div');
      lines.className = 'card-lines';
      lines.setAttribute('aria-hidden', 'true');
      lines.innerHTML = `
        <div class="card-line card-line--top"></div>
        <div class="card-line card-line--bottom"></div>
        <div class="card-line card-line--left"></div>
        <div class="card-line card-line--right"></div>
      `;
      card.appendChild(lines);

      // Inject ambient dot (from Glowing Card .dot pattern)
      const dot = document.createElement('div');
      dot.className = 'card-dot';
      dot.setAttribute('aria-hidden', 'true');
      card.appendChild(dot);

      // Cursor-follow glow element
      const glow = document.createElement('div');
      glow.className = 'card-cursor-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);

      // Track mouse position inside card for cursor glow
      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.left = x + 'px';
        glow.style.top  = y + 'px';
      });
    });
  }

  initCardGlow();

  /* ─── Hero section: inject orb + grid + beam markup ─── */
  function initHeroEnhancements() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Blueprint grid overlay
    const grid = document.createElement('div');
    grid.className = 'hero-grid';
    grid.setAttribute('aria-hidden', 'true');
    hero.appendChild(grid);

    // Primary copper orb
    const orb = document.createElement('div');
    orb.className = 'hero-orb';
    orb.setAttribute('aria-hidden', 'true');
    hero.appendChild(orb);

    // Secondary steel orb
    const orbSecondary = document.createElement('div');
    orbSecondary.className = 'hero-orb-secondary';
    orbSecondary.setAttribute('aria-hidden', 'true');
    hero.appendChild(orbSecondary);

    // Scan beam
    const beam = document.createElement('div');
    beam.className = 'hero-beam';
    beam.setAttribute('aria-hidden', 'true');
    hero.appendChild(beam);
  }

  initHeroEnhancements();

  /* ─── Nav link active state sync (enhanced for mobile drawer) ─── */
  // Re-fire on mobile open to trigger stagger animations
  if (mobileBtn && mobileNav) {
    const _originalOpen = openMobileNav;
    window.openMobileNavWithStagger = function () {
      _originalOpen();
      // Reset animations so they replay each open
      mobileNav.querySelectorAll('.mobile-nav-link, .mobile-nav-actions').forEach(el => {
        el.style.animation = 'none';
        void el.offsetHeight; // reflow trigger
        el.style.animation = '';
      });
    };
    mobileBtn.addEventListener('click', function() {
      if (!mobileNav.classList.contains('open')) {
        // Re-trigger CSS animations by toggling
        mobileNav.querySelectorAll('.mobile-nav-link, .mobile-nav-actions').forEach(el => {
          el.style.animation = 'none';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.animation = '';
            });
          });
        });
      }
    });
  }

  /* ─── Smooth number counter with formatted output ─── */
  // Override the basic counter with a formatted version
  const countersV2 = document.querySelectorAll('[data-target]');
  if (countersV2.length && 'IntersectionObserver' in window) {
    const cObserverV2 = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target)) return; // skip non-numeric (e.g. "TN-Wide")
            const duration = 2000;
            const start = performance.now();
            const suffix = el.dataset.suffix || '';

            const step = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target) + suffix;
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            cObserverV2.unobserve(el);
          }
        });
      },
      { threshold: 0.6 }
    );
    countersV2.forEach(c => cObserverV2.observe(c));
  }

})();
