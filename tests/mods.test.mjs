import test from 'node:test';
import assert from 'node:assert/strict';
import {mods,categories} from '../assets/data/mods.mjs';
import {renderMods} from '../scripts/landing.mjs';
import {details} from '../assets/data/mod-details.mjs';
test('katalog zawiera 53 unikalne mody, opisy i poprawne kategorie',()=>{
 assert.equal(mods.length,53);
 assert.equal(new Set(mods.map(m=>m.name)).size,53);
 for(const m of mods){assert.ok(categories.includes(m.category));assert.ok(m.description.length>20);}
 const html=renderMods({snapshot:null});
 assert.match(html,/id="mod-search"/);
 assert.match(html,/aria-label="Kategorie modów"/);
 assert.equal((html.match(/class="mod-group"/g)||[]).length,5);
 assert.match(html,/href="#mods-0"/);
 assert.doesNotMatch(html,/<select/);
 assert.equal((html.match(/class="mod-card"/g)||[]).length,53);
 assert.equal((html.match(/class="mod-open"/g)||[]).length,53);
 assert.match(html,/aria-labelledby="mod-dialog-title"/);
 assert.match(html,/lucide-search/);
 for(const m of mods)assert.ok(details[m.name]?.length>m.description.length,m.name);
 assert.match(html,/assets\/mods.js/);
 assert.doesNotMatch(html,/href="\//);
});
