// Campaign tuning stays separate from legacy weapon/reward formulas.
Object.assign(ENEMIES,{iron_bear:{name:'Iron Bear',variant:1,hp:11,windup:1.65,pattern:['jump','down','up']},frost_wolf:{name:'Frost Wolf',variant:1,hp:8,windup:1.4,pattern:['down','up','jump']}});
Object.assign(BOSSES,{elder_bear:{name:'Elder Bear',variant:1,hp:24,windup:1.6,phases:3,pattern:['jump','up','down']}});
const BEAST_IDS=['dread_wolf','frost_wolf','iron_bear','elder_bear'];
const ROOM_ROSTERS={swordsman:['swordsman','goblin_scout','frost_wolf'],heavy_knight:['heavy_knight','orc_raider','iron_bear'],rogue:['rogue','moss_golem','dread_wolf'],duelist:['duelist','minotaur_guard','ogre_smith']};
class CampaignGame extends CombatGame {
 constructor(rng=Math.random){super(rng);this.testTempo='standard';this.runIndex=0;this.routeReward=null;}
 start(weapon=this.weapon){const ok=super.start(weapon);this.runIndex=this.meta.wins;this.routeReward=null;this.persist();return ok;}
 roomEnemy(node){const ids=ROOM_ROSTERS[node];return ids?ids[(this.runIndex||0)%ids.length]:node;}
 get combatProfile(){return BEAST_IDS.includes(this.enemyId)?'melee':super.combatProfile;}
 get chainLength(){if(this.test&&this.testLength)return super.chainLength;if(this.enemyId==='elder_bear')return [2,3,4][this.phase-1];return super.chainLength;}
 beginChain(forced){
  if(!forced){const profile=this.combatProfile,id=this.enemyId;forced=Array.from({length:this.chainLength},(_,i)=>{
   const family=profile==='mixed'?(this.rng()<.5?'melee':'ranged'):profile,r=this.rng();
   if(family==='ranged'){const kind=r<1/3?'up':r<2/3?'down':'jump';return {family,kind,target:kind==='up'?0:kind==='down'?2:1};}
   const slam=['iron_bear','elder_bear','ogre_smith','rune_golem'].includes(id)?.4:['dread_wolf','frost_wolf'].includes(id)?.15:.25;
   if(r<slam)return {family,kind:'jump',target:1};
   const pick=(r-slam)/(1-slam);return {family,kind:'melee',target:i===0?1:pick<1/3?0:pick<2/3?1:2};
  });}
  const ok=super.beginChain(forced);if(!ok)return false;
  const tempo=this.test?this.testTempo:'standard',mult=tempo==='slow'?1.25:tempo==='challenge'?.92:1;
  const early=!this.test&&this.floor===0?.2:0;
  const windup=Math.max(1.15,(this.enemy.windup+early)*mult);
  this.combo.first=this.time+windup;this.combo.interval=Math.max(1.4,(1.65-(this.phase-1)*.1)*mult);this.attack=this.makeHit(0);return true;
 }
 selectNode(id){
  if(this.state!=='route'||!ROUTE[this.floor]?.includes(id))return false;
  this.routeReward=null;
  if(ROOM_ROSTERS[id]){this.log.push(id);this.routeReward=id;return this.loadEnemy(this.roomEnemy(id));}
  if(['rest','camp'].includes(id)&&this.hp===3){this.log.push(id);this.shield=Math.max(this.shield,1);this.floor++;this.state='route';this.persist();return true;}
  return super.selectNode(id);
 }
 selectSkill(id){if(((this.state==='starter'&&['momentum','guardian'].includes(id))||this.skills[id])&&!this.unlocked(id)&&['starter','reward','shop','shrine'].includes(this.state)&&(this.skills[id]||0)<2){
   if(this.state==='shop'&&this.meta.gold<2)return false;const prior=this.state;if(prior==='shop')this.meta.gold-=2;this.skills[id]=(this.skills[id]||0)+1;if(id==='guardian')this.shield=1;if(prior!=='starter')this.floor++;this.state='route';this.persist();return true;
  }return super.selectSkill(id);}
 update(dt){const before=this.state,elite=this.routeReward==='duelist'&&this.enemyId!=='duelist';super.update(dt);
  if(before==='combat'&&this.state==='reward'&&elite){this.grantGold(2);if(!this.test&&this.encounterHits===0)this.meta.elite++;this.persist();}
 }
 persist(){super.persist();if(!this.test&&this.savedRun){this.savedRun.runIndex=this.runIndex||0;this.savedRun.routeReward=this.routeReward;try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}}
}
if(typeof module!=='undefined')module.exports={CampaignGame,BEAST_IDS,ROOM_ROSTERS};
