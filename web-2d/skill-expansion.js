// Shared unlock catalog. Weapon techniques are automatic counterattacks, never an Attack button.
const EXTRA_SKILLS={
 twin_fang:{weapon:'bow',title:['Song tiễn','Twin Fang'],xp:8,color:'#8bd7ce',shape:'wind',desc:['Bắn hai mũi tên cùng lúc khi Perfect: +1 damage.','Bắn hai mũi tên cùng lúc khi Perfect: +2 damage.']},
 crescent:{weapon:'katana',title:['Trăng khuyết','Crescent Cut'],xp:8,color:'#a8baf4',shape:'claw',desc:['Né trọn combo từ 2 đòn: phản công vòng cung +1 damage.','Né trọn combo từ 2 đòn: phản công vòng cung +2 damage.']},
 cross_cut:{weapon:'daggers',title:['Song trảm','Cross Cut'],xp:8,color:'#eaa29c',shape:'claw',desc:['Perfect: chém hai nhát giao nhau, +1 damage.','Perfect: chém hai nhát giao nhau, +2 damage.']},
 fault_breaker:{weapon:'greatsword',title:['Phá thạch','Fault Breaker'],xp:8,color:'#d8b777',shape:'shield',desc:['Xả từ 2 Charge bằng Perfect: đập kiếm nứt đất, +1 damage.','Xả từ 2 Charge bằng Perfect: đập kiếm nứt đất, +2 damage.']},
 resolve:{title:['Bền chí','Resolve'],field:'clean',target:5,color:'#c8d397',shape:'shield',desc:['Giữ Flow khi né Normal lần đầu mỗi trận.','Giữ Flow khi né Normal 2 lần đầu mỗi trận.']},
 second_wind:{title:['Hồi sức','Second Wind'],field:'perfect',target:24,color:'#94d2ba',shape:'wind',desc:['Sau 6 phản công Perfect trong trận: hồi 1 HP, một lần.','Sau 4 phản công Perfect trong trận: hồi 1 HP, một lần.']},
 ember:{title:['Tàn lửa','Ember'],total:12,color:'#ee9a65',shape:'flame',element:'fire',desc:['Mỗi phản công trúng tích 1 Lửa. Đủ 3: cháy 1 damage/giây trong 2 giây, không kết liễu.','Đủ 3 Lửa: cháy 1 damage/giây trong 3 giây, không kết liễu.']},
 spark:{title:['Điện quang','Spark'],total:16,color:'#dfd992',shape:'wind',element:'lightning',desc:['Mỗi phản công trúng tích 1 Sét. Đòn thứ 3 phóng tia: +1 damage.','Đòn thứ 3 phóng tia: +2 damage.']},
 rime:{title:['Sương giá','Rime'],total:12,color:'#9de3f5',shape:'eye',element:'ice',desc:['Mỗi phản công trúng tích 1 Băng. Đủ 3: nhịp báo đòn kế tiếp chậm 15%.','Đủ 3 Băng: nhịp báo đòn kế tiếp chậm 20%.']}
};
const EXTRA_EN={twin_fang:['Perfect: fire two arrows together, +1 damage.','Perfect: fire two arrows together, +2 damage.'],crescent:['Dodge an entire 2+ hit combo: crescent counter +1 damage.','Dodge an entire 2+ hit combo: crescent counter +2 damage.'],cross_cut:['Perfect: two crossing cuts, +1 damage.','Perfect: two crossing cuts, +2 damage.'],fault_breaker:['Perfect release of 2+ Charge: sword ground break +1 damage.','Perfect release of 2+ Charge: sword ground break +2 damage.'],resolve:['Preserve Flow on the first Normal counter each encounter.','Preserve Flow on the first 2 Normal counters each encounter.'],second_wind:['After 6 Perfect counters in an encounter: heal 1 HP, once.','After 4 Perfect counters in an encounter: heal 1 HP, once.'],ember:['Each counter hit adds 1 Fire. At 3: burn 1 damage/second for 2 seconds, cannot finish.','At 3 Fire: burn 1 damage/second for 3 seconds, cannot finish.'],rime:['Each counter hit adds 1 Ice. At 3: next chain’s first tell is 15% slower.','At 3 Ice: next chain’s first tell is 20% slower.'],spark:['Each counter hit adds 1 Lightning. The third hit sparks: +1 damage.','The third hit sparks: +2 damage.']};
for(const [id,v]of Object.entries(EXTRA_SKILLS)){
 SKILLS[id]={name:v.title[1],desc:v.desc};
 SKILL_VISUALS[id]={title:v.title[0],color:v.color,dark:'#263c42',tag:v.weapon?'VŨ KHÍ':v.element?'NGUYÊN TỐ':'BỊ ĐỘNG',brief:v.weapon?(id==='crescent'?['Combo 2+ → +1 DMG','Combo 2+ → +2 DMG']:id==='fault_breaker'?['2+ Charge → +1 DMG','2+ Charge → +2 DMG']:['Perfect → +1 DMG','Perfect → +2 DMG']):id==='resolve'?['Normal: giữ Flow ×1','Normal: giữ Flow ×2']:id==='second_wind'?['6 Perfect → +1 HP','4 Perfect → +1 HP']:id==='ember'?['3 Fire → Burn 2s','3 Fire → Burn 3s']:id==='rime'?['3 Ice → Chill 15%','3 Ice → Chill 20%']:['3 Lightning → +1 DMG','3 Lightning → +2 DMG'],shape:v.shape};
}
function extraProgress(meta,id){const v=EXTRA_SKILLS[id];if(!v)return null;if(v.weapon)return [meta.xp[v.weapon]||0,v.xp,'XP'];if(v.total)return [Object.values(meta.xp).reduce((a,b)=>a+b,0),v.total,'XP tổng'];return [meta[v.field]||0,v.target,v.field==='perfect'?'Perfect':'Trận không mất HP'];}
const baseUnlock=CampaignGame.prototype.unlocked;
CampaignGame.prototype.unlocked=function(id){const p=extraProgress(this.meta,id);return p?p[0]>=p[1]:baseUnlock.call(this,id);};
const baseLoad=CampaignGame.prototype.loadEnemy;
CampaignGame.prototype.loadEnemy=function(...args){const ok=baseLoad.apply(this,args);if(ok){this.elementState={fire:0,ice:0,chill:0,burn:0,nextBurn:0,lightning:0};this.resolveUsed=0;this.recoveryPerfects=0;this.recoveryUsed=false;this.weaponTechniqueEvents=[];this.persist();}return ok;};
const baseDamage=CampaignGame.prototype.damage;
CampaignGame.prototype.damage=function(perfect,mutate=false){
 const flow=this.flow,charge=this.charge,result=baseDamage.call(this,perfect,mutate);let extra=0;
 for(const [id,v]of Object.entries(EXTRA_SKILLS)){if(!v.weapon||v.weapon!==this.weapon||!this.skills[id])continue;const trigger=id==='crescent'?(this.lastCombo?.clean&&this.lastCombo.results.length>=2):id==='fault_breaker'?perfect&&charge>=2:perfect;if(trigger){const amount=this.skills[id];extra+=amount;if(mutate)this.lastBonuses.push({id,amount,text:v.title[1]+' · +'+amount+' DMG'});}}
 if(this.skills.spark&&(this.elementState?.lightning||0)>=2){extra+=this.skills.spark;if(mutate){this.elementState.lightning=0;this.lastBonuses.push({id:'spark',amount:this.skills.spark,text:'Spark · +'+this.skills.spark+' DMG'});}}
 if(mutate){const allHeld=this.lastCombo?.results.every(r=>r.held),noNormal=this.lastCombo?.results.every(r=>r.perfect||r.held);if(!perfect&&allHeld)this.flow=flow;else if(!perfect&&noNormal)this.flow=flow;else if(!perfect&&this.skills.resolve&&(this.resolveUsed||0)<this.skills.resolve){this.flow=flow;this.resolveUsed=(this.resolveUsed||0)+1;this.lastBonuses.push({id:'resolve',text:'Resolve · Flow '+flow});}}
 return result+extra;
};
// Elements attach only to actual counter hits. Burn cannot stack and never grants XP.
const baseUpdate=CampaignGame.prototype.update;
CampaignGame.prototype.update=function(dt){
 const existing=new Set(this.damageEvents),oldShots=new Set(this.shots),oldPerfects=this.perfects;baseUpdate.call(this,dt);
 for(const shot of this.shots.filter(s=>!oldShots.has(s)))for(const bonus of shot.bonuses||[])if(EXTRA_SKILLS[bonus.id]?.weapon)(this.weaponTechniqueEvents||(this.weaponTechniqueEvents=[])).push({...bonus,time:shot.start,travel:shot.impact-shot.start});
 if(this.state!=='combat')return;
 const state=this.elementState||(this.elementState={fire:0,ice:0,chill:0,burn:0,nextBurn:0,lightning:0});
 for(const hit of this.damageEvents.filter(e=>!existing.has(e)&&!e.element)){
  if(this.skills.spark&&!this.lastBonuses.some(b=>b.id==='spark'))state.lightning++;
  for(const id of ['ember','rime'])if(this.skills[id]){const type=id==='ember'?'fire':'ice';state[type]++;if(state[type]>=3){state[type]=0;if(type==='fire'){if(!state.burn){state.burn=this.skills.ember>=2?3:2;state.burnClock=0;this.skillEvents.push({id,text:'Ember · BURN',time:this.time});}}else{state.chill=this.skills.rime>=2?.2:.15;this.skillEvents.push({id,text:'Rime · CHILL',time:this.time});}}}
 }
 if(this.perfects>oldPerfects){this.recoveryPerfects=(this.recoveryPerfects||0)+1;const cap=this.skills.second_wind>=2?4:6;if(this.skills.second_wind&&!this.recoveryUsed&&this.recoveryPerfects>=cap&&this.hp<3){this.hp++;this.recoveryUsed=true;this.skillEvents.push({id:'second_wind',text:'Second Wind · +1 HP',time:this.time});this.persist();}}
 if(state.burn)state.burnClock=(state.burnClock||0)+dt;if(state.burn&&state.burnClock>=1){state.burn--;state.burnClock-=1;if(this.enemyHp>1){this.enemyHp--;this.totalDamage++;this.damageEvents.push({element:true,time:this.time,damage:1,perfect:false});this.lastDamage=1;this.persist();}}
 if(this.damageEvents.some(e=>!existing.has(e)))this.persist();
 this.weaponTechniqueEvents=(this.weaponTechniqueEvents||[]).filter(e=>this.time-e.time<.7);
};
const baseBegin=CampaignGame.prototype.beginChain;
CampaignGame.prototype.beginChain=function(forced){const chill=this.elementState?.chill||0,ok=baseBegin.call(this,forced);if(ok&&chill){this.combo.first+=(this.attack.impact-this.attack.start)*chill;this.elementState.chill=0;this.attack=this.makeHit(0);this.persist();}return ok;};

