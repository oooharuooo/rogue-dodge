// Battle Art unlocks track relevant play, independently of weapon Mastery XP.
SKILL_UNLOCKS.momentum={dungeon:1,count:18,achievement:'flow',label:'Đạt Flow 3+ · mỗi combo +1 điểm'};
SKILL_UNLOCKS.resolve={dungeon:1,count:20,achievement:'flow',label:'Đạt Flow 3+ · mỗi combo +1 điểm'};
const artUnlockProgress=unlockProgress;
unlockProgress=function(meta,id){const r=SKILL_UNLOCKS[id];if(!r?.achievement)return artUnlockProgress(meta,id);const p=ensureProgress(meta),value=Object.entries(p.artAchievements?.[r.achievement]||{}).reduce((sum,[d,n])=>sum+(+d>=r.dungeon?safeCount(n):0),0);return [p.legacyUnlocked[id]?r.count:value,r.count,r.label];};
const artProgressDamage=CampaignGame.prototype.damage;
CampaignGame.prototype.damage=function(perfect,mutate=false){const before=this.flow,result=artProgressDamage.call(this,perfect,mutate);if(mutate!==false&&!this.test&&this.flow>before&&this.flow>=3){const p=ensureProgress(this.meta),d=this.dungeonId||1;p.artAchievements??={};p.artAchievements.flow??={};p.artAchievements.flow[d]=safeCount(p.artAchievements.flow[d])+1;this.artProgressDirty=true;}return result;};
const artProgressUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(...args){const result=artProgressUpdate.apply(this,args);if(this.artProgressDirty&&!this.test){this.artProgressDirty=false;this.persist();}return result;};


SKILL_UNLOCKS.resolve={dungeon:1,count:1,achievement:'flow5',label:'Đạt Flow 5 trong một trận'};
SKILL_UNLOCKS.echo={dungeon:1,count:5,achievement:'boss_stagger',label:'Tạo Stagger trên boss · tích lũy 5 lần'};
SKILL_UNLOCKS.last_stand={dungeon:1,count:1,achievement:'last_stand_trial',label:'Thắng một trận: gây 30 DMG ở 1 tim, không Shield/Thế đỡ'};
EXTRA_SKILLS.last_stand={title:['Tử chiến','Last Stand'],color:'#ea8e8a',shape:'claw',desc:['Không Shield/Thế đỡ: 2 tim +10%, 1 tim +25% damage nền.','Không Shield/Thế đỡ: 2 tim +15%, 1 tim +35% damage nền.']};
SKILLS.last_stand={name:'Last Stand',desc:EXTRA_SKILLS.last_stand.desc};
function lastStandRate(g){return g.hp>=3||g.hp<=0||g.shield||g.armor||g.chainArmor||g.pendingGuard||g.heavyChosen?0:g.hp===1?(g.skills.last_stand>=2?.35:.25):(g.skills.last_stand>=2?.15:.10);}
function artPoint(g,key){if(g.test)return;const p=ensureProgress(g.meta),d=g.dungeonId||1;p.artAchievements??={};p.artAchievements[key]??={};p.artAchievements[key][d]=safeCount(p.artAchievements[key][d])+1;g.artProgressDirty=true;}
const trialReset=CampaignGame.prototype.reset;CampaignGame.prototype.reset=function(...args){const ok=trialReset.apply(this,args);this.lowHealthTrialDamage=0;this.staggerRecorded=false;this.lastStandCarry=0;return ok;};
const trialLoad=CampaignGame.prototype.loadEnemy;CampaignGame.prototype.loadEnemy=function(...args){const ok=trialLoad.apply(this,args);if(ok){this.lowHealthTrialDamage=0;this.staggerRecorded=false;this.lastStandCarry=0;}return ok;};
const riskDamage=CampaignGame.prototype.damage;
CampaignGame.prototype.damage=function(perfect,mutate=false){const rate=this.skills.last_stand?lastStandRate(this):0,bossOpening=this.isBoss&&this.opening;const result=riskDamage.call(this,perfect,mutate);const credit=rate?(this.lastStandCarry||0)+WEAPON_RULES[this.weapon].base*4*rate:0,bonus=Math.floor(credit+1e-9);if(mutate){this.lastStandCarry=rate?credit-bonus:0;if(this.flow>=5){const p=ensureProgress(this.meta);if(!Object.values(p.artAchievements?.flow5||{}).some(n=>n>0))artPoint(this,'flow5');}if(bossOpening){if(!this.staggerRecorded)artPoint(this,'boss_stagger');this.staggerRecorded=false;}if(bonus)this.lastBonuses.push({id:'last_stand',amount:bonus,text:'Last Stand · +'+bonus+' DMG'});}return result+bonus;};
// Last Stand applies to base counters only; never adds a separate Follow-up bonus.
const trialAward=FullGame.prototype.awardEncounterXP;
FullGame.prototype.awardEncounterXP=function(){const eligible=!this.test&&!this.encounterXPGranted&&this.enemyHp<=0&&this.lowHealthTrialDamage>=30;trialAward.call(this);if(eligible){const p=ensureProgress(this.meta);if(!Object.values(p.artAchievements?.last_stand_trial||{}).some(n=>n>0))artPoint(this,'last_stand_trial');}};
const riskUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(...args){const beforeDamage=this.totalDamage,eligible=this.hp===1&&!this.shield&&!this.armor&&!this.chainArmor&&!this.pendingGuard;const result=riskUpdate.apply(this,args);if(eligible)this.lowHealthTrialDamage+=Math.max(0,this.totalDamage-beforeDamage);if(!this.test&&this.encounterXPGranted&&this.lowHealthTrialDamage>=30){const p=ensureProgress(this.meta);if(!Object.values(p.artAchievements?.last_stand_trial||{}).some(n=>n>0))artPoint(this,'last_stand_trial');}if(this.isBoss&&this.opening&&!this.staggerRecorded){artPoint(this,'boss_stagger');this.staggerRecorded=true;}if(!this.opening&&!this.lastCritical)this.staggerRecorded=false;if(this.artProgressDirty&&!this.test){this.artProgressDirty=false;this.persist();}return result;};
const trialPersist=CampaignGame.prototype.persist;CampaignGame.prototype.persist=function(){trialPersist.call(this);if(this.test||!this.savedRun||this.state==='menu')return;this.savedRun.lowHealthTrialDamage=this.lowHealthTrialDamage;this.savedRun.staggerRecorded=this.staggerRecorded;try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}};

