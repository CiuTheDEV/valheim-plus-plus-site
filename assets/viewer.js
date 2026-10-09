export function initViewer(selector,onOpen=()=>{},onClose=()=>{}){
 const triggers=[...document.querySelectorAll(selector)];if(!triggers.length)return;
 const dialog=document.createElement('dialog');dialog.className='screen-dialog';
 const close=document.createElement('button');close.type='button';close.className='viewer-close';close.textContent='Zamknij';close.setAttribute('aria-label','Zamknij zdjęcie');
 const image=document.createElement('img'),caption=document.createElement('p');caption.id='viewer-caption';dialog.setAttribute('aria-labelledby',caption.id);dialog.append(close,image,caption);document.body.append(dialog);let trigger;
 fetch(new URL('./control-icons.json',import.meta.url)).then(r=>r.json()).then(icons=>{close.innerHTML=icons.x+'<span>Zamknij</span>';}).catch(()=>{});
 triggers.forEach(button=>button.addEventListener('click',event=>{event.preventDefault();trigger=button;const original=button.querySelector('img');image.src=original.src;image.alt=original.alt;caption.textContent=original.alt;onOpen();dialog.showModal();close.focus();}));
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{onClose();trigger?.focus();});
}
initViewer('.guide-shot');
