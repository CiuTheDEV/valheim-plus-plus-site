import test from 'node:test';
import assert from 'node:assert/strict';

test('nawigacja wybiera pomoc przy końcu strony i sekcję na środku widoku',async()=>{
 const {activeSection}=await import('../assets/scroll-core.mjs');
 assert.equal(typeof activeSection,'function');
 const sections=[{id:'changelog',top:-600,bottom:560},{id:'pomoc',top:592,bottom:1120}];
 assert.equal(activeSection(sections,{viewportHeight:1292,headerHeight:86,scrollY:4000,scrollHeight:5292}),'pomoc');
 assert.equal(activeSection(sections,{viewportHeight:1292,headerHeight:86,scrollY:3200,scrollHeight:5292}),'pomoc');
 assert.equal(activeSection([{id:'launcher',top:250,bottom:1100},{id:'changelog',top:1130,bottom:1700}],{viewportHeight:1080,headerHeight:86,scrollY:1000,scrollHeight:5000}),'launcher');
 assert.equal(activeSection([{id:'launcher',top:800,bottom:1400}],{viewportHeight:1080,headerHeight:86,scrollY:0,scrollHeight:5000}),null);
});
test('ręczne włączenie przewijania ma pierwszeństwo przed ograniczeniem systemowym',async()=>{
 const {scrollEnabled,scrollPosition}=await import('../assets/scroll-core.mjs');
 assert.equal(scrollEnabled(null,true),true);
 assert.equal(scrollEnabled('on',true),true);
 assert.equal(scrollEnabled('off',false),false);
 assert.equal(scrollPosition(100,500,0),100);
 assert.equal(scrollPosition(100,500,1),500);
 assert.ok(scrollPosition(100,500,.5)>100&&scrollPosition(100,500,.5)<500);
});
test('starsze wydania są pojedynczo rozwijane i opis nie wycieka do nagłówka',async()=>{
 const {releaseArchive}=await import('../assets/releases-core.mjs');
 const html=releaseArchive([{product:'modpack',version:'0.3.9',date:'2026-10-07',notes:'<script>bad</script>',url:'https://github.com/CiuTheDEV/valheim-plus-plus/releases/tag/modpack-v0.3.9'}]);
 assert.match(html,/<details/);assert.match(html,/<summary[^>]*>[\s\S]*?0\.3\.9[\s\S]*?<\/summary>/);
 assert.doesNotMatch(html,/<script>/);
});
