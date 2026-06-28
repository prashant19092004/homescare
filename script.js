'use strict';

const header = document.querySelector('#site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Sticky navigation and mobile menu.
const updateHeader = () =>
  header.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('open');
  nav.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

nav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  })
);

// Update active menu link as sections enter the viewport.
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle('active', link.hash === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: '-35% 0px -55%', threshold: 0 }
);
sections.forEach((section) => sectionObserver.observe(section));

// Scroll reveals and animated counters.
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion) reveals.forEach((item) => item.classList.add('visible'));
else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((item) => revealObserver.observe(item));
}

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.target);
      const duration = reduceMotion ? 0 : 1600;
      const start = performance.now();
      const tick = (now) => {
        const progress = duration ? Math.min((now - start) / duration, 1) : 1;
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(target * eased).toLocaleString(
          'en-IN'
        );
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(counter);
    });
  },
  { threshold: 0.5 }
);
counters.forEach((counter) => counterObserver.observe(counter));

// Accessible FAQ accordion.
document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const willOpen = !item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((openItem) => {
      openItem.classList.remove('open');
      openItem.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    item.classList.toggle('open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
  });
});

// Responsive testimonial carousel.
const track = document.querySelector('.testimonial-track');
const slides = [...document.querySelectorAll('.testimonial')];
const dotsWrap = document.querySelector('.slider-dots');
let slideIndex = 0;
let autoplay;
const visibleSlides = () =>
  window.innerWidth <= 520 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
const pageCount = () => Math.max(1, slides.length - visibleSlides() + 1);

const buildDots = () => {
  dotsWrap.innerHTML = '';
  for (let i = 0; i < pageCount(); i += 1) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show review page ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
};
const renderSlider = () => {
  slideIndex = Math.min(slideIndex, pageCount() - 1);
  const slideWidth = slides[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
  track.style.transform = `translateX(-${slideIndex * (slideWidth + gap)}px)`;
  [...dotsWrap.children].forEach((dot, index) =>
    dot.classList.toggle('active', index === slideIndex)
  );
};
function goToSlide(index) {
  slideIndex = (index + pageCount()) % pageCount();
  renderSlider();
  restartAutoplay();
}
const restartAutoplay = () => {
  clearInterval(autoplay);
  if (!reduceMotion)
    autoplay = setInterval(() => goToSlide(slideIndex + 1), 5500);
};
document
  .querySelector('.slider-prev')
  .addEventListener('click', () => goToSlide(slideIndex - 1));
document
  .querySelector('.slider-next')
  .addEventListener('click', () => goToSlide(slideIndex + 1));
window.addEventListener('resize', () => {
  buildDots();
  renderSlider();
});
buildDots();
renderSlider();
restartAutoplay();

// Welcome offer appears after every page load.
const popup = document.querySelector('#welcome-popup');
const closePopup = () => {
  popup.hidden = true;
  document.body.style.overflow = '';
};
window.setTimeout(() => {
  popup.hidden = false;
  document.body.style.overflow = 'hidden';
  popup.querySelector('.popup-close').focus();
}, 100);
popup.querySelector('.popup-close').addEventListener('click', closePopup);
popup.addEventListener('click', (event) => {
  if (event.target === popup) closePopup();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !popup.hidden) closePopup();
});

// Lightweight click ripple on primary actions.
document.querySelectorAll('.ripple').forEach((button) =>
  button.addEventListener('click', (event) => {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();
    circle.className = 'ripple-ink';
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
    circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
    button.querySelector('.ripple-ink')?.remove();
    button.appendChild(circle);
  })
);

document.querySelector('#year').textContent = new Date().getFullYear();
