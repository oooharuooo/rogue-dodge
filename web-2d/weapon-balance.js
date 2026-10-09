// Weapon rules are independent of skill unlock progression. Values are preview baselines.
const WEAPON_RULES={katana:{base:2,masteryClean:[0,.25,.5]},daggers:{base:1.75,follow:.75,masterySkip:[0,.25,.5]},greatsword:{base:1.5,heavyBonus:1,masteryBreak:[0,.25,.5]},bow:{base:1.5,interrupt:.25,masteryInterrupt:[0,.25,.5]}};
const BALANCED_TECHNIQUES={twin_fang:['Bắn ngắt đúng: +0,25 damage','Bắn ngắt đúng: +0,5 damage'],crescent:['Clean Chain chuẩn bị +0,25 damage cho phản công kế tiếp','Clean Chain chuẩn bị +0,5 damage cho phản công kế tiếp'],cross_cut:['Nối đòn thêm 0,25 damage','Nối đòn thêm 0,5 damage'],fault_breaker:['Giáp vỡ: phản công sau thêm 0,25 damage, một lần mỗi trận','Giáp vỡ: phản công sau thêm 0,5 damage, một lần mỗi trận']};
for(const [id,desc]of Object.entries(BALANCED_TECHNIQUES)){EXTRA_SKILLS[id].desc=desc;SKILLS[id].desc=desc;}
Object.assign(WEAPONS.katana,{state:'Flow',upgrades:['Thu kiếm: Clean Chain chuẩn bị +0,25 damage','Kiếm pháp: Thu kiếm +0,5 damage']});
Object.assign(WEAPONS.daggers,{state:'Nối đòn',upgrades:['Tiết chế: bỏ nối đòn chuẩn bị +0,25 damage','Nhịp dao: đòn nối +0,25 damage']});
Object.assign(WEAPONS.greatsword,{state:'Giáp ảo',upgrades:['Vững thế: thế đỡ vỡ chuẩn bị +0,25 damage','Phản chấn: thế đỡ vỡ chuẩn bị +0,5 damage']});
Object.assign(WEAPONS.bow,{state:'Bắn ngắt',upgrades:['Dứt điểm: bắn ngắt +0,25 damage','Mũi chặn: bắn ngắt +0,5 damage']});
function resetIdentity(g){Object.assign(g,{weaponRulesVersion:1,enemyRecoveryUntil:0,guardianUsed:0,armor:0,chainArmor:0,armorBroken:false,armorRecovery:0,pendingWeaponBonus:0,nextSwordBonus:0,staminaMax:g.isBoss?7:(g.enemyId==='duelist'||!g.test&&g.routeReward==='duelist')?5:3,opening:false,daggerWindow:null,bowSpent:false,identitySeen:new Set(),faultUsed:false,weaponMotion:null,cancelReturn:null,interruptMotion:null,echoPending:false});g.stamina=g.staminaMax;}
const identityReset=CampaignGame.prototype.reset;
CampaignGame.prototype.reset=function(){identityReset.call(this);resetIdentity(this);};
const identityLoad=CampaignGame.prototype.loadEnemy;
CampaignGame.prototype.loadEnemy=function(...args){const ok=identityLoad.apply(this,args);if(ok)resetIdentity(this);return ok;};
CampaignGame.prototype.damage=function(perfect,mutate=false){
 const heldOnly=this.lastCombo?.results.every(r=>r.held||r.interrupted||r.deflected||r.perfect),flow=perfect?this.flow+1:heldOnly?this.flow:this.skills.resolve&&(this.resolveUsed||0)<this.skills.resolve?this.flow:0;
 const critical=this.opening;let base=WEAPON_RULES[this.weapon].base,bonus=0;const events=[];const add=(id,amount)=>{bonus+=amount;events.push({id,amount:Math.round(amount*4),text:(SKILL_VISUALS[id]?.title||id)+' · +'+Math.round(amount*4)+' DMG'});};
 if(critical){base*=2;events.push({id:'opening',text:'Sơ hở · chí mạng'});}
 if(this.skills.momentum&&flow>=(this.skills.momentum>=2?2:3))add('momentum',.5);
 const count=this.perfects+(perfect?1:0);if(perfect&&this.skills.flame_counter&&count%(this.skills.flame_counter>=2?2:3)===0)add('flame_counter',.5);
 if(this.pendingWeaponBonus)add('mastery',this.pendingWeaponBonus);
 if(!critical&&this.echoPending&&this.skills.echo)add('echo',this.skills.echo*.25);
 if(this.skills.spark&&(this.elementState?.lightning||0)>=2){add('spark',this.skills.spark>=2?1:.5);if(mutate)this.elementState.lightning=0;}
 if(mutate){this.lastCritical=critical;this.lastBonuses=events;this.flow=flow;this.perfects=count;this.pendingWeaponBonus=0;if(!critical)this.echoPending=false;if(!perfect&&!heldOnly&&this.skills.resolve&&(this.resolveUsed||0)<this.skills.resolve)this.resolveUsed=(this.resolveUsed||0)+1;if(critical){this.opening=false;this.stamina=this.staminaMax;this.echoPending=!!this.skills.echo;}this.aim=this.charge=this.bank=0;}
 if(this.heavyChosen){bonus+=WEAPON_RULES.greatsword.heavyBonus;if(mutate){this.heavyChosen=false;events.push({id:"heavy_spend",text:"BỔ NẶNG"});}}return Math.round((base+bonus)*4);
};
CampaignGame.prototype.prepareWeaponShot=function(s){s.critical=!!this.lastCritical;if(this.weapon!=='daggers')return;const total=s.damage;s.damage=total/4;for(let i=1;i<3;i++)this.shots.push({...s,start:s.start+i*.09,impact:s.impact+i*.09,damage:i===2?total-s.damage*2:s.damage,secondary:true,critical:false,bonuses:[]});this.daggerWindow={start:s.impact+.18,end:s.impact+.48};this.weaponMotion={start:this.counter.start,kind:'daggers',end:this.counter.start+.85};};
const identityBegin=CampaignGame.prototype.beginChain;
CampaignGame.prototype.beginChain=function(...args){const ok=identityBegin.apply(this,args);if(ok){this.bowSpent=false;this.identitySeen=new Set();this.chainArmor=this.armor;this.armor=0;}return ok;};
CampaignGame.prototype.weaponAction=function(){
 if(this.state!=='combat')return false;
 if(this.weapon==='bow'&&this.combo&&this.attack&&!this.attack.resolved&&!this.bowSpent){this.bowSpent=true;const a=this.attack,remaining=a.impact-this.time,single=this.combo.hits.length===1,progress=(this.time-a.start)/(a.impact-a.start),correct=remaining>=.16&&this.time>=a.start&&(!single||(progress>=.22&&progress<=.48));const bonus=WEAPON_RULES.bow.masteryInterrupt[Math.min(3,this.level)-1]+(this.skills.twin_fang||0)*.25;this.weaponMotion={start:this.time-.5,kind:'bow',end:this.time+.4};this.shots.push({start:this.time,impact:this.time+.14,damage:WEAPON_RULES.bow.interrupt+bonus,perfect:false,intercept:correct,miss:!correct,originY:554+this.pose().offset-this.pose().height,beat:a.index,counterKey:this.attackCount,bonuses:correct?[{id:'twin_fang',text:'Bắn chặn · ngắt nhịp'}]:[]});this.feedback=correct?'BẮN CHẶN':'BẮN HỤT · vẫn có thể né';return true;}
 const w=this.daggerWindow;if(this.weapon==='daggers'&&w&&this.time>=w.start&&this.time<=w.end){this.daggerWindow=null;this.weaponMotion={start:this.counter?.start??this.time-.28,kind:'daggers',followStart:this.time,end:this.time+.65};const extra=WEAPON_RULES.daggers.follow+(this.level>=3?.25:0)+(this.skills.cross_cut||0)*.25;for(let i=0;i<2;i++)this.shots.push({start:this.time+i*.12,impact:this.time+.18+i*.12,damage:extra/2,perfect:false,followup:true,secondary:true,counterKey:this.attackCount,bonuses:i?[]:[{id:'cross_cut',text:'Nối đòn · 2 nhát'}]});this.feedback='NỐI ĐÒN';return true;}return false;
};
const identityAct=CampaignGame.prototype.act;
CampaignGame.prototype.act=function(kind){if(!['up','down','jump'].includes(kind))return false;if(this.weapon==='daggers'&&this.shots.some(s=>s.followup&&!s.hit)){this.shots=this.shots.filter(s=>!s.followup||s.hit);this.cancelReturn={start:this.time,x:weaponHeroPosition(this)};this.counter=null;this.weaponMotion=null;this.feedback='HỦY NỐI · NÉ';}return identityAct.call(this,kind);};
const identityUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(dt){
 const oldLast=this.lastCombo,oldShield=this.shield;let lentArmor=false;if(this.weapon==='greatsword'&&this.chainArmor&&this.combo&&!this.shield){this.shield=1;lentArmor=true;}
 identityUpdate.call(this,dt);
 if(lentArmor){if(this.shield===0){this.chainArmor=0;this.armorBroken=true;this.armorRecovery=0;if(!this.faultUsed){this.pendingWeaponBonus=WEAPON_RULES.greatsword.masteryBreak[Math.min(3,this.level)-1]+(this.skills.fault_breaker||0)*.25;this.faultUsed=true;}this.skillEvents.push({id:'guard_break',text:'THẾ ĐỠ BỊ PHÁ',time:this.time});}else this.shield=oldShield;}
 if(this.state!=='combat'){this.daggerWindow=null;return;}
 let resourcesChanged=false;const c=this.combo||this.lastCombo;for(const r of c?.results||[]){const key=this.attackCount+':'+r.index;if(this.identitySeen.has(key))continue;this.identitySeen.add(key);resourcesChanged=true;if(r.perfect||r.deflected){this.stamina=Math.max(0,this.stamina-(r.deflected?2:1));if(this.stamina===0)this.opening=true;}}
 if(this.lastCombo&&this.lastCombo!==oldLast){resourcesChanged=true;const clean=this.lastCombo.clean;if(this.opening&&!this.counter)this.counter={perfect:false,start:null,released:false,readyAt:this.time+.42};
 if(this.weapon==='greatsword'){this.armor=this.chainArmor;this.chainArmor=0;if(clean){if(this.armor){this.heavyWindow={start:this.time,end:this.time+.38};}else{this.pendingGuard=true;this.armorRecovery=1;}}else this.armorRecovery=0;}
 if(clean&&this.weapon==='katana')this.nextSwordBonus=WEAPON_RULES.katana.masteryClean[Math.min(3,this.level)-1]+(this.skills.crescent||0)*.25;}
 if(this.pendingGuard&&!this.counter){this.pendingGuard=false;this.armor=1;this.armorBroken=false;this.armorRecovery=0;this.skillEvents.push({id:'guard_gain',text:'THẾ ĐỠ',time:this.time});}if(this.heavyWindow&&this.time>this.heavyWindow.end)this.heavyWindow=null;
 if(this.daggerWindow&&this.time>this.daggerWindow.end){this.daggerWindow=null;if(this.level>=2)this.pendingWeaponBonus+=WEAPON_RULES.daggers.masterySkip[Math.min(3,this.level)-1];}
 if(this.weapon==='daggers'&&this.counter?.released&&this.time>this.counter.start+.46)this.counter=null;
 if(this.weapon==='katana'&&!this.counter&&this.nextSwordBonus){this.pendingWeaponBonus=this.nextSwordBonus;this.nextSwordBonus=0;}if(resourcesChanged)this.persist();
};
const identityPersist=CampaignGame.prototype.persist;
CampaignGame.prototype.persist=function(){this.identityState={weapon:this.weapon,enemy:this.enemyId,stamina:this.stamina,staminaMax:this.staminaMax,opening:this.opening,armor:this.armor,chainArmor:this.chainArmor,armorBroken:this.armorBroken,armorRecovery:this.armorRecovery,pendingWeaponBonus:this.pendingWeaponBonus,echoPending:this.echoPending,guardianUsed:this.guardianUsed};identityPersist.call(this);};
const identityResume=CampaignGame.prototype.resume;
CampaignGame.prototype.resume=function(){const ok=identityResume.call(this);if(ok){const saved=this.identityState;resetIdentity(this);if(saved&&saved.weapon===this.weapon&&saved.enemy===this.enemyId){for(const key of ['stamina','staminaMax','opening','armor','armorBroken','armorRecovery','pendingWeaponBonus','echoPending','guardianUsed'])if(saved[key]!=null)this[key]=saved[key];this.armor=Math.max(this.armor,saved.chainArmor||0);}}return ok;};
SKILLS.flame_counter.desc=['Mỗi 3 phản công Perfect: +0,5 damage','Mỗi 2 phản công Perfect: +0,5 damage'];SKILLS.momentum.desc=['Flow 3: +0,5 damage','Flow 2: +0,5 damage'];
EXTRA_SKILLS.spark.desc=SKILLS.spark.desc=['Mỗi 3 phản công: +0,5 damage','Mỗi 3 phản công: +1 damage'];SKILL_VISUALS.guardian.title='Vững tâm';
EXTRA_SKILLS.echo={title:['Dư âm','Echo'],total:18,color:'#c8adf3',shape:'eye',desc:['Sau chí mạng: phản công thường kế +0,25 damage','Sau chí mạng: phản công thường kế +0,5 damage']};SKILLS.echo={name:'Echo',desc:EXTRA_SKILLS.echo.desc};SKILL_VISUALS.echo={title:'Dư âm',color:'#c8adf3',dark:'#263c42',tag:'PHẢN CÔNG',shape:'eye',brief:EXTRA_SKILLS.echo.desc};
for(const [id,title]of Object.entries({twin_fang:'Dứt điểm',crescent:'Thu kiếm',cross_cut:'Nhịp dao',fault_breaker:'Phản chấn'})){EXTRA_SKILLS[id].title[0]=title;SKILL_VISUALS[id].title=title;SKILL_VISUALS[id].brief=SKILLS[id].desc;}
SKILL_VISUALS.flame_counter.brief=['3 Perfect → +0,5 DMG','2 Perfect → +0,5 DMG'];SKILL_VISUALS.momentum.brief=['Flow 3 → +0,5 DMG','Flow 2 → +0,5 DMG'];

// Smooth approach/contact/retreat for the optional dagger follow-up.
function weaponHeroPosition(g,age=g.counter?.start==null?-1:g.time-g.counter.start){
 const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const regular=a=>a<0?90:90+540*ease(a<=.28?a/.28:1-(a-.28)/(.85-.28));
 if(g.cancelReturn&&g.time-g.cancelReturn.start<.16)return 90+(g.cancelReturn.x-90)*(1-ease((g.time-g.cancelReturn.start)/.16));
 const m=g.weaponMotion;if(m?.followStart!=null&&g.time<m.end){const t=g.time-m.followStart,from=regular(m.followStart-m.start);if(t<.08)return from+(630-from)*ease(t/.08);if(t<.32)return 630;return 90+540*(1-ease((t-.32)/.33));}
 return regular(age);
}





