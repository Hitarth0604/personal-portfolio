import { projects } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  const homeView = document.getElementById('home-view');
  const csView = document.getElementById('case-study-view');
  
  // Custom Cursor
  const cursor = document.getElementById('custom-cursor');
  document.addEventListener('mousemove', (e) => {
    if(window.innerWidth > 900) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    }
  });

  // Lightbox Elements
  const lightbox = document.getElementById('lightbox-overlay');
  const lbImg = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');
  let currentGalleryImages = [];
  let currentLbIndex = 0;

  function openLightbox(index, imagesArr) {
    currentGalleryImages = imagesArr;
    currentLbIndex = index;
    lbImg.src = currentGalleryImages[currentLbIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function lbShowPrev(e) {
    if(e) e.stopPropagation();
    currentLbIndex = (currentLbIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    lbImg.src = currentGalleryImages[currentLbIndex];
  }

  function lbShowNext(e) {
    if(e) e.stopPropagation();
    currentLbIndex = (currentLbIndex + 1) % currentGalleryImages.length;
    lbImg.src = currentGalleryImages[currentLbIndex];
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lbShowPrev);
  lbNext.addEventListener('click', lbShowNext);
  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if(lightbox.classList.contains('active')) {
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') lbShowPrev();
      if(e.key === 'ArrowRight') lbShowNext();
    }
  });

  // Visual Index Logic
  const visualIndex = document.getElementById('visual-index');
  const indexContainer = document.getElementById('index-list-container');
  const btnIndex = document.getElementById('btn-index');
  const btnIndexClose = document.getElementById('btn-index-close');

  function renderVisualIndex() {
    indexContainer.innerHTML = '';
    projects.forEach((project, index) => {
      const num = String(index + 1).padStart(2, '0');
      const item = document.createElement('div');
      item.innerHTML = `
        <div class="index-item" onclick="window.location.hash='${project.id}-cs'">
          <div>${num}</div>
          <div>${project.title}</div>
          <div class="meta" style="text-align: right; margin-top: 0;">${project.category}</div>
        </div>
        <img src="${project.heroImage}" class="index-preview" loading="lazy">
      `;
      indexContainer.appendChild(item);
    });
  }

  btnIndex.addEventListener('click', (e) => {
    e.preventDefault();
    visualIndex.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  btnIndexClose.addEventListener('click', () => {
    visualIndex.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Scroll Listeners (Nav only)
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const nav = document.getElementById('nav');
    if (scrolled > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });

  // Router Logic with transition
  function handleRoute() {
    const hash = window.location.hash.substring(1); 
    visualIndex.classList.remove('active');
    document.body.style.overflow = '';

    if (!hash || hash === 'work' || hash === 'about' || hash === 'contact' || hash === 'experience') {
      csView.style.display = 'none';
      homeView.style.display = 'block';
      
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({top: y, behavior: 'smooth'});
          }
        }, 50);
      } else {
        window.scrollTo(0, 0);
      }
    } else if (hash.endsWith('-cs')) {
      const projectId = hash.replace('-cs', '');
      const project = projects.find(p => p.id === projectId);
      if (project) {
        renderCaseStudy(project);
        
        homeView.style.display = 'none';
        csView.style.display = 'block';
        window.scrollTo(0, 0);
      } else {
        window.location.hash = ''; 
      }
    } else {
      // It's a jump to an anchor inside homeView like #awaken-branding
      csView.style.display = 'none';
      homeView.style.display = 'block';
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 50);
    }
  }

  function renderCaseStudy(project) {
    const pIndex = projects.findIndex(p => p.id === project.id);
    document.getElementById('cs-num').textContent = String(pIndex + 1).padStart(2, '0');
    document.getElementById('cs-title').textContent = project.title;
    document.getElementById('cs-category').textContent = project.category;
    document.getElementById('cs-year').textContent = project.year;
    document.getElementById('cs-role').textContent = project.role;
    document.getElementById('cs-tools').textContent = project.tools;
    document.getElementById('cs-client').textContent = project.client;
    document.getElementById('cs-overview').textContent = project.overview;
    
    const heroImg = document.getElementById('cs-hero-img');
    heroImg.src = project.heroImage;
    
    // Animate hero entering
    heroImg.style.transform = 'scale(0.98)';
    heroImg.style.opacity = '0.5';
    heroImg.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      heroImg.style.transform = 'scale(1)';
      heroImg.style.opacity = '1';
    }, 50);
    
    // Render dynamic sections
    const dynamicContainer = document.getElementById('cs-dynamic-content');
    dynamicContainer.innerHTML = '';
    
    // Accumulate all images for lightbox context if needed, or we can scope it per section.
    // Let's scope lightbox per section for cleaner arrays, or global per project.
    // We will do global per project so user can cycle through everything.
    let allProjectImages = [];
    project.sections.forEach(sec => {
      allProjectImages = allProjectImages.concat(sec.images);
    });

    let currentImgOffset = 0;

    project.sections.forEach(section => {
      const secWrapper = document.createElement('div');
      secWrapper.className = 'grid-12 cs-section';
      
      const titleWrapper = document.createElement('div');
      titleWrapper.style.gridColumn = '1 / 13';
      titleWrapper.innerHTML = `<div class="meta cs-section-title">${section.title}</div>`;
      secWrapper.appendChild(titleWrapper);

      const gallery = document.createElement('div');
      gallery.style.gridColumn = '1 / 13';
      
      if(section.layout === 'full-width') gallery.className = 'cs-gallery-full';
      else if(section.layout === '50-50') gallery.className = 'cs-gallery-50-50';
      else if(section.layout === '70-30') gallery.className = 'cs-gallery-70-30';
      else if(section.layout === 'editorial-collage') gallery.className = 'cs-gallery-editorial';
      else if(section.layout === '3-col') gallery.className = 'cs-gallery-3-col';
      else gallery.className = 'cs-gallery-full';

      section.images.forEach((src) => {
        const imgIndex = currentImgOffset;
        currentImgOffset++;
        
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-img';
        img.addEventListener('click', () => {
          openLightbox(imgIndex, allProjectImages);
        });
        gallery.appendChild(img);
      });
      
      secWrapper.appendChild(gallery);
      dynamicContainer.appendChild(secWrapper);
    });
    
    // Testimonial
    if(project.testimonial) {
      const testWrapper = document.createElement('div');
      testWrapper.className = 'grid-12';
      const t = project.testimonial;
      
      let html = '';
      if(t.layout === 'split') {
        html = `
          <div class="cs-testimonial cs-testi-split">
            <div class="testi-left">
              <div class="meta mb-4">CLIENT NOTE</div>
              <div class="cs-testimonial-text">"${t.text}"</div>
            </div>
            <div class="testi-right">
              <div class="meta">${t.author}</div>
              <div class="meta" style="color: var(--text-muted);">${t.role}</div>
            </div>
          </div>
        `;
      } else if (t.layout === 'center') {
        html = `
          <div class="cs-testimonial cs-testi-center">
            <div class="meta mb-4">CLIENT NOTE</div>
            <div class="cs-testimonial-text">"${t.text}"</div>
            <div class="meta">${t.author}</div>
            <div class="meta" style="color: var(--text-muted);">${t.role}</div>
          </div>
        `;
      } else {
        html = `
          <div class="cs-testimonial cs-testi-default">
            <div class="meta mb-4">CLIENT NOTE</div>
            <div class="cs-testimonial-text">"${t.text}"</div>
            <div class="meta">${t.author}</div>
            <div class="meta" style="color: var(--text-muted);">${t.role}</div>
          </div>
        `;
      }
      
      testWrapper.innerHTML = html;
      dynamicContainer.appendChild(testWrapper);
    }
    
    // Navigation
    const prevIndex = (pIndex - 1 + projects.length) % projects.length;
    const nextIndex = (pIndex + 1) % projects.length;
    const prevProject = projects[prevIndex];
    const nextProject = projects[nextIndex];
    
    document.getElementById('cs-prev-title').textContent = prevProject.title;
    document.getElementById('cs-prev').href = `#${prevProject.id}-cs`;
    
    document.getElementById('cs-next-title').textContent = nextProject.title;
    document.getElementById('cs-next').href = `#${nextProject.id}-cs`;
  }

  // Scroll Reveal Animation
  function initObserver() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  
  // Custom Cursor hover triggers
  function initHoverTriggers() {
    document.querySelectorAll('.hover-trigger').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if(window.innerWidth > 900) {
          cursor.classList.add('active');
          cursor.textContent = el.getAttribute('data-cursor') || 'VIEW';
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('active');
      });
    });
  }

  document.getElementById('back-btn').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = ''; 
  });

  // Initialization
  renderVisualIndex();
  initObserver();
  initHoverTriggers();
  handleRoute();
  
  window.addEventListener('hashchange', handleRoute);
});
