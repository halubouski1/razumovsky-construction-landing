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
  const sliderEl = document.querySelector('.services-slider');
  const wrapper = sliderEl.querySelector('.swiper-wrapper');
  // Pristine markup (the original 4 cards) — restored when the slider is torn
  // down for the mobile stacking layout.
  const originalHTML = wrapper.innerHTML;
  const prevBtn = document.querySelector('.services__prev');
  const nextBtn = document.querySelector('.services__next');
  let servicesSlider = null;

  const syncPrev = () => {
    if (!servicesSlider) return;
    prevBtn.classList.toggle('swiper-button-disabled', servicesSlider.realIndex === 0);
  };

  const initServices = () => {
    if (servicesSlider) return;
    wrapper.innerHTML = originalHTML;
    // Swiper needs enough slides for loop mode; clone the cards until there are plenty.
    const slides = Array.from(wrapper.children);
    while (wrapper.children.length < 12) {
      slides.forEach((slide) => wrapper.appendChild(slide.cloneNode(true)));
    }
    servicesSlider = new Swiper(sliderEl, {
      slidesPerView: 'auto',
      loop: true,
      speed: 600,
      breakpoints: {
        571: { spaceBetween: 10 }, // 571px to 1919px
        1920: { spaceBetween: 14 }, // 1920px and up
      },
    });
    servicesSlider.on('slideChange', syncPrev);
    syncPrev();
  };

  const destroyServices = () => {
    if (!servicesSlider) return;
    servicesSlider.destroy(true, true);
    servicesSlider = null;
    wrapper.innerHTML = originalHTML; // back to the pristine 4 cards for the stack
  };

  // Below 570px the slider becomes a sticky stack of the 4 original cards.
  const mqStack = window.matchMedia('(max-width: 570px)');
  const applyServices = () => (mqStack.matches ? destroyServices() : initServices());
  applyServices();
  mqStack.addEventListener('change', applyServices);

  nextBtn.addEventListener('click', () => servicesSlider && servicesSlider.slideNext());
  prevBtn.addEventListener('click', () => {
    if (!servicesSlider || servicesSlider.realIndex === 0) return;
    servicesSlider.slidePrev();
  });
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

// ========================================
// Smooth scroll for in-page anchor links (menu / header / footer)
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href) return;
  if (href === '#') {
    // Bare placeholder link — don't let it jump to the top
    link.addEventListener('click', (e) => e.preventDefault());
    return;
  }
  const target = document.querySelector(href);
  if (!target) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (menu && menu.classList.contains('is-open')) closeMenu();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
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

// preloader
document.body.style.overflow = 'hidden';
const loader = () => {
    document.body.style.overflow = '';
    const preloader = document.getElementById('preloader');
    const fadeout = setInterval(() => {
        const opacity = getComputedStyle(preloader).opacity;
        opacity > 0 ? preloader.style.opacity = opacity - 0.1000 : (clearInterval(fadeout), preloader.remove());
    }, 15);
}

setTimeout(() => loader(), 5000);