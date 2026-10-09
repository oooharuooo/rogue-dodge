require('./progression-32.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('web-2d/build-economy.js','utf8'));
let checks=0,saves={};global.localStorage={getItem:k=>saves[k]||null,setItem:(k,v)=>saves[k]=v,removeItem:k=>delete saves[k]};
function fresh(){saves={};const g=new CampaignGame(()=>.4);g.start('katana');g.selectSkill('focus');return g;}
function kill(g,boss=false,node='swordsman'){g.routeReward=node;g.loadEnemy(boss?'executioner':'swordsman',boss);g.enemyHp=1;g.bossShownPhase=3;g.shots=[{damage:1,impact:g.time+.01,start:g.time,hit:false,perfect:false}];g.update(.02);}
{const g=fresh();kill(g);assert.equal(g.rewardKind,'combat');assert.equal(g.meta.gold,2);assert.equal(g.meta.xp.katana,1);assert.deepEqual(g.offerSkills(Object.keys(SKILLS)),[]);assert(!g.selectSkill('focus'));g.skip();assert.equal(g.floor,1);checks++;}
{const g=fresh();kill(g,false,'duelist');assert.equal(g.rewardKind,'elite');assert.equal(g.meta.gold,6);assert.equal(g.meta.xp.katana,2);assert.deepEqual(g.offerSkills(Object.keys(SKILLS)),['focus']);assert(!g.selectSkill('flame_counter'));assert(g.selectSkill('focus'));assert.equal(g.skills.focus,2);checks++;}
{const g=fresh();g.state='shop';g.meta.gold=4;const offer=g.offerSkills(Object.keys(SKILLS));assert(offer.includes('focus')&&offer.includes('flame_counter'));assert(g.selectSkill('flame_counter'));assert.equal(g.meta.gold,0);assert.equal(g.skills.flame_counter,1);checks++;}
{const g=fresh();g.state='shop';g.meta.gold=3;assert(!g.selectSkill('flame_counter'));assert.equal(g.meta.gold,3);assert(g.selectSkill('focus'));assert.equal(g.meta.gold,0);checks++;}
{const g=fresh();g.state='shop';g.hp=2;g.meta.gold=2;assert(g.buySupplies());assert.equal(g.hp,3);assert.equal(g.meta.gold,0);assert.equal(g.state,'route');checks++;}
{const g=fresh();g.state='event';assert(g.chooseEvent('learn'));assert.equal(g.hp,3);assert.deepEqual(g.offerSkills(Object.keys(SKILLS)),['flame_counter']);assert(g.selectSkill('flame_counter'));assert.equal(g.hp,2);assert.equal(g.floor,1);assert(!g.selectSkill('flame_counter'));checks++;}
{const g=fresh();g.state='event';g.hp=1;assert(!g.chooseEvent('learn'));assert.equal(g.hp,1);g.hp=2;g.chooseEvent('learn');g.skip();assert.equal(g.hp,2);checks++;}
{const g=fresh();g.state='shrine';assert(!g.selectSkill('flame_counter'));assert(g.selectSkill('focus'));checks++;}
{const g=fresh();g.state='shop';g.meta.gold=20;g.skills={focus:1,flame_counter:1,momentum:1,resolve:1};ensureProgress(g.meta).legacyUnlocked.ember=true;assert(!g.selectSkill('ember'));assert(g.selectSkill('focus'));assert.equal(Object.keys(g.skills).length,4);checks++;}
{const g=fresh();g.state='shop';g.meta.gold=20;const p=ensureProgress(g.meta);p.legacyUnlocked.ember=p.legacyUnlocked.spark=true;g.skills={focus:1,ember:1};assert(!g.selectSkill('spark'));checks++;}
for(const choice of ['gold','mastery','starter']){const g=fresh();kill(g,true);assert.equal(g.rewardKind,'boss');assert.equal(g.state,'reward');assert.equal(g.meta.wins,1);assert(!g.skip());assert(g.claimBossReward(choice));assert.equal(g.state,'won');assert(!g.claimBossReward(choice));assert.equal(g.meta.gold,choice==='gold'?18:10);assert.equal(g.meta.xp.katana,choice==='mastery'?8:4);assert.equal(ensureProgress(g.meta).starterCharges||0,choice==='starter'?1:0);checks++;}
{const g=fresh(),p=ensureProgress(g.meta);p.tiers.katana[1]=24;p.xp.katana=24;g.meta.xp.katana=24;kill(g,true);assert(!g.claimBossReward('mastery'));assert.equal(g.meta.xp.katana,24);assert(g.claimBossReward('gold'));checks++;}
{const g=fresh(),p=ensureProgress(g.meta);p.starterCharges=3;kill(g,true);assert(!g.claimBossReward('starter'));assert(g.claimBossReward('gold'));checks++;}
{const g=fresh();ensureProgress(g.meta).starterCharges=1;g.start('daggers');g.useStarterCharge=true;assert(!g.selectSkill('spark'));assert.equal(ensureProgress(g.meta).starterCharges,1);assert(g.selectSkill('focus'));assert.equal(g.skills.focus,2);assert.equal(ensureProgress(g.meta).starterCharges,0);g.start();g.selectSkill('focus');assert.equal(g.skills.focus,1);checks++;}
{const g=fresh();g.state='shop';g.meta.gold=4;const offers=g.offerSkills(Object.keys(SKILLS));g.persist();const h=new CampaignGame(()=>.99);assert(h.resume());assert.equal(h.routeVersion,3);assert.deepEqual(h.offerSkills(Object.keys(SKILLS)),offers);assert(h.selectSkill('focus'));assert.equal(h.meta.gold,1);checks++;}
{const g=fresh();kill(g,true);const h=new CampaignGame();assert(h.resume());assert.equal(h.rewardKind,'boss');assert.equal(h.enemyHp,0);const xp=h.meta.xp.katana;assert(h.claimBossReward('starter'));assert.equal(h.meta.xp.katana,xp);assert.equal(h.savedRun,null);const j=new CampaignGame();assert.equal(ensureProgress(j.meta).starterCharges,1);assert(!j.resume());checks++;}
{const g=fresh();g.routeVersion=2;g.floor=3;g.persist();const h=new CampaignGame();assert(h.resume());assert.deepEqual(h.route[3],CAMPAIGN_ROUTE[3]);checks++;}
{const g=fresh(),p=ensureProgress(g.meta);p.tiers.katana[1]=19;p.xp.katana=19;g.meta.xp.katana=19;kill(g,true);assert.equal(g.bossRewardOptions().find(o=>o.id==='mastery').amount,1);assert(g.claimBossReward('mastery'));assert.equal(p.xp.katana,24);checks++;}
{const g=fresh();g.dungeonId=2;kill(g,true);assert(g.claimBossReward('mastery'));const p=ensureProgress(g.meta);assert.equal(qualifiedXP(p,'katana',2),8);assert.equal(progressionCount(p,2),1);checks++;}
{const g=fresh();g.enterTest('katana','executioner',true);const before=JSON.stringify(g.meta);g.rewardKind='boss';g.state='reward';assert(!g.claimBossReward('gold'));assert(!g.claimBossReward('mastery'));assert(!g.claimBossReward('starter'));assert.equal(JSON.stringify(g.meta),before);checks++;}
// Exhaust every reachable branch: every new route goes through the shop.
{function paths(tier,index,shop){const ids=BUILD_ROUTE[tier];shop||=ids[index]==='shop';if(tier===BUILD_ROUTE.length-1){assert(shop);return;}for(let j=0;j<BUILD_ROUTE[tier+1].length;j++)if(routeConnected(BUILD_ROUTE,tier,index,j))paths(tier+1,j,shop);}for(let i=0;i<BUILD_ROUTE[0].length;i++)paths(0,i,false);checks++;}
console.log('Build economy: '+checks+' checks passed: rewards, exact prices, HP trade, skill/element caps, boss choice once, seals, shop route, saved offers and legacy routes.');
for(const w of Object.keys(WEAPONS)){
 const g=fresh();g.start(w);g.selectSkill('focus');let states=new Set(),wins=0,previous=g.state;
 for(let frame=0;frame<120000&&!['won','lost'].includes(g.state);frame++){
  states.add(g.state);
  if(g.state==='route')g.selectNode(g.availableNodes()[0]);
  else if(g.state==='event'){if(!g.chooseEvent('learn'))g.chooseEvent('safe');}
  else if(['reward','shop','shrine'].includes(g.state)){
   if(g.rewardKind==='boss')g.claimBossReward('starter');
   else if(g.rewardKind==='combat')g.skip();
   else {const id=g.offerSkills(Object.keys(SKILLS))[0];if(!id||!g.selectSkill(id))g.skip();}
  }else if(g.state==='combat'){
   if(!g.combo&&!g.counter&&!g.action)g.beginChain();const a=g.attack;
   if(a&&!a.resolved){if(w==='bow'&&!g.bowSpent&&g.time>=a.start+(a.impact-a.start)*.32)g.weaponAction();if(w==='katana'&&a.family==='melee'&&a.kind!=='jump'){if(g.time>=a.impact-.1)g.deflect(a.target);}else if(!g.action&&g.time>=a.impact-.45)g.act(g.recommendedAction(a));}
   if(w==='daggers'&&g.daggerWindow&&g.time>=g.daggerWindow.start+.04)g.weaponAction();if(w==='greatsword'&&g.heavyWindow)g.weaponAction();g.update(1/60);
  }
  if(previous==='combat'&&g.state==='reward')wins++;previous=g.state;
 }
 assert.equal(g.state,'won');assert(states.has('shop'));assert.equal(ensureProgress(g.meta).starterCharges,1);assert(Object.keys(g.skills).length<=4);assert.equal(g.savedRun,null);console.log('Full D1 '+w+': '+wins+' wins, '+g.runXP+' XP, '+g.meta.gold+' Gold left, build '+JSON.stringify(g.skills)+', HP '+g.hp+'.');
}

