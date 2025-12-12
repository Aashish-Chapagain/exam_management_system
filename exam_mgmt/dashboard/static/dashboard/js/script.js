// Simple Navbar Highlight & Interactivity
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".navbar nav a");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  console.log("Admin Dashboard Loaded");

  // Auto-fade success messages
  setTimeout(() => {
    document.querySelectorAll(".success-text").forEach((el) => {
      el.style.transition = "opacity 0.5s ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 500);
    });
  }, 2000);
});
