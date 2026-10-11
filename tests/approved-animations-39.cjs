const fs=require('fs'),vm=require('vm'),assert=require('assert');
let previous,commands=[];
class HeroRig{draw(c,x,y,state,clock){this.state=state;if(state.includes('attack')||this.deflect)this.drawMelee(c,state,clock)}drawMelee(){this.base=true}}
class CampaignGame{damage(){this.heavyChosen=false;return 10}prepareWeaponShot(){}}
const context={HeroRig,CampaignGame,game:{time:1,shots:[]},arenaYScale:.5,strikeArt:(c,g,age)=>previous={g,age}};
vm.createContext(context);vm.runInContext(fs.readFileSync('web-2d/chosen-counter-animation.js','utf8'),context);
const canvas=new Proxy({createLinearGradient:()=>({addColorStop:(...a)=>commands.push(['color',...a])})},{get:(o,k)=>k in o?o[k]:(...a)=>commands.push([k,...a]),set:(o,k,v)=>(commands.push([k,v]),o[k]=v,true)});
let checks=0;const check=(v,m)=>{assert(v,m);checks++};
for(const type of ['intercept','followup','heavyTap']){commands=[];context.strikeArt(canvas,{weapon:'bow',time:1,damageEvents:[{time:.96,[type]:true}],skillEvents:[],visualAnchor:{x:400,y:500}},.55);check(previous.g.damageEvents.length===0,'tap removes original white contact');check(commands.some(c=>c.includes('#ffd078')),'tap renders amber core');}
commands=[];context.strikeArt(canvas,{weapon:'bow',time:1,damageEvents:[],skillEvents:[]},-1);check(commands.length===0,'miss creates no contact FX');
commands=[];const normal={time:.96,damage:6};context.strikeArt(canvas,{weapon:'katana',time:1,damageEvents:[normal],skillEvents:[]},.4);check(previous.g.damageEvents[0]===normal&&commands.length===0,'counter keeps original art');
commands=[];context.strikeArt(canvas,{weapon:'katana',time:1,damageEvents:[],skillEvents:[{id:'deflect',time:.96,lane:1}]},-1);check(previous.g.skillEvents.length===0&&commands.some(c=>c.includes('#ffd078')),'successful deflect replaces contact art');
const g=new CampaignGame();g.weapon='greatsword';g.counter={};g.heavyChosen=true;check(g.damage(true,true)===10&&g.counter.heavyTap,'damage stays unchanged and records heavy identity before consumption');let shot={};g.prepareWeaponShot(shot);check(shot.heavyTap,'heavy identity reaches shot');
const rig=new HeroRig();rig.weapon='greatsword';rig.files=['Left Arm.png','Right Arm.png','Left Hand.png','Right Hand.png'].map(name=>({name}));rig.images=[{},{},{},{}];rig.greatsword={};context.game.counter={start:0};rig.draw(canvas,0,0,'heavy_attack',.52);check(rig.state==='sword_attack'&&rig.selectedCounter,'regular greatsword counter uses Draw Cut without overhead body lift');
context.game.heavyChosen=true;rig.draw(canvas,0,0,'idle',1);check(!rig.selectedHeavy,'pending Heavy never overrides idle pose');
context.game.counter.heavyTap=true;rig.draw(canvas,0,0,'heavy_attack',.52);check(rig.selectedHeavy&&rig.state==='heavy_attack','spent Heavy uses Shoulder Cleave');
context.game={time:1,shots:[],weaponMotion:null};rig.weapon='daggers';rig.draw(canvas,0,0,'idle',1);check(!rig.selectedFollow&&!rig.selectedReverseCounter,'exit clears attack pose flags');
console.log('Approved animations: '+checks+' checks passed — tap hit/miss, Deflect, counter art, Heavy metadata, pending/idle and exit cleanup.');
