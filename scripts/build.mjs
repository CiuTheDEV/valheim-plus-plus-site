import { readdir, readFile, mkdir, writeFile, cp, rm, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import {icon, iconText} from './icons.mjs';
import { renderLanding, renderHistory, renderMods } from './landing.mjs';

const project = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = path.resolve(process.argv[2] || project);
const out = path.join(root, 'dist');
const escape = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const markdown = new Marked();
const ids = new Map();
markdown.use({ renderer: {
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const base = text.replace(/<[^>]*>/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sekcja';
    const n = ids.get(base) || 0; ids.set(base, n + 1);
    return `<h${depth} id="${base}${n ? `-${n}` : ''}">${text}</h${depth}>`;
  },
  image({href,text}) {
    const safe=escape(href);return `<a class="guide-shot" href="${safe}" aria-label="Powiększ: ${escape(text)}"><img src="${safe}" alt="${escape(text)}" loading="lazy"><span>${escape(text)} <b aria-hidden="true">↗</b></span></a>`;
  },
  link({ href, title, tokens }) {
    const target = /^(?:[a-z]+:|\/\/)/i.test(href) ? href : href.replace(/\.md(?=$|[?#])/, '.html');
    if (/^(?:javascript|vbscript|data):/i.test(target)) return this.parser.parseInline(tokens);
    return `<a href="${escape(target)}"${title ? ` title="${escape(title)}"` : ''}>${this.parser.parseInline(tokens)}</a>`;
  }
} });
const files = (await readdir(path.join(root, 'poradnik'))).filter(f => f.endsWith('.md')).sort();
if (!files.length) throw new Error('Dodaj przynajmniej jeden rozdział w poradnik/*.md.');
const pages = await Promise.all(files.map(async file => {
  const source = await readFile(path.join(root, 'poradnik', file), 'utf8');
  const title = source.match(/^#\s+(.+)$/m)?.[1];
  if (!title) throw new Error(`${file}: brakuje tytułu # Nazwa rozdziału.`);
  return { file: file.replace(/\.md$/, '.html'), title, source };
}));
// Only generated dist in the resolved content root; never follow a linked output.
if (out !== path.join(root,'dist') || path.dirname(out)!==root) throw new Error('Niebezpieczny katalog wynikowy.');
const resolvedRoot=await realpath(root);
try {
 const info=await lstat(out);
 if(info.isSymbolicLink() || (await realpath(out))!==path.join(resolvedRoot,'dist')) throw new Error('dist nie może być linkiem.');
 await rm(out,{recursive:true,force:true});
}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out, { recursive: true });
await cp(path.join(project, 'assets'), path.join(out, 'assets'), { recursive: true, filter: async file => {
 const info=await lstat(file);if(info.isSymbolicLink())throw new Error('Asset nie może być linkiem: '+file);
 return info.isDirectory() || /\.(?:css|js|mjs|json|png|jpg|jpeg|webp|svg|woff2)$/i.test(file);
} });
await mkdir(path.join(out,'assets/fonts'),{recursive:true});
await cp(path.join(project,'node_modules/@fontsource/cinzel/files/cinzel-latin-700-normal.woff2'),path.join(out,'assets/fonts/cinzel.woff2'));
await cp(path.join(project,'node_modules/lucide-static/LICENSE'),path.join(out,'assets/lucide-LICENSE.txt'));
await cp(path.join(project,'node_modules/@fontsource/cinzel/LICENSE'),path.join(out,'assets/fonts/LICENSE.txt'));
const controls=['x','play','pause'].map(name=>[name,iconText({'x':'✕','play':'▷','pause':'Ⅱ'}[name])]);
await writeFile(path.join(out,'assets/control-icons.json'),JSON.stringify(Object.fromEntries(controls)));
const nav = active => `<a class="nav-link ${active === 'poradnik.html' ? 'active' : ''}" href="poradnik.html" ${active === 'poradnik.html' ? 'aria-current="page"' : ''}><span>00</span> Spis rozdziałów</a>${pages.map((p, i) => `<a class="nav-link ${active === p.file ? 'active' : ''}" href="${escape(p.file)}" ${active === p.file ? 'aria-current="page"' : ''}><span>${String(i + 1).padStart(2, '0')}</span> ${escape(p.title)}</a>`).join('')}`;
function baseLayout(title, active, content) {
  return iconText(`<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · Valheim ++</title><meta name="description" content="Valheim ++ — poradnik do modpaka. Instalacja, pierwsze kroki, mody i pomoc."><link rel="icon" href="assets/images/valheim-emblem.png" type="image/png"><link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/ux.css"><link rel="stylesheet" href="assets/refinement.css"></head><body><a class="skip" href="#tresc">Przejdź do treści</a><aside class="sidebar"><a href="index.html" class="brand"><img src="assets/images/valheim-emblem.png" alt="" width="44" height="44"><span>VALHEIM <b>++</b><small>POMOC I INSTRUKCJE</small></span></a><div class="nav-label">WYBIERZ TEMAT</div><nav class="desktop-nav" aria-label="Rozdziały">${nav(active)}</nav><details class="mobile-nav"><summary>Rozdziały poradnika</summary><nav aria-label="Rozdziały na telefonie">${nav(active)}</nav></details><div class="sidebar-note"><span class="dot"></span> Potrzebujesz czegoś innego?<small>Wróć na stronę paczki albo sprawdź aktualizacje.</small></div></aside><div class="page"><header class="topbar"><span>POMOC VALHEIM ++</span><a href="index.html">VALHEIM ++</a></header><main id="tresc">${content}</main><footer>Valheim ++ <span>© ${new Date().getFullYear()} Bullet · Valheim ++</span></footer></div><script type="module" src="assets/viewer.js"></script></body></html>`);
}
function layout(title, active, content) {
  const footer = `<footer class="guide-footer"><div><a class="guide-footer-brand" href="index.html">VALHEIM ++</a><p>Nieoficjalny projekt społeczności Valheim.</p></div><nav aria-label="Linki w stopce"><a href="mody.html">Lista modów</a><a href="changelog.html">Historia zmian</a><a href="index.html">Strona główna ${icon('arrow-up-right')}</a></nav><small>© ${new Date().getFullYear()} Bullet · Valheim ++</small></footer>`;
  return baseLayout(title, active, content)
    .replace('<body>', '<body class="vh-guide">')
    .replace('</head>', '<link rel="stylesheet" href="assets/guide.css"></head>')
    .replace(/<footer>[\s\S]*?<\/footer>/, footer)
    .replace('<span>POMOC VALHEIM ++</span>', '<span>PORADNIK VALHEIM ++</span>')
    .replace('<a href="index.html">VALHEIM ++</a>', `<a href="index.html">Strona główna ${icon('arrow-up-right')}</a>`);
}
const descriptions=['Pobranie, wskazanie gry i pierwsze uruchomienie.','Sprawdzanie zmian i instalowanie nowego wydania.','Starsze wersje, przypięcie paczki i powrót do najnowszego wydania.','Automatyczne kopie, cofanie aktualizacji i ochrona danych gracza.','Problemy z grą, pobieraniem i zgłaszanie błędów.'];
const topicIcons=['download','refresh-cw','layers','shield','wrench'];
const cards = pages.map((p, i) => `<a class="card" href="${escape(p.file)}"><div class="topic-heading"><span class="topic-icon">${icon(topicIcons[i] || 'book-open')}</span><span class="card-number">${String(i + 1).padStart(2, '0')} / ROZDZIAŁ</span></div><h2>${escape(p.title)}</h2><p>${escape(descriptions[i] || 'Otwórz instrukcję.')}</p><span class="card-arrow" aria-hidden="true">↗</span></a>`).join('');
await writeFile(path.join(out, 'poradnik.html'), layout('Poradnik', 'poradnik.html', `<div class="guide-intro"><div class="eyebrow">PORADNIK VALHEIM ++</div><h1>W czym potrzebujesz pomocy?</h1><p>Wybierz temat. Każda instrukcja pokazuje, co kliknąć i co zobaczysz dalej.</p><a class="button" href="${escape(pages[0].file)}">Zacznij od instalacji →</a></div><section class="cards" aria-label="Rozdziały poradnika">${cards}</section>`));
const source = await readFile(path.join(root, 'landing.md'), 'utf8');
const snapshot=JSON.parse(await readFile(path.join(project,'assets/data/releases.json'),'utf8'));
const gallery=[
 {id:'home',title:'Gotowe do gry',src:'assets/images/launcher-home.png',alt:'Ekran główny launchera z przyciskiem Graj i stanem paczki.'},
 {id:'update',title:'Opis zmian w paczce',src:'assets/images/launcher-update.png',alt:'Podgląd zmian w wybranym wydaniu paczki.'},
 {id:'versions',title:'Wybór wcześniejszego wydania',src:'assets/images/launcher-versions.png',alt:'Lista starszych wersji paczki w ustawieniach launchera.'},
 {id:'backups',title:'Automatyczne kopie',src:'assets/images/launcher-backups.png',alt:'Cofnięcie aktualizacji i historia chronionych danych gracza.'},
 {id:'repair',title:'Naprawa brakujących plików',src:'assets/images/launcher-repair.png',alt:'Lista brakujących plików paczki przed ich uzupełnieniem.'}
];
await writeFile(path.join(out, 'index.html'), renderLanding({ source, chapters: pages, snapshot, gallery }));
await writeFile(path.join(out, 'changelog.html'), renderHistory({ snapshot }));
await writeFile(path.join(out, 'mody.html'), renderMods({ snapshot }));
for (const [i, p] of pages.entries()) {
  ids.clear();
  const rendered = markdown.parse(p.source);
  // Keep heading IDs and links intact; each stage forms an independent panel.
  const parts = rendered.split(/(?=<h2\b)/);
  const body = `<div class="chapter-intro"><div class="eyebrow">ROZDZIAŁ ${String(i + 1).padStart(2, '0')}</div>${parts.shift()}</div>` + parts.map(part => `<section class="guide-step">${part}</section>`).join('');
  const previous = pages[i - 1]; const next = pages[i + 1];
  const pager = `<nav class="pager" aria-label="Sąsiednie rozdziały">${previous ? `<a href="${escape(previous.file)}"><small>← POPRZEDNI ROZDZIAŁ</small>${escape(previous.title)}</a>` : '<a href="poradnik.html"><small>← WRÓĆ</small>Spis rozdziałów</a>'}${next ? `<a href="${escape(next.file)}"><small>NASTĘPNY ROZDZIAŁ →</small>${escape(next.title)}</a>` : ''}</nav>`;
  await writeFile(path.join(out, p.file), layout(p.title, p.file, `<div class="breadcrumb"><a href="poradnik.html">Poradnik</a><span>/</span>${escape(p.title)}</div><article class="article">${body}</article>${pager}`));
}
await writeFile(path.join(out, '.nojekyll'), '');
console.log(`Gotowe: landing, changelog i ${pages.length} rozdziałów w ${out}`);