const baseReset=CampaignGame.prototype.reset;
CampaignGame.prototype.reset=function(){baseReset.call(this);this.elementState={fire:0,ice:0,chill:0,burn:0,nextBurn:0,lightning:0};this.resolveUsed=0;this.recoveryPerfects=0;this.recoveryUsed=false;this.weaponTechniqueEvents=[];};
function eligibleExtra(game,id){const v=EXTRA_SKILLS[id];if(v?.weapon&&v.weapon!==game.weapon)return false;if(v?.element&&Object.keys(game.skills).some(key=>key!==id&&EXTRA_SKILLS[key]?.element))return false;return true;}
const baseSelect=CampaignGame.prototype.selectSkill;
CampaignGame.prototype.selectSkill=function(id){return eligibleExtra(this,id)&&baseSelect.call(this,id);};
const baseSkillIcon=skillIconMarkup;
skillIconMarkup=function(id){const v=EXTRA_SKILLS[id],paths={twin_fang:'M27 26Q84 74 27 123M27 26v97M18 62h105m-15-9 15 9-15 9M18 86h105m-15-9 15 9-15 9',crescent:'M33 29Q133 48 109 107Q80 137 27 110Q98 125 101 78Q98 44 33 29Z',cross_cut:'M29 28l78 93m-72 0 71-93M21 96l28 24m49-22-27 25',fault_breaker:'M64 24h13v66H64ZM49 91h42M70 92v22m-3 0-24 9-8-5-13 13m47-17 24 7 9-4 17 15',rime:'M70 21v108M24 48l92 54M24 102l92-54M58 28l12 13 12-13m-24 94 12-13 12 13M27 62l17-3-3-17m60 67-3-17 17-3',spark:'M79 20 42 82h25l-9 50 43-68H75Z'};if(!paths[id])return baseSkillIcon(id);return `<svg viewBox="0 0 140 150" aria-hidden="true" class="skill-illustration"><rect width="140" height="150" rx="14" fill="#223b42"/><circle cx="70" cy="75" r="53" fill="none" stroke="${v.color}" opacity=".2"/><path d="${paths[id]}" fill="${['crescent','fault_breaker','spark'].includes(id)?v.color:'none'}" stroke="${v.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;};
