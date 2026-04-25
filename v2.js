/**
 * Ali Alshahri — Portfolio Script
 * Version : 2.0
 * Sections : Loading · Navigation · Typewriter · Particles
 *            Reveal animations · Skill bars · Contact form · Scroll-top
 *
 * React-ready: all logic is isolated in self-contained functions
 * so each can be imported / replaced independently in a React refactor.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */

/**
 * Lightweight event throttle.
 * @param {Function} fn
 * @param {number} limitMs
 * @returns {Function}
 */
function throttle(fn, limitMs) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= limitMs) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Smooth-scroll to an element, accounting for nav height.
 * @param {string} selector  CSS selector or id (with #)
 */
function smoothScrollTo(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const navH    = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
  const offsetY = target.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top: offsetY, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════
   1.  LOADING SCREEN
═══════════════════════════════════════════════════════ */

function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;

  const hide = () => {
    screen.classList.add('hidden');
    // Remove from DOM after transition so it never blocks interaction
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
  };

  // Hide after page load (or 2.5 s max, whichever comes first)
  if (document.readyState === 'complete') {
    setTimeout(hide, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 400), { once: true });
    setTimeout(hide, 2500);
  }
}

/* ═══════════════════════════════════════════════════════
   2.  NAVIGATION
═══════════════════════════════════════════════════════ */

function initNavigation() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks    = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');

  if (!navbar) return;

  /* ── Scrolled class ── */
  const onScroll = throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
    showScrollTopIfNeeded();
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active nav link on scroll ── */
  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        const id = section.getAttribute('id');
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  /* ── Mobile menu toggle ── */
  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  mobileClose?.addEventListener('click', closeMobileMenu);

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      smoothScrollTo(link.getAttribute('href'));
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu?.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // Close on resize above breakpoint
  window.addEventListener('resize', throttle(() => {
    if (window.innerWidth > 768) closeMobileMenu();
  }, 200));

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });
}

/* ═══════════════════════════════════════════════════════
   3.  TYPEWRITER
═══════════════════════════════════════════════════════ */

function initTypewriter() {
  const el = document.getElementById('typing');
  if (!el) return;

  const WORDS = ['Programmer', 'Web Developer', 'Bug Hunter', 'Arduino Engineer'];

  let wordIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let timeoutId  = null;

  function tick() {
    const currentWord = WORDS[wordIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = currentWord.slice(0, charIndex);
    } else {
      charIndex++;
      el.textContent = currentWord.slice(0, charIndex);
    }

    let delay;

    if (!isDeleting && charIndex === currentWord.length) {
      // Word fully typed — pause then start deleting
      delay      = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Word fully deleted — move to next
      isDeleting = false;
      wordIndex  = (wordIndex + 1) % WORDS.length;
      delay      = 500;
    } else {
      // Normal typing / deleting speed
      delay = isDeleting ? 80 : 140;
    }

    timeoutId = setTimeout(tick, delay);
  }

  // Start after a short initial delay
  timeoutId = setTimeout(tick, 1000);

  // Cleanup helper (useful when converting to React component)
  return () => clearTimeout(timeoutId);
}

/* ═══════════════════════════════════════════════════════
   4.  PARTICLE CANVAS
═══════════════════════════════════════════════════════ */

function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const CONFIG = {
    count:       60,
    maxRadius:   2.2,
    minRadius:   0.5,
    maxSpeed:    0.45,
    connectDist: 120,
    color:       'rgba(40, 167, 69,',
  };

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── Create particles ── */
  function createParticles() {
    particles = Array.from({ length: CONFIG.count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * CONFIG.maxSpeed,
      vy: (Math.random() - 0.5) * CONFIG.maxSpeed,
      r:  Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius,
    }));
  }

  /* ── Animation loop ── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${CONFIG.color}0.7)`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * 0.3;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `${CONFIG.color}${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  /* ── Init ── */
  resize();
  createParticles();
  draw();

  window.addEventListener('resize', throttle(() => {
    resize();
    createParticles();
  }, 250));

  // Cleanup helper
  return () => cancelAnimationFrame(animId);
}

/* ═══════════════════════════════════════════════════════
   5.  SCROLL-REVEAL (Intersection Observer)
═══════════════════════════════════════════════════════ */

function initReveal() {
  // Add data-reveal attributes to all key elements
  const revealMap = [
    ['.hero-text',     'up'],
    ['.hero-visual',   'left'],
    ['.section-header','up'],
    ['.about-figure',  'left'],
    ['.about-text',    'right'],
    ['.skill-card',    'up'],
    ['.service-card',  'up'],
    ['.contact-info',  'left'],
    ['.contact-form',  'right'],
  ];

  revealMap.forEach(([selector, dir]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.setAttribute('data-reveal', dir);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseFloat(el.style.getPropertyValue('--i') || 0) * 0.1;

      setTimeout(() => {
        el.classList.add('revealed');

        // Animate skill bars when their card is revealed
        const fill = el.querySelector('.skill-fill[data-progress]');
        if (fill) {
          fill.style.width = fill.getAttribute('data-progress') + '%';
        }
      }, delay * 1000);

      observer.unobserve(el);
    });
  }, {
    threshold:   0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   6.  CONTACT FORM (AJAX with Formspree)
═══════════════════════════════════════════════════════ */

function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const btn    = form?.querySelector('.submit-btn');

  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const name    = form.querySelector('[name="name"]')?.value.trim();
    const email   = form.querySelector('[name="_replyto"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !message) {
      setStatus('error', 'Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error', 'Please enter a valid email address.');
      return;
    }

    // Disable button while submitting
    setSubmitting(true);
    setStatus('', '');

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      if (response.ok) {
        setStatus('success', '✓ Message sent! I\'ll get back to you within 24 hours.');
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      setStatus('error', '✗ Something went wrong. Please try again or email me directly.');
    } finally {
      setSubmitting(false);
    }
  });

  function setSubmitting(loading) {
    if (!btn) return;
    btn.disabled = loading;
    const span = btn.querySelector('span');
    const icon = btn.querySelector('i');
    if (span) span.textContent = loading ? 'Sending…' : 'Send Message';
    if (icon) {
      icon.className = loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane';
    }
  }

  function setStatus(type, message) {
    status.textContent  = message;
    status.className    = `form-status ${type}`.trim();
  }
}

/* ═══════════════════════════════════════════════════════
   7.  SCROLL-TO-TOP BUTTON
═══════════════════════════════════════════════════════ */

function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function showScrollTopIfNeeded() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

/* ═══════════════════════════════════════════════════════
   8.  FOOTER YEAR
═══════════════════════════════════════════════════════ */

function initFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ═══════════════════════════════════════════════════════
   BOOTSTRAP — run everything on DOMContentLoaded
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNavigation();
  initTypewriter();
  initParticles();
  initReveal();
  initContactForm();
  initScrollTop();
  initFooterYear();
});
