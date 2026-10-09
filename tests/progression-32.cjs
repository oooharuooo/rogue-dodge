require('./major-one-final.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');vm.runInThisContext(fs.readFileSync('web-2d/progression.js','utf8'));
function normal(w='katana',d=1){const g=new CampaignGame(()=>.4);g.start(w);g.selectSkill('focus');g.selectNode(g.availableNodes()[0]);g.dungeonId=d;return g;}
function winXP(g){g.enemyHp=0;g.awardEncounterXP();}
let checks=0;
for(const w of Object.keys(WEAPONS)){
 const g=normal(w);g.enemyHp=g.enemyMax=1000;g.shots=[{damage:1,impact:g.time+.01,start:g.time,hit:false,perfect:false}];g.update(.02);assert.equal(g.meta.xp[w],0);assert.equal(g.runXP,0);checks++;
 g.enemyHp=1;g.shots=[{damage:1,impact:g.time+.01,start:g.time,hit:false,perfect:false}];g.update(.02);assert.equal(g.meta.xp[w],1);assert.equal(g.runXP,1);winXP(g);assert.equal(g.meta.xp[w],1);checks++;
 for(let i=0;i<100;i++){g.loadEnemy('swordsman');winXP(g);}assert.equal(g.meta.xp[w],24);assert.equal(g.level,1);assert(!g.unlocked('ember'));assert(!g.unlocked('spark'));assert(!g.unlocked('rime'));checks++;
 g.dungeonId=2;for(let i=0;i<12;i++){g.loadEnemy('swordsman');winXP(g);}assert.equal(g.level,2);const xp=g.meta.xp[w];g.dungeonId=1;g.loadEnemy('swordsman');winXP(g);assert.equal(g.meta.xp[w],xp);assert.equal(g.level,2);checks++;
 for(let i=0;i<30;i++){g.dungeonId=2;g.loadEnemy('swordsman');winXP(g);}assert.equal(g.level,2);assert(g.unlocked('ember'));checks++;
 for(let i=0;i<36;i++){g.dungeonId=3;g.loadEnemy('swordsman');winXP(g);}assert.equal(g.level,3);checks++;
}
{const g=normal();g.routeReward='duelist';winXP(g);assert.equal(g.meta.xp.katana,2);g.loadEnemy('executioner',true);winXP(g);assert.equal(g.meta.xp.katana,6);checks++;}
{const g=new CampaignGame();g.enterTest('katana','executioner',true);winXP(g);assert.equal(g.meta.xp.katana,0);assert.equal(g.runXP,0);checks++;}
{const g=normal();g.skills={focus:1,flame_counter:1,momentum:1,resolve:1};g.meta.progression.legacyUnlocked.ember=true;g.state='reward';assert(!g.selectSkill('ember'));assert(g.selectSkill('focus'));assert.equal(g.skills.focus,2);assert(!eligibleExtra(g,'ember'));checks++;}
{const g=new CampaignGame();delete g.meta.progression;g.weapon='katana';g.meta.xp.katana=20;const p=ensureProgress(g.meta);assert.equal(g.level,3);assert(g.unlocked('crescent'));assert.equal(p.legacyXP.katana,20);assert.equal(p.xp.katana,0);checks++;}
{let saved={};global.localStorage={getItem:k=>saved[k]||null,setItem:(k,v)=>{saved[k]=v},removeItem:k=>{delete saved[k]}};const g=normal();winXP(g);g.persist();const h=new CampaignGame();assert.equal(h.meta.xp.katana,1);assert.equal(ensureProgress(h.meta).xp.katana,1);h.resume();winXP(h);assert.equal(h.meta.xp.katana,1);checks++;}
console.log(`Mastery v2: ${checks} checks passed: encounter-only XP, once-only rewards, D1 cap, D2/D3 gates, replay ranks, Test isolation, slots, migration and reload.`);



global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
for(const weapon of Object.keys(WEAPONS)){
 const g=new CampaignGame(()=>.4);g.start(weapon);g.selectSkill('focus');let encounterWins=0,lastState=g.state;
 for(let frame=0;frame<120000&&!['won','lost'].includes(g.state);frame++){
  if(g.state==='route')g.selectNode(g.availableNodes()[0]);
  else if(['reward','shop','shrine','event'].includes(g.state)){if(g.state==='reward'&&g.skills.focus<2)g.selectSkill('focus');else g.skip();}
  else if(g.state==='combat'){if(!g.combo&&!g.counter&&!g.action)g.beginChain();const a=g.attack;if(a&&!a.resolved){if(weapon==='bow'&&!g.bowSpent&&g.time>=a.start+(a.impact-a.start)*.32)g.weaponAction();if(weapon==='katana'&&a.family==='melee'&&a.kind!=='jump'){if(g.time>=a.impact-.1)g.deflect(a.target);}else if(!g.action&&g.time>=a.impact-.45)g.act(g.recommendedAction(a));}if(weapon==='daggers'&&g.daggerWindow&&g.time>=g.daggerWindow.start+.04)g.weaponAction();if(weapon==='greatsword'&&g.heavyWindow)g.weaponAction();g.update(1/60);}
  if(lastState==='combat'&&['reward','won'].includes(g.state))encounterWins++;lastState=g.state;
 }
 assert.equal(g.state,'won');assert.equal(g.level,1);assert.equal(g.meta.progression.encounters[1],encounterWins);assert(g.runXP<=24&&g.runXP>=encounterWins+3);assert.equal(g.meta.xp[weapon],g.runXP);console.log(`Full D1 ${weapon}: ${encounterWins} wins, ${g.runXP} XP, rank ${g.level}, HP ${g.hp}.`);
}

