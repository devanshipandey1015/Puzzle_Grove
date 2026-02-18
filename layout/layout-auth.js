/**
 * Auth state for layout header (login/logout buttons). Run on every page so header shows correct state.
 */
(function () {
    function getCurrentUser() {
        try {
            return window.safeParseJSON && window.safeParseJSON(localStorage.getItem('puzzleGroveUser'), null);
        } catch (_) {
            return null;
        }
    }

    function updateUI() {
        var loginBtn = document.getElementById('loginBtn');
        var logoutBtn = document.getElementById('logoutBtn');
        if (!loginBtn || !logoutBtn) return;
        var user = getCurrentUser();
        if (user && typeof user.username === 'string') {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = '';
        } else {
            loginBtn.style.display = '';
            logoutBtn.style.display = 'none';
        }
    }

    function bind() {
        var loginBtn = document.getElementById('loginBtn');
        var logoutBtn = document.getElementById('logoutBtn');
        if (loginBtn) loginBtn.addEventListener('click', function () { window.location.href = 'login.html'; });
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                try { localStorage.removeItem('puzzleGroveUser'); } catch (_) {}
                updateUI();
            });
        }
    }

    function init() {
        updateUI();
        bind();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
