// Highlight active nav link
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// Smooth submit button feedback
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.submit-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      btn.textContent = 'Sent! Thanks ✦';
      btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      setTimeout(() => {
        btn.textContent = 'Send my piece ✦';
        btn.style.background = '';
      }, 2500);
    });
  }
});
