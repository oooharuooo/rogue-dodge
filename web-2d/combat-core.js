// Sequential combat layer; FullGame owns rewards, weapons, mastery and checkpoints.
class CombatGame extends FullGame {
 constructor(rng=Math.random){super();this.rng=rng;this.combo=null;this.lastCombo=null;this.testFamily='auto';this.testLength=0;}
 reset(){super.reset();this.combo=null;this.lastCombo=null;}
 loadEnemy(id,boss=false){this.combo=null;this.lastCombo=null;return super.loadEnemy(id,boss);}
 resume(){const ok=super.resume();this.combo=null;this.lastCombo=null;return ok;}
 get combatProfile(){
  if(this.enemyId==='dread_wolf')return 'melee';
  if(this.test&&this.testFamily!=='auto')return this.testFamily;
  if(this.isBoss)return this.phase>=2?'mixed':this.enemyId==='wraith'||this.enemyId==='minotaur_oracle'?'ranged':'melee';
  return ['frost_golem','moss_golem'].includes(this.enemyId)?'ranged':'melee';
 }
 get chainLength(){return this.test&&this.testLength?Math.max(1,Math.min(4,this.testLength)):this.isBoss?({executioner:[2,3],warden:[2,4],wraith:[2,3,4],rune_golem:[2,3],minotaur_chief:[2,4],minotaur_oracle:[2,3,4]}[this.enemyId]||[2,3])[this.phase-1]:this.enemyId==='duelist'?2:1;}
 begin(kind){return this.beginChain();}
 beginSingle(kind){return this.beginChain([{family:'ranged',kind,target:kind==='up'?0:kind==='down'?2:1}]);}
 beginChain(forced){
  if(this.state!=='combat'||this.time<(this.enemyRecoveryUntil||0)||this.attack||this.combo||this.action||this.counter||this.shots.some(s=>!s.hit&&!s.followup))return false;
  const hits=forced||Array.from({length:this.chainLength},(_,i)=>{
   const family=this.combatProfile==='mixed'?(this.rng()<.5?'melee':'ranged'):this.combatProfile,r=this.rng();
   if(family==='ranged'){const kind=r<.34?'up':r<.67?'down':'jump';return {family,kind,target:kind==='up'?0:kind==='down'?2:1};}
   return {family,kind:r<.25?'jump':'melee',target:i===0||r<.5?1:r<.75?0:2};
  });
  const windup=Math.max(1.15,this.enemy.windup||1.35),interval=Math.max(1.35,1.6-(this.phase-1)*.10);
  this.combo={hits,targets:hits.map(h=>h.target),index:0,first:this.time+windup,started:this.time,interval,originLane:1,results:[],clean:true,perfect:true};
  this.attack=this.makeHit(0);this.attackCount++;return true;
 }
 makeHit(index){const c=this.combo,impact=c.first+index*c.interval;return {...c.hits[index],index,count:c.hits.length,start:index?impact-(c.interval-.5):c.started,impact,resolved:false};}
 recommendedAction(a=this.attack){if(!a||a.resolved)return null;return a.kind==='jump'?'jump':a.family==='ranged'?a.kind:a.target===1?'up':null;}
 update(dt){
  if(!Number.isFinite(dt)||dt<0)return;const current=this.attack;this.attack=null;super.update(dt);
  if(this.state!=='combat'){this.combo=null;this.attack=null;return;}this.attack=current;
  const c=this.combo;
  if(c){while(c.index<c.hits.length&&this.time>=c.first+c.index*c.interval){
   const a=this.makeHit(c.index),p=this.pose(a.impact),position=1+p.offset/156;
   const deflected=!!a.deflectAttempt&&a.deflectAttempt.lane===a.target&&a.deflectAttempt.time<=a.impact&&a.impact-a.deflectAttempt.time<=(this.deflectWindow??.30);
   const safe=a.deflectAttempt?deflected:a.interrupted?true:a.kind==='jump'?p.kind==='jump'&&p.height>=85:a.family==='ranged'?Math.abs(position-a.target)<.48:Math.abs(position-a.target)>.52;
   const extra=(this.skills.focus>=2?.03:this.skills.focus?.02:0)/.9,active=a.kind==='jump'?p.kind==='jump':a.family==='ranged'?p.kind===a.kind:a.target===1&&['up','down'].includes(p.kind);
   const perfect=!a.deflectAttempt&&!a.interrupted&&safe&&active&&p.progress>=.42-extra&&p.progress<=.58+extra;
   const held=!a.deflectAttempt&&safe&&a.family==='melee'&&a.kind!=='jump'&&p.kind==='idle';c.results.push({...a,safe,perfect,held,deflected});c.clean&&=safe;c.perfect&&=perfect;
   if(deflected)this.skillEvents.push({id:'deflect',text:'DEFLECT',time:a.impact,lane:a.target,beat:a.index});
   if(a.interrupted){this.feedback='NGẮT ĐÒN';}else if(safe){this.dodged++;this.feedback=deflected?'DEFLECT':perfect?'PERFECT':held?'GIỮ ĐÚNG':'NORMAL · NÉ ĐÚNG';if(perfect&&!this.test)this.meta.perfect++;if(perfect&&this.skills.focus&&(p.progress<.42||p.progress>.58))this.skillEvents.push({id:'focus',text:'Focus · Perfect mở rộng',time:a.impact});}
   else {this.hits++;const priorFlow=this.flow;this.flow=0;if(this.shield){this.shield--;this.skillEvents.push({id:'guardian',text:'Guardian · Đã chặn đòn',time:a.impact});this.feedback='GUARDIAN';}else{this.hp--;this.encounterHits++;this.hurtTime=a.impact;this.feedback='TRÚNG ĐÒN';if(this.skills.guardian&&(this.guardianUsed||0)<this.skills.guardian){this.guardianUsed=(this.guardianUsed||0)+1;this.flow=priorFlow;this.skillEvents.push({id:'guardian',text:'Vững tâm · giữ Flow',time:a.impact});}}}
   a.resolved=true;this.attack=a;c.index++;
   // Save resolved damage and shield consumption before the next combo beat.
   this.persist();
   if(this.hp<=0){this.state='lost';this.lossTime=this.time;this.combo=null;this.counter=null;this.shots=[];this.persist();return;}
  }
  if(c.index===c.hits.length){this.lastCombo={...c,results:c.results.slice()};this.combo=null;this.enemyRecoveryUntil=this.time+(this.weapon==='daggers'?1.0:1.55);if(c.clean){this.counter={perfect:c.perfect,start:null,released:false,readyAt:this.time+.42};this.feedback=c.perfect?'PERFECT CHUỖI · PHẢN CÔNG':'NÉ ĐỦ CHUỖI · PHẢN CÔNG';}this.persist();}
  else if(this.time>=c.first+c.index*c.interval-(c.interval-.5))this.attack=this.makeHit(c.index);
  }else if(this.attack?.resolved&&this.time-this.attack.impact>.6)this.attack=null;
 }
}
if(typeof module!=='undefined')module.exports={CombatGame};
