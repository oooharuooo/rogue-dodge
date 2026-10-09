const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('web-2d/weapon-balance-ui.js','utf8');
let calls=0,seenAttack;
global.drawEncounter=(c,g)=>{calls++;seenAttack=g.attack;g.visualAnchor={x:710,y:552};};
global.drawCloseEncounter=()=>{throw Error('Interrupted drawing must not emit a melee slash');};
const c={save(){},restore(){},translate(){}};
vm.runInThisContext(source.slice(source.indexOf('const baseEncounterDraw='),source.indexOf("weaponActionButton.addEventListener('keydown'")));
const attack={interrupted:true,index:1,impact:2},g={attack,time:1.92,interruptMotion:{start:1.9,anchor:{x:280,y:500}},combo:{first:.4,interval:1.6,hits:[{},{},{}]}};
drawCloseEncounter(c,g);assert.equal(calls,1);assert.equal(seenAttack,null);assert.equal(g.attack,attack);assert(g.visualAnchor.x<320);
g.time=2.4;drawCloseEncounter(c,g);assert.equal(calls,2);assert.equal(g.attack,attack);assert.equal(g.visualAnchor.y,552);assert(g.visualAnchor.x<320);
g.attack={index:2,impact:3.6};drawEncounter(c,g);assert.equal(calls,3);assert.equal(seenAttack,g.attack);
console.log('Interrupted art: one draw per frame, no melee slash, attack restored, stays near contact until next tell, next beat rendered normally.');

// Early ranged interruption must not teleport the next melee approach.
global.ENCOUNTER_STYLES={executioner:{family:'axe'}};global.enemyMotion=()=>({re:0,le:0,lean:0,drop:0});
vm.runInThisContext(fs.readFileSync('web-2d/combat-motion.js','utf8'));
const approach={enemyId:'executioner',time:2.5,attack:{index:2,target:1,kind:'melee'},combo:{},interruptMotion:{beat:1,anchor:{x:600,y:552}}};
assert.equal(710+meleeMotion(approach,0).shift,600);
vm.runInThisContext(fs.readFileSync('web-2d/wolf-rig.js','utf8'));
approach.attack.start=2.5;approach.attack.impact=3.6;assert.equal(wolfPose(approach).x,600);
console.log('Next humanoid/quadruped beat starts at the early interrupt contact position, without teleporting into melee range.');
const single={enemyId:'executioner',attack:{interrupted:true,index:0,impact:2},time:1.9,interruptMotion:{start:.8,anchor:{x:450,y:552}},combo:null};let previousX=null;for(let i=0;i<=30;i++){single.time=1.9+i/60;drawInterruptRecovery(c,single,baseEncounterDraw,[]);if(previousX!==null)assert(Math.abs(single.visualAnchor.x-previousX)<35,'single interruption retreat must be continuous');previousX=single.visualAnchor.x;}assert.equal(single.visualAnchor.x,710);
const settled=meleeMotion({enemyId:'executioner',attack:{kind:'melee',target:0,resolved:true,index:0,start:0,impact:1},combo:null,time:1.4},1.4);assert.equal(Math.abs(settled.right),0);assert.equal(Math.abs(settled.left),0);assert.equal(Math.abs(settled.wa),0);
const arenaSource=fs.readFileSync('web-2d/arena-layout.js','utf8');vm.runInThisContext(arenaSource.split('\n').slice(0,3).join('\n'));for(const weapon of ['katana','daggers','greatsword'])for(const age of [.85,.9,1,1.3])assert.equal(counterPosition(age,weapon),90);
console.log('Single-beat retreat continuous; melee hands settle before idle switch; hero counter stays at home after recovery.');


