global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.LaneGame=require('../web-2d/lane-core.js');
for(const f of ['full-core.js','combat-core.js','campaign-core.js'])Object.assign(global,require('../web-2d/'+f));
for(const f of ['skill-visuals.js','skill-expansion.js','weapon-balance.js','weapon-final.js','boss-phase.js'])vm.runInThisContext(fs.readFileSync('web-2d/'+f,'utf8'));
const melee={family:'melee',kind:'melee',target:1},ranged=kind=>({family:'ranged',kind,target:kind==='up'?0:kind==='down'?2:1});
const plans={single:[melee],melee3:[melee,melee,melee],ranged3:[ranged('up'),ranged('down'),ranged('jump')],mixed3:[melee,{...melee,kind:'jump'},ranged('down')]};
function simulate(weapon,level,pattern,style,fps=60,build=false){
 const g=new CampaignGame(()=>.4);g.enterTest(weapon,'executioner',true);g.enemyHp=g.enemyMax=100000;g.testLevel=level;
 if(build)g.skills={spark:2,ember:2,rime:2,momentum:2,flame_counter:2,cross_cut:2,crescent:2,twin_fang:2,fault_breaker:2};
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
const rows=[];
for(const fps of [30,60,120])for(const weapon of ['katana','daggers','greatsword','bow'])for(const level of [1,2,3])for(const pattern of Object.keys(plans))for(const style of ['expert','conservative','errors'])rows.push(simulate(weapon,level,pattern,style,fps));
for(const weapon of ['katana','daggers','greatsword','bow'])for(const pattern of Object.keys(plans))rows.push(simulate(weapon,3,pattern,'expert',60,true));
for(const w of ['katana','daggers','greatsword','bow'])for(const l of [1,2,3])for(const p of Object.keys(plans))for(const s of ['expert','conservative']){
 const matched=rows.filter(r=>r.weapon===w&&r.level===l&&r.pattern===p&&r.style===s&&!r.build);
 assert.equal(new Set(matched.map(r=>r.damage)).size,1,'FPS damage differs: '+[w,l,p,s]);
}
for(const weapon of ['katana','daggers','greatsword','bow']){
 const g=new CampaignGame(()=>.4);g.start(weapon);g.selectSkill('focus');
 for(let frame=0;frame<120000&&!['won','lost'].includes(g.state);frame++){
  if(g.state==='route')g.selectNode(g.availableNodes()[0]);
  else if(['reward','shop','shrine','event'].includes(g.state)){if(g.state==='reward'&&(g.skills.focus||0)<2)g.selectSkill('focus');else g.skip();}
  else if(g.state==='combat'){
   if(!g.combo&&!g.counter&&!g.action)g.beginChain();
   const a=g.attack;if(a&&!a.resolved){
    if(weapon==='bow'&&!g.bowSpent&&g.time>=a.start+(a.impact-a.start)*.32)g.weaponAction();
    if(weapon==='katana'&&a.family==='melee'&&a.kind!=='jump'){if(g.time>=a.impact-.1)g.deflect(a.target);}
    else if(!g.action&&g.time>=a.impact-.45)g.act(g.recommendedAction(a));
   }
   if(weapon==='daggers'&&g.daggerWindow&&g.time>=g.daggerWindow.start+.04)g.weaponAction();
   if(weapon==='greatsword'&&g.heavyWindow)g.weaponAction();
   g.update(1/60);
  }
 }
 assert.equal(g.state,'won',weapon+' full Dungeon 1');assert.equal(g.hp,3);assert.equal(g.savedRun,null);
}
const columns=Object.keys(rows[0]);fs.writeFileSync('weapon-balance-20-results.csv',[columns.join(','),...rows.map(r=>columns.map(k=>r[k]).join(','))].join('\n'));
console.log(rows.length+' scenarios and full Dungeon 1 with all four weapons passed: levels 1–3, four attack patterns, three play styles, 30/60/120 FPS and stacked skill builds.');
console.table(rows.filter(r=>r.level===1&&r.fps===60&&!r.build&&['expert','conservative'].includes(r.style)&&['single','melee3'].includes(r.pattern)));
