const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
global.LaneGame=require('../web-2d/lane-core.js');
Object.assign(global,require('../web-2d/full-core.js'));
global.CombatGame=require('../web-2d/combat-core.js').CombatGame;
const {CampaignGame,D1_ALL_LANE_SKILLS}=require('../web-2d/campaign-core.js');
const {attackSoundCue}=require('../web-2d/feedback.js');
let checks=0;const ok=(value,message)=>{assert.ok(value,message);checks++;};

function startSkill(){const g=new CampaignGame();g.enterTest('bow','goblin_scout');g.testLength=4;g.begin();return g;}
{
 const g=startSkill(),a=g.attack;
 ok(a.enemySkill==='goblin_crescent_47','Goblin selects the mapped #47 move');
 ok(a.coverage==='all'&&a.skillClass==='single'&&a.beatCount===1,'The all-lanes skill remains one attack beat');
 ok(g.combo.hits.length===1,'Single-beat skill does not become a combo even when Test Mode requests four');
 ok(g.recommendedAction(a)==='jump','Only Jump is recommended for the full-screen slash');
}
{
 const g=new CampaignGame();g.enterTest('katana','orc_raider');g.testCoverage='all';g.testLength=4;g.begin();
 ok(g.combo.hits.length===1,'The Test Mode all-lanes skill stays a single beat even when combo length is four');
 ok(g.attack.coverage==='all'&&g.recommendedAction()==='jump','All-lanes test attack clearly covers all lanes and requires Jump');
}
{
 const g=new CampaignGame(()=>.99);g.enterTest('bow','goblin_scout');g.testCoverage='single';g.testFamily='melee';g.testLength=1;g.attackCount=1;g.beginChain();
 ok(g.attack.enemySkill==='goblin_dagger_01'&&g.attack.coverage!=='all','Goblin ordinary single-lane melee is mapped to its approved lab move');
}
{
 const g=new CampaignGame(()=>.1);g.enterTest('bow','goblin_scout');g.testCoverage='combo';g.testLength=1;g.attackCount=1;g.beginChain();
 ok(g.attack.kind==='melee'&&g.attack.enemySkill==='goblin_dagger_01'&&g.attack.coverage!=='all','Goblin random single-lane attacks cannot become a second generic earthquake/all-lanes move');
 const special=new CampaignGame();special.enterTest('bow','goblin_scout');special.testCoverage='all';special.beginChain();
 ok(special.attack.enemySkill==='goblin_crescent_47'&&special.attack.coverage==='all'&&special.attack.kind==='melee','Goblin has exactly one deliberate all-lanes move: #47');
}
{
 const g=startSkill();g.update(.70);ok(g.act('jump'),'Player can start the timed Jump');g.update(.45);
 ok(g.lastCombo.results.length===1&&g.lastCombo.results[0].safe,'A correctly timed Jump avoids the slash');
 ok(g.lastCombo.results[0].perfect,'Jump centered on impact receives the existing Perfect window');
 ok(g.hp===3,'Correct Jump preserves health');
}
{
 const g=startSkill();g.update(.70);ok(g.act('up'),'Up input remains available for testing');g.update(.45);
 ok(!g.lastCombo.results[0].safe&&g.hp===2,'Changing lane does not evade an all-lanes crescent');
}
{
 global.Image=class{constructor(){this.complete=true;this.naturalWidth=965;this.naturalHeight=1629;}set src(value){this.path=value;}};
 const {drawGoblinCrescent47,drawGoblinDagger01,drawD1Crescent47,drawExecutionerLattice44}=require('../web-2d/enemy-skills-60.js'),g=startSkill(),draws=[],translations=[],scales=[];
 const ctx={save(){},restore(){},translate(x,y){translations.push([x,y]);},scale(x,y){scales.push([x,y]);},rotate(){},drawImage(...args){draws.push(args);}};
 g.time=g.attack.impact-.12;drawGoblinCrescent47(ctx,g,false);
 ok(draws.length===3,'Main crescent and two staggered afterimages are separate image layers');
 ok(draws.every(args=>args[0].path==='monster-parts/goblin/Crescent47.png'),'Animation layers use the approved bitmap asset');
 draws.length=0;drawGoblinDagger01(ctx,g,false);
 ok(draws.length===0,'Goblin single-lane SlashFX never appears during the all-lanes Crescent #47 attack');
 const centers=translations.slice(0,3).map(args=>args[0]);
 ok(centers[0]>centers[1]&&centers[1]>centers[2],'Goblin crescent moves from Goblin toward the hero in mirrored world coordinates');
 ok(scales.slice(0,3).every(([x,y])=>x===-1&&y===1),'Goblin crescent uses the corrected slash orientation');
 draws.length=0;drawGoblinCrescent47(ctx,g,true);
 ok(draws.length===0,'Reduced motion hides the travelling animation before impact');
 g.time=g.attack.impact;drawGoblinCrescent47(ctx,g,true);
 ok(draws.length===1,'Reduced motion displays one still image at the hit beat');
 g.attack.interrupted=true;draws.length=0;drawGoblinCrescent47(ctx,g,false);
 ok(draws.length===0,'An interrupted attack cancels its visual slash');

 g.attack={...g.attack,enemySkill:'goblin_dagger_01',target:2,interrupted:false};draws.length=0;translations.length=0;scales.length=0;
 drawGoblinCrescent47(ctx,g,false);
 ok(draws.length===0,'All-lanes Crescent #47 never appears during the single-lane SlashFX attack');
 g.time=g.attack.impact-.28;drawGoblinDagger01(ctx,g,false);const early=translations.map(args=>args[0]);
 g.time=g.attack.impact-.04;draws.length=0;translations.length=0;drawGoblinDagger01(ctx,g,false);const late=translations.map(args=>args[0]);
 ok(draws.length===3&&draws.every(args=>args[0].path==='monster-parts/goblin/SlashFX.png'),'Single-lane move uses the Goblin SlashFX bitmap in a layered travelling trail');
 ok(early[0]>late.at(-1)&&late.at(-1)<90&&translations.every(args=>args[1]>=650&&args[1]<=654),'Single-lane SlashFX travels from the Goblin, along the selected lane, and through the hero');
 ok(scales.every(([x,y])=>x===y&&x>0),'Single-lane SlashFX is not locally mirrored backward against the mirrored arena');
 g.attack={...g.attack,enemySkill:'orc_crescent_47',coverage:'all',impact:1,interrupted:false};g.time=.98;draws.length=0;drawD1Crescent47(ctx,g,false);
 ok(draws.length===3&&draws.every(args=>args[0].path==='monster-parts/goblin/Crescent47.png'),'Orc and Minotaur use the selected layered crescent bitmap');
 g.attack={...g.attack,enemySkill:'executioner_lattice_44'};draws.length=0;drawExecutionerLattice44(ctx,g,false);
 ok(draws.length===3&&draws.every(args=>args[0].path==='monster-parts/executioner/Lattice44.png'),'Executioner #44 uses three layered bitmap passes of its selected lattice art');
}
console.log(checks+' Goblin Crescent #47 single-beat / full-lane / timed-Jump checks passed');

