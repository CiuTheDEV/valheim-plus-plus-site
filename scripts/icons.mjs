import {readFileSync} from 'node:fs';
const names=new Set(['arrow-left','arrow-right','arrow-up-right','download','maximize-2','x','play','pause','chevron-down','book-open','shield','swords','hammer','sprout','backpack','refresh-cw','layers','wrench','sliders-horizontal']);
export function icon(name){
 if(!names.has(name))throw new Error('Nieznana ikona: '+name);
 return readFileSync(new URL('../node_modules/lucide-static/icons/'+name+'.svg',import.meta.url),'utf8').replace(/<svg/, '<svg aria-hidden="true" focusable="false"').replace(/width="24"/,'width="20"').replace(/height="24"/,'height="20"');
}
export function iconText(html){let script=false;return html.split(/(<[^>]*>)/g).map(part=>{if(part.startsWith('<')){if(/^<script\b/.test(part))script=true;if(/^<\/script/.test(part))script=false;return part;}return script?part:part.replace(/↗|→|←|↓|⤢|Ⅱ|▷|✕/g,char=>icon({'↗':'arrow-up-right','→':'arrow-right','←':'arrow-left','↓':'download','⤢':'maximize-2','Ⅱ':'pause','▷':'play','✕':'x'}[char]));}).join('');}
