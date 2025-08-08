// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
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
    #feefa2ff 0%, 
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
