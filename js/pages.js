/* ============================================
   GAS NOIR — Inner Pages JS
   Cursor · Mobile Nav · Reveals · FAQ · Forms
============================================ */

(function () {
  'use strict';

  /* ─── CUSTOM CURSOR ─── */
  const cursor = document.querySelector('.cursor');
  const ring   = document.querySelector('.cursor-ring');

  if (cursor && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function lerp() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerp);
    })();

    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      ring.style.opacity   = '1';
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      ring.style.opacity   = '0';
    });

    const hoverTargets = 'a, button, .service-hub-card, .case-card, .blog-card, .resource-card, .bio-link, .filter-btn, .faq-question';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.transform = 'translate(-50%,-50%) scale(2.4)';
        ring.style.borderColor = '#4682B4';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.borderColor = '';
      });
    });
  }

  /* ─── MOBILE NAV ─── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileNav.setAttribute('aria-hidden', String(!open));
    });

    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ─── NAV SCROLL STATE ─── */
  const nav = document.querySelector('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── ACTIVE NAV LINK ─── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '/') return;
    if (path.startsWith(href)) a.classList.add('active');
  });

  /* ─── SCROLL REVEALS ─── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));
  }

  /* ─── FAQ ACCORDION ─── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ─── FILTER BUTTONS ─── */
  document.querySelectorAll('.filter-btn, .blog-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.case-filters, .blog-filter');
      if (group) group.querySelectorAll('.filter-btn, .blog-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ─── CONTACT FORM ─── */
  const contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Message Sent ✓';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.opacity = '';
        contactForm.reset();
      }, 4000);
    });
  }

  /* ─── OPT-IN FORM ─── */
  const optinForm = document.querySelector('.js-optin-form');
  if (optinForm) {
    optinForm.addEventListener('submit', e => {
      e.preventDefault();
      window.location.href = '/free/thank-you';
    });
  }

})();
