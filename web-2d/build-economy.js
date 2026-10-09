// Build acquisition v3. Combat damage, animation and unlock ownership stay independent.
const BUILD_PRICES={newSkill:4,upgrade:3,heal:2};
const BUILD_ROUTE=[['swordsman','heavy_knight'],['rogue','swordsman','heavy_knight'],['event','rest','duelist'],['shop'],['rogue','heavy_knight'],['shrine','event','treasure'],['duelist','rogue','shrine'],['camp','duelist'],['boss']];
Object.defineProperty(CampaignGame.prototype,'route',{get(){return this.routeVersion===1?ROUTE:this.routeVersion===3?BUILD_ROUTE:CAMPAIGN_ROUTE;},configurable:true});
const buildStart=CampaignGame.prototype.start;
CampaignGame.prototype.start=function(...args){const ok=buildStart.apply(this,args);if(ok){this.routeVersion=3;this.persist();}return ok;};
const buildReset=CampaignGame.prototype.reset;
CampaignGame.prototype.reset=function(){buildReset.call(this);this.buildRulesVersion=3;this.rewardKind=null;this.bossRewardClaimed=false;this.useStarterCharge=false;this.buildOffers={};this.bossRewardReceipt=null;};
function buildCandidates(g,candidates){
 return candidates.filter(id=>SKILLS[id]&&(g.skills[id]||0)<2&&eligibleExtra(g,id)&&(g.skills[id]||CampaignGame.prototype.unlocked.call(g,id))&&(g.state!=='shrine'&&!(g.state==='reward'&&g.rewardKind==='elite')||g.skills[id])&&(!(g.state==='reward'&&g.rewardKind==='event')||!g.skills[id]));
}
CampaignGame.prototype.skillPrice=function(id){return this.skills[id]?BUILD_PRICES.upgrade:BUILD_PRICES.newSkill;};
CampaignGame.prototype.offerSkills=function(candidates){
 if(this.state==='reward'&&['combat','boss'].includes(this.rewardKind))return [];
 const pool=buildCandidates(this,candidates),key=this.state+':'+this.floor+':'+this.rewardKind+':'+JSON.stringify(this.skills);
 this.buildOffers||={};
 if(!this.buildOffers[key]){
  const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.min(i,Math.floor(this.rng()*(i+1)));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  let offers=shuffled.slice(0,3);
  if(this.state==='shop'){const fresh=shuffled.find(id=>!this.skills[id]),upgrade=shuffled.find(id=>this.skills[id]);if(fresh&&upgrade)offers=[fresh,upgrade,...shuffled.filter(id=>id!==fresh&&id!==upgrade)].slice(0,3);}
  this.buildOffers[key]=offers;this.persist();
 }
 return this.buildOffers[key].filter(id=>pool.includes(id));
};
CampaignGame.prototype.selectSkill=function(id){
 if(!['starter','reward','shop','shrine'].includes(this.state))return false;
 if(this.state==='reward'&&['combat','boss'].includes(this.rewardKind))return false;
 if(!buildCandidates(this,[id]).includes(id))return false;
 if(this.state==='reward'&&this.rewardKind==='event'&&this.hp<=1)return false;
 const prior=this.state,price=this.skillPrice(id),before=this.meta.gold;
 if(prior==='shop'&&before<price)return false;
 if(prior==='shop')this.meta.gold-=price;
 this.skills[id]=(this.skills[id]||0)+1;if(prior!=='starter')this.floor++;this.state='route';
 if(prior==='reward'&&this.rewardKind==='event')this.hp--;
 if(prior==='starter'&&this.useStarterCharge){const p=ensureProgress(this.meta);if((p.starterCharges||0)>0){p.starterCharges--;this.skills[id]=2;}}
 this.rewardKind=null;this.useStarterCharge=false;this.buildOffers={};this.routeOutcome=prior==='shop'?'Shop · −'+price+' Gold · '+SKILLS[id].name+' Lv.'+this.skills[id]:prior==='reward'?'Nhận '+SKILLS[id].name+' Lv.'+this.skills[id]:this.routeOutcome;this.persist();return true;
};
const buildEvent=CampaignGame.prototype.chooseEvent;
CampaignGame.prototype.chooseEvent=function(choice){
 if(choice==='learn'){
  if(this.state!=='event'||this.hp<=1)return false;
  const pool=buildCandidates({...this,state:'reward',rewardKind:'event'},Object.keys(SKILLS));
  if(!pool.length)return false;this.state='reward';this.rewardKind='event';this.buildOffers={};this.persist();return true;
 }
 return buildEvent.call(this,choice);
};
const buildSkip=CampaignGame.prototype.skip;
CampaignGame.prototype.skip=function(){if(this.state==='reward'&&this.rewardKind==='boss')return false;const ok=buildSkip.call(this);if(ok){this.rewardKind=null;this.buildOffers={};this.persist();}return ok;};
CampaignGame.prototype.bossRewardOptions=function(){const p=ensureProgress(this.meta),d=this.dungeonId||1,tier=p.tiers[this.weapon]||{},room=d===1?Math.max(0,24-(tier[1]||0)):4;return [{id:'gold',amount:8,available:true},{id:'mastery',amount:Math.min(4,room),available:room>0},{id:'starter',amount:1,available:(p.starterCharges||0)<3}];};
CampaignGame.prototype.claimBossReward=function(id){
 if(this.test||this.state!=='reward'||this.rewardKind!=='boss'||this.bossRewardClaimed)return false;
 const option=this.bossRewardOptions().find(o=>o.id===id&&o.available);if(!option)return false;
 const p=ensureProgress(this.meta),d=this.dungeonId||1,w=this.weapon;
 if(id==='gold')this.grantGold(option.amount);
 if(id==='mastery'){p.tiers[w][d]=(p.tiers[w][d]||0)+option.amount;p.xp[w]+=option.amount;this.meta.xp[w]=p.xp[w];this.runXP+=option.amount;this.lastMasteryReward={amount:option.amount,raw:4,dungeon:d,capped:option.amount<4,rank:masteryRank(this.meta,w)};}
 if(id==='starter')p.starterCharges=(p.starterCharges||0)+1;
 this.bossRewardReceipt={id,amount:option.amount};this.bossRewardClaimed=true;this.rewardKind=null;this.state='won';this.persist();return true;
};
const buildUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(dt){const before=this.state;buildUpdate.call(this,dt);if(!this.test&&before==='combat'&&['reward','won'].includes(this.state)){
 this.rewardKind=this.isBoss?'boss':this.routeReward==='duelist'?'elite':'combat';
 if(this.isBoss){this.state='reward';this.bossRewardClaimed=false;}
 this.routeOutcome=this.rewardKind==='elite'?'Elite · +6 Gold · nâng 1 skill đang có':this.rewardKind==='combat'?'Combat · +2 Gold · XP encounter':'Boss · +10 Gold · chọn thêm 1 phần thưởng';this.buildOffers={};this.persist();
}};
const buildPersist=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){buildPersist.call(this);if(!this.test&&this.savedRun){for(const key of ['buildRulesVersion','rewardKind','bossRewardClaimed','useStarterCharge','buildOffers','bossRewardReceipt'])this.savedRun[key]=this[key];try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}};

