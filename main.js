/* ==========================================================================
   RAKKARIKÖÖRI OY – main.js
   ========================================================================== */

'use strict';

/* ==========================================================================
   NAVIGAATIO – pienenee ja saa taustan scrollatessa
   ========================================================================== */
(function initNavScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();

/* ==========================================================================
   HAMPURILAISVALIKKO
   ========================================================================== */
(function initMobileMenu() {
  const btn  = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function openMenu() {
    btn.classList.add('open');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Sulje valikko');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Avaa valikko');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function () {
    if (btn.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Sulje mobiilivalikkolinkistä
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Escape sulkee valikon
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.classList.contains('open')) {
      closeMenu();
      btn.focus();
    }
  });

  // Sulje klikkaamalla ulkopuolelle (ei menu-elementin sisältä)
  document.addEventListener('click', function (e) {
    if (
      btn.classList.contains('open') &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      closeMenu();
    }
  });
})();

/* ==========================================================================
   SCROLL REVEAL – clip-path inset(0 0 100% 0) → inset(0 0 0% 0)
   ========================================================================== */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-clip');
  if (!els.length) return;

  const obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
  );

  els.forEach(function (el) {
    obs.observe(el);
  });
})();

/* ==========================================================================
   STATS LUVUT – kasvavat 0 → loppuarvo (easeOutQuart, 1.8s)
   ========================================================================== */
(function initCountUp() {
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (!statEls.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCount(el) {
    const target   = parseFloat(el.getAttribute('data-target'));
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTs  = performance.now();

    function tick(now) {
      const elapsed  = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const value    = Math.round(eased * target);

      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statEls.forEach(function (el) {
    obs.observe(el);
  });
})();

/* ==========================================================================
   HERO VAIHTUVA TEKSTI – 3 sanaa pyörii opacity-häivytyksellä (3s sykli)
   ========================================================================== */
(function initRotatingText() {
  const items = document.querySelectorAll('.rotating-item');
  if (items.length < 2) return;

  let current = 0;

  // Varmista lähtötila
  items.forEach(function (item, i) {
    item.classList.toggle('active', i === 0);
  });

  function rotate() {
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }

  setInterval(rotate, 3000);
})();

/* ==========================================================================
   RIPPLE-EFEKTI – lähtee klikkauspisteestä (hover_napit)
   ========================================================================== */
(function initRipple() {
  document.querySelectorAll('.btn-ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x    = e.clientX - rect.left  - size / 2;
      const y    = e.clientY - rect.top   - size / 2;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.cssText = [
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + x    + 'px',
        'top:'    + y    + 'px'
      ].join(';');

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  });
})();

/* ==========================================================================
   LOMAKKEEN VALIDOINTI JA LÄHETYS
   ========================================================================== */
(function initForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  // --- Apufunktiot ---

  function showFieldError(input, msg) {
    input.classList.add('error');
    const errSpan = input.parentElement.querySelector('.field-error');
    if (errSpan) errSpan.textContent = msg;
  }

  function clearFieldError(input) {
    input.classList.remove('error');
    const errSpan = input.parentElement.querySelector('.field-error');
    if (errSpan) errSpan.textContent = '';
  }

  function clearStatus() {
    status.className = 'form-status';
    status.textContent = '';
  }

  // Poista virhe reaaliajassa kun käyttäjä kirjoittaa
  form.querySelectorAll('input, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      clearFieldError(field);
      clearStatus();
    });
  });

  // --- Validointi ---

  function validate() {
    let valid = true;

    const nimi   = form.querySelector('#nimi');
    const puh    = form.querySelector('#puhelin');
    const kohde  = form.querySelector('#kohde');
    const email  = form.querySelector('#email');

    if (!nimi || !nimi.value.trim()) {
      showFieldError(nimi, 'Kirjoita nimesi.');
      valid = false;
    }

    if (!puh || !puh.value.trim()) {
      showFieldError(puh, 'Kirjoita puhelinnumero.');
      valid = false;
    }

    // Sähköposti on vapaaehtoinen, mutta jos täytetty, tarkista muoto
    if (email && email.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        showFieldError(email, 'Tarkista sähköpostiosoite.');
        valid = false;
      }
    }

    if (!kohde || !kohde.value.trim()) {
      showFieldError(kohde, 'Kerro kohteesta ja ongelmasta.');
      valid = false;
    }

    return valid;
  }

  // --- Lähetys ---

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!validate()) {
      // Siirrä fokus ensimmäiseen virhekenttään
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn  = form.querySelector('[type="submit"]');
    const origText   = submitBtn.textContent;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Lähetetään...';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        status.classList.add('success');
        status.textContent = 'Viesti lähetetty! Otamme yhteyttä pian.';
        form.reset();

        // Poista mahdolliset jääneet virheet
        form.querySelectorAll('input, textarea').forEach(function (f) {
          clearFieldError(f);
        });

        // Siirrä fokus statusviestiin esteettömyyden vuoksi
        status.setAttribute('tabindex', '-1');
        status.focus();
      } else {
        const json = await res.json().catch(function () { return {}; });
        const msg  = json.error || 'Palvelinvirhe – yritä hetken päästä uudelleen.';
        throw new Error(msg);
      }
    } catch (err) {
      status.classList.add('error');
      status.textContent =
        'Lähetys epäonnistui. Soita meille: 044 237 8143 tai lähetä sähköpostia info@otsonointioulu.fi';
      status.setAttribute('tabindex', '-1');
      status.focus();
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = origText;
    }
  });
})();

/* ==========================================================================
   SMOOTH SCROLL – ankkurilinkeille, kompensoi kiinteän headerin korkeus
   ========================================================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href   = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const header = document.getElementById('site-header');
      const offset = header ? header.offsetHeight + 12 : 84;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: top, behavior: 'smooth' });

      // Siirrä fokus kohdeelementtiin esteettömyyden vuoksi
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();