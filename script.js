document.addEventListener('DOMContentLoaded', () => {

  // ===== Preloader =====
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 800);
  });
  // Fallback: hide preloader after 3 seconds even if load event didn't fire
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 3000);

  // ===== Sticky header =====
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.remove('transparent');
      header.classList.add('solid');
    } else {
      header.classList.add('transparent');
      header.classList.remove('solid');
    }
  });

  // ===== Year =====
  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== Counter animation =====
  const nums = document.querySelectorAll('.num');
  const animate = (el) => {
    const target = +el.dataset.target;
    let curr = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      curr += step;
      if (curr >= target) { el.textContent = target; }
      else { el.textContent = curr; requestAnimationFrame(tick); }
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animate(e.target); counterObserver.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(n => counterObserver.observe(n));

  // ===== Mobile hamburger menu =====
  const toggle = document.getElementById('menuToggle');
  const menu = document.querySelector('.menu');
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
  });
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== Scroll Reveal Animations =====
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // ===== Team Slideshow (left & right cycling images) =====
  function initSlideshow(containerId, intervalMs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const slides = container.querySelectorAll('.team-slide');
    if (slides.length <= 1) return;
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, intervalMs);
  }
  initSlideshow('teamSlideLeft', 3000);
  initSlideshow('teamSlideRight', 4000);

  // ===== Lightbox =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.querySelector('.lightbox-close');

  document.querySelectorAll('.lightbox-trigger').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxCaption.textContent = img.alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });

  // ===== Contact Form =====
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
      name: document.getElementById('contactName').value,
      phone: document.getElementById('contactPhone').value,
      service: document.getElementById('contactService').value,
      message: document.getElementById('contactMessage').value
    };

    // Simulate form submission (replace with real endpoint like EmailJS/Formspree)
    setTimeout(() => {
      // Build WhatsApp message as fallback
      const waMessage = encodeURIComponent(
        `Hello MR UPVC!\n\n` +
        `Name: ${formData.name}\n` +
        `Phone: ${formData.phone}\n` +
        `Service: ${formData.service || 'Not specified'}\n\n` +
        `Message: ${formData.message}`
      );

      // Show success message
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';

      // Open WhatsApp with the form data
      window.open(`https://wa.me/916382528529?text=${waMessage}`, '_blank');

      // Reset form after 5 seconds
      setTimeout(() => {
        contactForm.style.display = 'block';
        formSuccess.style.display = 'none';
        contactForm.reset();
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
      }, 5000);
    }, 1000);
  });

});
