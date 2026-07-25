/**
 * Hexcentric — Motion animation engine
 * Uses Motion (motiondivision/motion) via ESM CDN for all mandated micro-interactions.
 */
import { animate, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@latest/+esm';

const SPRING_SNAPPY = { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 };
const SPRING_DRAWER = { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 };
const SPRING_PILL = { type: 'spring', stiffness: 420, damping: 34, mass: 0.75 };
const EASE_OUT = [0.16, 1, 0.3, 1];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealInstant(elements) {
  elements.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ─── Hero: staggered entry for title, subhead, CTAs ─── */
export function initHeroStagger() {
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return;

  const targets = hero.querySelectorAll(
    '.hero-eyebrow, .hero h1, .page-hero h1, .hero-subtitle, .hero-actions, .proof-strip, .page-hero .text-overline, .page-hero p.fade-up'
  );

  if (!targets.length) return;

  if (reducedMotion) {
    revealInstant(targets);
    return;
  }

  animate(
    targets,
    { opacity: [0, 1], y: [28, 0] },
    { duration: 0.75, delay: stagger(0.1, { startDelay: 0.12 }), easing: EASE_OUT }
  );
}

/* ─── Scroll: inView fade-ups for cards, features, case studies ─── */
export function initScrollReveal() {
  const selectors = [
    '.fade-up',
    '.scale-in',
    '.card',
    '.service-card',
    '.project-card',
    '.testimonial-card',
    '.authority-item',
    '.stat-item',
    '.compliance-badge',
    '.faq-item',
    '.cta-banner',
    '.section-header--center',
  ].join(', ');

  const seen = new Set();
  const elements = [...document.querySelectorAll(selectors)].filter((el) => {
    if (seen.has(el)) return false;
    if (el.closest('.hero, .page-hero')) return false;
    seen.add(el);
    return true;
  });

  if (!elements.length) return;

  if (reducedMotion) {
    elements.forEach((el) => el.classList.add('motion-revealed'));
    revealInstant(elements);
    return;
  }

  elements.forEach((el) => {
    el.classList.add('motion-pending');

    inView(
      el,
      () => {
        animate(
          el,
          el.classList.contains('scale-in')
            ? { opacity: [0, 1], scale: [0.96, 1] }
            : { opacity: [0, 1], y: [24, 0] },
          { duration: 0.55, easing: EASE_OUT }
        );
        el.classList.remove('motion-pending');
        el.classList.add('motion-revealed');
      },
      { margin: '-8% 0px -5% 0px', amount: 0.15, once: true }
    );
  });
}

/* ─── Project tabs: spring pill + layout-style filter transitions ─── */
export function initProjectFilters() {
  const filterBars = document.querySelectorAll('.filter-bar');
  const projectCards = document.querySelectorAll('.project-card[data-category]');
  if (!filterBars.length || !projectCards.length) return;

  filterBars.forEach((bar) => {
    const pill = bar.querySelector('.filter-pill-bg');
    const buttons = [...bar.querySelectorAll('.filter-btn')];

    function movePill(btn, animatePill = true) {
      if (!pill || !btn) return;
      const isWrapped = bar.classList.contains('filter-bar--wrap') && window.innerWidth <= 900;
      if (isWrapped) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.opacity = '1';
      const barRect = bar.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const props = {
        left: btnRect.left - barRect.left - 4 + bar.scrollLeft,
        width: btnRect.width,
        top: btnRect.top - barRect.top,
        height: btnRect.height,
        opacity: 1,
      };

      if (reducedMotion || !animatePill) {
        Object.assign(pill.style, {
          left: `${props.left}px`,
          width: `${props.width}px`,
          top: `${props.top}px`,
          height: `${props.height}px`,
          opacity: '1',
        });
        return;
      }

      animate(pill, props, SPRING_PILL);
    }

    const initial = bar.querySelector('.filter-btn.active');
    if (initial) {
      requestAnimationFrame(() => movePill(initial, false));
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        movePill(btn);
        filterCards(btn.dataset.filter);
      });
    });

    const resizeObs = new ResizeObserver(() => {
      const active = bar.querySelector('.filter-btn.active');
      if (active) movePill(active, false);
    });
    resizeObs.observe(bar);
  });

  function filterCards(filter) {
    const cards = [...projectCards];
    const toHide = cards.filter((c) => filter !== 'all' && c.dataset.category !== filter);
    const toShow = cards.filter((c) => filter === 'all' || c.dataset.category === filter);
    const grid = document.getElementById('project-grid');

    if (reducedMotion) {
      cards.forEach((card) => {
        card.style.display = toShow.includes(card) ? '' : 'none';
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return;
    }

    const firstRects = new Map(
      cards.filter((c) => c.style.display !== 'none').map((c) => [c, c.getBoundingClientRect()])
    );

    const hideAnim = toHide.map((card) =>
      animate(
        card,
        { opacity: 0, scale: 0.96, y: -8 },
        { duration: 0.22, easing: EASE_OUT }
      ).then(() => {
        card.style.display = 'none';
        card.dataset.motionHidden = 'true';
      })
    );

    Promise.all(hideAnim).then(() => {
      toShow.forEach((card) => {
        if (card.style.display === 'none' || card.dataset.motionHidden === 'true') {
          card.style.display = '';
          delete card.dataset.motionHidden;
        }
      });

      cards.filter((c) => c.style.display !== 'none').forEach((card) => {
        const first = firstRects.get(card);
        if (!first) return;
        const last = card.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          animate(card, { x: [dx, 0], y: [dy, 0] }, { duration: 0.5, easing: EASE_OUT });
        }
      });

      animate(
        toShow.filter((c) => !firstRects.has(c)),
        { opacity: [0, 1], scale: [0.96, 1], y: [16, 0] },
        { delay: stagger(0.06), duration: 0.45, easing: EASE_OUT }
      );
    });
  }
}

