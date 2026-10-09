import test from 'node:test';
import assert from 'node:assert/strict';
const module=await import('../assets/gallery-core.mjs').catch(()=>null);
test('galeria zawija indeks i zachowuje autoplay po ręcznym wyborze',()=>{
 assert.ok(module,'Brak sterowania galerią');
 const gallery=module.createGallery(3);
 gallery.move(-1);assert.equal(gallery.index,2);assert.equal(gallery.autoplay,true);
 gallery.resume();gallery.move(1,false);assert.equal(gallery.index,0);assert.equal(gallery.autoplay,true);
 gallery.select(1);assert.equal(gallery.index,1);assert.equal(gallery.autoplay,true);
});
test('autoplay pauzuje na czas interakcji i działa domyślnie również przy ograniczeniu systemowym',()=>{
 assert.ok(module,'Brak sterowania galerią');
 const gallery=module.createGallery(3);
 gallery.block('hover',true);gallery.move(1,false);assert.equal(gallery.index,0);
 gallery.block('focus',true);gallery.block('hover',false);assert.equal(gallery.autoplay,false);
 gallery.block('focus',false);assert.equal(gallery.autoplay,true);
 const reduced=module.createGallery(3,true);assert.equal(reduced.autoplay,true);reduced.move(1);assert.equal(reduced.index,1);
 reduced.setReducedMotion(false);reduced.resume();assert.equal(reduced.autoplay,true);
 assert.equal(module.createGallery(1).autoplay,false);
});
