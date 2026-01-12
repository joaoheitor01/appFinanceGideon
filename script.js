document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Optional: Close sidebar when clicking outside of it on mobile
    document.addEventListener('click', (event) => {
        // Check if the screen is mobile-sized and the sidebar is open
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggleButton = toggleButton.contains(event.target);

            if (!isClickInsideSidebar && !isClickOnToggleButton) {
                sidebar.classList.remove('open');
            }
        }
    });
});