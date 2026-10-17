import {readSnapshot,fetchReleaseCatalog,catalogSnapshot,downloadUrl,releaseCards,releaseArchive} from './releases-core.mjs';
document.documentElement?.classList?.add('js');
// Zwijanie: wysokość opisu i przewijanie strony biegną jedną krzywą, więc strona nie skacze, gdy treść pod czytanym miejscem znika.
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
function collapse(notes,card){
 const start=notes.offsetHeight,y0=scrollY;
 notes.classList.add('collapsing');notes.classList.remove('expanded');notes.style.maxHeight='';
 const end=notes.offsetHeight,max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const cardTop=card?card.getBoundingClientRect().top+y0:y0;
 const target=Math.max(0,Math.min(cardTop-110<y0?cardTop-110:y0,max));
 notes.style.maxHeight=start+'px';
 const t0=performance.now(),duration=380;
 const step=now=>{
  const p=Math.min(1,(now-t0)/duration),e=ease(p);
  notes.style.maxHeight=start+(end-start)*e+'px';scrollTo({top:y0+(target-y0)*e,behavior:'instant'});
  if(p<1)requestAnimationFrame(step);else{notes.style.maxHeight='';notes.classList.remove('collapsing');}
 };
 requestAnimationFrame(step);
}
document.addEventListener?.('click',event=>{
 const button=event.target.closest?.('.notes-toggle');if(!button)return;
 const notes=button.parentElement.querySelector('.release-notes');const open=!notes.classList.contains('expanded');
 if(open){notes.style.maxHeight=notes.offsetHeight+'px';notes.offsetHeight;notes.classList.add('expanded');notes.style.maxHeight=notes.scrollHeight+'px';}
 else collapse(notes,button.closest('.release-card'));
 button.setAttribute('aria-expanded',String(open));button.querySelector('span').textContent=open?'Zwiń opis':'Rozwiń cały opis';
});
// Ponowne rysowanie (dane z GitHuba, zmiana zakładki) zachowuje rozwinięte opisy i otwarte wpisy, żeby nie przesunąć strony.
function setHtml(el,html){
 const notes=[...(el.querySelectorAll?.('.release-notes')||[])].map(n=>n.classList.contains('expanded'));
 const details=[...(el.querySelectorAll?.('details')||[])].map(d=>d.open);
 el.innerHTML=html;
 if(!el.querySelectorAll)return;
 el.querySelectorAll('details').forEach((d,i)=>{if(details[i])d.open=true;});
 el.querySelectorAll('.release-notes').forEach((n,i)=>{
  if(!notes[i]||!n.classList.contains('clamped'))return;
  n.classList.add('expanded');n.style.maxHeight='none';
  const button=n.parentElement.querySelector('.notes-toggle');if(button){button.setAttribute('aria-expanded','true');button.querySelector('span').textContent='Zwiń opis';}
 });
}
const area=document.querySelector('[data-release-area]');
let snapshot;
try{snapshot=JSON.parse(document.querySelector('#release-snapshot')?.textContent||'null');}catch{}
if(!readSnapshot(snapshot))snapshot=null;
let catalog=readSnapshot(snapshot)||{modpack:[],launcher:[],beta:[]};
const cacheKey='vh-public-releases-v1';
try{
 const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');const valid=readSnapshot(cached);
 if(valid&&Object.values(valid).some(entries=>entries.length)&&(!snapshot||Date.parse(cached.fetchedAt)>Date.parse(snapshot.fetchedAt))&&Date.parse(cached.fetchedAt)<=Date.now()+60000){catalog=valid;snapshot=cached;}
}catch{}
const historyMode=area?.dataset.history==='true';
const hashProduct=()=>({'#launcher':'launcher','#beta':'beta','#modpak':'modpack'})[location.hash]||'modpack';
let selected=historyMode?hashProduct():'launcher';const tabs=[...document.querySelectorAll('[data-product]')];
const level=historyMode?2:3;
const order=['modpack','launcher','beta'];let pendingDir=0;
function placeIndicator(){
 const indicator=area?.querySelector('.tab-indicator'),tab=tabs.find(t=>t.dataset.product===selected);
 if(!indicator||!tab||!tab.offsetWidth)return;
 indicator.style.setProperty('--x',tab.offsetLeft+'px');indicator.style.setProperty('--w',tab.offsetWidth+'px');
 if(!indicator.classList.contains('ready'))requestAnimationFrame(()=>indicator.classList.add('ready'));
}
function enterPanel(){
 const panel=document.querySelector('[data-panel="'+selected+'"]');if(!panel||!pendingDir)return;
 panel.style.setProperty('--dir',String(pendingDir));panel.classList.remove('entering');void panel.offsetWidth;panel.classList.add('entering');pendingDir=0;
}
function choose(product){pendingDir=Math.sign(order.indexOf(product)-order.indexOf(selected));selected=product;}
function render(){
 for(const link of document.querySelectorAll('[data-download]'))link.href=downloadUrl(catalog);
 for(const label of document.querySelectorAll('[data-version]')){const key=label.dataset.version;label.textContent='Wersja '+(catalog[key][0]?.version||'—');}
 if(historyMode){
  area.classList.add('tabs-ready');
  for(const panel of document.querySelectorAll('[data-panel]')){const list=catalog[panel.dataset.panel]||[];setHtml(panel,releaseCards(list,1,2)+(list.length>1?releaseArchive(list.slice(1),2):''));panel.hidden=panel.dataset.panel!==selected;}
 }else if(area){
  setHtml(document.querySelector('#release-list'),releaseCards(catalog.modpack,1,level));
  setHtml(document.querySelector('#older-release-list'),releaseArchive(catalog.modpack.slice(1),level));
  const secondary=document.querySelector('#secondary-release-list');
  if(secondary){setHtml(secondary,releaseCards(catalog[selected],1,2)+(catalog[selected].length>1?releaseArchive(catalog[selected].slice(1),2):''));secondary.setAttribute('aria-labelledby','tab-'+selected);}
 }
 for(const tab of tabs){const active=tab.dataset.product===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
 if(historyMode){placeIndicator();enterPanel();}
}
for(const [i,tab] of tabs.entries()){
 tab.addEventListener('click',()=>{if(historyMode)choose(tab.dataset.product);else selected=tab.dataset.product;render();if(historyMode){try{history.replaceState(null,'','#'+(selected==='modpack'?'modpak':selected));}catch{}}});
 tab.addEventListener('keydown',e=>{const target=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(target!==null){e.preventDefault();tabs[target].focus();tabs[target].click();}});
}
const status=document.querySelector('[data-release-status]');
function fallback(){if(status)status.textContent='Nie można potwierdzić aktualności na GitHubie. '+(snapshot?'Zapisany katalog: '+snapshot.fetchedAt.slice(0,10)+'.':'Sprawdź wydania przez link GitHub.');}
render();if(status)status.textContent='Sprawdzanie aktualnych wydań na GitHubie…';
try{
 catalog=await fetchReleaseCatalog();snapshot=catalogSnapshot(catalog);render();
 if(status){status.textContent='';status.hidden=true;}
 try{localStorage.setItem(cacheKey,JSON.stringify(snapshot));}catch{}
}catch{fallback();}
if(historyMode){addEventListener('hashchange',()=>{choose(hashProduct());render();});addEventListener('resize',placeIndicator);if(area?.querySelector('.history-tabs')&&globalThis.ResizeObserver)new ResizeObserver(placeIndicator).observe(area.querySelector('.history-tabs'));document.fonts?.ready.then(placeIndicator);}
