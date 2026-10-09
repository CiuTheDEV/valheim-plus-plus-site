export const RELEASES_URL = 'https://github.com/CiuTheDEV/valheim-plus-plus/releases';
export const API_URL = 'https://api.github.com/repos/CiuTheDEV/valheim-plus-plus/releases';
// Lucide arrow-right, shared by server-rendered and freshly fetched release cards.
const arrowIcon='<svg class="lucide lucide-arrow-right" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>';
export function readSnapshot(value) {
 try {
  const data=typeof value==='string'?JSON.parse(value):value;
  if(data?.schema!==1||typeof data.fetchedAt!=='string'||!Number.isFinite(Date.parse(data.fetchedAt)))return null;
  return selectReleases(data.releases);
 }catch{return null;}
}
export const downloadUrl = catalog => catalog?.launcher?.[0]?.assets.find(a=>a.name==='ValheimPlusPlus.exe')?.url || RELEASES_URL;
export function catalogSnapshot(catalog) {
 return {schema:1,fetchedAt:new Date().toISOString(),releases:Object.values(catalog).flat().map(e=>({tag_name:e.tag,draft:false,prerelease:e.product==='beta',published_at:e.date,html_url:e.url,name:e.title,body:e.notes,assets:e.assets.map(a=>({name:a.name,size:a.size,state:'uploaded',browser_download_url:a.url}))}))};
}
export function releaseCards(entries, limit=entries.length) {
 return entries.slice(0,limit).map(e=>`<article class="release-card"><header><h3>${escapeHtml(e.product==='launcher'?'Launcher':e.product==='beta'?'Valheim ++ beta':'Valheim ++')} ${escapeHtml(e.version)}</h3><time datetime="${escapeHtml(e.date)}">${escapeHtml(e.date.slice(0,10))}</time></header>${e.product==='beta'?'<p class="beta-warning">Wydanie testowe — instalacja tylko po świadomym wyborze w launcherze.</p>':''}<div class="release-notes">${safeNotes(e.notes).replace(/<(\/?)(h)([1-6])>/g,(_,slash,h,n)=>`<${slash}h${Math.min(6,Number(n)+3)}>`)||'<p>Brak opisu zmian.</p>'}</div><a class="text-link" href="${escapeHtml(e.url)}">Wydanie na GitHubie ${arrowIcon}</a></article>`).join('') || '<p>Brak kompletnych publicznych wydań w tym kanale. <a href="'+RELEASES_URL+'">Sprawdź GitHub '+arrowIcon+'</a></p>';
}
export function releaseArchive(entries){return entries.map(e=>`<details class="archive-entry"><summary><span>${escapeHtml(e.version)}</span><time>${escapeHtml(e.date.slice(0,10))}</time><span class="archive-label">Opis zmian</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>${releaseCards([e])}</details>`).join('')||'<p>Brak starszych wydań.</p>';}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const versionPart = '(0|[1-9][0-9]{0,5})';
const tagPattern = new RegExp(`^(launcher|modpack|modpack-beta)-v(${versionPart}\\.${versionPart}\\.${versionPart})$`);
function exactGithubUrl(value, suffix) {
 try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.search && !u.hash && u.hostname === 'github.com' && u.pathname === '/CiuTheDEV/valheim-plus-plus/releases/'+suffix; } catch { return false; }
}
export function normalizeRelease(raw) {
 if (!raw || raw.draft !== false || typeof raw.prerelease !== 'boolean' || !Array.isArray(raw.assets) || raw.assets.length > 100) return null;
 const match = typeof raw.tag_name === 'string' && raw.tag_name.match(tagPattern);
 if (!match) return null;
 const product = match[1] === 'launcher' ? 'launcher' : match[1] === 'modpack-beta' ? 'beta' : 'modpack';
 if (raw.prerelease !== (product === 'beta') || !exactGithubUrl(raw.html_url,'tag/'+raw.tag_name)) return null;
 if (typeof raw.published_at !== 'string' || !Number.isFinite(Date.parse(raw.published_at))) return null;
 const version = match[2];
 const launcherZip=version==='0.14.0'?'ValheimPlusPlus-Windows-x64.zip':`ValheimPlusPlus-Launcher-${version}-Windows-x64.zip`;
 const required = product === 'launcher' ? ['launcher.json','ValheimPlusPlus.exe',launcherZip] : ['modpack.json',`valheim-plus-plus-${version}.zip`];
 const assets = required.map(name=>{
  const candidates=raw.assets.filter(a=>a?.name===name);
  const asset=candidates[0];
  if (candidates.length !== 1 || asset.state !== 'uploaded' || !Number.isSafeInteger(asset.size) || asset.size <= 0 || !exactGithubUrl(asset.browser_download_url,`download/${raw.tag_name}/${encodeURIComponent(name)}`)) return null;
  return {name,size:asset.size,url:asset.browser_download_url};
 });
 if (assets.some(a=>!a)) return null;
 return {product,version,tag:raw.tag_name,date:new Date(raw.published_at).toISOString(),url:raw.html_url,title:typeof raw.name==='string'?raw.name.slice(0,200):raw.tag_name,notes:typeof raw.body==='string'?raw.body.slice(0,20000):'',assets};
}
export function selectReleases(rawArray) {
 if (!Array.isArray(rawArray) || rawArray.length>2000) throw new Error('Niepoprawny format katalogu wydań.');
 const catalog={modpack:[],launcher:[],beta:[]};const seen=new Set();
 for(const raw of rawArray){const entry=normalizeRelease(raw);if(entry&&!seen.has(entry.tag)){catalog[entry.product].push(entry);seen.add(entry.tag);}}
 for(const entries of Object.values(catalog)) entries.sort((a,b)=>{const av=a.version.split('.').map(Number),bv=b.version.split('.').map(Number);return bv[0]-av[0]||bv[1]-av[1]||bv[2]-av[2];});
 return catalog;
}
export async function fetchReleaseCatalog({fetchImpl=globalThis.fetch,signal,maxPages=20}={}) {
 if (!Number.isInteger(maxPages)||maxPages<1||maxPages>20) throw new Error('Niepoprawny limit paginacji.');
 const all=[];
 for(let page=1;page<=maxPages;page++){
  const timeout=AbortSignal.timeout(10000);
  const response=await fetchImpl(`${API_URL}?per_page=100&page=${page}`,{headers:{Accept:'application/vnd.github+json'},signal:signal?AbortSignal.any([signal,timeout]):timeout,credentials:'omit',redirect:'error'});
  if(!response.ok)throw new Error(`GitHub HTTP ${response.status}`);
  const data=await response.json();if(!Array.isArray(data)||data.length>100)throw new Error('Niepoprawny format odpowiedzi GitHub.');
  all.push(...data);
  if(data.length<100)return selectReleases(all);
 }
 throw new Error('Limit paginacji: katalog nie został odczytany w całości.');
}
function inline(source) {
 const tokens=/`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
 let html='',position=0;
 for(const match of source.matchAll(tokens)){
  html+=escapeHtml(source.slice(position,match.index));
  if(match[1])html+=`<code>${escapeHtml(match[1])}</code>`;
  else if(match[2]){
   try {const url=new URL(match[3]);html+=!url.username&&!url.password&&['https:','http:'].includes(url.protocol)?`<a href="${escapeHtml(url.href)}" rel="noopener noreferrer">${escapeHtml(match[2])}</a>`:escapeHtml(match[0]);}catch{html+=escapeHtml(match[0]);}
  }else if(match[4])html+=`<strong>${escapeHtml(match[4])}</strong>`;
  else html+=`<em>${escapeHtml(match[5])}</em>`;
  position=match.index+match[0].length;
 }
 return html+escapeHtml(source.slice(position));
}
export function safeNotes(source) {
 if(typeof source!=='string')return '';
 let html='',list='',paragraph=[],code=null;
 const flush=()=>{if(paragraph.length){html+=`<p>${inline(paragraph.join(' '))}</p>`;paragraph=[];}if(list){html+=`</${list}>`;list='';}};
 for(const line of source.slice(0,20000).replace(/\r/g,'').split('\n')){
  if(line.startsWith('```')){flush();if(code===null)code=[];else{html+=`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`;code=null;}continue;}
  if(code!==null){code.push(line);continue;}
  const heading=line.match(/^(#{1,6})\s+(.+)$/),item=line.match(/^\s*(?:([-*])|\d+\.)\s+(.+)$/);
  if(heading){flush();html+=`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;}
  else if(item){if(paragraph.length){html+=`<p>${inline(paragraph.join(' '))}</p>`;paragraph=[];}const type=item[1]?'ul':'ol';if(list!==type){if(list)html+=`</${list}>`;html+=`<${type}>`;list=type;}html+=`<li>${inline(item[2])}</li>`;}
  else if(!line.trim())flush();
  else{if(list){html+=`</${list}>`;list='';}paragraph.push(line);}
 }
 flush();if(code!==null)html+=`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`;
 return html;
}
