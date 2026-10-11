// Independent runs. Existing encounter/shop code uses a non-persistent Gold adapter.
const RUN_MARK_REWARD=10;
function ensureRunAccount(g){
 if(!g.meta)return;
 if(g.meta.runEconomyVersion===4){Object.defineProperty(g.meta,'gold',{configurable:true,enumerable:false,get:()=>g.supplies||0,set:value=>{g.supplies=safeCount(value);}});return;}
 let saved=null;try{saved=JSON.parse(localStorage.getItem('rogue-lane-main-v1'));}catch{}
 g.meta.runEconomyVersion=4;g.meta.victoryMarks=safeCount(saved?.runEconomyVersion===4?saved.victoryMarks:0);
 g.meta.bossClaims=Array.isArray(saved?.bossClaims)?saved.bossClaims.filter(x=>typeof x==='string').slice(-100):[];
 g.meta.lastRun=saved?.runEconomyVersion===4?saved.lastRun||null:null;
 Object.defineProperty(g.meta,'gold',{configurable:true,enumerable:false,get:()=>g.supplies||0,set:value=>{g.supplies=safeCount(value);}});
 ensureProgress(g.meta).starterCharges=0;
}
function runIdentity(g){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
const runReset=CampaignGame.prototype.reset;
CampaignGame.prototype.reset=function(){runReset.call(this);ensureRunAccount(this);this.runRulesVersion=4;this.supplies=0;this.runId=null;this.runWeapon=null;this.runMarks=0;this.runFinished=false;this.runResult=null;};
const runStart=CampaignGame.prototype.start;
CampaignGame.prototype.start=function(weapon=this.weapon){if(!WEAPONS[weapon])return false;const ok=runStart.call(this,weapon);if(ok){this.runId=runIdentity(this);this.runWeapon=weapon;this.useStarterCharge=false;this.persist();}return ok;};
// Reject mid-run weapon changes at the model boundary, including direct UI assignment.
Object.defineProperty(CampaignGame.prototype,'weapon',{configurable:true,get(){return this._selectedWeapon||'bow';},set(value){if(!WEAPONS[value])return;if(!this.test&&this.runWeapon&&['starter','route','combat','reward','shop','shrine','event'].includes(this.state)&&value!==this.runWeapon)return;this._selectedWeapon=value;}});
CampaignGame.prototype.finishRun=function(won){
 if(this.test||this.runFinished)return false;
 this.runFinished=true;this.runResult={won,weapon:this.runWeapon||this.weapon,dungeon:this.dungeonId||1,xp:this.runXP,marks:this.runMarks,suppliesEarned:this.runGold,suppliesDiscarded:this.supplies};
 this.supplies=0;this.flow=0;this.shield=0;this.armor=0;this.pendingGuard=null;this.heavyWindow=null;this.daggerWindow=null;this.skills={};this.elementState={};this.meta.lastRun=this.runResult;return true;
};
CampaignGame.prototype.bossRewardOptions=function(){return [];};
CampaignGame.prototype.claimBossReward=function(id='complete'){
 if(this.test||id!=='complete'||this.state!=='reward'||this.rewardKind!=='boss'||this.bossRewardClaimed)return false;
 this.bossRewardClaimed=true;this.rewardKind=null;this.bossRewardReceipt=null;this.state='won';this.finishRun(true);this.persist();return true;
};
const runUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(dt){const before=this.state;runUpdate.call(this,dt);if(this.test)return;
 if(before==='combat'&&this.state==='reward'&&this.rewardKind==='boss'){
  // The legacy boss payout is in-run Gold; replace it with permanent Marks.
  this.supplies=Math.max(0,this.supplies-10);this.runGold=Math.max(0,this.runGold-10);
  if(this.runId&&!this.meta.bossClaims.includes(this.runId)){this.meta.bossClaims.push(this.runId);this.meta.bossClaims=this.meta.bossClaims.slice(-100);this.meta.victoryMarks+=RUN_MARK_REWARD;this.runMarks=RUN_MARK_REWARD;}
  this.routeOutcome='Boss · +'+this.runMarks+' Victory Marks';this.persist();
 }
 if(this.state==='lost'&&this.finishRun(false))this.persist();
};
const runPersist=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){if(this.test)return;if(this.state==='menu'){try{localStorage.setItem('rogue-lane-main-v1',JSON.stringify(this.meta));}catch{}return;}if(typeof this.routeOutcome==='string')this.routeOutcome=this.routeOutcome.replaceAll('Gold','Supplies');runPersist.call(this);if(this.savedRun){for(const key of ['runRulesVersion','supplies','runId','runWeapon','runMarks','runFinished','runResult'])this.savedRun[key]=this[key];try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}};
const runResume=CampaignGame.prototype.resume;
CampaignGame.prototype.resume=function(){const saved=this.savedRun;if(saved?.runRulesVersion!==4)return false;const ok=runResume.call(this);if(ok){this.runWeapon=saved.runWeapon||saved.weapon;this._selectedWeapon=this.runWeapon;this.persist();}return ok;};
CampaignGame.prototype.returnToLoadout=function(){if(!['won','lost','menu'].includes(this.state))return false;this.reset();this.test=false;this.savedRun=null;try{localStorage.removeItem('rogue-lane-checkpoint-v1');}catch{}this.persist();return true;};
