const assert=require('node:assert/strict');
const memory=new Map();
global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
global.LaneGame=require('../web-2d/lane-core.js');
Object.assign(global,require('../web-2d/full-core.js'));
global.CombatGame=require('../web-2d/combat-core.js').CombatGame;
const {CampaignGame}=require('../web-2d/campaign-core.js');
function fresh(){memory.clear();return new CampaignGame(()=>.5);}
function reopen(){const g=new CampaignGame(()=>.5);assert.equal(g.resume(),true);return g;}
// Reload between combo beats must not refund damage or consumed shields.
for(const shield of [0,1]){
 const g=fresh();g.start('bow');g.selectSkill('focus');g.selectNode('swordsman');g.shield=shield;g.persist();
 g.beginChain([{family:'melee',kind:'melee',target:1},{family:'melee',kind:'melee',target:1}]);
 g.update(g.attack.impact+.01);
 const r=reopen();assert.equal(r.hp,shield?3:2);assert.equal(r.shield,0);assert.equal(r.hits,1);assert.equal(r.encounterHits,shield?0:1);assert.equal(r.attackCount,1);
 assert.equal(r.combo,null);assert.equal(r.action,null);
}
// All purchase rooms survive reload, and a completed purchase cannot repeat.
for(const choice of ['potion','shield','treasure']){
 const g=fresh();g.start();g.selectSkill('focus');g.hp=2;g.meta.gold=12;g.floor=choice==='shield'?2:choice==='treasure'?5:4;g.state='route';
 g.selectNode(choice==='potion'?'shop':choice==='shield'?'event':'treasure');
 let r=reopen();
 if(choice==='potion')assert.equal(r.buySupplies(),true);
 if(choice==='shield')assert.equal(r.chooseEvent('supplies'),true);
 r=reopen();assert.equal(r.meta.gold,choice==='treasure'?15:10);assert.equal(r.floor,choice==='shield'?3:choice==='treasure'?6:5);
 assert.equal(r.buySupplies(),false);assert.equal(r.chooseEvent('supplies'),false);if(choice==='treasure')assert.equal(r.selectNode('treasure'),false);
 assert.ok(r.routeOutcome);
}
// Dangerous room scaling and its bonus survive reload for every roster.
for(let rotation=0;rotation<3;rotation++){
 const g=fresh();g.meta.wins=rotation;g.start('katana');g.selectSkill('focus');g.floor=6;g.state='route';g.selectNode('duelist');
 const hp=g.enemyMax;let r=reopen();assert.equal(r.enemyMax,hp);assert.equal(r.routeReward,'duelist');assert.equal(r.runIndex,rotation);
 r.enemyHp=1;r.shots=[{impact:r.time,damage:1,perfect:false,bonuses:[]}];r.update(.01);
 assert.equal(r.state,'reward');assert.equal(r.runGold,6);assert.equal(r.meta.gold,6);
 r=reopen();r.update(1);assert.equal(r.runGold,6);assert.equal(r.meta.gold,6);assert.equal(r.state,'reward');
}
console.log('Checkpoint combo damage, room purchases and three dangerous rosters passed');
