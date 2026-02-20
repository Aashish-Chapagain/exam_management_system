// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
    
    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Update icon and save preference
            if (document.body.classList.contains('dark-mode')) {
                if (themeIcon) themeIcon.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                if (themeIcon) themeIcon.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }
});
