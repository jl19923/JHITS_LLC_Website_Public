const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}
toggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    toggle.focus();
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('jhits@jhits.es');
    status.textContent = 'Correo copiado.';
  } catch {
    status.textContent = 'Puedes seleccionar y copiar el correo: jhits@jhits.es';
  }
});

// Motion is optional; all content remains usable without it.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('.motion-toggle');
let userPaused = false;
try { userPaused = localStorage.getItem('jhits-motion') === 'paused'; } catch {}
const motionOff = () => userPaused || reducedMotion.matches;
const tiltSurfaces = document.querySelectorAll('.tilt-surface');
const reveals = document.querySelectorAll('.section-heading, .service-grid article, .process > div, .process li, .company > *, .demo-copy, .comparison, .contact > *');
let revealObserver;
function resetTilt() {
  tiltSurfaces.forEach(el => { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
}
function syncMotion() {
  document.body.classList.toggle('motion-paused', motionOff());
  motionButton.setAttribute('aria-pressed', String(motionOff()));
  motionButton.textContent = motionOff() ? (reducedMotion.matches ? 'Movimiento reducido' : 'Activar efectos') : 'Pausar efectos';
  if (reducedMotion.matches) motionButton.textContent = 'Movimiento reducido';
  motionButton.disabled = reducedMotion.matches;
  if (motionOff()) {
    resetTilt();
    reveals.forEach(el => el.classList.remove('pending'));
    revealObserver?.disconnect();
  }
  updateScroll();
}
motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  try { localStorage.setItem('jhits-motion', userPaused ? 'paused' : 'enabled'); } catch {}
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
finePointer.addEventListener('change', resetTilt);
if ('IntersectionObserver' in window && !motionOff()) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach((el, index) => {
    // Avoid hiding elements already in view or a current anchor destination.
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('reveal', 'pending');
      el.style.setProperty('--delay', `${(index % 3) * 65}ms`);
      revealObserver.observe(el);
    }
  });
}
tiltSurfaces.forEach(el => {
  let frame = 0;
  el.addEventListener('pointermove', event => {
    if (motionOff() || !finePointer.matches) return;
    cancelAnimationFrame(frame);
    const bounds = el.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    frame = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${-y * 7}deg`);
      el.style.setProperty('--ry', `${x * 9}deg`);
    });
  });
  el.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
  });
});
const progress = document.querySelector('.reading-progress');
const visual = document.querySelector('.hero-visual');
let scrollFrame = 0;
function updateScroll() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0})`;
  document.querySelector('.header').classList.toggle('scrolled', scrollY > 15);
  visual.style.setProperty('--parallax', motionOff() || !finePointer.matches ? '0px' : `${Math.min(scrollY * 0.08, 30)}px`);
}
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => { updateScroll(); scrollFrame = 0; });
}, { passive: true });
window.addEventListener('resize', updateScroll);
const restoreRange = document.querySelector('#restore-range');
restoreRange.addEventListener('input', () => {
  document.querySelector('.comparison').style.setProperty('--split', `${Number(restoreRange.value)}%`);
  restoreRange.setAttribute('aria-valuetext', `${restoreRange.value} % de imagen limpia`);
});
syncMotion();
