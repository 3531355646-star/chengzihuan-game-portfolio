const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.copy-email').forEach((button) => {
  button.addEventListener('click', async () => {
    const email = button.dataset.copy;
    const originalLabel = '复制 <span>▣</span>';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const field = document.createElement('textarea');
        field.value = email;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      button.innerHTML = '已复制 <span>✓</span>';
      window.setTimeout(() => { button.innerHTML = originalLabel; }, 1600);
    } catch {
      button.textContent = '复制失败';
      window.setTimeout(() => { button.innerHTML = originalLabel; }, 1600);
    }
  });
});

document.querySelectorAll('.case-study').forEach((section) => {
  const button = section.querySelector('.read-toggle');
  const layout = section.querySelector('.case-layout');
  const frame = section.querySelector('.case-reader iframe');
  const reader = section.querySelector('.case-reader');

  button.addEventListener('click', () => {
    const isOpen = layout.classList.toggle('reader-open');
    button.setAttribute('aria-expanded', String(isOpen));
    reader.setAttribute('aria-hidden', String(!isOpen));
    button.innerHTML = isOpen ? '收起全文 <span>↙</span>' : '阅读全文 <span>↗</span>';
    if (isOpen && !frame.hasAttribute('src')) frame.setAttribute('src', frame.dataset.src);
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const revealTargets = document.querySelectorAll(
    '.profile-panel, .internship-panel, .project-card-large, .project-card-small, .case-study .section-heading, .case-gallery figure, .games-section .section-heading, .game-row, .game-collage, .contact-section .contact-actions'
  );
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
    revealObserver.observe(element);
  });
}

const scrollMeter = document.querySelector('.scroll-meter span');
let meterFrame = 0;
const updateScrollMeter = () => {
  if (meterFrame) return;
  meterFrame = requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    scrollMeter.style.height = `${progress * 100}%`;
    meterFrame = 0;
  });
};
window.addEventListener('scroll', updateScrollMeter, { passive: true });
window.addEventListener('resize', updateScrollMeter);
updateScrollMeter();

// Keep scrolling within the current page; switch pages only after reaching its edge.
const pageSections = [...document.querySelectorAll('main > section')];
let pageFlipLocked = false;
window.addEventListener('wheel', (event) => {
  if (window.matchMedia('(max-width: 650px)').matches || event.ctrlKey) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  if (event.target instanceof Element && event.target.closest('iframe, .case-reader')) return;

  if (pageFlipLocked) {
    event.preventDefault();
    return;
  }

  const anchorY = window.innerHeight * 0.35;
  const currentIndex = pageSections.findIndex((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= anchorY && rect.bottom > anchorY;
  });
  if (currentIndex < 0) return;

  const current = pageSections[currentIndex];
  const rect = current.getBoundingClientRect();
  const direction = event.deltaY > 0 ? 1 : -1;
  const atPageEdge = direction > 0
    ? rect.bottom <= window.innerHeight + 4
    : rect.top >= -4;
  if (!atPageEdge) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= pageSections.length) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  pageFlipLocked = true;
  pageSections[nextIndex].scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'start'
  });
  window.setTimeout(() => { pageFlipLocked = false; }, 900);
}, { passive: false });