// D1 signatures remain separate by enemy, resolve as one full-screen beat,
// and only Jump avoids them. Test Mode uses the same selected enemy skill.
for(const [enemyId,skill] of Object.entries(D1_ALL_LANE_SKILLS)){
 const boss=enemyId==='executioner';
 const g=new CampaignGame(()=>.4);g.enterTest('bow',enemyId,boss);g.testCoverage='all';g.testLength=4;g.beginChain();
 assert.equal(g.attack.enemySkill,skill.id,enemyId+' keeps its selected D1 all-lanes move');
 assert.equal(g.attack.coverage,'all');assert.equal(g.attack.kind,'melee');assert.equal(g.attack.beatCount,1);assert.equal(g.combo.hits.length,1);
 assert.equal(g.recommendedAction(),'jump');assert.equal(attackSoundCue(g.attack).bell,true);checks+=7;
 g.update(g.attack.impact-g.time-.45);assert(g.act('jump'));g.update(.45);assert(g.lastCombo.results[0].safe&&g.hp===3,enemyId+' is evaded by the timed Jump');checks++;
 const miss=new CampaignGame(()=>.4);miss.enterTest('bow',enemyId,boss);miss.testCoverage='all';miss.beginChain();miss.update(miss.attack.impact-miss.time-.45);assert(miss.act('up'));miss.update(.45);assert(!miss.lastCombo.results[0].safe&&miss.hp===2,enemyId+' cannot be evaded by changing lanes');checks++;
 const normal=new CampaignGame(()=>.4);normal.enterTest('bow',enemyId,boss);normal.test=false;normal.dungeonId=1;normal.attackCount=skill.firstAt;normal.beginChain();assert.equal(normal.attack.enemySkill,skill.id,enemyId+' uses its assigned move at its D1 cadence');checks++;
}
console.log('D1 all-lanes assignments, single-beat Jump rule, cadence and wrong-lane punishment passed for Goblin, Orc, Minotaur Elite and Executioner Boss');

// Normal-game three-lane warning: the cross flash is attached to the enemy,
// and the matching warning bell is emitted before release.
{
 const source=fs.readFileSync('web-2d/boss-motion.js','utf8'),begin=source.indexOf('function drawAttackTell'),end=source.indexOf('// Deterministic impact geometry',begin),sandbox={};
 vm.runInNewContext(source.slice(begin,end)+'\nthis.drawAttackTell=drawAttackTell;',sandbox);
 const translations=[],ctx={save(){},restore(){},translate(x,y){translations.push([x,y]);},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}};
 sandbox.drawAttackTell(ctx,{attack:{coverage:'all'},faceAnchor:{x:702,y:427},visualAnchor:{x:710,y:552}}, {x:745,y:500},.3);
 assert.deepEqual(translations,[[702,427]],'All-lanes cross flash stays on the enemy face/upper body');checks++;
 global.localStorage={getItem:()=>null};global.matchMedia=()=>({matches:false});
 const {CombatFeedback}=require('../web-2d/feedback.js'),feedback=new CombatFeedback();let bells=0;feedback.bell=()=>bells++;
 const g=startSkill(),a=g.attack;g.time=a.start+(a.impact-a.start)*.12;feedback.update(g,.01);
 assert.equal(bells,1,'The all-lanes warning bell plays during the tell');checks++;
}
console.log('Normal-game all-lanes enemy flash / warning sound checks passed');