/* ─── Mobile drawer: spring slide-in + staggered links ─── */
let drawerControls = null;

export function initMobileDrawer() {
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  if (!mobileNav || !mobileBtn) return;

  const links = [...mobileNav.querySelectorAll('.mobile-nav-link')];
  const actions = mobileNav.querySelector('.mobile-nav-actions');
  let isOpen = false;
  let linkAnim = null;

  const mobileMq = window.matchMedia('(max-width: 900px)');
  function applyNavDisplay() {
    mobileNav.style.display = mobileMq.matches ? 'flex' : 'none';
    if (!mobileMq.matches && isOpen) closeDrawer();
  }
  mobileMq.addEventListener('change', applyNavDisplay);
  applyNavDisplay();

  mobileNav.style.transform = 'translateX(100%)';
  mobileNav.style.visibility = 'hidden';
  mobileNav.style.pointerEvents = 'none';

  function animateLinksIn() {
    if (reducedMotion) {
      links.forEach((l) => { l.style.opacity = '1'; l.style.transform = 'none'; });
      if (actions) { actions.style.opacity = '1'; actions.style.transform = 'none'; }
      return;
    }

    linkAnim = animate(
      links,
      { opacity: [0, 1], x: [28, 0] },
      { delay: stagger(0.055, { startDelay: 0.08 }), ...SPRING_DRAWER }
    );

    if (actions) {
      animate(actions, { opacity: [0, 1], x: [28, 0] }, { delay: 0.32, ...SPRING_DRAWER });
    }
  }

  function resetLinks() {
    if (linkAnim) linkAnim.stop();
    links.forEach((l) => {
      l.style.opacity = '0';
      l.style.transform = 'translateX(28px)';
    });
    if (actions) {
      actions.style.opacity = '0';
      actions.style.transform = 'translateX(28px)';
    }
  }

  function openDrawer() {
    if (isOpen) return;
    isOpen = true;
    mobileNav.classList.add('open');
    mobileBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileNav.style.visibility = 'visible';
    mobileNav.style.pointerEvents = 'auto';

    resetLinks();

    if (reducedMotion) {
      mobileNav.style.transform = 'translateX(0)';
      links.forEach((l) => { l.style.opacity = '1'; l.style.transform = 'none'; });
      if (actions) { actions.style.opacity = '1'; actions.style.transform = 'none'; }
      return;
    }

    animate(mobileNav, { x: ['100%', '0%'] }, SPRING_DRAWER).then(animateLinksIn);
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    mobileBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (reducedMotion) {
      mobileNav.style.transform = 'translateX(100%)';
      mobileNav.style.visibility = 'hidden';
      mobileNav.style.pointerEvents = 'none';
      mobileNav.classList.remove('open');
      return;
    }

    animate(mobileNav, { x: '100%' }, { ...SPRING_DRAWER, duration: 0.35 }).then(() => {
      mobileNav.style.visibility = 'hidden';
      mobileNav.style.pointerEvents = 'none';
      mobileNav.classList.remove('open');
      resetLinks();
    });
  }

  drawerControls = { open: openDrawer, close: closeDrawer, toggle: () => (isOpen ? closeDrawer() : openDrawer()) };

  mobileBtn.addEventListener('click', drawerControls.toggle);
  links.forEach((link) => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeDrawer();
      mobileBtn.focus();
    }
  });
}

export function getDrawerControls() {
  return drawerControls;
}

/* ─── Filter pill DOM injection (called before filter init) ─── */
export function initFilterPillMarkup() {
  document.querySelectorAll('.filter-bar').forEach((bar) => {
    if (bar.querySelector('.filter-pill-bg')) return;
    const pill = document.createElement('div');
    pill.className = 'filter-pill-bg';
    pill.setAttribute('aria-hidden', 'true');
    bar.insertBefore(pill, bar.firstChild);
  });
}

export function initMotion() {
  initFilterPillMarkup();
  initHeroStagger();
  initScrollReveal();
  initProjectFilters();
  initMobileDrawer();
}
