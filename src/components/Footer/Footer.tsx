import React from 'react';

/**
 * Single shared footer used across all pages.
 * - Copyright text
 * - "Made by Devanshi"
 * - GitHub icon (new tab, noopener noreferrer)
 * - Admin icon
 * Icons have aria-labels for accessibility.
 */
export function Footer(): React.ReactElement {
  return (
    <footer className="page-footer" role="contentinfo">
      <p className="footer-copyright">
        © 2025 Puzzle Grove — Enhance your vocabulary while having fun!
      </p>
      <nav className="social-links" role="navigation" aria-label="Footer links">
        <a
          href="https://github.com/devanshipandey1015"
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
        >
          <i className="fab fa-github" aria-hidden="true" />
        </a>
        <a
          href="admin-login.html"
          className="social-link social-link-admin"
          title="Admin Access"
          aria-label="Admin access"
        >
          <i className="fas fa-shield-alt" aria-hidden="true" />
        </a>
      </nav>
      <p className="footer-credit">
        Made by <span className="footer-credit-name">Devanshi</span>
      </p>
    </footer>
  );
}

export default Footer;
