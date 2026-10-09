require('./major-one-final.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.game=new CampaignGame(()=>.4);global.badgeMemory=new WeakMap();global.weaponTarget={};global.deflectBadge={};
const src=fs.readFileSync('web-2d/turn-feedback.js','utf8');vm.runInThisContext(src.slice(0,src.indexOf('const turnDamageHud=')));
let cases=0;
for(const fps of [30,60,120]){
 const g=new CampaignGame(()=>.4);g.enterTest('daggers','executioner',true);g.enemyHp=g.enemyMax=1000;
 g.beginChain([{family:'melee',kind:'melee',target:0}]);
 while(!g.daggerWindow||g.time<g.daggerWindow.start)g.update(1/fps);
 g.weaponAction();while(g.time<g.enemyRecoveryUntil)g.update(1/fps);
 assert(g.beginChain([{family:'melee',kind:'melee',target:0}]));
 while(g.shots.some(s=>!s.hit))g.update(1/fps);
 assert.equal(g.turnDamageTotals[1],10);assert.equal(g.turnDamageTotals[2]||0,0);
 const before=g.turnDamageTotals[1];g.update(1/fps);assert.equal(g.turnDamageTotals[1],before);
 g.loadEnemy('swordsman');assert.deepEqual(g.turnDamageTotals,{});cases++;
 const overkill=new CampaignGame(()=>.4);overkill.enterTest('katana','executioner',true);overkill.enemyHp=3;
 overkill.beginChain([{family:'melee',kind:'melee',target:0}]);
 while(overkill.state==='combat')overkill.update(1/fps);
 assert.equal(overkill.turnDamageTotals[1],3);cases++;
}
console.log('Turn damage: '+cases+' cases passed; delayed follow-ups stay with original turn, overkill capped, reset clears totals.');
