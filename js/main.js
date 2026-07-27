/**
 * Hexcentric Roof Structures — Main JS
 * Handles: Navigation, glassmorphism header, FAQ, counters, card glow
 * Motion animations delegated to js/motion.js
 */
import { initMotion, getDrawerControls } from './motion.js';

(async function () {
  'use strict';

  try {
    await initMotion();
  } catch {
    document.querySelectorAll('.fade-up, .scale-in, .card, .service-card, .project-card, .testimonial-card, .authority-item, .stat-item, .compliance-badge, .faq-item, .cta-banner, .section-header--center').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ─── Header glassmorphism on scroll ─── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Active nav link (clean URLs) ─── */
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    const linkPath = href.split('#')[0].replace(/\/$/, '') || '/';
    if (linkPath === currentPath) link.classList.add('active');
  });

  /* ─── Mobile nav close button (drawer open/close handled by motion.js) ─── */
  const mobileClose = document.querySelector('.mobile-nav-close');
  if (mobileClose) {
    mobileClose.addEventListener('click', () => getDrawerControls()?.close());
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
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', function () {
      const item = this.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      const isOpen = item?.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach((faqItem) => {
        faqItem.classList.remove('open');
        const question = faqItem.querySelector('.faq-question');
        const faqAnswer = faqItem.querySelector('.faq-answer');
        if (question) question.setAttribute('aria-expanded', 'false');
        if (faqAnswer) faqAnswer.hidden = true;
      });

      if (!isOpen && item && answer) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  /* ─── Animated counter ─── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const duration = 2000;
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
      { threshold: 0.6 }
    );
    counters.forEach(c => cObserver.observe(c));
  }

  /* ─── Scroll Progress Bar (rAF-throttled) ─── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
      scrollTicking = false;
    });
  }, { passive: true });

  /* ─── Cursor-Follow Glow on Cards ─── */
  function initCardGlow() {
    document.querySelectorAll('.card, .service-card, .compliance-badge, .testimonial-card').forEach(card => {
      card.classList.add('card-glow');

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

      const dot = document.createElement('div');
      dot.className = 'card-dot';
      dot.setAttribute('aria-hidden', 'true');
      card.appendChild(dot);

      const glow = document.createElement('div');
      glow.className = 'card-cursor-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);

      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
      });
    });
  }

  initCardGlow();

  /* ─── Hero section: inject orb + grid + beam markup ─── */
  function initHeroEnhancements() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const grid = document.createElement('div');
    grid.className = 'hero-grid';
    grid.setAttribute('aria-hidden', 'true');
    hero.appendChild(grid);

    const orb = document.createElement('div');
    orb.className = 'hero-orb';
    orb.setAttribute('aria-hidden', 'true');
    hero.appendChild(orb);

    const orbSecondary = document.createElement('div');
    orbSecondary.className = 'hero-orb-secondary';
    orbSecondary.setAttribute('aria-hidden', 'true');
    hero.appendChild(orbSecondary);

    const beam = document.createElement('div');
    beam.className = 'hero-beam';
    beam.setAttribute('aria-hidden', 'true');
    hero.appendChild(beam);
  }

  initHeroEnhancements();

})();
