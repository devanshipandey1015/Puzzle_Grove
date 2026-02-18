/**
 * Puzzle Grove theme toggle.
 * Uses data-theme="dark" on <html>; preference stored in localStorage as puzzleGroveTheme.
 * Run initTheme() in <head> (inline) to avoid flash; then themeToggle.init() after DOM ready.
 */
(function () {
    const STORAGE_KEY = 'puzzleGroveTheme';

    function getStored() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (_) {
            return null;
        }
    }

    function apply(theme) {
        var next = theme === 'dark' ? 'dark' : 'light';
        var html = document.documentElement;
        if (next === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch (_) {}
        /* Charts/visualizations can listen for this to redraw with theme colors */
        window.dispatchEvent(new CustomEvent('puzzlegrove-theme-change', { detail: { theme: next } }));
    }

    /** Call from <head> before body to prevent flash. */
    window.initTheme = function () {
        var stored = getStored();
        apply(stored === 'dark' ? 'dark' : 'light');
    };

    /** Toggle between light and dark. Returns new theme ('light' | 'dark'). */
    window.toggleTheme = function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        var next = isDark ? 'light' : 'dark';
        apply(next);
        return next;
    };

    /** Current theme: 'light' or 'dark'. */
    window.getTheme = function () {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    };

    /** Initialize toggle button(s): [data-theme-toggle] and #themeToggle. Updates aria-label and icon. */
    function updateToggleButton(btn) {
        if (!btn) return;
        var isDark = window.getTheme() === 'dark';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        var icon = btn.querySelector('.theme-toggle-icon');
        if (icon) {
            icon.className = 'theme-toggle-icon fas fa-' + (isDark ? 'sun' : 'moon');
        }
    }

    window.themeToggle = {
        init: function () {
            window.initTheme();
            var buttons = document.querySelectorAll('[data-theme-toggle], #themeToggle');
            buttons.forEach(function (btn) {
                if (btn._themeToggleBound) return;
                btn._themeToggleBound = true;
                updateToggleButton(btn);
                btn.addEventListener('click', function () {
                    window.toggleTheme();
                    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach(updateToggleButton);
                });
            });
            if (!window.themeToggle._changeBound) {
                window.themeToggle._changeBound = true;
                window.addEventListener('puzzlegrove-theme-change', function () {
                    document.querySelectorAll('[data-theme-toggle], #themeToggle').forEach(updateToggleButton);
                });
            }
        }
    };
})();
