// Campaign tuning stays separate from legacy weapon/reward formulas.
Object.assign(ENEMIES,{iron_bear:{name:'Iron Bear',variant:1,hp:11,windup:1.65,pattern:['jump','down','up']},frost_wolf:{name:'Frost Wolf',variant:1,hp:8,windup:1.4,pattern:['down','up','jump']}});
Object.assign(BOSSES,{elder_bear:{name:'Elder Bear',variant:1,hp:24,windup:1.6,phases:3,pattern:['jump','up','down']}});
const BEAST_IDS=['dread_wolf','frost_wolf','iron_bear','elder_bear'];
const ROOM_ROSTERS={swordsman:['swordsman','goblin_scout','frost_wolf'],heavy_knight:['heavy_knight','orc_raider','iron_bear'],rogue:['rogue','moss_golem','dread_wolf'],duelist:['duelist','minotaur_guard','ogre_smith']};
// Campaign topology is data, separate from legacy five-room runs.
const CAMPAIGN_ROUTE=[['swordsman','heavy_knight'],['rogue','swordsman','heavy_knight'],['rogue','event','duelist'],['rest','heavy_knight','shrine'],['rogue','shop','duelist'],['event','heavy_knight','treasure'],['duelist','rogue','shrine'],['camp','duelist'],['boss']];
const ROUTE_REGIONS=[{name:'Rừng cổ',subtitle:'Dấu chân trong sương',from:0,to:2},{name:'Đèo đá',subtitle:'Giá của mỗi lựa chọn',from:3,to:5},{name:'Thành bỏ hoang',subtitle:'Trước cổng lãnh chúa',from:6,to:8}];
function routeConnected(route,tier,from,to){if(!route[tier]||!route[tier+1])return false;if(route[tier+1].length===1)return true;return Math.abs(from-to)<=1;}
class CampaignGame extends CombatGame {
 constructor(rng=Math.random){super(rng);this.testTempo='standard';this.runIndex=0;this.routeReward=null;this.routeOutcome='';this.routeVersion=this.savedRun?(this.savedRun.routeVersion||1):2;this.skillOfferKey='';this.skillOfferIds=[];}
 get route(){return this.routeVersion===1?ROUTE:CAMPAIGN_ROUTE;}
 availableNodes(){const ids=this.route[this.floor]||[];if(this.routeVersion===1||this.floor===0)return ids;const prev=this.route[this.floor-1].indexOf(this.log[this.floor-1]);return prev<0?ids:ids.filter((id,i)=>routeConnected(this.route,this.floor-1,prev,i));}
 offerSkills(candidates){const key=this.state+':'+this.floor+':'+this.enemyId+':'+JSON.stringify(this.skills);if(this.skillOfferKey!==key){this.skillOfferKey=key;const pool=[...candidates];this.skillOfferIds=[];while(pool.length&&this.skillOfferIds.length<3){const i=Math.min(pool.length-1,Math.floor(this.rng()*pool.length));this.skillOfferIds.push(pool.splice(i,1)[0]);}this.persist();}return this.skillOfferIds.filter(id=>candidates.includes(id)).slice(0,3);}
 start(weapon=this.weapon){this.routeVersion=2;this.skillOfferKey='';this.skillOfferIds=[];const ok=super.start(weapon);this.runIndex=this.meta.wins;this.routeReward=null;this.routeOutcome='';this.persist();return ok;}
 roomHp(node,tier=this.floor){const e=ENEMIES[this.roomEnemy(node)],depth=this.routeVersion===1?1:1+Math.floor(tier/3)*.15;return Math.ceil(e.hp*depth*(node==='duelist'?1.25:1));}
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
  if(this.state!=='route'||!this.availableNodes().includes(id))return false;
  this.routeReward=null;this.routeOutcome='';
  if(ROOM_ROSTERS[id]){this.log.push(id);this.routeReward=id;const ok=this.loadEnemy(this.roomEnemy(id));if(ok){this.enemyMax=this.enemyHp=this.roomHp(id);this.persist();}return ok;}
  if(['rest','camp'].includes(id)&&this.hp===3){this.log.push(id);this.routeOutcome=this.shield?'Nghỉ · giữ HP và shield, đi tiếp an toàn':'Đã nghỉ · nhận 1 shield';this.shield=Math.max(this.shield,1);this.floor++;this.state='route';this.persist();return true;}
  const hp=this.hp,gold=this.meta.gold;const ok=super.selectNode(id);if(ok&&['rest','camp','treasure'].includes(id)){this.routeOutcome=id==='treasure'?'Kho báu · +3 Gold':this.hp>hp?'Đã nghỉ · +1 HP':'Đã nghỉ · nhận 1 shield';this.persist();}return ok;
 }
 buySupplies(){if(this.state!=='shop'||this.meta.gold<2||this.hp>=3)return false;this.meta.gold-=2;this.hp++;this.floor++;this.state='route';this.routeOutcome='Shop · −2 Gold, +1 HP';this.persist();return true;}
 chooseEvent(choice){if(choice==='safe'&&this.routeVersion!==1){if(this.state!=='event')return false;this.floor++;this.state='route';this.routeOutcome='Lữ hành · Không giao dịch, giữ tài nguyên';this.persist();return true;}if(choice==='supplies'){if(this.state!=='event'||this.meta.gold<2||this.shield)return false;this.meta.gold-=2;this.shield=1;this.floor++;this.state='route';this.routeOutcome='Người lữ hành · −2 Gold, nhận 1 shield';this.persist();return true;}const ok=super.chooseEvent(choice);if(ok){this.routeOutcome=choice==='risk'?'Sự kiện · −1 HP, +5 Gold':'Sự kiện · +2 Gold';this.persist();}return ok;}
 selectSkill(id){if(((this.state==='starter'&&['momentum','guardian'].includes(id))||this.skills[id])&&!this.unlocked(id)&&['starter','reward','shop','shrine'].includes(this.state)&&(this.skills[id]||0)<2){
   if(this.state==='shop'&&this.meta.gold<2)return false;const prior=this.state;if(prior==='shop')this.meta.gold-=2;this.skills[id]=(this.skills[id]||0)+1;if(prior!=='starter')this.floor++;this.state='route';this.persist();return true;
  }return super.selectSkill(id);}
 update(dt){const before=this.state,elite=this.routeReward==='duelist';super.update(dt);
  if(before==='combat'&&this.state==='reward'&&elite){this.grantGold(this.enemyId==='duelist'?2:4);this.routeOutcome='Đường nguy hiểm · +6 Gold và chọn skill';if(!this.test&&this.encounterHits===0&&this.enemyId!=='duelist')this.meta.elite++;this.persist();}
 }
 persist(){super.persist();if(!this.test&&this.savedRun){this.savedRun.routeVersion=this.routeVersion;this.savedRun.skillOfferKey=this.skillOfferKey;this.savedRun.skillOfferIds=this.skillOfferIds;this.savedRun.runIndex=this.runIndex||0;this.savedRun.routeReward=this.routeReward;this.savedRun.routeOutcome=this.routeOutcome;try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}}
}
if(typeof module!=='undefined')module.exports={CampaignGame,BEAST_IDS,ROOM_ROSTERS,CAMPAIGN_ROUTE,ROUTE_REGIONS,routeConnected};
