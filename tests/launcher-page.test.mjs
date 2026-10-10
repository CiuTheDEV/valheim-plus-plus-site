import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
test('szczegóły launchera są dostępne ze strony głównej i prowadzą do istniejących instrukcji',()=>{
 const build=spawnSync(process.execPath,['scripts/build.mjs'],{encoding:'utf8'});
 assert.equal(build.status,0,build.stderr);
 const landing=readFileSync('dist/index.html','utf8');
 assert.match(landing,/href="launcher.html"/);
 assert.ok(existsSync('dist/launcher.html'),'Brak osobnej strony launchera');
 const page=readFileSync('dist/launcher.html','utf8');
 assert.match(page,/class="site-header"/);
 assert.doesNotMatch(page,/class="sidebar"|class="vh-guide|class="guide-step"/);
 for(const target of ['01-instalacja.html','02-pierwsze-kroki.html','03-mody.html','04-wspolna-gra.html','05-pomoc.html'])assert.ok(page.includes(`href="${target}`),target);
 for(const match of page.matchAll(/(?:src|href)="([^"#]+)(?:#[^"]*)?"/g)){
  if(/^[a-z]+:/i.test(match[1]))continue;
  assert.ok(existsSync('dist/'+match[1]),match[1]);
 }
});
test('screeny launchera mają rozdzielczość do powiększenia',()=>{
 for(const [name,width] of [['home',1920],['recap',1200],['error',1080]]){
  const png=readFileSync(`assets/images/launcher-${name}.png`);
  assert.ok(png.readUInt32BE(16)>=width,`${name}: zbyt mały oryginał`);
 }
});
