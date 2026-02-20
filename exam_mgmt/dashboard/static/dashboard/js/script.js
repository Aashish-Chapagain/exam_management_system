// Dark Mode Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.querySelector('.theme-icon');
  const body = document.body;

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
  }

  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Update icon and save preference
    if (body.classList.contains('dark-mode')) {
      themeIcon.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
      
      // Add a fun animation
      themeToggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
      }, 300);
    } else {
      themeIcon.textContent = '🌙';
      localStorage.setItem('theme', 'light');
      
      // Add a fun animation
      themeToggle.style.transform = 'rotate(-360deg)';
      setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
      }, 300);
    }
  });

  // Navbar link interactivity
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute('href') !== '#') {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  // Card hover sound effect (optional)
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
  });

  // Auto-fade alert messages
  setTimeout(() => {
    document.querySelectorAll(".alert").forEach((el) => {
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      el.style.opacity = "0";
      el.style.transform = "translateY(-20px)";
      setTimeout(() => el.remove(), 500);
    });
  }, 5000);

  // Add smooth scroll for anchor links
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

  // Add card entrance animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(card);
  });

  console.log("✨ Exam Management Dashboard Loaded Successfully!");
});
