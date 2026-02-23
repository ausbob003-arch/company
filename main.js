/* =========================================
   OZB Corporate Site — main.js  v2
   ========================================= */

/* ---------- Header scroll ---------- */
const header = document.getElementById('header');
const ticker = document.getElementById('ticker');
const TICKER_H = ticker ? ticker.offsetHeight : 0;

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > TICKER_H + 20);
}, { passive: true });

/* ---------- Hamburger ---------- */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---------- Fade-up observer ---------- */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.fade-up').forEach(el => {
  // Hero elements: trigger immediately after load
  if (el.closest('.hero')) {
    setTimeout(() => el.classList.add('visible'), 80 + Array.from(
      el.closest('.hero').querySelectorAll('.fade-up')
    ).indexOf(el) * 120);
  } else {
    fadeObserver.observe(el);
  }
});

/* ---------- Counter animation ---------- */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent  = Math.round(easeOutQuart(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('.stat__num').forEach(el => counterObserver.observe(el));

/* ---------- Active nav highlight ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ---------- Contact form ---------- */
const form    = document.getElementById('contactForm');
const success = document.getElementById('contactSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    // Text / email / select required
    form.querySelectorAll('[required]:not([type="checkbox"])').forEach(field => {
      const ok = field.value.trim() !== '';
      field.style.borderColor = ok ? '' : '#c94040';
      if (!ok) valid = false;
    });

    // Checkbox
    const privacy = form.querySelector('#privacy');
    if (privacy && !privacy.checked) {
      privacy.closest('.checkbox-label').querySelector('.checkbox-custom').style.borderColor = '#c94040';
      valid = false;
    }

    if (!valid) {
      // Scroll to first error
      const firstErr = form.querySelector('[style*="c94040"]');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = form.querySelector('.contact-btn');
    btn.disabled = true;
    btn.querySelector('.contact-btn__text').textContent = '送信中...';

    // Simulate API call
    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1400);
  });

  // Live validation feedback
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.style.borderColor) field.style.borderColor = '';
    });
  });
}

/* ---------- Works タブ切り替え ---------- */
const worksTabs   = document.querySelectorAll('.works__tab');
const worksPanels = document.querySelectorAll('.works__panel');

worksTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    worksTabs.forEach(t => t.classList.remove('works__tab--active'));
    worksPanels.forEach(p => p.classList.remove('works__panel--active'));

    tab.classList.add('works__tab--active');
    const panel = document.getElementById(`tab-${target}`);
    if (panel) {
      panel.classList.add('works__panel--active');
      // パネル内の fade-up 要素を再トリガー
      panel.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
        fadeObserver.observe(el);
      });
    }
  });
});

/* ---------- Smooth scroll (offset for fixed header) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---------- Lightbox ---------- */
(function() {
  const lightbox        = document.getElementById('lightbox');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxWebpSrc = document.getElementById('lightboxWebpSource');
  const lightboxCap     = document.getElementById('lightboxCaption');
  const lightboxClose   = document.getElementById('lightboxClose');
  const lightboxBdrop   = document.getElementById('lightboxBackdrop');

  if (!lightbox) return;

  function openLightbox(el) {
    const supportsWebP = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
    const webpSrc = el.dataset.webp;
    const fallSrc = el.dataset.src;
    const caption = el.dataset.caption || '';

    lightboxWebpSrc.srcset = webpSrc || '';
    lightboxImg.src = (supportsWebP && webpSrc) ? webpSrc : fallSrc;
    lightboxImg.alt = caption;
    lightboxCap.textContent = caption;

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxWebpSrc.srcset = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(el => {
    el.addEventListener('click', () => openLightbox(el));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
})();

/* ---------- Parallax glow (subtle, performance-safe) ---------- */
const glow1 = document.querySelector('.hero__glow--1');
const glow2 = document.querySelector('.hero__glow--2');
if (glow1 && glow2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        glow1.style.transform = `translate(${x * 0.8}px, ${y * 0.6}px)`;
        glow2.style.transform = `translate(${-x * 0.5}px, ${-y * 0.4}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
}
