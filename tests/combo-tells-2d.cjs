const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('web-2d/wolf-rig.js','utf8'),sandbox);
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
for(const kind of ['melee','jump'])for(const target of [0,1,2]){
 const combo={index:1,hits:[{},{}],targets:[target,1]};
 const first={start:0,impact:1,kind,target,index:0,resolved:true};
 const before=sandbox.wolfPose({attack:first,combo,time:1.5});
 const after=sandbox.wolfPose({attack:{start:1.5,impact:2.5,kind,target:1,index:1},combo,time:1.5});
 ok(Math.abs(before.x-after.x)<1,'No teleport between combo hits');
 ok(after.x<350,'Followup stays close');ok(Math.abs(before.y-552)<.01&&Math.abs(after.y-552)<.01,'Recenter between hits');
}
const parts=Object.fromEntries(['leg','tail','torso','mane','fur','harness','head'].map(k=>[k,()=>{}]));let alpha=1,shadow=[];const ctx={save(){},restore(){},set globalAlpha(v){alpha=v},get globalAlpha(){return alpha},beginPath(){},ellipse(){shadow.push(alpha)},fill(){},translate(){},rotate(){},scale(){},moveTo(){},quadraticCurveTo(){},stroke(){}};
for(const q of [.4,.95]){shadow=[];alpha=1;sandbox.drawWolf(ctx,{quadParts:parts,time:q,attack:{start:0,impact:1,kind:'melee',target:0}});ok(q<.86?shadow[0]===0:shadow[0]>.8,'Shadow delayed until contact');}
const {attackSoundCue}=require('../web-2d/feedback.js');ok(!attackSoundCue({family:'melee',kind:'melee',target:0}).bell,'Upper strike has no bell');for(const family of ['melee','ranged'])ok(attackSoundCue({family,kind:'jump'}).bell,'Three-lane slam rings at '+family);console.log(checks+' combo continuity, delayed shadow and bell checks passed');

