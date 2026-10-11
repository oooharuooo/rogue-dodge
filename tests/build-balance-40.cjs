require('./risk-battle-arts-38.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('web-2d/build-balance-40.js','utf8'));
let saves={},checks=0;global.localStorage={getItem:k=>saves[k]||null,setItem:(k,v)=>saves[k]=v,removeItem:k=>delete saves[k]};
function fresh(w='greatsword'){saves={};const g=new CampaignGame(()=>.4);g.start(w);g.selectSkill('focus');g.loadEnemy('executioner',true);g.enemyHp=g.enemyMax=10000;return g;}
function check(v,m){assert(v,m);checks++;}
for(const w of Object.keys(WEAPONS)){const g=fresh(w);g.hp=1;g.skills.last_stand=1;let damage=0;for(let i=0;i<10;i++){g.opening=false;g.pendingWeaponBonus=0;damage+=g.damage(false,true);}check(damage===WEAPON_RULES[w].base*4*10+Math.floor(WEAPON_RULES[w].base*4*10*.25),'exact long-term percentage '+w);const carry=g.lastStandCarry;g.damage(false,false);check(g.lastStandCarry===carry,'preview does not spend fractional credit');g.shield=1;g.damage(false,true);check(g.lastStandCarry===0,'protection clears unused credit');}
{const g=fresh();g.hp=1;g.skills.last_stand=2;g.heavyChosen=true;check(g.damage(false,true)===10,'Heavy has no Last Stand bonus');g.loadEnemy('swordsman');check(g.lastStandCarry===0,'credit never carries into another encounter');}
{const g=fresh();g.meta.progression.legacyUnlocked.echo=false;artPoint(g,'boss_stagger');check(!g.unlocked('echo'),'one boss Stagger does not unlock');g.loadEnemy('executioner',true);artPoint(g,'boss_stagger');check(!g.unlocked('echo'),'two different boss encounters do not unlock');artPoint(g,'boss_stagger');check(g.unlocked('echo'),'two in same boss unlock');const count=unlockProgress(g.meta,'echo')[0];g.test=true;artPoint(g,'boss_stagger');check(unlockProgress(g.meta,'echo')[0]===count,'Test cannot grant unlock');}
function kill(g){g.enemyHp=1;g.shots=[{start:g.time,impact:g.time+.01,damage:1,hit:false}];g.update(.02);}
{const g=fresh('katana');for(let i=1;i<=4;i++){g.loadEnemy('swordsman');g.routeReward='swordsman';kill(g);check(g.rewardKind===([2,4].includes(i)?'milestone':'combat'),'skill cadence encounter '+i);if(g.rewardKind==='milestone'){const offers=g.offerSkills(Object.keys(SKILLS));check(offers.includes('focus')&&offers.includes('flame_counter'),'milestone new and upgrade');check(g.selectSkill(offers[0]),'milestone claim');}else g.skip();check(!g.selectSkill('focus'),'reward cannot be claimed twice');}check(g.buildCombats===4,'four actual wins, not route nodes');}
{const g=fresh();g.state='shop';g.supplies=4;const a=g.offerSkills(Object.keys(SKILLS));g.persist();const h=new CampaignGame(()=>.9);check(h.resume(),'checkpoint resumes');check(JSON.stringify(a)===JSON.stringify(h.offerSkills(Object.keys(SKILLS))),'merchant cannot reroll on resume');check(h.buildCombats===g.buildCombats,'cadence saved');h.skills={focus:2,flame_counter:2,momentum:2,resolve:1};h.meta.progression.legacyUnlocked.resolve=true;check(h.offerSkills(Object.keys(SKILLS)).every(id=>h.skills[id]),'full build only upgrades');}
{const g=fresh();g.bossStaggers=1;g.lastStandCarry=.5;g.persist();const h=new CampaignGame(()=>.4);check(h.resume()&&h.bossStaggers===1&&h.lastStandCarry===.5,'challenge and credit resume at exact moment');}
check(BUILD_ROUTE[7].includes('shop'),'late merchant option');
console.log('Build balance 40: '+checks+' checks passed — exact risk percentage, protection, same-boss challenge, Test isolation, two cadence milestones, claim once, stable offers/full build and resume.');
const old=fresh();const oldP=ensureProgress(old.meta);delete oldP.buildBalanceVersion;oldP.legacyUnlocked.echo=false;oldP.artAchievements={boss_stagger:{1:5}};check(old.unlocked('echo'),'previously earned art stays unlocked');
{const g=fresh('katana');g.hp=2;g.loadEnemy('swordsman');g.enemyHp=g.enemyMax=100;for(let i=0;i<3;i++){g.encounterXPGranted=false;g.enemyHp=0;g.awardEncounterXP();g.enemyHp=100;g.loadEnemy('swordsman');}check(g.unlocked('second_wind'),'wounded clean wins unlock recovery');}
{const g=fresh('katana');g.meta.progression.legacyUnlocked.ember=false;g.lastCombo={clean:true,results:[{perfect:true}]};for(let i=0;i<9;i++)g.damage(true,true);check(g.unlocked('ember'),'three Perfect triples unlock Ember');g.test=true;const prior=unlockProgress(g.meta,'ember')[0];for(let i=0;i<9;i++)g.damage(true,true);check(unlockProgress(g.meta,'ember')[0]===prior,'Perfect challenge isolated from Test');}
console.log('Additional unlock preservation/challenge checks passed. Total '+checks+'.');
for(const w of Object.keys(WEAPONS)){
 saves={};const run=new CampaignGame(()=>.4);run.start(w);run.selectSkill('flame_counter');let rooms=0;
 for(let guard=0;guard<80&&!['won','lost'].includes(run.state);guard++){
  if(run.state==='route'){const nodes=run.availableNodes(),pick=nodes.find(id=>['swordsman','heavy_knight','rogue','duelist','boss'].includes(id))||nodes[0];assert(run.selectNode(pick));}
  else if(run.state==='combat'){
   rooms++;for(let frame=0;frame<15000&&run.state==='combat';frame++){
    if(!run.combo&&!run.counter&&!run.action&&!run.shots.some(s=>!s.hit)&&run.time>=(run.enemyRecoveryUntil||0))run.beginChain();
    if(run.attack&&!run.attack.resolved&&!run.action&&run.time>=run.attack.impact-.45){const action=run.recommendedAction();if(action)run.act(action);}
    run.update(1/60);
   }assert(run.state!=='combat','encounter completes');
  }else if(run.state==='reward'&&run.rewardKind==='boss')run.claimBossReward();
  else if(['reward','shop','shrine'].includes(run.state)){const offers=run.offerSkills(Object.keys(SKILLS)),pick=offers.find(id=>run.state!=='shop'||run.supplies>=run.skillPrice(id));if(pick)assert(run.selectSkill(pick));else assert(run.skip());}
  else if(run.state==='event')assert(run.chooseEvent('safe'));
  else throw Error(run.state);
 }
 check(run.state==='won'&&run.runMarks===10&&rooms>=4,'complete balanced dungeon '+w);
}
console.log('Four normal dungeon runs passed with new skill milestones, shop/Elite choices and single boss Marks reward. Total '+checks+'.');
