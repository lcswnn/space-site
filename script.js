// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 80) {
    // Scrolling down
    navbar.classList.add('hide');
  } else {
    // Scrolling up
    navbar.classList.remove('hide');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Avoid negative scroll
});


// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Dynamic gradient following mouse cursor on title
const title = document.querySelector('.title-space h1');

title.addEventListener('mousemove', (e) => {
  const rect = title.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;
  
  title.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, 
    rgb(254, 234, 132) 0%, 
    #f7f7d5ff 10%, 
    var(--white) 30%)`;
  title.style.webkitBackgroundClip = 'text';
  title.style.webkitTextFillColor = 'transparent';
  title.style.backgroundClip = 'text';
});

title.addEventListener('mouseleave', () => {
  title.style.background = 'var(--white)';
  title.style.webkitBackgroundClip = 'text';
  title.style.webkitTextFillColor = 'transparent';
  title.style.backgroundClip = 'text';
});


// ===== Reveal on Scroll =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // reveal only once
      }
    });
  },
  { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
(async function loadAPOD() {
  const container = document.getElementById('apod-container');
  const media = container.querySelector('.apod-media');
  const captionEl = container.querySelector('#apod-title');
  const linkEl = container.querySelector('#apod-link');

  try {
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true');
    if (!res.ok) throw new Error(`APOD HTTP ${res.status}`);
    const data = await res.json();

    // Choose the best image URL
    let url =
      data.media_type === 'image'
        ? (data.hdurl || data.url)
        : data.thumbnail_url; // when it's a video

    // If API throttled or fields missing
    if (!url) throw new Error('No image URL in APOD payload');

    // Avoid mixed content (http on https site)
    url = url.replace(/^http:\/\//i, 'https://');

    // Build image
    const img = new Image();
    img.alt = data.title || 'Astronomy Picture of the Day';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => container.classList.remove('loading');
    img.onerror = () => {
      container.classList.remove('loading');
      captionEl.textContent = 'Failed to load APOD image.';
    };
    img.src = url;

    // Insert only into the media area
    media.innerHTML = '';
    media.appendChild(img);

    // Caption + link
    captionEl.textContent = data.title || '';
    linkEl.href = (data.hdurl || data.url || url);
  } catch (err) {
    console.warn(err);
    container.classList.remove('loading');
    media.innerHTML = '';
    captionEl.textContent = 'APOD unavailable right now. Try again later.';
    linkEl.removeAttribute('href');
  }
})();

