require('./normal-deflect-input.cjs');
const assert=require('node:assert/strict');let count=0;
for(const fps of [30,60,120])for(const target of [0,1,2])for(const lead of [.1,.25,.35,.5])for(const wrong of [false,true]){
 const g=new CampaignGame(()=>.4);g.start('katana');g.selectSkill('focus');g.selectNode(g.availableNodes()[0]);g.enemyHp=g.enemyMax=1000;g.beginChain([{family:'melee',kind:'melee',target}]);while(g.time<g.attack.impact-lead)g.update(1/fps);const actual=g.attack.impact-g.time;g.deflect(wrong?(target+1)%3:target);while(!g.lastCombo)g.update(1/fps);const valid=!wrong&&actual<=.30;assert.equal(g.lastCombo.results[0].deflected,valid,`fps ${fps} lane ${target} lead ${actual}`);assert.equal(g.hp,valid?3:2);count++;
}
console.log(`Normal Deflect timing: ${count} timing/lane/FPS cases passed, no Test Mode automation.`);
