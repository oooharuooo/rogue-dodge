const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('web-2d/boss-motion.js','utf8');
const ground=src.slice(src.indexOf('function drawGroundWave'),src.indexOf('// Preparation cue'));
const rubble=src.slice(src.indexOf('const compactAllLaneFx'),src.indexOf('\n\n',src.indexOf('function drawImpactRubble')));
function render(compact){let calls=0;const ctx=new Proxy({globalAlpha:1},{get(o,k){if(k in o)return o[k];return()=>calls++;},set(o,k,v){o[k]=v;return true;}});const s={ctx,matchMedia:()=>({matches:compact}),Math};vm.createContext(s);vm.runInContext(ground+'\n'+rubble,s);s.drawGroundWave(ctx,{attack:{kind:'jump',groundOrigin:{x:500,y:450}},bladeTip:{x:600,y:430},time:1.1},.9);s.drawImpactRubble(ctx,{x:145,y:552},1.2);return calls;}
const desktop=render(false),mobile=render(true);assert(desktop>mobile,'coarse/small-screen path should render fewer canvas primitives');assert(mobile<desktop*.7,'target a substantial reduction in all-lane canvas work');
console.log(`All-lane FX: desktop ${desktop} mocked canvas calls; compact ${mobile} (${Math.round((1-mobile/desktop)*100)}% fewer).`);
