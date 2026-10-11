// Normal dungeon flow on an isolated account copy; sandbox cannot persist real rewards.
const journeySessions57=new WeakMap();
const journeyPersist57=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){if(this.sandboxJourney)return;return journeyPersist57.call(this);};
CampaignGame.prototype.openSandboxJourney=function(){if(this.sandboxJourney)return true;if(!this.test)this.persist();journeySessions57.set(this,Object.getOwnPropertyDescriptors(this));this.meta=JSON.parse(JSON.stringify(this.meta));this.sandboxJourney=true;this.sandboxOptions={autoDodge:false,oneHit:false};this.reset();this.test=false;this.savedRun=null;worldProgress(this).__sandboxView=1;return true;};
CampaignGame.prototype.closeSandboxJourney=function(){const saved=journeySessions57.get(this);if(!saved)return false;for(const key of Object.keys(this))if(!Object.hasOwn(saved,key))delete this[key];Object.defineProperties(this,saved);journeySessions57.delete(this);return true;};
const journeyStatus57=CampaignGame.prototype.dungeonStatus;
CampaignGame.prototype.dungeonStatus=function(id){const status=journeyStatus57.call(this,id);return this.sandboxJourney&&status?{...status,available:true,requirementMet:true}:status;};
const journeyStart57=CampaignGame.prototype.startDungeon;
CampaignGame.prototype.startDungeon=function(id,...args){const ok=journeyStart57.call(this,id,...args);if(ok&&this.sandboxJourney){this.bossId=DUNGEON_BOSSES[id]||({3:'rune_golem',4:'minotaur_chief',5:'warden',6:'wraith'})[id];this.savedRun=null;}return ok;};
const journeyAvailable57=CampaignGame.prototype.availableNodes;
CampaignGame.prototype.availableNodes=function(){return this.sandboxJourney?(this.route[this.floor]||[]):journeyAvailable57.call(this);};
const journeyLoad57=CampaignGame.prototype.loadEnemy;
CampaignGame.prototype.loadEnemy=function(...args){this.sandboxLoading=true;try{return journeyLoad57.apply(this,args);}finally{this.sandboxLoading=false;}};
Object.defineProperty(CampaignGame.prototype,'enemyHp',{configurable:true,get(){return this._enemyHp57??0;},set(n){this._enemyHp57=(this.sandboxJourney&&this.sandboxOptions?.oneHit||this.test&&this.testOneHit57)&&!this.sandboxLoading&&this.state==='combat'&&n<this._enemyHp57?0:n;}});
CampaignGame.prototype.retrySameDungeon=function(){if(!['lost','won'].includes(this.state))return false;const d=this.runResult?.dungeon||this.dungeonId||1,w=this.runResult?.weapon||this.runWeapon||this.weapon;return this.startDungeon(d,w,true);};
// Three distinct starter styles: timing, burst and Flow. Existing earned arts stay earned.
const journeyUnlocked57=CampaignGame.prototype.unlocked;
CampaignGame.prototype.unlocked=function(id){return id==='momentum'||journeyUnlocked57.call(this,id);};
// Healing no longer ejects the player from the merchant before reviewing the offers.
CampaignGame.prototype.buySupplies=function(){if(this.state!=='shop'||this.supplies<BUILD_PRICES.heal||this.hp>=3)return false;this.supplies-=BUILD_PRICES.heal;this.hp++;this.routeOutcome='Shop · −'+BUILD_PRICES.heal+' Supplies · +1 HP';this.persist();return true;};
const journeyLoadout57=CampaignGame.prototype.returnToLoadout;
CampaignGame.prototype.returnToLoadout=function(){if(this.sandboxJourney){this.reset();this.savedRun=null;return true;}return journeyLoadout57.call(this);};
if(typeof game!=='undefined'){const hp57=game.enemyHp;delete game.enemyHp;game.enemyHp=hp57;}
const journeySelect57=CampaignGame.prototype.selectNode;
CampaignGame.prototype.selectNode=function(id){if(this.sandboxJourney&&this.state==='route'){this.log.length=this.floor;if(id==='boss'){this.routeReward=null;this.routeOutcome='';this.log.push(id);return this.loadEnemy(this.bossId,true);}}return journeySelect57.call(this,id);};
Object.assign(DUNGEON_BOSSES,{3:'rune_golem',4:'minotaur_chief',5:'warden',6:'wraith'});

SKILL_UNLOCKS.momentum={free:true};
