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

  // Always reset to '0' so counter rolls from 0 on every page visit
  nums.forEach(n => { n.textContent = '0'; });

  const animate = (el) => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    let curr = 0;
    const totalSteps = 60;
    const step = Math.max(1, Math.round(target / totalSteps));
    const tick = () => {
      curr += step;
      if (curr >= target) {
        el.textContent = target.toLocaleString() + suffix;
      } else {
        el.textContent = curr.toLocaleString() + suffix;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  // Threshold 0.2 — triggers as soon as stat cards are 20% visible
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });
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

  // ===== Interactive Project Map (Leaflet) =====
  const mapEl = document.getElementById('projectMap');
  if (mapEl && typeof L !== 'undefined') {

    const projectMap = L.map('projectMap', {
      zoomControl: false,           // we add it manually to bottom-right
      attributionControl: true
    }).setView([12.8900, 80.1600], 12);

    // ── Light branded tile layer (CartoDB Positron — clean white) ──
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(projectMap);

    // Move zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(projectMap);

    // ── Fit-All button (top-right) ─────────────────────────────
    const FitAll = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const btn = L.DomUtil.create('button', 'map-fitall-btn');
        btn.title = 'Show all sites';
        btn.innerHTML = '⊞';
        L.DomEvent.on(btn, 'click', () => {
          projectMap.flyToBounds(allBounds, { padding: [24, 24], duration: 1 });
          listContainer.querySelectorAll('.map-loc-item').forEach(el => el.classList.remove('active'));
        });
        return btn;
      }
    });
    new FitAll().addTo(projectMap);

    // ── Animated pulse marker ──────────────────────────────────
    const makePinIcon = (active = false) => L.divIcon({
      className: '',
      html: `
        <div class="mr-pin-wrap${active ? ' mr-pin-active' : ''}">
          <div class="mr-pin-dot"></div>
          <div class="mr-pin-pulse"></div>
        </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 28],
      popupAnchor: [0, -30]
    });
    const pinIcon       = makePinIcon(false);
    const pinIconActive = makePinIcon(true);

    // ── Project locations ──────────────────────────────────────
    const workSites = [
      { id: 1, name: 'Ponmar',        coords: [12.8727, 80.1765], images: ['IMG/R1.webp',  'IMG/L1.jpg']  },
      { id: 2, name: 'Madambakkam',   coords: [12.8884, 80.1593], images: ['IMG/R2.jpg',   'IMG/L2.png']  },
      { id: 3, name: 'Perungalathur', coords: [12.9064, 80.0984], images: ['IMG/L11.webp', 'IMG/R11.webp']},
      { id: 4, name: 'Sithalapakkam', coords: [12.8797, 80.1904], images: ['IMG/R22.webp', 'IMG/L22.webp']},
      { id: 5, name: 'Karapakkam',    coords: [12.9157, 80.2285], images: ['IMG/L1.jpg',   'IMG/R1.webp'] },
      { id: 6, name: 'Agaram Then',   coords: [12.8752, 80.1472], images: ['IMG/L2.png',   'IMG/R2.jpg']  },
      { id: 7, name: 'Kovilancheri',  coords: [12.8631, 80.1795], images: ['IMG/R11.webp', 'IMG/L11.webp']}
    ];

    const listContainer = document.getElementById('mapLocationList');
    const mapMarkers    = {};
    const sidebarItems  = {};
    let sliderInterval  = null;
    let activeId        = null;

    // Compute bounds for fit-all
    const allBounds = L.latLngBounds(workSites.map(s => s.coords));

    // ── Build markers & sidebar ────────────────────────────────
    workSites.forEach(site => {
      // Popup content
      const imgTags = site.images.map((src, i) =>
        `<img src="${src}" alt="${site.name}" class="${i === 0 ? 'active' : ''}">`
      ).join('');

      const popup = L.popup({
        maxWidth: 230,
        minWidth: 200,
        className: 'mr-map-popup',
        closeButton: true
      }).setContent(`
        <div class="mr-popup-inner">
          <div class="map-popup-slider" id="mslider-${site.id}">${imgTags}</div>
          <div class="mr-popup-footer">
            <span class="mr-popup-dot">📍</span>
            <strong>${site.name} Project Site</strong>
          </div>
        </div>`);

      const marker = L.marker(site.coords, { icon: pinIcon }).addTo(projectMap);
      marker.bindPopup(popup);
      mapMarkers[site.id] = marker;

      // Image slideshow on popup open
      marker.on('popupopen', () => {
        // Update icons
        if (activeId && mapMarkers[activeId]) mapMarkers[activeId].setIcon(pinIcon);
        activeId = site.id;
        marker.setIcon(pinIconActive);

        // Highlight sidebar
        Object.values(sidebarItems).forEach(el => el.classList.remove('active'));
        if (sidebarItems[site.id]) sidebarItems[site.id].classList.add('active');

        // Auto-slide images
        const sliderEl = document.getElementById(`mslider-${site.id}`);
        if (!sliderEl) return;
        const imgs = sliderEl.querySelectorAll('img');
        if (imgs.length <= 1) return;
        let idx = 0;
        if (sliderInterval) clearInterval(sliderInterval);
        sliderInterval = setInterval(() => {
          imgs[idx].classList.remove('active');
          idx = (idx + 1) % imgs.length;
          imgs[idx].classList.add('active');
        }, 2200);
      });

      marker.on('popupclose', () => {
        marker.setIcon(pinIcon);
        activeId = null;
        if (sliderInterval) { clearInterval(sliderInterval); sliderInterval = null; }
        Object.values(sidebarItems).forEach(el => el.classList.remove('active'));
      });

      // Sidebar item
      const item = document.createElement('div');
      item.className = 'map-loc-item';
      item.innerHTML = `<strong>${site.name}</strong><small>Tap to view</small>`;
      item.addEventListener('click', () => {
        projectMap.flyTo(site.coords, 16, { animate: true, duration: 1.2 });
        setTimeout(() => marker.openPopup(), 1300);
      });
      listContainer.appendChild(item);
      sidebarItems[site.id] = item;
    });

    // ── Invalidate on scroll-reveal ────────────────────────────
    const mapObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => projectMap.invalidateSize(), 200);
          mapObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    mapObserver.observe(mapEl);
  }

});


