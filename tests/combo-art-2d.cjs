const fs=require('fs'),vm=require('vm'),assert=require('assert');
const pose=JSON.parse(fs.readFileSync('web-2d/knight-parts/pose.json'));
const rigs=Object.fromEntries([1,2,3].map(variant=>[variant,{...pose,images:pose.files.map(f=>({width:+f.width,height:+f.height,name:f.name,variant}))}]));
const packs=Object.fromEntries(fs.readdirSync('web-2d/monster-parts').map(id=>{const r=JSON.parse(fs.readFileSync('web-2d/monster-parts/'+id+'/pose.json'));return [id,{...r,images:r.files.map(f=>({width:+f.width,height:+f.height,name:f.name}))}]}));
let matrix=[1,0,0,1,0,0],stack=[],grips={},wave=null,edge=0,moves=[],lines=[],bodyAlpha=1;
const mul=n=>{const [a,b,c,d,e,f]=matrix,[g,h,i,j,k,l]=n;matrix=[a*g+c*h,b*g+d*h,a*i+c*j,b*i+d*j,a*k+c*l+e,b*k+d*l+f]};
const point=(x,y)=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];
const ctx={globalAlpha:1,save(){stack.push({matrix:[...matrix],alpha:this.globalAlpha})},restore(){const saved=stack.pop();matrix=saved.matrix;this.globalAlpha=saved.alpha},translate(x,y){mul([1,0,0,1,x,y])},scale(x,y){mul([x,0,0,y,0,0])},rotate(r){mul([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0])},beginPath(){},ellipse(){},fill(){},stroke(){},arc(){},moveTo(x,y){moves.push(point(x,y))},lineTo(x,y){lines.push(point(x,y))},closePath(){},bezierCurveTo(){},quadraticCurveTo(cx,cy,x,y){lines.push(point(x,y))},
 drawImage(im,x,y,w=im.width,h=im.height){
  if(im.name==='Sword.png')for(const [dx,dy]of [[0,0],[w,0],[0,h],[w,h]])edge=Math.max(edge,point(x+dx,y+dy)[0]);
  const grip=im.name==='Right Hand.png'?[72,64]:im.name==='Sword.png'?[65,64]:null;
  if(grip)grips[im.name]=point(x+grip[0],y+grip[1]);
  if(im.name==='SlashFX.png')wave={center:point(x+w/2,y+h/2),left:point(x+w,y)[0],top:point(x,y)[1],bottom:point(x,y+h)[1]};
  if(im.name==='Body.png')bodyAlpha=this.globalAlpha;
 }};
const sandbox={knightRig:rigs[3],enemyRigs:rigs};sandbox.packs=packs;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("web-2d/modular-enemies.js","utf8"),sandbox);
vm.runInContext('Object.assign(monsterRigs,packs)',sandbox);
const nativeWeapon=sandbox.drawPluginWeapon,nativeFX=sandbox.drawMonsterProjectile;
sandbox.drawPluginWeapon=(c,type)=>{nativeWeapon(c,type);grips['Sword.png']=point(63,62);if(type!=='fist')for(const [x,y]of [[38,12],[382,12],[38,118],[382,118]])edge=Math.max(edge,point(x,y)[0]);};
sandbox.drawMonsterProjectile=(c,style,x,y,w,h,q)=>{nativeFX(c,style,x,y,w,h,q);wave={center:point(x+w/2,y+h/2),left:point(x+w,y)[0],top:point(x,y)[1],bottom:point(x,y+h)[1]};};
vm.runInContext(fs.readFileSync("web-2d/enemy-identities.js","utf8"),sandbox);const motion=fs.readFileSync('web-2d/boss-motion.js','utf8');vm.runInContext(motion.slice(motion.indexOf('function drawReadableBoss')),sandbox);
vm.runInContext(fs.readFileSync('web-2d/encounter-art.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('web-2d/combat-motion.js','utf8'),sandbox);
let samples=0,maxError=0;
for(const id of ['swordsman','heavy_knight','rogue','duelist','executioner','warden','wraith','goblin_scout','orc_raider','ogre_smith','frost_golem','moss_golem','rune_golem','minotaur_guard','minotaur_chief','minotaur_oracle'])for(const target of [0,1,2])for(const kind of ['melee','jump'])for(let i=0;i<=120;i++){
 const g={enemyId:id,isBoss:false,phase:1,enemyHp:10,time:i/100,damageEvents:[],combo:{index:0,targets:[target],originLane:1},attack:{family:'melee',kind,target,index:0,start:0,impact:1}};
 grips={};edge=0;moves=[];lines=[];sandbox.drawCloseEncounter(ctx,g);const a=grips['Right Hand.png'],b=grips['Sword.png'];const error=Math.hypot(a[0]-b[0],a[1]-b[1]);assert.ok(error<.2,id+' melee grip');maxError=Math.max(maxError,error);assert.equal(stack.length,0);assert.ok(edge<892,id+' melee weapon clipping');samples++;
}
console.log(samples+' integrated melee poses: registered grips, balanced transforms and weapon edges passed');

