// Wejścia elementów przy przewijaniu (.reveal): wspólne dla landingu i poradnika. Po zakończeniu wejścia klasy znikają,
// żeby zwykłe style (np. unoszenie karty po najechaniu) działały bez opóźnień i nadpisań.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      element.classList.add('is-visible');
      setTimeout(() => element.classList.remove('will-reveal', 'is-visible', 'revealed'), 1300);
      observer.unobserve(element);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
}
