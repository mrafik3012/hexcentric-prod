/**
 * Hexcentric — Motion animation engine
 * Loads Motion from CDN at runtime; content stays visible if the library fails.
 */

const SPRING_DRAWER = { type: 'spring', stiffness: 280, damping: 28, mass: 0.9 };
const EASE_OUT = [0.16, 1, 0.3, 1];

const REVEAL_SELECTORS = [
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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let animate = null;
let inView = null;
let stagger = null;
let scroll = null;

function revealInstant(elements) {
  elements.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.classList.add('motion-revealed');
    el.classList.remove('motion-pending');
  });
}

function revealAllContent() {
  revealInstant(document.querySelectorAll(REVEAL_SELECTORS));
  document.querySelectorAll('.hero h1, .page-hero h1, .hero-subtitle, .hero-actions, .proof-strip, .page-hero .text-overline, .page-hero p.fade-up').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  document.querySelectorAll('.mobile-nav-link, .mobile-nav-actions').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

async function loadMotionLibrary() {
  try {
    ({ animate, inView, stagger, scroll } = await import('https://cdn.jsdelivr.net/npm/motion@12.23.12/+esm'));
    return true;
  } catch {
    return false;
  }
}

function initHeroParallax() {
  if (reducedMotion || !scroll) return;

  document.querySelectorAll('.hero, .page-hero').forEach((hero) => {
    scroll(
      (progress) => {
        hero.style.setProperty('--hero-parallax-y', `${progress * 8}%`);
        hero.style.setProperty('--hero-bg-scale', `${1 + progress * 0.03}`);
      },
      { target: hero, offset: ['start start', 'end start'] }
    );
  });
}

function initHeroStagger() {
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return;

  const targets = hero.querySelectorAll(
    '.hero h1, .page-hero h1, .hero-subtitle, .hero-actions, .proof-strip, .page-hero .text-overline, .page-hero p.fade-up'
  );

  if (!targets.length) return;

  if (reducedMotion || !animate) {
    revealInstant(targets);
    return;
  }

  targets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
  });

  animate(
    targets,
    { opacity: [0, 1], y: [28, 0] },
    { duration: 0.75, delay: stagger(0.1, { startDelay: 0.12 }), easing: EASE_OUT }
  );
}

function initScrollReveal() {
  const seen = new Set();
  const elements = [...document.querySelectorAll(REVEAL_SELECTORS)].filter((el) => {
    if (seen.has(el)) return false;
    if (el.closest('.hero, .page-hero')) return false;
    seen.add(el);
    return true;
  });

  if (!elements.length) return;

  if (reducedMotion || !inView) {
    revealInstant(elements);
    return;
  }

  elements.forEach((el) => {
    el.classList.add('motion-pending');
    el.style.opacity = '0';
    el.style.transform = el.classList.contains('scale-in') ? 'scale(0.96)' : 'translateY(24px)';

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

let drawerControls = null;

function initMobileDrawer() {
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

  function showLinks() {
    links.forEach((l) => { l.style.opacity = '1'; l.style.transform = 'none'; });
    if (actions) { actions.style.opacity = '1'; actions.style.transform = 'none'; }
  }

  function animateLinksIn() {
    if (reducedMotion || !animate) {
      showLinks();
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
    if (!animate || reducedMotion) return;
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

    if (reducedMotion || !animate) {
      mobileNav.style.transform = 'translateX(0)';
      showLinks();
      return;
    }

    animate(mobileNav, { x: ['100%', '0%'] }, SPRING_DRAWER).then(animateLinksIn);
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    mobileBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (reducedMotion || !animate) {
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

export async function initMotion() {
  const motionReady = await loadMotionLibrary();

  if (!motionReady) {
    revealAllContent();
  }

  initHeroParallax();
  initHeroStagger();
  initScrollReveal();
  initMobileDrawer();
}
