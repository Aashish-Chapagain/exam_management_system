setTimeout(() => {
    document.querySelectorAll(".success-message").forEach((el) => {
      el.style.transition = "opacity 0.5s ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 500);
    });
  }, 2000);


