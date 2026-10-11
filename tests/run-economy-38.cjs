require('./checkpoint-combat-35.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let store={},checks=0;global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
store={'rogue-lane-main-v1':'old','rogue-lane-checkpoint-v1':'old','rogue-locale':'vi'};
vm.runInThisContext(fs.readFileSync('web-2d/run-storage.js','utf8'));assert(!store['rogue-lane-main-v1']);assert.equal(store['rogue-locale'],'vi');checks++;
vm.runInThisContext(fs.readFileSync('web-2d/run-economy.js','utf8'));
function fresh(w='katana'){store={};const g=new CampaignGame(()=>.4);assert(g.start(w));assert(g.selectSkill('focus'));return g;}
function kill(g,boss=false){g.loadEnemy(boss?'executioner':'swordsman',boss);g.enemyHp=1;g.bossShownPhase=3;g.shots=[{start:g.time,impact:g.time+.01,damage:1,perfect:false}];g.update(.02);}
for(const w of Object.keys(WEAPONS)){
 const g=fresh(w);assert.equal(g.hp,3);assert.equal(g.supplies,0);const locked=g.weapon;g.weapon=Object.keys(WEAPONS).find(x=>x!==w);assert.equal(g.weapon,locked);checks++;
 kill(g);assert.equal(g.supplies,2);assert.equal(g.meta.victoryMarks,0);assert.equal(g.runXP,1);g.skip();g.state='shop';g.grantGold(5);const marks=g.meta.victoryMarks;assert(g.selectSkill('focus'));assert.equal(g.supplies,4);assert.equal(g.meta.victoryMarks,marks);checks++;
 g.persist();const r=new CampaignGame(()=>.4);assert(r.resume());assert.equal(r.supplies,4);assert.equal(r.runId,g.runId);assert.equal(r.weapon,w);checks++;
 kill(r,true);assert.equal(r.meta.victoryMarks,10);assert.equal(r.supplies,4);assert.equal(r.state,'reward');assert.equal(r.rewardKind,'boss');r.update(2);assert.equal(r.meta.victoryMarks,10);r.persist();const restored=new CampaignGame(()=>.4);assert(restored.resume());assert.equal(restored.meta.victoryMarks,10);assert(restored.claimBossReward());assert(!restored.claimBossReward());assert.equal(restored.meta.victoryMarks,10);assert.equal(restored.supplies,0);assert.deepEqual(restored.skills,{});assert(!restored.savedRun);checks++;
 const xp=restored.meta.xp[w];assert(restored.returnToLoadout());restored.weapon=Object.keys(WEAPONS).find(x=>x!==w);assert.notEqual(restored.weapon,w);assert(restored.start(restored.weapon));assert.equal(restored.hp,3);assert.equal(restored.supplies,0);assert.deepEqual(restored.skills,{});assert.equal(restored.meta.victoryMarks,10);assert.equal(restored.meta.xp[w],xp);checks++;
}
{const g=fresh();kill(g);g.skip();g.loadEnemy('swordsman');g.hp=1;g.flow=4;g.grantGold(7);g.beginChain([{family:'melee',kind:'melee',target:1}]);for(let i=0;i<200&&g.state==='combat';i++)g.update(1/60);assert.equal(g.state,'lost');assert.equal(g.supplies,0);assert.equal(g.flow,0);assert.deepEqual(g.skills,{});assert.equal(g.meta.xp.katana,1);assert.equal(g.runResult.suppliesDiscarded,9);assert(!g.savedRun);assert(!new CampaignGame().resume());checks++;}
{const g=fresh();g.grantGold(8);g.state='shop';g.hp=2;assert(g.buySupplies());assert.equal(g.hp,3);assert.equal(g.supplies,6);assert(!g.buySupplies());checks++;}
{const g=fresh();g.loadEnemy('swordsman');g.grantGold(4);g.beginChain([{family:'melee',kind:'melee',target:1}]);g.update(.5);g.persist();const savedTime=g.time;const r=new CampaignGame();assert(r.resume());assert.equal(r.time,savedTime);assert.deepEqual(r.attack,g.attack);assert.equal(r.supplies,4);assert.equal(r.meta.victoryMarks,0);checks++;}
{const g=fresh();const memory=JSON.stringify(store),meta=JSON.stringify(g.meta);g.enterTest('bow','executioner',true);kill(g,true);assert.equal(JSON.stringify(store),memory);assert.equal(JSON.stringify(g.meta),meta);checks++;}
{const g=fresh();kill(g,true);g.claimBossReward();const old=g.runId;g.returnToLoadout();g.start('katana');g.selectSkill('focus');assert.notEqual(g.runId,old);kill(g,true);assert.equal(g.meta.victoryMarks,20);checks++;}
{const g=fresh();assert(!Object.hasOwn(JSON.parse(store['rogue-lane-main-v1']),'gold'));assert.equal(ensureProgress(g.meta).starterCharges,0);checks++;}
// Complete real current D1 routes for each weapon at multiple frame rates.
for(const w of Object.keys(WEAPONS))for(const fps of [30,60,120]){
 const g=fresh(w);let frames=0;
 while(!['won','lost'].includes(g.state)&&frames++<fps*500){
  if(g.state==='route')g.selectNode(g.availableNodes()[0]);
  else if(g.state==='event')g.chooseEvent('safe');
  else if(g.state==='reward'&&g.rewardKind==='boss')g.claimBossReward();
  else if(['reward','shop','shrine'].includes(g.state))g.skip();
  if(g.state==='combat'&&!g.attack&&!g.combo&&!g.counter&&!g.shots.some(s=>!s.hit))g.begin();
  const a=g.attack;if(a&&!a.resolved&&!g.action&&g.time>=a.impact-.45){const action=g.recommendedAction();if(action)g.act(action);}
  g.update(1/fps);
 }
 assert.equal(g.state,'won',w+' '+fps);assert.equal(g.meta.victoryMarks,10);assert.equal(g.supplies,0);assert(g.runResult.xp>0);assert.deepEqual(g.skills,{});checks++;
}
{const g=fresh();g.grantGold(6);g.loadEnemy('swordsman');g.beginChain([{family:'melee',kind:'melee',target:1}]);g.update(.4);g.persist();const before=store['rogue-lane-checkpoint-v1'];g.reset();g.weapon='bow';g.persist();assert.equal(store['rogue-lane-checkpoint-v1'],before);const r=new CampaignGame();assert(r.resume());assert.equal(r.weapon,'katana');assert.equal(r.supplies,6);assert.equal(r.time,.4);checks++;}
{const g=fresh();const p=ensureProgress(g.meta);p.xp.katana=36;p.tiers.katana={1:24,2:12};g.meta.xp.katana=36;g.persist();g.start('katana');assert.equal(g.level,2);assert.equal(g.supplies,0);assert.deepEqual(g.skills,{});checks++;}
for(const w of Object.keys(WEAPONS))for(const point of [.4,1.3,3,5]){
 const g=fresh(w);g.loadEnemy('executioner',true);g.enemyMax=g.enemyHp=1000;g.grantGold(7);g.beginChain([0,1,2].map(target=>({family:'melee',kind:'melee',target:w==='katana'?target:1})));
 function step(x){const a=x.attack;if(a&&!a.resolved&&!x.action){if(w==='katana'&&x.time>=a.impact-.1)x.deflect(a.target);else if(w!=='katana'&&x.time>=a.impact-.45)x.act('up');}x.update(1/60);}
 while(g.time<point)step(g);g.persist();const snapshot={...store};while(g.time<9)step(g);const result=x=>JSON.stringify({hp:x.hp,enemyHp:x.enemyHp,damage:x.totalDamage,stamina:x.stamina,supplies:x.supplies,weapon:x.weapon,meta:x.meta});const expected=result(g);store={...snapshot};const r=new CampaignGame(()=>.4);assert(r.resume());while(r.time<9)step(r);assert.deepEqual(JSON.parse(result(r)),JSON.parse(expected));checks++;
}
console.log('Independent dungeon: '+checks+' checks passed — four weapons, Supplies/Marks separation, once-only boss rewards, loss/reset, menu resume, Mastery retention, 16 timeline comparisons, Test isolation and 12 complete D1 runs.');
