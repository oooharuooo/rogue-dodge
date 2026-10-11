require('./world-map-41.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('web-2d/dungeon-42.js','utf8'));
let storage={};global.localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]};
for(const dungeon of [1,2])for(const w of Object.keys(WEAPONS)){
 storage={};const g=new CampaignGame(()=>.4);assert(!g.startDungeon(2,w));worldProgress(g)[1]=1;assert(g.startDungeon(dungeon,w));assert.equal(g.dungeonId,dungeon);assert.equal(g.bossId,DUNGEON_BOSSES[dungeon]);g.selectSkill('focus');let rooms=0,phases=new Set();
 for(let step=0;step<80&&!['won','lost'].includes(g.state);step++){
  if(g.state==='route'){const ids=g.availableNodes();if(dungeon===1&&g.floor===0)assert.equal(g.roomEnemy('swordsman'),'goblin_scout','Goblin Scout is the first D1 encounter on the opening combat path');const pick=ids.find(id=>['swordsman','heavy_knight','rogue','duelist','boss'].includes(id))||ids[0];assert(g.selectNode(pick));}
  else if(g.state==='combat'){
   rooms++;if(rooms===1){if(dungeon===1){assert.equal(g.enemyId,'goblin_scout','The first normal D1 fight loads Goblin Scout');assert(g.beginChain());assert.equal(g.attack.enemySkill,'goblin_crescent_47','Goblin opens with its approved signature skill');assert.equal(g.attack.coverage,'all','The opening skill covers all three lanes');assert.equal(g.recommendedAction(),'jump','The signature skill retains its timed Jump counter');}g.persist();const h=new CampaignGame(()=>.4);assert(h.resume());assert.equal(h.dungeonId,dungeon);assert.equal(h.enemyHp,g.enemyHp);assert.equal(h.route.length,9);assert.equal(h.bossId,DUNGEON_BOSSES[dungeon]);}
   for(let frame=0;frame<20000&&g.state==='combat';frame++){
    if(g.isBoss)phases.add(g.phase);
    if(!g.combo&&!g.counter&&!g.action&&!g.shots.some(s=>!s.hit)&&g.time>=(g.enemyRecoveryUntil||0))g.beginChain();
    if(g.attack&&!g.attack.resolved&&!g.action&&g.time>=g.attack.impact-.45){const action=g.recommendedAction();if(action)g.act(action);}
    g.update(1/60);
   }assert.notEqual(g.state,'combat');
  }else if(g.state==='reward'&&g.rewardKind==='boss'){const marks=g.meta.victoryMarks;g.update(.05);assert.equal(g.meta.victoryMarks,marks);assert(g.claimBossReward());assert(!g.claimBossReward());}
  else if(['reward','shop','shrine'].includes(g.state)){const pick=g.offerSkills(Object.keys(SKILLS)).find(id=>g.state!=='shop'||g.supplies>=g.skillPrice(id));if(pick)assert(g.selectSkill(pick));else assert(g.skip());}
  else if(g.state==='event')assert(g.chooseEvent('safe'));else throw Error(g.state);
 }
 assert.equal(g.state,'won',w);assert.equal(g.runMarks,dungeon===2?15:10);assert.equal(g.meta.victoryMarks,dungeon===2?15:10);assert.equal(worldProgress(g)[dungeon],dungeon===1?2:1);assert(qualifiedXP(ensureProgress(g.meta),w,dungeon)>0);assert.equal(g.supplies,0);assert.deepEqual([...phases],dungeon===2?[1,2,3]:[1,2]);assert.equal(g.dungeonStatus(3).requirementMet,dungeon===2);assert(!g.dungeonStatus(3).available);
 console.log('Dungeon '+dungeon+' '+w+': '+rooms+' combats, '+g.runXP+' qualified XP, '+g.runMarks+' Marks, '+phases.size+' boss phases, exact resume.');
}
console.log('Dungeon 42 checks passed.');
storage={};const rankGame=new CampaignGame(()=>.4);worldProgress(rankGame)[1]=1;assert(rankGame.startDungeon(2,'katana'));const p=ensureProgress(rankGame.meta);p.xp.katana=rankGame.meta.xp.katana=24;p.tiers.katana[1]=24;p.legacyRanks.katana=1;for(let i=0;i<12;i++){rankGame.loadEnemy('frost_wolf');rankGame.enemyHp=0;rankGame.awardEncounterXP();}assert.equal(rankGame.level,2);rankGame.persist();const ranked=new CampaignGame(()=>.4);assert.equal(masteryRank(ranked.meta,'katana'),2);assert.equal(qualifiedXP(ensureProgress(ranked.meta),'katana',2),12);console.log('Dungeon 2 qualified XP unlocks Mastery Lv.2 at 36 total / 12 qualified and persists.');
