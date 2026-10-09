// Freeze simulation time during the phase reveal; existing attacks retain their deadlines.
const hpPhase=Object.getOwnPropertyDescriptor(FullGame.prototype,'phase').get;
Object.defineProperty(CampaignGame.prototype,'phase',{configurable:true,get(){return this.isBoss?(this.bossShownPhase??hpPhase.call(this)):1;}});
const phaseLoad=CampaignGame.prototype.loadEnemy;CampaignGame.prototype.loadEnemy=function(...args){const ok=phaseLoad.apply(this,args);this.bossShownPhase=1;this.phaseTransition=null;this.faceAnchor=null;return ok;};
const phaseResume=CampaignGame.prototype.resume;CampaignGame.prototype.resume=function(){const ok=phaseResume.call(this);this.bossShownPhase=hpPhase.call(this);this.phaseTransition=null;return ok;};
function beginPhaseReveal(g){if(!g.isBoss||g.state!=='combat'||g.enemyHp<=0||g.phaseTransition)return false;const target=hpPhase.call(g);if(target<=g.phase)return false;g.phaseTransition={elapsed:0,duration:.8,target:g.phase+1,anchor:{...(g.visualAnchor||{x:710,y:552})}};return true;}
const phaseUpdate=CampaignGame.prototype.update;CampaignGame.prototype.update=function(dt){if(!Number.isFinite(dt)||dt<0)return;if(this.phaseTransition){this.phaseTransition.elapsed+=dt;if(this.phaseTransition.elapsed>=this.phaseTransition.duration){this.bossShownPhase=this.phaseTransition.target;this.phaseTransition=null;}return;}if(beginPhaseReveal(this))return;phaseUpdate.call(this,dt);beginPhaseReveal(this);};
for(const method of ['beginChain','act','deflect','weaponAction']){const original=CampaignGame.prototype[method];CampaignGame.prototype[method]=function(...args){return this.phaseTransition?false:original.apply(this,args);};}

