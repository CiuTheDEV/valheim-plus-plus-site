// Chwila po kliknięciu „Pobierz launcher”: pieczęć na przycisku, kruk przelatujący przez ekran (klatki z assets/images/raven-flight.webp)
// i komunikat, co robić dalej.
// Pobieranie działa jak zwykły link — nic tu nie blokuje ani nie opóźnia kliknięcia.
const checkIcon = '<svg class="seal-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let busy = false;
let toast;

function showToast() {
  toast?.remove();
  toast = document.createElement('div');
  toast.className = 'download-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${checkIcon}<span><strong>Wyprawa się zaczyna.</strong> Uruchom <b>ValheimPlusPlus.exe</b> z folderu Pobrane.</span>`;
  document.body.append(toast);
  requestAnimationFrame(() => toast.classList.add('is-shown'));
  const mine = toast;
  const hide = () => { mine.classList.remove('is-shown'); setTimeout(() => mine.remove(), 400); };
  mine.addEventListener('click', hide);
  setTimeout(hide, 7000);
}

function flyRaven(button, calm) {
  const rect = button.getBoundingClientRect();
  const startX = rect.left + rect.width / 2, startY = rect.top + rect.height / 2;
  const bird = document.createElement('div');
  bird.className = 'download-raven-wrap';
  bird.innerHTML = '<div class="download-raven"></div>';
  bird.style.left = startX + 'px';
  bird.style.top = startY + 'px';
  document.body.append(bird);
  // Kruk leci w stronę wolniejszej połowy ekranu i znika w jego obrębie; z nagłówka schodzi w dół strony.
  // Przy ograniczonym ruchu leci krócej i spokojniej, bez przechyłów i powiększania.
  const dir = startX > innerWidth * 0.6 ? -1 : 1;
  const reach = calm ? 0.6 : 1;
  const dx = dir * Math.min(innerWidth * 0.5, (dir > 0 ? innerWidth - startX : startX) - 90) * reach;
  const rise = (startY >= 240 ? Math.min(startY - 80, 520) : -Math.min(innerHeight * 0.45, 380)) * reach;
  const tilt = calm ? 0 : (rise > 0 ? -9 : 8) * dir;
  const grow = calm ? 0.15 : 0.45;
  bird.style.setProperty('--flip', String(dir));
  const at = (p, scale, turn) => `translate(-50%,-50%) translate(${dx * p}px,${-rise * p}px) scale(${scale}) rotate(${turn}deg)`;
  const frames = [
    { transform: at(0, calm ? 0.8 : 0.35, 0), opacity: 0, offset: 0 },
    { transform: at(0.1, calm ? 0.85 : 0.65, tilt * 0.4), opacity: 1, offset: 0.14 },
    { transform: at(0.55, 1 + grow * 0.2, tilt), opacity: 1, offset: 0.62 },
    { transform: at(1, 1 + grow, tilt * 1.2), opacity: 0, offset: 1 }
  ];
  const flight = bird.animate(frames, { duration: calm ? 1300 : 1700, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
  flight.onfinish = flight.oncancel = () => bird.remove();
}

document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-download]');
  if (!button || busy || event.defaultPrevented) return;
  busy = true;
  const icon = button.querySelector('svg');
  const original = icon?.outerHTML;
  button.classList.add('is-sealed');
  if (icon) icon.outerHTML = checkIcon;
  flyRaven(button, motion.matches);
  showToast();
  setTimeout(() => {
    button.classList.remove('is-sealed');
    const seal = button.querySelector('.seal-check');
    if (seal && original) seal.outerHTML = original;
    busy = false;
  }, 3200);
});
