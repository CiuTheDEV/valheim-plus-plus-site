import {readSnapshot,fetchReleaseCatalog,catalogSnapshot,downloadUrl,releaseCards,releaseArchive} from './releases-core.mjs';
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
let selected='launcher';const tabs=[...document.querySelectorAll('[data-product]')];
function render(){
 for(const link of document.querySelectorAll('[data-download]'))link.href=downloadUrl(catalog);
 for(const label of document.querySelectorAll('[data-version]')){const key=label.dataset.version;label.textContent='Wersja '+(catalog[key][0]?.version||'—');}
 if(area){
  document.querySelector('#release-list').innerHTML=releaseCards(catalog.modpack,1);
  document.querySelector('#older-release-list').innerHTML=releaseArchive(catalog.modpack.slice(1));
  const secondary=document.querySelector('#secondary-release-list');
  if(secondary){secondary.innerHTML=releaseCards(catalog[selected],1)+(catalog[selected].length>1?releaseArchive(catalog[selected].slice(1)):'');secondary.setAttribute('aria-labelledby','tab-'+selected);}
 }
 for(const tab of tabs){const active=tab.dataset.product===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
}
for(const [i,tab] of tabs.entries()){
 tab.addEventListener('click',()=>{selected=tab.dataset.product;render();});
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
