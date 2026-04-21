// Shared components injected into every page

const NAV_HTML = `
<nav>
  <div class="nav-logo">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="rgba(255,255,255,0.2)"/>
      <path d="M14 4 L15.8 10.5 L22 8.5 L17.5 13.5 L22.5 16.5 L16 15.8 L14.5 22 L12.5 15.8 L6 16.5 L11 13.5 L6.5 8.5 L13 10.5 Z" fill="white" opacity="0.9"/>
      <path d="M14 10 Q17.5 14 14 22 Q10.5 14 14 10Z" fill="rgba(255,220,100,0.85)"/>
    </svg>
    Creative Generation
  </div>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="art.html">Art</a></li>
    <li><a href="ebooks.html">E-Books</a></li>
    <li><a href="articles.html">Articles</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="friends.html">Friends</a></li>
  </ul>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-links">
    <a href="index.html">Home</a>
    <a href="art.html">Art</a>
    <a href="ebooks.html">E-Books</a>
    <a href="articles.html">Articles</a>
    <a href="about.html">About</a>
    <a href="friends.html">Friends</a>
  </div>
  <div>&copy; 2026 Creative Generation &middot; All rights reserved</div>
  <div class="footer-copy">&copy; 2026 Creative Generation &middot; All rights reserved &middot; <a href="/admin/" style="color:rgba(255,255,255,0.3);text-decoration:none;font-size:11px;">✦ admin</a></div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) navPlaceholder.outerHTML = NAV_HTML;

  // Inject footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.outerHTML = FOOTER_HTML;

  // Active link
  const links = document.querySelectorAll('.nav-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });

  // Submit button
  const btn = document.querySelector('.submit-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.textContent = 'Sent! Thanks ✦';
      btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      setTimeout(() => { btn.textContent = original; btn.style.background = ''; }, 2500);
    });
  }
});
