const search=document.querySelector('#mod-search');
const cards=[...document.querySelectorAll('.mod-card')];
function filter(){
 const query=search.value.trim().toLocaleLowerCase('pl').replaceAll('_',' ');
 let count=0;
 for(const card of cards){
  const match=card.dataset.modName.replaceAll('_',' ').includes(query);
  card.hidden=!match;if(match)count++;
 }
 document.querySelector('#mod-count').textContent=`Wyświetlono ${count} z ${cards.length} modów`;
 document.querySelector('#mod-empty').hidden=count>0;
 document.querySelectorAll('.mod-group').forEach(group=>{
  const visible=group.querySelectorAll('.mod-card:not([hidden])').length;
  group.hidden=visible===0;
  group.querySelector('.mod-group-count').textContent=visible;
  const link=document.querySelector(`.mods-topbar a[href="#${group.id}"]`);
  link.hidden=visible===0;
 });
}
search.addEventListener('input',filter);
import {mods} from './data/mods.mjs';
import {details,sourceUrls} from './data/mod-details.mjs';
const dialog=document.querySelector('.mod-dialog');
let trigger;
document.querySelectorAll('.mod-open').forEach(button=>button.addEventListener('click',()=>{
 const mod=mods.find(m=>m.name.toLowerCase()===button.dataset.mod);
 if(!mod)return;
 trigger=button;
 document.querySelector('#mod-dialog-title').textContent=mod.name.replaceAll('_',' ');
 document.querySelector('#mod-dialog-category').textContent=mod.category;
 document.querySelector('#mod-dialog-description').textContent=details[mod.name];
 const source=document.querySelector('#mod-dialog-source');
 source.hidden=!sourceUrls[mod.name];
 if(sourceUrls[mod.name])source.href=sourceUrls[mod.name];else source.removeAttribute('href');
 dialog.showModal();
 document.body.classList.add('mod-dialog-open');
 dialog.querySelector('.mod-dialog-close').focus();
}));
dialog.querySelector('.mod-dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
 if(event.target!==dialog)return;
 const box=dialog.getBoundingClientRect();
 if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{document.body.classList.remove('mod-dialog-open');trigger?.focus({preventScroll:true});});
