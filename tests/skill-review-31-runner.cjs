global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.LaneGame=require('../web-2d/lane-core.js');
for(const f of ['full-core.js','combat-core.js','campaign-core.js'])Object.assign(global,require('../web-2d/'+f));
for(const f of ['skill-visuals.js','skill-expansion.js','weapon-balance.js','weapon-final.js','boss-phase.js'])vm.runInThisContext(fs.readFileSync('web-2d/'+f,'utf8'));
const melee={family:'melee',kind:'melee',target:1},ranged=kind=>({family:'ranged',kind,target:kind==='up'?0:kind==='down'?2:1});
const plans={single:[melee],melee3:[melee,melee,melee],ranged3:[ranged('up'),ranged('down'),ranged('jump')],mixed3:[melee,{...melee,kind:'jump'},ranged('down')]};
function simulate(weapon,level,pattern,style,fps=60,build=false){
 const g=new CampaignGame(()=>.4);g.enterTest(weapon,'executioner',true);g.enemyHp=g.enemyMax=100000;g.testLevel=level;
 if(build)g.skills={...build};
 const pressed=new Set();let completed=0,last=null,lastDamage=0,firstDamage=null,followed=0;
 for(let frame=0;frame<fps*300&&completed<12&&g.hp>0;frame++){
  if(!g.combo&&!g.counter&&!g.action)g.beginChain(plans[pattern].map(h=>({...h})));
  const a=g.attack;
  if(a&&!a.resolved){const key=g.attackCount+':'+a.index,bad=style==='errors'&&(g.attackCount+a.index)%5===0;
   if(weapon==='bow'&&style!=='conservative'&&!g.bowSpent&&g.time>=a.start+(a.impact-a.start)*(bad?.96:.32))g.weaponAction();
   if(!pressed.has(key)){
    if(weapon==='katana'&&style!=='conservative'&&a.family==='melee'&&a.kind!=='jump'){
     if(g.time>=a.impact-(bad?.35:.10)){g.deflect(a.target);pressed.add(key);}
    }else if(!g.action&&g.time>=a.impact-(bad?.8:.45)){g.act(g.recommendedAction(a));pressed.add(key);}
   }
  }
  if(weapon==='daggers'&&style!=='conservative'&&g.daggerWindow&&g.time>=g.daggerWindow.start+.04){assert(g.weaponAction());followed++;}
  if(weapon==='greatsword'&&style!=='conservative'&&g.heavyWindow)assert(g.weaponAction());
  g.update(1/fps);
  for(const event of g.damageEvents)assert(Number.isInteger(event.damage)&&event.damage>=0);
  if(g.lastCombo!==last&&g.lastCombo){last=g.lastCombo;completed++;}
  if(g.totalDamage!==lastDamage){if(firstDamage===null)firstDamage=g.totalDamage;lastDamage=g.totalDamage;}
 }
 while((g.counter||g.daggerWindow||g.heavyWindow||g.pendingGuard||g.shots.some(s=>!s.hit))&&g.hp>0){
  if(weapon==='daggers'&&style!=='conservative'&&g.daggerWindow&&g.time>=g.daggerWindow.start+.04){assert(g.weaponAction());followed++;}
  if(weapon==='greatsword'&&style!=='conservative'&&g.heavyWindow)assert(g.weaponAction());
  g.update(1/fps);
 }
 assert(g.totalDamage>0&&Number.isFinite(g.totalDamage/g.time));
 return {weapon,level,pattern,style,fps,build,chains:completed,damage:g.totalDamage,dps:+(g.totalDamage/g.time).toFixed(2),hp:g.hp,followed};
}

const combos=[{}, {focus:2,flame_counter:2,momentum:2}, {focus:2,momentum:2,ember:2}, {resolve:2,momentum:2,spark:2}, {guardian:2,second_wind:2,rime:2}, {focus:2,momentum:2,echo:2}];
const results=[];for(const w of ['katana','daggers','greatsword','bow'])for(const pattern of Object.keys(plans))for(const build of combos){const extra={katana:'crescent',daggers:'cross_cut',greatsword:'fault_breaker',bow:'twin_fang'}[w],skills={...build};if(Object.keys(skills).length)skills[extra]=2;const result=simulate(w,3,pattern,'expert',60,skills);results.push({...result,build:JSON.stringify(skills)});}
fs.writeFileSync('skill-review-31-results.csv','weapon,pattern,build,damage,dps,hp\n'+results.map(r=>[r.weapon,r.pattern,JSON.stringify(r.build),r.damage,r.dps,r.hp].join(',')).join('\n'));
console.log('Legal build audit: '+results.length+' simulations, each at most 4 skills and 1 element.');
for(const w of ['katana','daggers','greatsword','bow']){const list=results.filter(r=>r.weapon===w&&r.pattern==='melee3');console.log(w,list.map(r=>({build:r.build,damage:r.damage,dps:r.dps,hp:r.hp})));}
