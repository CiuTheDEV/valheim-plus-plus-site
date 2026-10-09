import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {renderLanding,renderHistory} from '../scripts/landing.mjs';
test('landing pokazuje najnowszy modpack, starsze wydania osobno i kontrolowaną galerię',()=>{
 const raw=v=>({tag_name:'modpack-v'+v,draft:false,prerelease:false,published_at:'2026-10-07T00:00:00Z',html_url:'https://github.com/CiuTheDEV/valheim-plus-plus/releases/tag/modpack-v'+v,body:'Zmiana '+v,assets:['modpack.json','valheim-plus-plus-'+v+'.zip'].map(name=>({name,size:100,state:'uploaded',browser_download_url:'https://github.com/CiuTheDEV/valheim-plus-plus/releases/download/modpack-v'+v+'/'+name}))});
 const html=renderLanding({source:'# Valheim ++\n\nHasło',snapshot:{schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[raw('0.3.9'),raw('0.3.10')]},gallery:[{title:'Start',src:'assets/images/home.png',alt:'Ekran główny'},{title:'Pobieranie',src:'assets/images/download.png',alt:'Pobieranie'}]});
 const latest=html.match(/id="release-list"[^>]*>([\s\S]*?)<\/div><details/);
 assert.ok(latest,'Najnowsze wydanie powinno być oddzielone od rozwijanej historii');
 assert.match(latest[1],/0.3.10/);assert.doesNotMatch(latest[1],/0.3.9/);
 assert.match(html,/id="older-release-list"/);
 assert.doesNotMatch(html,/id="secondary-release-list"/);
 assert.match(renderHistory({snapshot:{schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[raw('0.3.10')]}}),/id="secondary-release-list"/);
 assert.match(html,/aria-label="Poprzedni screen"/);assert.match(html,/aria-label="Następny screen"/);assert.doesNotMatch(html,/data-gallery-pause/);
 assert.match(html,/Bullet/);
 const help=html.split('id="pomoc"')[1].split('</section>')[0];
 assert.match(help,/href="poradnik.html"/);
});

test('osadzona migawka nie zamyka skryptu JSON i zachowuje dane Markdown',()=>{
 const snapshot={schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[],notes:'</script><script>alert(1)</script>'};
 const html=renderLanding({source:'# Valheim ++\n\nHasło',snapshot});
 const embedded=html.match(/<script id="release-snapshot" type="application\/json">([\s\S]*?)<\/script>/)[1];
 assert.doesNotMatch(embedded,/<script/);
 assert.equal(JSON.parse(embedded).notes,snapshot.notes);
});

test('nowy rozdział trafia do menu, linki Markdown działają w podfolderze', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'valheim-guide-'));
  try {
    mkdirSync(path.join(root, 'poradnik'));
    writeFileSync(path.join(root, 'landing.md'), '# Valheim ++\n\nOpis testowego modpaka.\n\n## O modpaku\n\nWłasna treść właściciela.\n\n## Najważniejsze zmiany\n\n### Zmiana\n\nOpis.\n\n## Jak zacząć?\n\nInstrukcja.');
    writeFileSync(path.join(root, 'poradnik/01-start.md'), '# Początek\n\n[Zobacz mody](02-mody.md#lista)');
    writeFileSync(path.join(root, 'poradnik/02-mody.md'), '# Mody i łódź\n\n## Lista\n\nTreść.');
    const result = spawnSync(process.execPath, ['scripts/build.mjs', root], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const page = readFileSync(path.join(root, 'dist/01-start.html'), 'utf8');
    assert.match(page, /href="02-mody.html#lista"/);
    assert.match(page, /Mody i łódź/);
    assert.match(page, /class="vh-guide"/);
    assert.match(page, /assets\/guide.css/);
    assert.match(page, /class="guide-footer"/);
    assert.match(readFileSync(path.join(root, 'dist/02-mody.html'), 'utf8'), /class="guide-step"/);
    assert.doesNotMatch(page, /href="\//);
    assert.match(readFileSync(path.join(root, 'dist/02-mody.html'), 'utf8'), /id="lista"/);
    const landing = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
    assert.match(landing, /Własna treść właściciela/);
    assert.doesNotMatch(landing, /class="sidebar"/);
    assert.match(landing, /href="poradnik.html"/);
    for (const id of ['o-modpaku','launcher','jak-zaczac','changelog','pomoc']) assert.match(landing, new RegExp(`id="${id}"`));
    assert.match(landing, /https:\/\/github.com\/CiuTheDEV\/valheim-plus-plus\/releases/);
    assert.doesNotMatch(landing, /music-widget/);
    const guide = readFileSync(path.join(root, 'dist/poradnik.html'), 'utf8');
    assert.match(guide, /02-mody.html/);
    const cards = [...guide.matchAll(/<a class="card"[\s\S]*?<\/a>/g)].map(match => match[0]);
    assert.equal(cards.length, 2);
    for (const card of cards) {
      assert.doesNotMatch(card, /<img/);
      assert.match(card, /class="topic-icon"[\s\S]*?<svg aria-hidden="true"/);
      assert.match(card, /<h2>.+?<\/h2>/);
    }
    writeFileSync(path.join(root,'dist/assets/obsolete.txt'),'stary asset');
    const rebuilt=spawnSync(process.execPath,['scripts/build.mjs',root],{encoding:'utf8'});
    assert.equal(rebuilt.status,0,rebuilt.stderr);
    assert.equal(existsSync(path.join(root,'dist/assets/obsolete.txt')),false);
    assert.equal(existsSync(path.join(root,'poradnik/01-start.md')),true);
    assert.equal(existsSync(path.join(root,'dist/.nojekyll')),true);
    for(const name of readdirSync(path.join(root,'dist')).filter(n=>n.endsWith('.html'))){
      const html=readFileSync(path.join(root,'dist',name),'utf8');
      for(const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
        if(/^[a-z]+:/i.test(match[1]))continue;
        for(const prefix of ['/','/przykladowe-repo/']){
          const url=new URL(match[1],'https://example.com'+prefix+name);
          assert.ok(url.pathname.startsWith(prefix),url.href);
          assert.ok(existsSync(path.join(root,'dist',decodeURIComponent(url.pathname.slice(prefix.length)))),match[1]);
        }
      }
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
