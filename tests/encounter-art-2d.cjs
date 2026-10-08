const fs=require('fs'),vm=require('vm'),assert=require('assert');
const pose=JSON.parse(fs.readFileSync('web-2d/knight-parts/pose.json'));
const rigs=Object.fromEntries([1,2,3].map(variant=>[variant,{...pose,images:pose.files.map(f=>({width:+f.width,height:+f.height,name:f.name,variant}))}]));
let matrix=[1,0,0,1,0,0],stack=[],grips={},wave=null,edge=0,moves=[],lines=[],bodyAlpha=1;
const mul=n=>{const [a,b,c,d,e,f]=matrix,[g,h,i,j,k,l]=n;matrix=[a*g+c*h,b*g+d*h,a*i+c*j,b*i+d*j,a*k+c*l+e,b*k+d*l+f]};
const point=(x,y)=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];
const ctx={globalAlpha:1,save(){stack.push({matrix:[...matrix],alpha:this.globalAlpha})},restore(){const saved=stack.pop();matrix=saved.matrix;this.globalAlpha=saved.alpha},translate(x,y){mul([1,0,0,1,x,y])},scale(x,y){mul([x,0,0,y,0,0])},rotate(r){mul([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0])},beginPath(){},ellipse(){},fill(){},stroke(){},arc(){},moveTo(x,y){moves.push(point(x,y))},lineTo(x,y){lines.push(point(x,y))},closePath(){},bezierCurveTo(){},
 drawImage(im,x,y,w=im.width,h=im.height){
  if(im.name==='Sword.png')for(const [dx,dy]of [[0,0],[w,0],[0,h],[w,h]])edge=Math.max(edge,point(x+dx,y+dy)[0]);
  const grip=im.name==='Right Hand.png'?[72,64]:im.name==='Sword.png'?[65,64]:null;
  if(grip)grips[im.name]=point(x+grip[0],y+grip[1]);
  if(im.name==='SlashFX.png')wave={center:point(x+w/2,y+h/2),left:point(x+w,y)[0],top:point(x,y)[1],bottom:point(x,y+h)[1]};
  if(im.name==='Body.png')bodyAlpha=this.globalAlpha;
 }};
const sandbox={knightRig:rigs[3],enemyRigs:rigs};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("web-2d/modular-enemies.js","utf8"),sandbox);
vm.runInContext(fs.readFileSync("web-2d/enemy-identities.js","utf8"),sandbox);const motion=fs.readFileSync('web-2d/boss-motion.js','utf8');vm.runInContext(motion.slice(motion.indexOf('function drawReadableBoss')),sandbox);
vm.runInContext(fs.readFileSync('web-2d/encounter-art.js','utf8'),sandbox);
let samples=0,maxError=0;
for(const id of ['swordsman','heavy_knight','rogue','duelist','executioner','warden','wraith'])for(const kind of ['up','down','jump']){
 const g={enemyId:id,isBoss:['executioner','warden','wraith'].includes(id),enemyHp:10,phase:1,damageEvents:[],attack:{kind,start:0,impact:1.2}};
 for(let i=0;i<=140;i++){
  g.time=i/100*1.2;grips={};wave=null;moves=[];lines=[];sandbox.drawEncounter(ctx,g);
  const a=grips['Right Hand.png'],b=grips['Sword.png'];const error=Math.hypot(a[0]-b[0],a[1]-b[1]);
  assert.ok(error<.2,id+' weapon detached');maxError=Math.max(maxError,error);
  if(i===70&&kind!=='jump')assert.ok(Math.hypot(wave.center[0]-g.attack.waveOrigin.x,wave.center[1]-g.attack.waveOrigin.y)<.01,id+' projectile must start at weapon');
  if(i===100&&kind!=='jump'){assert.ok(Math.abs(wave.left-90)<.01,id+' projectile must reach hero at impact');assert.ok(Math.abs(wave.bottom-wave.top-312)<.01,'Must span exactly two lanes');}
  if(i===72&&kind==='jump')assert.ok(Math.hypot(g.attack.groundOrigin.x-g.bladeTip.x,g.attack.groundOrigin.y-g.bladeTip.y)<.01,'Ground wave must start at weapon');
  if(i===100&&kind==='jump'){assert.ok(moves.some(([x,y])=>Math.abs(x-90)<.01&&y===260),'Ground wave must reach hero at impact');assert.ok(lines.some(([,y])=>y===768),'Ground wave must cover third lane');}
  assert.equal(stack.length,0);samples++;
 }
}
for(const id of ['swordsman','heavy_knight','rogue','duelist','executioner','warden','wraith']){sandbox.drawEncounter(ctx,{enemyId:id,isBoss:false,enemyHp:0,time:2,deathTime:1,damageEvents:[],attack:null});assert.ok(bodyAlpha>=.15&&bodyAlpha<.2,'Death fade must reach all body parts');}
assert.ok(860-edge*.95>12,'Weapon clipping in right-hand layout');assert.ok(100+edge*.95<948,'Weapon clipping in left-hand layout');
console.log(`${samples} encounter poses: grip <= ${maxError.toFixed(3)} px; all projectile origins/impacts and weapon edges passed`);

