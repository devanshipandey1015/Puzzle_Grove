/**
 * Shared layout: injects Header and Footer into every page.
 * Each page must have: <div id="layout-header-slot"></div>, <main id="layout-main">...</main>, <div id="layout-footer-slot"></div>
 * Include this script first so header/footer exist before other scripts run.
 */
(function () {
    function getHeaderHTML() {
        return (
            '<header class="layout-header" role="banner">' +
            '<a href="index.html" class="layout-logo">Puzzle Grove</a>' +
            '<div class="layout-header-actions">' +
            '<button type="button" id="themeToggle" class="theme-toggle-btn" data-theme-toggle aria-label="Toggle dark mode" title="Toggle dark mode">' +
            '<i class="theme-toggle-icon fas fa-moon"></i></button>' +
            '<div class="auth-buttons">' +
            '<button id="loginBtn" class="auth-btn" type="button" aria-label="Log in">Login</button>' +
            '<button id="logoutBtn" class="auth-btn" type="button" aria-label="Log out" style="display:none;">Logout</button>' +
            '</div></div></header>'
        );
    }

    function getFooterHTML() {
        return (
            '<footer class="page-footer" role="contentinfo">' +
            '<p class="footer-copyright">© 2025 Puzzle Grove — Enhance your vocabulary while having fun!</p>' +
            '<p class="footer-credit">Made by <span class="footer-credit-name">Devanshi</span></p>' +
            '<div class="social-links" role="navigation" aria-label="Footer links">' +
            '<a href="https://github.com/devanshipandey1015" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">' +
            '<i class="fab fa-github" aria-hidden="true"></i></a>' +
            '<a href="admin-login.html" class="social-link social-link-admin" title="Admin Access" aria-label="Admin access">' +
            '<i class="fas fa-shield-alt" aria-hidden="true"></i></a>' +
            '</div>' +
            '</footer>'
        );
    }

    function init() {
        var headerSlot = document.getElementById('layout-header-slot');
        var footerSlot = document.getElementById('layout-footer-slot');
        if (headerSlot) headerSlot.innerHTML = getHeaderHTML();
        if (footerSlot) footerSlot.innerHTML = getFooterHTML();
        if (typeof window.themeToggle !== 'undefined' && window.themeToggle.init) window.themeToggle.init();
    }

    /* Run immediately when script loads (script is at end of body, so slots exist) */
    init();
})();
