global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.LaneGame=require('../web-2d/lane-core.js');
for(const f of ['full-core.js','combat-core.js','campaign-core.js'])Object.assign(global,require('../web-2d/'+f));
for(const f of ['skill-visuals.js','skill-expansion.js','weapon-balance.js','weapon-final.js','boss-phase.js'])vm.runInThisContext(fs.readFileSync('web-2d/'+f,'utf8'));
let checks=0;
for(const fps of [30,60,120])for(const weapon of ['katana','daggers','greatsword','bow']){
 const g=new CampaignGame(()=>.4);g.enterTest(weapon,'executioner',true);g.enemyHp=g.enemyMax=1000;
 g.beginChain([{family:'melee',kind:'melee',target:0}]);
 while(g.combo)g.update(1/fps); // Hold middle: safe against upper attack.
 const ended=g.time,ready=g.counter.readyAt;
 assert.equal(g.counter.start,null);assert(ready>=ended+.419);
 assert(Math.abs(g.enemyRecoveryUntil-ended-(weapon==='daggers'?1:1.55))<1e-6);
 while(g.time+1/fps<ready){g.update(1/fps);assert.equal(g.counter.start,null);assert.equal(g.totalDamage,0);}
 while(g.time<ready)g.update(1/fps);
 assert(g.counter.start>=ready);
 while(g.time<g.enemyRecoveryUntil) {assert.equal(g.beginChain(),false);g.update(1/fps);}
 while(g.counter||g.shots.some(s=>!s.hit))g.update(1/fps);
 assert(g.totalDamage>0);assert(g.beginChain());
 g.loadEnemy('swordsman');assert.equal(g.enemyRecoveryUntil,0);checks++;
}
for(const fps of [30,60,120]){
 const g=new CampaignGame(()=>.4);g.enterTest('daggers','executioner',true);g.enemyHp=g.enemyMax=1000;
 g.beginChain([{family:'melee',kind:'melee',target:0}]);
 while(!g.daggerWindow||g.time<g.daggerWindow.start)g.update(1/fps);
 assert(g.weaponAction());
 while(g.time<g.enemyRecoveryUntil)g.update(1/fps);
 assert(g.shots.some(s=>s.followup&&!s.hit),'follow-up overlaps next tell');
 assert(g.beginChain([{family:'melee',kind:'melee',target:1}]));
 assert(g.act('up'));assert(!g.shots.some(s=>s.followup&&!s.hit));checks++;
}
console.log('Counter recovery: '+checks+' weapon/FPS cases passed, including cancelling greedy follow-ups.');
