import test from 'node:test';
import assert from 'node:assert/strict';
const core = await import('../assets/releases-core.mjs').catch(()=>null);
const repo = 'https://github.com/CiuTheDEV/valheim-plus-plus';
function release(tag, extra = {}) {
 const version = tag.match(/(\d+\.\d+\.\d+)$/)[1];
 const names = tag.startsWith('launcher-') ? ['launcher.json','ValheimPlusPlus.exe',`ValheimPlusPlus-Launcher-${version}-Windows-x64.zip`] : ['modpack.json',`valheim-plus-plus-${version}.zip`];
 return {tag_name:tag,draft:false,prerelease:tag.startsWith('modpack-beta-'),published_at:'2026-10-07T10:00:00Z',html_url:`${repo}/releases/tag/${tag}`,body:'# Test\n\nOpis.',assets:names.map(name=>({name,size:100,state:'uploaded',browser_download_url:`${repo}/releases/download/${tag}/${name}`})),...extra};
}
test('numeracja, kompletne stabilne i oddzielna beta',()=>{
 assert.ok(core,'Brak implementacji katalogu wydań');
 const catalog = core.selectReleases([release('launcher-v0.9.9'),release('launcher-v0.20.1'),release('modpack-v0.3.9'),release('modpack-v0.3.10'),release('modpack-beta-v1.0.0'),release('modpack-v9.0.0',{draft:true}),release('modpack-v8.0.0',{prerelease:true}),release('launcher-v10.0.0',{assets:[]})]);
 assert.deepEqual(catalog.launcher.map(r=>r.version),['0.20.1','0.9.9']);
 assert.deepEqual(catalog.modpack.map(r=>r.version),['0.3.10','0.3.9']);
 assert.deepEqual(catalog.beta.map(r=>r.version),['1.0.0']);
});
test('niebezpieczne i niekompletne assety są odrzucane',()=>{
 assert.ok(core,'Brak implementacji katalogu wydań');
 const raw=release('launcher-v0.20.1');raw.assets[1].browser_download_url='https://evil.example/setup.exe';assert.equal(core.normalizeRelease(raw),null);
 const uploading=release('modpack-v0.3.10');uploading.assets[1].state='new';assert.equal(core.normalizeRelease(uploading),null);
 assert.equal(core.normalizeRelease(release('modpack-v0.3.10',{html_url:'javascript:alert(1)'})),null);
});
test('pełna paginacja, limit i przerwane żądanie nie zwracają częściowego katalogu',async()=>{
 assert.ok(core,'Brak implementacji katalogu wydań');
 const page1=Array.from({length:100},()=>release('modpack-v0.3.9'));
 const fetchImpl=async(url)=>({ok:true,json:async()=>new URL(url).searchParams.get('page')==='1'?page1:[release('modpack-v0.3.10')]});
 const catalog=await core.fetchReleaseCatalog({fetchImpl});assert.equal(catalog.modpack[0].version,'0.3.10');assert.equal(catalog.modpack.length,2);
 await assert.rejects(core.fetchReleaseCatalog({fetchImpl,maxPages:1}),/paginac|limit/i);
 await assert.rejects(core.fetchReleaseCatalog({fetchImpl:async url=>new URL(url).searchParams.get('page')==='1'?{ok:true,json:async()=>page1}:{ok:false,status:403}}),/403/);
 await assert.rejects(core.fetchReleaseCatalog({fetchImpl:async()=>({ok:true,json:async()=>({message:'wrong'})})}),/format/i);
});
test('Markdown wydań renderuje strukturę, ale nigdy surowy HTML i niebezpieczne linki',()=>{
 assert.ok(core,'Brak implementacji katalogu wydań');
 const html=core.safeNotes('## Dodane mody\n\n- **Nowość**\n- `kod`\n\n<script>alert(1)</script>\n[atak](javascript:alert(1))\n[źródło](https://github.com/example)');
 assert.match(html,/<h2>Dodane mody<\/h2>/);assert.match(html,/<strong>Nowość<\/strong>/);assert.match(html,/<code>kod<\/code>/);assert.match(html,/<ul>/);
 assert.doesNotMatch(html,/<script|href="javascript:|onclick=/i);assert.match(html,/&lt;script&gt;/);assert.match(html,/href="https:\/\/github.com\/example"/);
});
test('migawka i cache są walidowane, pobieranie zawsze wybiera stabilny EXE', async () => {
 const {readSnapshot,downloadUrl}=await import('../assets/releases-core.mjs');
 const catalog=readSnapshot({schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[release('launcher-v0.20.1'),release('modpack-beta-v1.0.0')]});
 assert.match(downloadUrl(catalog), /launcher-v0.20.1\/ValheimPlusPlus.exe$/);
 assert.equal(readSnapshot('{broken'),null);
 assert.equal(readSnapshot({schema:2,releases:[]}),null);
 assert.equal(readSnapshot({schema:1,fetchedAt:'bad',releases:[]}),null);
 const bad=release('launcher-v0.20.1');bad.assets[1].browser_download_url='https://evil.example/a';
 assert.equal(readSnapshot({schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[bad]}).launcher.length,0);
});
test('błąd sieci zachowuje migawkę; launcher i beta pokazują starsze wydania w zwiniętych kartach', async () => {
 const snapshot={schema:1,fetchedAt:'2026-10-07T00:00:00Z',releases:[release('launcher-v0.20.1'),release('launcher-v0.20.0'),release('modpack-beta-v0.4.1'),release('modpack-beta-v0.4.0'),release('modpack-v0.3.9'),release('modpack-v0.3.8')]};
 const link={href:''};const status={textContent:''};const list={innerHTML:'',setAttribute(){}};const older={innerHTML:''},secondary={innerHTML:'',setAttribute(){}};
 const tabs=['launcher','beta'].map(product=>({dataset:{product},setAttribute(){},addEventListener(event,fn){this[event]=fn;}}));
 const originals={document:globalThis.document,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
 try{
  globalThis.document={querySelector(selector){return ({'[data-release-area]':{dataset:{history:'false'}},'#release-snapshot':{textContent:JSON.stringify(snapshot)},'#release-list':list,'#older-release-list':older,'#secondary-release-list':secondary,'[data-release-status]':status})[selector];},querySelectorAll(selector){return ({'[data-product]':tabs,'[data-download]':[link],'[data-version]':[]})[selector];}};
  globalThis.localStorage={getItem(){return '{broken';},setItem(){throw new Error('storage disabled');}};
  globalThis.fetch=async()=>{throw new Error('offline');};
  await import('../assets/releases.mjs?offline-test');
  assert.match(link.href,/launcher-v0.20.1\/ValheimPlusPlus.exe$/);
  assert.match(status.textContent,/Nie można potwierdzić/);
  assert.match(status.textContent,/2026-10-07/);
  assert.match(list.innerHTML,/0.3.9/);
  assert.doesNotMatch(list.innerHTML,/0.3.8/);assert.match(older.innerHTML,/0.3.8/);
  assert.equal((secondary.innerHTML.match(/<details class="archive-entry"/g)||[]).length,1);
  assert.match(secondary.innerHTML,/<summary>[\s\S]*?0\.20\.0[\s\S]*?<\/summary>/);
  assert.doesNotMatch(secondary.innerHTML,/<details[^>]*\bopen\b/);
  tabs[1].click();assert.match(secondary.innerHTML,/0.4.1/);assert.match(list.innerHTML,/0.3.9/);
  assert.match(secondary.innerHTML,/<summary>[\s\S]*?0\.4\.0[\s\S]*?<\/summary>/);
  assert.equal((secondary.innerHTML.match(/<details class="archive-entry"/g)||[]).length,1);
  assert.doesNotMatch(secondary.innerHTML,/0\.20\.1|<details[^>]*\bopen\b/);
  assert.match(link.href,/launcher-v0.20.1\/ValheimPlusPlus.exe$/);
 }finally{Object.assign(globalThis,originals);}
});
test('historyczny launcher 0.14.0 zachowuje publiczny ZIP o dawnej nazwie',()=>{
 const raw=release('launcher-v0.14.0');
 raw.assets[2].name='ValheimPlusPlus-Windows-x64.zip';
 raw.assets[2].browser_download_url='https://github.com/CiuTheDEV/valheim-plus-plus/releases/download/launcher-v0.14.0/ValheimPlusPlus-Windows-x64.zip';
 assert.equal(core.normalizeRelease(raw)?.version,'0.14.0');
});
