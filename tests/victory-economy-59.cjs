const assert59=require('node:assert/strict');require('./journey-57.cjs');
for(const dungeon of [1,2])for(const weapon of Object.keys(WEAPONS)){
 const g=new CampaignGame(()=>.4);worldProgress(g)[1]=1;assert59(g.startDungeon(dungeon,weapon,true));g.selectSkill('momentum');g.state='shop';g.supplies=6;g.hp=2;
 assert59.equal(g.skillPrice('focus'),4);assert59.equal(g.skillPrice('momentum'),3);
 assert59(g.buySupplies());assert59.equal(g.supplies,4);assert59(!g.buySupplies());assert59(g.selectSkill('focus'));assert59.equal(g.supplies,0);
 g.state='shop';g.supplies=2;const build=JSON.stringify(g.skills);assert59(!g.selectSkill('momentum'));assert59.equal(JSON.stringify(g.skills),build);assert59.equal(g.supplies,2);
 g.state='event';g.hp=1;assert59(!g.chooseEvent('learn'));assert59.equal(g.hp,1);
 g.state='shrine';const offers=g.offerSkills(Object.keys(SKILLS));assert59(offers.every(id=>g.skills[id]));
}
console.log('59: eight weapon/dungeon economy budgets: heal vs new skill, upgrade affordability, no last-heart skill trade, owned-skill shrine offers passed.');

