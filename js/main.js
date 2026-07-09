// ========================================
// Lenis smooth scroll
// ========================================
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const lenisRaf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
  };
  requestAnimationFrame(lenisRaf);
}

// ========================================
// AOS init
// ========================================
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 900,
    once: true,
    offset: 80,
    easing: 'ease-out-cubic',
  });
  if (lenis) lenis.on('scroll', AOS.refresh);
}

// ========================================
// Hero scroll-down button
// ========================================
const heroScroll = document.querySelector('.hero__scroll');
if (heroScroll) {
  heroScroll.addEventListener('click', () => {
    const target = window.innerHeight;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  });
}

// ========================================
// About Us — scroll-driven text fill
// ========================================
const aboutText = document.querySelector('.about__text');
if (aboutText) {
  // Wrap every word in its own span so it can be coloured independently
  const words = aboutText.textContent.trim().split(/\s+/);
  aboutText.innerHTML = words
    .map((word) => `<span class="about__word">${word}</span>`)
    .join(' ');
  const wordEls = Array.from(aboutText.querySelectorAll('.about__word'));
  const total = wordEls.length;

  // Colours the fill interpolates between: light grey -> near black
  const FROM = [179, 179, 179];
  const TO = [30, 30, 30];
  // How many words are mid-transition at once (soft gradient edge)
  const overlap = Math.min(1, 5 / total);

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const mix = (t) =>
    `rgb(${FROM.map((c, i) => Math.round(c + (TO[i] - c) * t)).join(', ')})`;

  const updateFill = () => {
    const rect = aboutText.getBoundingClientRect();
    const vh = window.innerHeight;
    // Fill starts when the text enters the lower part of the viewport
    // and completes as it reaches the upper third
    const start = vh * 0.9;
    const end = vh * 0.3;
    const progress = clamp((start - rect.top) / (start - end));

    wordEls.forEach((word, i) => {
      const wordStart = (i / (total - 1)) * (1 - overlap);
      const p = clamp((progress - wordStart) / overlap);
      word.style.color = mix(p);
    });
  };

  updateFill();
  if (lenis) {
    lenis.on('scroll', updateFill);
  } else {
    window.addEventListener('scroll', updateFill, { passive: true });
  }
  window.addEventListener('resize', updateFill);
}

// ========================================
// Services slider — loops forward, can't go left from the first slide
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.services-slider')) {
  // Swiper needs enough slides for loop mode (~2x the visible count), otherwise
  // it silently disables the loop. Clone the cards until there are plenty.
  const wrapper = document.querySelector('.services-slider .swiper-wrapper');
  const originalSlides = Array.from(wrapper.children);
  const MIN_SLIDES = 12;
  while (wrapper.children.length < MIN_SLIDES) {
    originalSlides.forEach((slide) => wrapper.appendChild(slide.cloneNode(true)));
  }

  const servicesSlider = new Swiper('.services-slider', {
    slidesPerView: 'auto',
    spaceBetween: 14,
    loop: true,
    speed: 600,
  });

  const prevBtn = document.querySelector('.services__prev');
  const nextBtn = document.querySelector('.services__next');

  // Disable "prev" whenever we're back on the very first slide
  const syncPrev = () => {
    prevBtn.classList.toggle('swiper-button-disabled', servicesSlider.realIndex === 0);
  };

  nextBtn.addEventListener('click', () => servicesSlider.slideNext());
  prevBtn.addEventListener('click', () => {
    if (servicesSlider.realIndex === 0) return;
    servicesSlider.slidePrev();
  });

  servicesSlider.on('slideChange', syncPrev);
  syncPrev();
}

// ========================================
// Choose slider — loops forward, can't go left from the first slide
// ========================================
if (typeof Swiper !== 'undefined' && document.querySelector('.choose-slider')) {
  const chooseSlider = new Swiper('.choose-slider', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    loop: true,
    speed: 600,
  });

  const prevBtn = document.querySelector('.choose__prev');
  const nextBtn = document.querySelector('.choose__next');

  const syncPrev = () => {
    prevBtn.classList.toggle('swiper-button-disabled', chooseSlider.realIndex === 0);
  };

  nextBtn.addEventListener('click', () => chooseSlider.slideNext());
  prevBtn.addEventListener('click', () => {
    if (chooseSlider.realIndex === 0) return;
    chooseSlider.slidePrev();
  });

  chooseSlider.on('slideChange', syncPrev);
  syncPrev();
}

// ========================================
// Footer — scroll to top
// ========================================
const toTop = document.querySelector('.footer__totop');
if (toTop) {
  toTop.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ========================================
// Popup — open via [data-popup], close via [data-popup-close] / overlay / Esc
// ========================================
const openPopup = (popup) => {
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
};

const closePopup = (popup) => {
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
};

document.querySelectorAll('[data-popup]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(btn.dataset.popup);
    if (target) openPopup(target);
  });
});

document.querySelectorAll('.popup').forEach((popup) => {
  popup.querySelectorAll('[data-popup-close]').forEach((el) => {
    el.addEventListener('click', () => closePopup(popup));
  });
});

// ========================================
// Menu — slide-out drawer opened by the burger
// ========================================
const menu = document.querySelector('.menu');
const burger = document.querySelector('.header__burger');

const openMenu = () => {
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();
};

const closeMenu = () => {
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
};

if (menu && burger) {
  burger.addEventListener('click', openMenu);
  menu.querySelectorAll('[data-menu-close]').forEach((el) => {
    el.addEventListener('click', closeMenu);
  });
  menu.querySelectorAll('.menu__nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const openedPopup = document.querySelector('.popup.is-open');
  if (openedPopup) closePopup(openedPopup);
  if (menu && menu.classList.contains('is-open')) closeMenu();
});

// intl-tel-input — auto-detect country from the typed phone number
const phoneInput = document.querySelector('#popup-phone');
if (phoneInput && typeof window.intlTelInput !== 'undefined') {
  window.intlTelInput(phoneInput, {
    initialCountry: 'us',
    nationalMode: false, // keep the full "+…" number inside the field, editable
    allowDropdown: false, // no manual picker — the flag only follows the typed number
  });

  // "+1" is a real (dark) value; the rest of the number is shown as a grey mask.
  const DIAL = '+1';
  phoneInput.value = DIAL;

  const field = phoneInput.closest('.popup__field');
  const hint = document.createElement('span');
  hint.className = 'popup__phone-hint';
  hint.setAttribute('aria-hidden', 'true');
  // Invisible "+1" reserves the exact width of the real value so the mask lines up after it
  hint.innerHTML = `<span class="popup__phone-hint-prefix">${DIAL}</span> (000)-000-00-00`;
  field.appendChild(hint);

  const syncHint = () => {
    const cs = getComputedStyle(phoneInput);
    hint.style.paddingLeft = cs.paddingLeft;
    hint.style.fontSize = cs.fontSize;
    // Show the mask only while nothing beyond the dial code has been typed
    hint.style.display = phoneInput.value.trim() === DIAL ? 'flex' : 'none';
  };

  phoneInput.addEventListener('input', syncHint);
  syncHint();
}