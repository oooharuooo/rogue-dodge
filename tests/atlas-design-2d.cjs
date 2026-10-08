const assert=require('node:assert/strict');
const memory=new Map();global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
global.LaneGame=require('../web-2d/lane-core.js');Object.assign(global,require('../web-2d/full-core.js'));global.CombatGame=require('../web-2d/combat-core.js').CombatGame;
const {CampaignGame,CAMPAIGN_ROUTE,routeConnected}=require('../web-2d/campaign-core.js');
let paths=0;
function walk(tier,index,visited){
 const id=CAMPAIGN_ROUTE[tier][index];visited=[...visited,id];
 if(tier===8){assert.equal(id,'boss');assert.ok(visited.slice(0,2).every(id=>ENEMIES[id]));paths++;return;}
 const next=CAMPAIGN_ROUTE[tier+1].map((id,j)=>j).filter(j=>routeConnected(CAMPAIGN_ROUTE,tier,index,j));assert.ok(next.length,'No dead-end branches');next.forEach(j=>walk(tier+1,j,visited));
}
CAMPAIGN_ROUTE[0].forEach((id,i)=>walk(0,i,[]));assert.ok(paths>100);
assert.ok(CAMPAIGN_ROUTE.slice(0,3).flat().every(id=>!['rest','camp','shop','treasure','shrine'].includes(id)));
assert.equal(CAMPAIGN_ROUTE.findIndex(ids=>ids.includes('rest')),3);assert.equal(CAMPAIGN_ROUTE.findIndex(ids=>ids.includes('shop')),4);
for(let seed=1;seed<=20;seed++){
 memory.clear();let state=seed;const g=new CampaignGame(()=>{state=(state*1664525+1013904223)>>>0;return state/2**32;});g.start();
 const candidates=['flame_counter','focus','momentum','guardian'];const offers=g.offerSkills(candidates);assert.equal(offers.length,3);assert.equal(new Set(offers).size,3);assert.deepEqual(g.offerSkills(candidates),offers);
 const resumed=new CampaignGame();assert.equal(resumed.resume(),true);assert.deepEqual(resumed.offerSkills(candidates),offers,'Reload cannot reroll draft');
}
memory.clear();const g=new CampaignGame();g.start();g.selectSkill('focus');g.floor=1;g.state='route';g.log=['swordsman'];assert.deepEqual(g.availableNodes(),['rogue','swordsman']);assert.equal(g.selectNode('heavy_knight'),false,'Cannot teleport to unconnected branch');
assert.equal(g.roomHp('swordsman',0),6);assert.equal(g.roomHp('swordsman',3),7);assert.equal(g.roomHp('swordsman',6),8);assert.equal(g.roomHp('duelist',6),17,'Elite multiplier combines with chapter depth');
g.floor=2;g.state='event';g.meta.gold=9;g.chooseEvent('safe');assert.equal(g.meta.gold,9,'Skipping event gives no free reward');
// Saved five-room runs continue under their original layout; new runs use nine.
memory.clear();const old=new FullGame();old.start();old.selectSkill('focus');const legacy=new CampaignGame();assert.equal(legacy.route.length,5);assert.equal(legacy.resume(),true);assert.equal(legacy.route.length,5);legacy.start();assert.equal(legacy.route.length,9);
legacy.floor=8;legacy.state='route';legacy.persist();const late=new CampaignGame();assert.equal(late.resume(),true);assert.equal(late.floor,8);assert.equal(late.route.length,9);
console.log(paths+' complete atlas paths, early difficulty gates, connected choices, stable three-card drafts and checkpoint compatibility passed');
