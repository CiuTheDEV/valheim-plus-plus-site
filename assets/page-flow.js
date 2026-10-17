// Płynne przejścia między stronami we wszystkich przeglądarkach: przy opuszczaniu strony treść gaśnie (CSS: body.page-leaving),
// a nowa strona wsuwa się animacją na <main>. Linki do kotwic na tej samej stronie i pobieranie nie są przechwytywane.
const clean = path => path.replace(/index\.html$/, '');
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download') || link.matches('[data-download]')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  if (clean(url.pathname) === clean(location.pathname) && url.search === location.search) return;
  event.preventDefault();
  document.body.classList.add('page-leaving');
  setTimeout(() => { location.href = url.href; }, 170);
});
addEventListener('pageshow', event => { if (event.persisted) document.body.classList.remove('page-leaving'); });
