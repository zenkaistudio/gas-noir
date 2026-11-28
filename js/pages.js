/* ============================================
   GAS NOIR — Inner Pages JS
   Cursor · Mobile Nav · Reveals · FAQ · Forms
============================================ */

(function () {
  'use strict';

  /* Booking calendar embed: white backing only once Google's page has actually loaded. */
  document.querySelectorAll('.booking-calendar-frame').forEach(f => {
    f.addEventListener('load', () => f.classList.add('is-loaded'));
  });

  /* ─── SITE CONFIG ───────────────────────────────────────────────
     Primary booking = Google Calendar booking page embedded on /book
     (2026-11-27; vault tools/booking-alert/booking-page.md). This table
     holds the fallback request form, the contact form and opt-ins.
     The key below is a publishable key: it can insert a request and
     nothing else. Empty either value and every form falls back to a
     real email hand-off — never a fake "sent" confirmation.
  ──────────────────────────────────────────────────────────────── */
  const GND = {
    email:        'hello@gasnoir.digital',
    supabaseUrl:  'https://zvwriojpfjbcyszovggk.supabase.co',
    supabaseKey:  'sb_publishable_8BtZE8ixahhRAfr1ZYFslw_MUVFM3AC',
    captureTable: 'gnd_site_requests',
    optinFormUrl: ''    // free guide opt-in — not wired yet
  };
  window.GND_CONFIG = GND;

  /* Lead capture (js/capture.js). Banks each request on the device before
     sending, and resends anything a previous visit could not deliver. */
  const capture = (window.GNDCapture && GND.supabaseUrl && GND.supabaseKey)
    ? window.GNDCapture.create({ url: GND.supabaseUrl, key: GND.supabaseKey, table: GND.captureTable })
    : null;
  if (capture && capture.ready) capture.flush();

  function formFields(form) {
    const out = {};
    form.querySelectorAll('input, select, textarea').forEach(el => { if (el.name) out[el.name] = el.value; });
    out.referrer = document.referrer || '';
    return out;
  }

  /* Result panel. Built with textContent only: it shows what the visitor typed. */
  function showResult(box, title, body, mailto) {
    box.textContent = '';
    const h = document.createElement('div');
    h.className = 'booking-result-title';
    h.textContent = title;
    const p = document.createElement('p');
    p.className = 'booking-result-body';
    p.textContent = body;
    box.appendChild(h);
    box.appendChild(p);
    if (mailto) {
      const a = document.createElement('a');
      a.className = 'btn-primary';
      a.href = mailto;
      a.textContent = 'Email Us Instead →';
      box.appendChild(a);
    }
    box.hidden = false;
  }

  /* Build a mailto: from a form's own fields. Real delivery, no backend. */
  function mailtoFromForm(form, subject) {
    const lines = [];
    form.querySelectorAll('input, select, textarea').forEach(el => {
      if (!el.name || el.type === 'submit' || el.name === 'website') return;
      const label = form.querySelector(`label[for="${el.id}"]`);
      lines.push(`${(label ? label.textContent : el.name).trim()}: ${el.value}`);
    });
    return `mailto:${GND.email}?subject=${encodeURIComponent(subject)}`
         + `&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  function requireFields(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.style.borderColor = bad ? '#e5484d' : '';
      if (bad) ok = false;
    });
    return ok;
  }

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

    // The embedded Google booking page swallows mouse events: hide the custom cursor over it.
    document.querySelectorAll('iframe').forEach(f => {
      f.addEventListener('mouseenter', () => { cursor.style.opacity = '0'; ring.style.opacity = '0'; });
      f.addEventListener('mouseleave', () => { cursor.style.opacity = '1'; ring.style.opacity = '1'; });
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

  /* ─── BOOKING REQUEST FORM ────────────────────────────────────
     The form ships hidden. It replaces the email/DM fallback only
     when capture is configured, so a visitor never sees a form
     that cannot deliver.
  ──────────────────────────────────────────────────────────────── */
  const bookingWrap = document.querySelector('.js-booking');
  const bookingForm = document.querySelector('.js-booking-form');
  if (bookingWrap && bookingForm && capture && capture.ready) {
    const fallback = bookingWrap.querySelector('.js-booking-fallback');
    const result = bookingWrap.querySelector('.js-booking-result');
    bookingForm.hidden = false;
    if (fallback) fallback.hidden = true;

    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!requireFields(bookingForm)) return;
      const btn = bookingForm.querySelector('[type="submit"]');
      const label = btn.textContent;
      const fields = formFields(bookingForm);
      const mailto = mailtoFromForm(bookingForm, 'Booking a 30-minute strategy call');
      btn.disabled = true;
      btn.textContent = 'Sending…';

      capture.submit('booking', fields).then(r => {
        if (r.ok) {
          bookingForm.hidden = true;
          showResult(result, 'Request received.',
            'We will reply to ' + fields.email + ' with a time, within one business day.');
        } else if (r.queued) {
          bookingForm.hidden = true;
          showResult(result, 'Saved on this device.',
            'We could not reach our server just now. Your request will send automatically the next time you open this page. To be safe, you can also email it to us now.',
            mailto);
        } else {
          btn.disabled = false;
          btn.textContent = label;
          showResult(result, 'That did not go through.',
            'Please email us instead and we will pick it up from there.', mailto);
        }
      });
    });
  }

  /* ─── CONTACT FORM ─── */
  const contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!requireFields(contactForm)) return;

      const btn = contactForm.querySelector('[type="submit"]');

      if (capture && capture.ready) {
        const label = btn.textContent;
        const fields = formFields(contactForm);
        const mailto = mailtoFromForm(contactForm, 'New enquiry via gasnoir.digital');
        let status = contactForm.querySelector('.form-status');
        if (!status) {
          status = document.createElement('p');
          status.className = 'form-status';
          status.setAttribute('role', 'status');
          contactForm.appendChild(status);
        }
        btn.disabled = true;
        btn.textContent = 'Sending…';
        capture.submit('contact', fields).then(r => {
          btn.disabled = false;
          btn.textContent = label;
          if (r.ok) {
            contactForm.reset();
            status.textContent = 'Message received. We will reply to ' + fields.email + ' within one business day.';
          } else {
            status.textContent = r.queued
              ? 'We could not reach our server, so your message is saved on this device and will send next time you open this page. Opening your email as a backup.'
              : 'That did not go through. Opening your email instead.';
            window.location.href = mailto;
          }
        });
        return;
      }

      /* No form backend yet — hand off to a real email the visitor can see leave. */
      btn.textContent = 'Opening your email…';
      window.location.href = mailtoFromForm(contactForm, 'New enquiry via gasnoir.digital');
      setTimeout(() => { btn.textContent = 'Send Message →'; }, 3000);
    });
  }

  /* ─── OPT-IN FORM ─── */
  const optinForm = document.querySelector('.js-optin-form');
  if (optinForm) {
    optinForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!requireFields(optinForm)) return;

      if (GND.optinFormUrl) {
        window.location.href = GND.optinFormUrl;
        return;
      }

      /* Capture the address for real before sending anyone to a thank-you page. */
      window.location.href = mailtoFromForm(optinForm, 'Send me the free guide — gasnoir.digital');
    });
  }

  /* ─── NEWSLETTER FORMS (home + blog) ─── */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!requireFields(form)) return;
      window.location.href = mailtoFromForm(form, 'Newsletter signup — gasnoir.digital');
    });
  });

})();
