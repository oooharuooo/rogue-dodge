// Persistent progression v2: encounter rewards, dungeon-qualified XP, preserved legacy ownership.
const MASTERY_RULES={2:{xp:36,dungeon:2,qualified:12},3:{xp:96,dungeon:3,qualified:36}};
const SKILL_UNLOCKS={focus:{free:true},flame_counter:{free:true},momentum:{dungeon:1,count:18},guardian:{dungeon:1,count:12,clean:true},resolve:{dungeon:1,count:20,clean:true},second_wind:{dungeon:2,count:30},ember:{dungeon:2,count:18},spark:{dungeon:2,count:18},rime:{dungeon:2,count:18},echo:{dungeon:3,count:24},twin_fang:{dungeon:1,xp:12,weapon:'bow'},crescent:{dungeon:1,xp:12,weapon:'katana'},cross_cut:{dungeon:1,xp:12,weapon:'daggers'},fault_breaker:{dungeon:1,xp:12,weapon:'greatsword'}};
function safeCount(value){return Number.isFinite(value)?Math.max(0,Math.floor(value)):0;}
function ensureProgress(meta){
 if(meta.progression?.version===2)return meta.progression;
 const oldXP={...meta.xp},owned={};for(const id of Object.keys(SKILLS)){const v=EXTRA_SKILLS[id];owned[id]=['focus','flame_counter'].includes(id)||id==='momentum'&&meta.perfect>=12||id==='guardian'&&meta.clean>=3||v?.weapon&&safeCount(oldXP[v.weapon])>=v.xp||v?.total&&Object.values(oldXP).reduce((a,b)=>a+safeCount(b),0)>=v.total||v?.field&&safeCount(meta[v.field])>=v.target;}
 const p={version:2,xp:{},tiers:{},encounters:{},clean:{},legacyRanks:{},legacyUnlocked:owned,legacyXP:oldXP};
 for(const w of Object.keys(WEAPONS)){p.xp[w]=0;p.tiers[w]={};const xp=safeCount(oldXP[w]);p.legacyRanks[w]=xp>=20?3:xp>=8?2:1;meta.xp[w]=0;}
 meta.progression=p;return p;
}
function qualifiedXP(p,w,min){return Object.entries(p.tiers[w]||{}).reduce((sum,[d,xp])=>sum+(+d>=min?safeCount(xp):0),0);}
function masteryRank(meta,w){const p=ensureProgress(meta);let rank=p.legacyRanks[w]||1;for(const [lv,r]of Object.entries(MASTERY_RULES))if(p.xp[w]>=r.xp&&qualifiedXP(p,w,r.dungeon)>=r.qualified)rank=Math.max(rank,+lv);return rank;}
Object.defineProperty(FullGame.prototype,'level',{get(){return this.test?this.testLevel||1:masteryRank(this.meta,this.weapon);},configurable:true});
function progressionCount(p,min,clean=false){return Object.entries(clean?p.clean:p.encounters).reduce((sum,[d,n])=>sum+(+d>=min?safeCount(n):0),0);}
function unlockProgress(meta,id){const p=ensureProgress(meta),r=SKILL_UNLOCKS[id];if(!r)return [0,1,''];const target=r.xp||r.count||1,unit=r.free?'Mở sẵn':r.weapon?'XP encounter · '+weaponLabelSafe(r.weapon):r.clean?'Encounter không mất tim':'Encounter đã thắng';const value=r.free||p.legacyUnlocked[id]?target:r.weapon?qualifiedXP(p,r.weapon,r.dungeon):progressionCount(p,r.dungeon,r.clean);return [value,target,unit+(r.free?'':' · Dungeon '+r.dungeon+'+')];}
function weaponLabelSafe(w){return WEAPONS[w]?.name||w;}
CampaignGame.prototype.unlocked=function(id){if(!SKILLS[id])return false;const [v,t]=unlockProgress(this.meta,id);return v>=t;};
FullGame.prototype.awardEncounterXP=function(){
 if(this.test||this.encounterXPGranted||this.enemyHp>0)return;this.encounterXPGranted=true;const p=ensureProgress(this.meta),d=Math.max(1,Math.min(6,safeCount(this.dungeonId)||1)),w=this.weapon,raw=this.isBoss?4:this.routeReward==='duelist'||this.enemyId==='duelist'?2:1;
 const tier=p.tiers[w],prior=safeCount(tier[d]),cap=d===1?24:Infinity,amount=Math.max(0,Math.min(raw,cap-prior));tier[d]=prior+amount;p.xp[w]=safeCount(p.xp[w])+amount;this.meta.xp[w]=p.xp[w];this.runXP+=amount;p.encounters[d]=safeCount(p.encounters[d])+1;if(this.encounterHits===0)p.clean[d]=safeCount(p.clean[d])+1;this.lastMasteryReward={amount,raw,dungeon:d,capped:amount<raw,rank:masteryRank(this.meta,w)};
};
const progressionLoad=CampaignGame.prototype.loadEnemy;CampaignGame.prototype.loadEnemy=function(...args){const ok=progressionLoad.apply(this,args);if(ok){this.encounterXPGranted=false;this.lastMasteryReward=null;this.persist();}return ok;};
const progressionPersist=CampaignGame.prototype.persist;CampaignGame.prototype.persist=function(){progressionPersist.call(this);if(!this.test&&this.savedRun){this.savedRun.dungeonId=this.dungeonId||1;this.savedRun.encounterXPGranted=!!this.encounterXPGranted;this.savedRun.lastMasteryReward=this.lastMasteryReward;try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}};
const progressionReset=CampaignGame.prototype.reset;CampaignGame.prototype.reset=function(){progressionReset.call(this);this.dungeonId=1;this.encounterXPGranted=false;this.lastMasteryReward=null;};
const progressionSelect=CampaignGame.prototype.selectSkill;CampaignGame.prototype.selectSkill=function(id){if(!this.unlocked(id)&&!this.skills[id])return false;if(!this.skills[id]&&Object.keys(this.skills).length>=4)return false;return progressionSelect.call(this,id);};
const progressionEligible=eligibleExtra;eligibleExtra=function(g,id){return progressionEligible(g,id)&&(!!g.skills[id]||Object.keys(g.skills).length<4);};

const progressionResume=CampaignGame.prototype.resume;CampaignGame.prototype.resume=function(){const ok=progressionResume.call(this);if(ok){const retired=Object.fromEntries(Object.entries(this.skills).filter(([id])=>!SKILLS[id]));if(Object.keys(retired).length){ensureProgress(this.meta).retiredBuild=retired;this.skills=Object.fromEntries(Object.entries(this.skills).filter(([id])=>SKILLS[id]));this.persist();}}return ok;};
