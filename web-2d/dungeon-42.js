// Dungeon 2 reuses the approved Frost Golem rig with a dedicated boss moveset.
WORLD_DUNGEONS[1].released=true;
BOSSES.frost_golem={...ENEMIES.frost_golem,name:'Frost Sentinel',hp:128,windup:1.55,phases:3,pattern:['jump','up','down']};
const SNOW_ROUTE=[['swordsman','heavy_knight'],['rogue','swordsman','heavy_knight'],['event','rest','duelist'],['shop'],['rogue','heavy_knight'],['shrine','event','treasure'],['duelist','rogue','shrine'],['camp','duelist','shop'],['boss']];
const DUNGEON_ROSTERS={
 1:{swordsman:['swordsman','goblin_scout'],heavy_knight:['heavy_knight','orc_raider','iron_bear'],rogue:['rogue','moss_golem','dread_wolf'],duelist:['duelist','minotaur_guard','ogre_smith']},
 2:{swordsman:['frost_wolf','swordsman'],heavy_knight:['frost_golem','heavy_knight'],rogue:['frost_wolf','frost_golem'],duelist:['frost_golem','duelist']}
};
const DUNGEON_BOSSES={1:'executioner',2:'frost_golem'};
Object.defineProperty(CampaignGame.prototype,'dungeonRegions',{get(){return this.dungeonId===2?[
 {name:'Rừng tuyết',subtitle:'Dấu chân trên băng',from:0,to:2},
 {name:'Đèo tuyết',subtitle:'Chọn đường qua giá rét',from:3,to:5},
 {name:'Lõi băng',subtitle:'Frost Sentinel đang chờ',from:6,to:8}
 ]:[{name:'Bìa rừng',subtitle:'Dấu chân trong sương',from:0,to:2},{name:'Rừng sâu',subtitle:'Giá của mỗi lựa chọn',from:3,to:5},{name:'Lõi rừng',subtitle:'Trước trận quyết chiến',from:6,to:8}];}});
const dungeonRoute=Object.getOwnPropertyDescriptor(CampaignGame.prototype,'route').get;
Object.defineProperty(CampaignGame.prototype,'route',{configurable:true,get(){return this.dungeonId===2&&!this.test?SNOW_ROUTE:dungeonRoute.call(this);}});
const dungeonRoom=CampaignGame.prototype.roomEnemy;
CampaignGame.prototype.roomEnemy=function(node){
 // The first D1 combat is the player's first chance to learn Goblin Scout's
 // signature move. Keep this mapping stable across fresh runs and old saves.
 if(!this.test&&this.dungeonId===1&&this.floor===0&&node==='swordsman')return 'goblin_scout';
 const pool=!this.test&&DUNGEON_ROSTERS[this.dungeonId||1]?.[node];return pool?pool[(this.runIndex||0)%pool.length]:dungeonRoom.call(this,node);
};
const dungeonHp=CampaignGame.prototype.roomHp;
CampaignGame.prototype.roomHp=function(...args){const hp=dungeonHp.apply(this,args);return this.dungeonId===2&&!this.test?Math.ceil(hp*1.15/4)*4:hp;};
const dungeonStart=CampaignGame.prototype.startDungeon;
CampaignGame.prototype.startDungeon=function(id,weapon=this.weapon,replaceSaved=false){const ok=dungeonStart.call(this,id,weapon,replaceSaved);if(ok){this.bossId=DUNGEON_BOSSES[id];this.persist();}return ok;};
const dungeonSelect=CampaignGame.prototype.selectNode;
CampaignGame.prototype.selectNode=function(id){if(id==='boss'&&!this.test)this.bossId=DUNGEON_BOSSES[this.dungeonId||1];return dungeonSelect.call(this,id);};
const dungeonChain=Object.getOwnPropertyDescriptor(CampaignGame.prototype,'chainLength')?.get||Object.getOwnPropertyDescriptor(CombatGame.prototype,'chainLength').get;
Object.defineProperty(CampaignGame.prototype,'chainLength',{configurable:true,get(){return this.enemyId==='frost_golem'&&this.isBoss?[2,2,3][this.phase-1]:!this.test&&this.dungeonId===2&&this.routeReward==='duelist'?2:dungeonChain.call(this);}});
const dungeonProfile=Object.getOwnPropertyDescriptor(CampaignGame.prototype,'combatProfile').get;
Object.defineProperty(CampaignGame.prototype,'combatProfile',{configurable:true,get(){return this.isBoss&&this.enemyId==='frost_golem'?(this.phase===1?'melee':this.phase===2?'ranged':'mixed'):dungeonProfile.call(this);}});
// Keep the original windup/recovery durations. Difficulty comes from moves and HP.
const dungeonChainBegin=CampaignGame.prototype.beginChain;
CampaignGame.prototype.beginChain=function(forced){if(!forced&&this.isBoss&&this.enemyId==='frost_golem'){const profiles=[
 [{family:'melee',kind:'melee',target:1},{family:'melee',kind:'jump',target:1}],
 [{family:'ranged',kind:'up',target:0},{family:'ranged',kind:'down',target:2}],
 [{family:'melee',kind:'melee',target:1},{family:'ranged',kind:'down',target:2},{family:'melee',kind:'jump',target:1}]
 ];forced=profiles[this.phase-1].map(x=>({...x}));}return dungeonChainBegin.call(this,forced);};
const dungeonUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(dt){const prior=this.state;dungeonUpdate.call(this,dt);if(!this.test&&this.dungeonId===2&&prior==='combat'&&this.state==='reward'&&this.rewardKind==='boss'&&this.runMarks===10){this.meta.victoryMarks+=5;this.runMarks=15;this.routeOutcome='Boss · +15 Victory Marks';this.persist();}};
