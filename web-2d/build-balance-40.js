// Run build cadence and Battle Art challenges. Unlocks do not equip skills.
const BUILD_MILESTONES=[2,4];
const previousChallenges=Object.fromEntries(['guardian','second_wind','ember','spark','rime','echo'].map(id=>[id,{...SKILL_UNLOCKS[id]}]));
function keepEarnedArts(meta){const p=ensureProgress(meta);if(p.buildBalanceVersion===40)return;for(const [id,r]of Object.entries(previousChallenges)){const value=r.achievement?Object.entries(p.artAchievements?.[r.achievement]||{}).reduce((sum,[d,n])=>sum+(+d>=r.dungeon?safeCount(n):0),0):progressionCount(p,r.dungeon,r.clean);if(value>=(r.count||1))p.legacyUnlocked[id]=true;}p.buildBalanceVersion=40;}
const balanceProgress=unlockProgress;unlockProgress=function(meta,id){keepEarnedArts(meta);return balanceProgress(meta,id);};
Object.assign(SKILL_UNLOCKS,{
 guardian:{dungeon:1,count:4,achievement:'recover_flow',label:'Sau khi mất tim, phục hồi Flow 3 · 4 trận'},
 second_wind:{dungeon:1,count:3,achievement:'wounded_clean',label:'Thắng trận không mất thêm tim, bắt đầu với 1–2 tim · 3 trận'},
 ember:{dungeon:1,count:3,achievement:'perfect_triple',label:'3 phản công Perfect liên tiếp · hoàn thành 3 lần'},
 spark:{dungeon:1,count:3,achievement:'stagger_any',label:'Tạo Stagger · 3 lần'},
 rime:{dungeon:1,count:12,achievement:'ranged_perfect',label:'Perfect Dodge đòn tầm xa · 12 lần'},
 echo:{dungeon:1,count:1,achievement:'boss_double',label:'Tạo Stagger 2 lần trong cùng một trận boss'}
});
const balancePoint=artPoint;
artPoint=function(g,key){balancePoint(g,key);if(key==='boss_stagger'&&!g.test){g.bossStaggers=(g.bossStaggers||0)+1;if(g.bossStaggers===2)balancePoint(g,'boss_double');}if(key==='boss_stagger'&&!g.test)balancePoint(g,'stagger_any');};
function balanceEncounter(g){g.bossStaggers=0;g.perfectStreak=0;g.recoveredFlow=false;g.startedWounded=g.hp>0&&g.hp<3;g.balanceBeatSeen=[];g.balanceStaggerTurn=null;g.lastStandCarry=0;}
const balanceReset=CampaignGame.prototype.reset;
CampaignGame.prototype.reset=function(...args){const result=balanceReset.apply(this,args);this.buildCombats=0;balanceEncounter(this);return result;};
const balanceLoad=CampaignGame.prototype.loadEnemy;
CampaignGame.prototype.loadEnemy=function(...args){const result=balanceLoad.apply(this,args);if(result)balanceEncounter(this);return result;};
const balanceDamage=CampaignGame.prototype.damage;
CampaignGame.prototype.damage=function(perfect,mutate=false){const wasOpening=this.opening,result=balanceDamage.call(this,perfect,mutate);if(mutate&&!this.test){if(perfect){this.perfectStreak=(this.perfectStreak||0)+1;if(this.perfectStreak===3){artPoint(this,'perfect_triple');this.perfectStreak=0;}}else this.perfectStreak=0;if(this.encounterHits>0&&this.flow>=3&&!this.recoveredFlow){this.recoveredFlow=true;artPoint(this,'recover_flow');}if(wasOpening&&!this.isBoss)artPoint(this,'stagger_any');}return result;};
const balanceAward=FullGame.prototype.awardEncounterXP;
FullGame.prototype.awardEncounterXP=function(){const fresh=!this.test&&!this.encounterXPGranted&&this.enemyHp<=0;balanceAward.call(this);if(fresh){this.buildCombats=(this.buildCombats||0)+1;if(this.startedWounded&&this.encounterHits===0)artPoint(this,'wounded_clean');}};
const balanceUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(...args){const prior=this.state,priorHits=this.hits,result=balanceUpdate.apply(this,args);if(!lastStandRate(this))this.lastStandCarry=0;if(this.hits>priorHits)this.perfectStreak=0;if(this.test)return result;
 for(const r of (this.combo||this.lastCombo)?.results||[]){const key=this.attackCount+':'+r.index;this.balanceBeatSeen||=[];if(this.balanceBeatSeen.includes(key))continue;this.balanceBeatSeen.push(key);if(r.perfect&&r.family==='ranged')artPoint(this,'ranged_perfect');}
 if(prior==='combat'&&this.state==='reward'&&!this.isBoss&&BUILD_MILESTONES.includes(this.buildCombats)){this.rewardKind='milestone';this.buildOffers={};this.routeOutcome='Mốc chiến kỹ · chọn skill mới hoặc nâng cấp';this.persist();}
 if(this.artProgressDirty){this.artProgressDirty=false;this.persist();}return result;
};
// One forced early merchant; a late merchant competes with healing/an Elite.
if(!BUILD_ROUTE[7].includes('shop'))BUILD_ROUTE[7].push('shop');
const balanceCandidates=buildCandidates;
buildCandidates=function(g,candidates){return balanceCandidates(g,candidates).filter(id=>g.state!=='starter'||!EXTRA_SKILLS[id]?.element);};
const balanceOffers=CampaignGame.prototype.offerSkills;
CampaignGame.prototype.offerSkills=function(candidates){const offers=balanceOffers.call(this,candidates);if(!['starter','reward','shop'].includes(this.state)||this.state==='reward'&&['combat','boss','elite','event'].includes(this.rewardKind))return offers;const pool=buildCandidates(this,candidates),key=this.state+':'+this.floor+':'+this.rewardKind+':'+JSON.stringify(this.skills),fresh=offers.find(id=>!this.skills[id])||pool.find(id=>!this.skills[id]),upgrade=offers.find(id=>this.skills[id])||pool.find(id=>this.skills[id]);if(fresh&&upgrade){const mixed=[fresh,upgrade,...offers.filter(id=>id!==fresh&&id!==upgrade)].slice(0,3);if(JSON.stringify(this.buildOffers[key])!==JSON.stringify(mixed)){this.buildOffers[key]=mixed;this.persist();}return mixed;}return offers;};
const BALANCE_FIELDS=['buildCombats','bossStaggers','perfectStreak','recoveredFlow','startedWounded','balanceBeatSeen','lastStandCarry'];
for(const key of BALANCE_FIELDS)if(!COMBAT_SAVE_FIELDS.includes(key))COMBAT_SAVE_FIELDS.push(key);
const balancePersist=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){balancePersist.call(this);if(!this.test&&this.savedRun){for(const key of BALANCE_FIELDS)this.savedRun[key]=this[key];try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}};
const balanceResume=CampaignGame.prototype.resume;
CampaignGame.prototype.resume=function(){const saved=this.savedRun,ok=balanceResume.call(this);if(ok){for(const key of BALANCE_FIELDS)if(saved?.[key]!=null)this[key]=saved[key];this.persist();}return ok;};
