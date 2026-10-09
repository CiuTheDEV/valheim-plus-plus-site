import {createGallery} from './gallery-core.mjs';
import {initViewer} from './viewer.js';
import {scrollEnabled,scrollPosition,activeSection} from './scroll-core.mjs';
let scrollPreference='on';
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const gallery=document.querySelector('[data-gallery]');
if(gallery){
 const slides=[...gallery.querySelectorAll('[data-slide]')],dots=[...gallery.querySelectorAll('[data-gallery-dot]')];
 const model=createGallery(slides.length,motion.matches);
 function render(){slides.forEach((slide,i)=>{slide.hidden=i!==model.index;});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===model.index)));}
 const move=delta=>{model.move(delta);render();};
 gallery.querySelector('[data-gallery-prev]').addEventListener('click',()=>move(-1));
 gallery.querySelector('[data-gallery-next]').addEventListener('click',()=>move(1));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>{model.select(i);render();}));
 // Keyboard focus pauses; mouse-click focus must not keep autoplay stopped after leaving the image.
 gallery.addEventListener('focusin',e=>model.block('focus',e.target.matches(':focus-visible')));gallery.addEventListener('focusout',e=>model.block('focus',!!e.relatedTarget&&gallery.contains(e.relatedTarget)&&e.relatedTarget.matches(':focus-visible')));
 gallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);if(e.target.matches('[data-screen]'))slides[model.index].querySelector('[data-screen]').focus();}});
 document.addEventListener('visibilitychange',()=>model.block('hidden',document.hidden));
 motion.addEventListener('change',()=>{model.setReducedMotion(motion.matches);render();});
 gallery.querySelector('.carousel-viewport').addEventListener('pointerenter',()=>model.block('hover',true));gallery.querySelector('.carousel-viewport').addEventListener('pointerleave',()=>model.block('hover',false));
 const timer=setInterval(()=>{if(model.autoplay){model.move(1,false);render();}},6500);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 initViewer('[data-screen]',()=>model.block('dialog',true),()=>model.block('dialog',false));render();
}
const header=document.querySelector('.site-header');
if(header){const size=()=>document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px');new ResizeObserver(size).observe(header);size();}
let frame;
const toggle=document.querySelector('[data-scroll-toggle]');
const updateToggle=()=>{if(toggle){const on=scrollEnabled(scrollPreference,motion.matches);toggle.setAttribute('aria-pressed',String(on));toggle.textContent='Płynne przewijanie: '+(on?'włączone':'wyłączone');}};
toggle?.addEventListener('click',()=>{scrollPreference=scrollEnabled(scrollPreference,motion.matches)?'off':'on';try{localStorage.setItem('vh-scroll-motion',scrollPreference);}catch{}updateToggle();});motion.addEventListener('change',updateToggle);updateToggle();
const stop=()=>cancelAnimationFrame(frame);window.addEventListener('wheel',stop,{passive:true});window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('keydown',e=>{if(['Escape','PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(e.key))stop();});
for(const link of document.querySelectorAll('a[href^="#"]'))link.addEventListener('click',event=>{
 const target=document.getElementById(link.getAttribute('href').slice(1));if(!target)return;
 event.preventDefault();history.pushState(null,'',link.getAttribute('href'));stop();const from=scrollY,to=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,from+target.getBoundingClientRect().top-(header?.getBoundingClientRect().height||0)-24));
 if(!scrollEnabled(scrollPreference,motion.matches)){window.scrollTo({top:to,behavior:'instant'});return;}
 const started=performance.now();const tick=time=>{const progress=Math.min(1,(time-started)/650);window.scrollTo({top:scrollPosition(from,to,progress),behavior:'instant'});if(progress<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
});
const navLinks=[...document.querySelectorAll('.site-header nav a[href^="#"]')];
if(navLinks.length){
 const targets=navLinks.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
 let navFrame;
 const updateNav=()=>{
  navFrame=null;
  const current=activeSection(targets.map(target=>({id:target.id,top:target.getBoundingClientRect().top})),{viewportHeight:innerHeight,headerHeight:header?.getBoundingClientRect().height||0,scrollY,scrollHeight:document.documentElement.scrollHeight});
  for(const link of navLinks){if(link.hash==='#'+current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
 };
 const scheduleNav=()=>{if(navFrame==null)navFrame=requestAnimationFrame(updateNav);};
 window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);
 new ResizeObserver(scheduleNav).observe(document.body);updateNav();
}
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('will-reveal');observer.observe(el);});}
