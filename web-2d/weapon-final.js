// Milestone 1: integer damage scale, melee deflect and a spendable greatsword stance.
for(const roster of [ENEMIES,BOSSES])for(const enemy of Object.values(roster))enemy.hp*=4;
const finalRoomHp=CampaignGame.prototype.roomHp;
if(finalRoomHp)CampaignGame.prototype.roomHp=function(...args){return Math.ceil(finalRoomHp.apply(this,args)/4)*4;};
const finalResetIdentity=resetIdentity;
resetIdentity=function(g){finalResetIdentity(g);Object.assign(g,{damageScale:4,heavyWindow:null,heavyChosen:false,pendingGuard:false,deflectMotion:null});};
CampaignGame.prototype.deflect=function(lane){const a=this.attack;if(this.weapon!=='katana'||this.state!=='combat'||!a||a.resolved||a.family!=='melee'||a.kind==='jump'||a.deflectAttempt||this.combo?.hits[a.index]?.deflectAttempt||this.action)return false;
 const attempt={lane,time:this.time};this.combo.hits[a.index].deflectAttempt=attempt;a.deflectAttempt=attempt;this.deflectMotion={start:this.time,impact:a.impact,end:a.impact+.32,lane,valid:lane===a.target&&a.impact-this.time<=(this.deflectWindow??.30)};return true;};
const finalPrepare=CampaignGame.prototype.prepareWeaponShot;
CampaignGame.prototype.prepareWeaponShot=function(s){const total=s.damage;finalPrepare.call(this,s);if(this.weapon==='daggers'){const shots=this.shots.filter(x=>x.counterKey===s.counterKey&&!x.followup&&!x.intercept&&!x.hit);const unit=Math.floor(total/3);shots.slice(-3).forEach((x,i)=>x.damage=i===2?total-unit*2:unit);}};
const finalWeaponAction=CampaignGame.prototype.weaponAction;
CampaignGame.prototype.weaponAction=function(){if(this.weapon==='greatsword'){if(!this.armor||!this.heavyWindow||this.time>this.heavyWindow.end)return false;this.armor=0;this.armorBroken=true;this.armorRecovery=0;this.heavyWindow=null;this.pendingGuard=false;this.heavyChosen=true;this.skillEvents.push({id:'heavy_spend',text:'BỔ NẶNG · TIÊU THỤ THẾ ĐỠ',time:this.time});return true;}const count=this.shots.length,ok=finalWeaponAction.call(this);if(ok){const shots=this.shots.slice(count),total=Math.round(shots.reduce((sum,s)=>sum+s.damage,0)*4);let spent=0;shots.forEach((s,i)=>{s.damage=i===shots.length-1?total-spent:Math.floor(s.damage*4);spent+=s.damage;});}return ok;};
const finalPersist=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){finalPersist.call(this);if(this.identityState){this.identityState.damageScale=4;this.identityState.pendingGuard=!!this.pendingGuard;}if(this.savedRun?.identityState){this.savedRun.identityState.damageScale=4;this.savedRun.identityState.pendingGuard=!!this.pendingGuard;if(!this.test)try{localStorage.setItem('rogue-lane-checkpoint-v1',JSON.stringify(this.savedRun));}catch{}}};
const finalResume=CampaignGame.prototype.resume;
CampaignGame.prototype.resume=function(){const scale=this.savedRun?.identityState?.damageScale,ok=finalResume.call(this);if(ok){if(scale!==4){this.enemyHp*=4;this.enemyMax*=4;this.totalDamage*=4;this.lastDamage*=4;}if(this.identityState?.pendingGuard){this.armor=1;this.pendingGuard=false;}this.persist();}return ok;};
// Counter bonuses retain their ratios; every delivered hit is now an integer.
function integerDescription(text){return text.replace(/([+]?[0-9]+(?:[.,][0-9]+)?)\s*(damage|DMG)/g,(_,n,unit)=>(n.startsWith('+')?'+':'')+Math.round(parseFloat(n.replace(',','.'))*4)+' '+unit);}
for(const v of Object.values(SKILLS))if(v.desc)v.desc=v.desc.map(integerDescription);
for(const v of Object.values(EXTRA_SKILLS))if(v.desc)v.desc=v.desc.map(integerDescription);
for(const v of Object.values(SKILL_VISUALS)){if(Array.isArray(v.brief))v.brief=v.brief.map(integerDescription);}
for(const v of Object.values(WEAPONS))v.upgrades=v.upgrades.map(integerDescription);
WEAPONS.greatsword.state='Thế đỡ';


// Mastery damage increments are modest; XP thresholds are handled in milestone 2.
WEAPONS.katana.upgrades=['Thu kiếm: Clean Chain chuẩn bị +1 damage cho phản công kế','Kiếm pháp: Clean Chain chuẩn bị +2 damage cho phản công kế'];
WEAPONS.daggers.upgrades=['Tiết chế: bỏ nối đòn chuẩn bị +1 damage cho phản công kế','Nhịp dao: bỏ nối đòn chuẩn bị +2 damage; nối đòn thêm 1 damage'];
WEAPONS.greatsword.upgrades=['Vững thế: lần đầu Thế đỡ vỡ, phản công kế +1 damage','Phản chấn: lần đầu Thế đỡ vỡ, phản công kế +2 damage'];
WEAPONS.bow.upgrades=['Dứt điểm: bắn ngắt đúng thêm 1 damage','Mũi chặn: bắn ngắt đúng thêm 2 damage'];
Object.assign(EXTRA_EN,{twin_fang:['A successful interrupt adds 1 damage.','A successful interrupt adds 2 damage.'],crescent:['A clean chain prepares +1 damage for the next counter.','A clean chain prepares +2 damage for the next counter.'],cross_cut:['Follow-up adds 1 damage.','Follow-up adds 2 damage.'],fault_breaker:['First broken guard stance: next counter +1 damage, once per encounter.','First broken guard stance: next counter +2 damage, once per encounter.']});

