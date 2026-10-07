// Persistence and actual combat FPS checks (beyond the legacy FullGame checks).
const assert=require('node:assert/strict');global.LaneGame=require('../web-2d/lane-core.js');global.FullGame=require('../web-2d/full-core.js').FullGame;const {CombatGame}=require('../web-2d/combat-core.js');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
for(const fps of [20,30,60])for(const family of ['melee','ranged','mixed'])for(const length of [1,2,3,4])for(const normal of [false,true]){
 let seed=31;const g=new CombatGame(()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296});g.enterTest('bow','executioner',true);g.testFamily=family;g.testLength=length;g.enemyHp=g.enemyMax=9999;let seen=-1,finished=0;
 for(let i=0;i<fps*400&&finished<10;i++){
  if(!g.attack&&!g.counter&&!g.shots.some(s=>!s.hit))g.begin();
  const a=g.attack;if(a&&!a.resolved&&!g.action&&g.time>=a.impact-(normal?.30:.45)){const action=g.recommendedAction(a);if(action)g.act(action);}
  g.update(1/fps);if(g.lastCombo&&g.lastCombo.first!==seen){seen=g.lastCombo.first;finished++;ok(g.lastCombo.clean,'Full clean chain at '+fps+' FPS');if(normal)ok(!g.lastCombo.perfect,'Normal timing never promoted to Perfect');}
 }
 ok(finished===10&&g.hp===3,'FPS policy completes 10 chains');
}
const store=new Map();global.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const g=new CombatGame();g.start('daggers');g.selectSkill('focus');g.selectNode('swordsman');g.hp=2;g.enemyHp=3;g.persist();const resumed=new CombatGame();ok(resumed.resume(),'Saved run can resume');ok(resumed.hp===2&&resumed.enemyHp===3&&resumed.weapon==='daggers'&&!resumed.combo,'Checkpoint preserves progress and clears partial animation');const before=JSON.stringify([...store]);resumed.enterTest('bow','dread_wolf');resumed.begin();resumed.update(5);ok(JSON.stringify([...store])===before,'Test cannot overwrite saved normal run');
console.log(checks+' production Normal/Perfect FPS and checkpoint checks passed');
