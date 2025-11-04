// Simple Navbar Highlight & Interactivity
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".navbar nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  
  console.log("Admin Dashboard Loaded ");
});
