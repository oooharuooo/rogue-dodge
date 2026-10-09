// Use the original Spriter hierarchy so replacement expressions follow the head.
class HeroRig {
 static async load(){
  const r=new HeroRig(),tree=await (await fetch((window.ASSET_BASE||'')+'hero-rig/rig.json')).json();
  r.files=tree.c.find(n=>n.tag==='folder').c.map(n=>n.a);
  r.animations=tree.c.find(n=>n.tag==='entity').c.filter(n=>n.tag==='animation');
  r.images=await Promise.all(r.files.map(f=>r.image('hero-rig/'+encodeURIComponent(f.name))));
  r.images[r.files.findIndex(f=>f.name==='Head.png')]=await r.image('hero-rig/head-short.png');
  const body=await r.image('hero-rig/body-no-wings.png');
  const bodyRegistered=document.createElement('canvas');bodyRegistered.width=320;bodyRegistered.height=320;
  bodyRegistered.getContext('2d').drawImage(body,220,230,882,838,59,59,205,214);
  r.images[r.files.findIndex(f=>f.name==='Body.png')]=bodyRegistered;
  const face=await r.image('hero-rig/face-brown.png');
  const registered=document.createElement('canvas');registered.width=320;registered.height=240;
  registered.getContext('2d').drawImage(face,263,308,993,519,45,52,240,141);
  r.files.forEach((f,i)=>{if(f.name.startsWith('Face '))r.images[i]=registered;});
  const jumpFace=await r.image('hero-rig/face-jump.png');
  r.jumpFace=document.createElement('canvas');r.jumpFace.width=320;r.jumpFace.height=240;
  r.jumpFace.getContext('2d').drawImage(jumpFace,263/1448*jumpFace.width,308/1086*jumpFace.height,993/1448*jumpFace.width,519/1086*jumpFace.height,45,52,240,141);
  r.bow=await r.image('hero-rig/bow.png');r.katana=await r.image('hero-rig/katana.png');r.greatsword=await r.image('hero-rig/greatsword.png');
  r.greatsword=HeroRig.heavyBlade(r.greatsword);
  r.sword=HeroRig.straightBlade(r.katana);
  r.swordFlat=HeroRig.flatBlade(r.sword);
  r.dagger=HeroRig.daggerBlade();
  return r;
 }
 static straightBlade(original){
  const c=document.createElement('canvas');c.width=400;c.height=128;
  const g=c.getContext('2d');g.drawImage(original,0,0,400,128);g.clearRect(137,0,263,128);
  const shape=(points,fill,outline=false)=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();if(outline){g.strokeStyle='#252d30';g.lineWidth=5;g.lineJoin='round';g.stroke();}};
  shape([[138,43],[293,46],[337,51],[389,64],[337,77],[293,82],[138,85]],'#80979b',true);
  shape([[141,47],[293,50],[337,55],[380,64],[141,64]],'#c3cfca');
  shape([[141,64],[380,64],[337,73],[293,78],[141,81]],'#637b86');
  shape([[153,60],[310,60],[349,64],[310,68],[153,68]],'#394d57');
  g.strokeStyle='#e4e6d5';g.lineWidth=2;g.beginPath();g.moveTo(143,47);g.lineTo(293,50);g.lineTo(337,55);g.lineTo(380,64);g.stroke();
  return c;
 }
 // Preserve the original grip/socket; replace only the blade with broad forged steel.
 static flatBlade(original){
  const c=document.createElement('canvas');c.width=400;c.height=128;const g=c.getContext('2d');
  g.drawImage(original,0,0,106,128,0,0,106,128);
  g.drawImage(original,106,0,32,128,106,46,32,36);
  g.drawImage(original,138,40,262,48,138,57,262,14);
  return c;
 }
 static daggerBlade(){
  const c=document.createElement('canvas');c.width=330;c.height=128;const g=c.getContext('2d');
  const shape=(points,fill)=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle='#282c2c';g.lineWidth=5;g.lineJoin='round';g.stroke();};
  shape([[35,54],[105,54],[105,74],[35,74]],'#604938');
  shape([[24,51],[39,51],[39,77],[24,77]],'#87938c');
  shape([[101,42],[119,46],[119,82],[101,86]],'#899790');
  shape([[120,45],[168,32],[227,39],[319,64],[227,89],[168,96],[120,83]],'#768e94');
  g.fillStyle='#d0d5c4';g.beginPath();g.moveTo(122,48);g.lineTo(168,38);g.lineTo(225,44);g.lineTo(309,64);g.lineTo(150,64);g.closePath();g.fill();
  g.fillStyle='#3b5360';g.beginPath();g.moveTo(150,64);g.lineTo(309,64);g.lineTo(225,83);g.lineTo(168,90);g.lineTo(122,80);g.closePath();g.fill();
  g.strokeStyle='#b19465';g.lineWidth=3;for(const x of [49,62,75,88]){g.beginPath();g.moveTo(x,55);g.lineTo(x-5,73);g.stroke();}
  return c;
 }
 static heavyBlade(original){
  const c=document.createElement('canvas');c.width=520;c.height=180;
  const g=c.getContext('2d');g.drawImage(original,0,26,400,128);g.clearRect(138,0,262,180);
  g.translate(138,90);g.scale(1.45,1.5);g.translate(-138,-90);
  const shape=(points,fill,stroke)=>{g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=5;g.lineJoin='round';g.stroke();}};
  shape([[139,72],[166,47],[337,47],[394,90],[337,133],[166,133],[139,108]],'#53666c','#20292b');
  shape([[146,74],[169,54],[335,54],[381,90],[153,90]],'#a4b7b7');
  shape([[153,90],[381,90],[335,126],[169,126],[146,106]],'#394b53');
  shape([[165,64],[330,64],[367,90],[165,90]],'#748d94');
  shape([[165,90],[367,90],[330,116],[165,116]],'#50666f');
  shape([[170,83],[330,83],[344,90],[330,97],[170,97]],'#293c45');
  g.strokeStyle='#d0d9ce';g.lineWidth=2;g.beginPath();g.moveTo(169,54);g.lineTo(335,54);g.lineTo(381,90);g.stroke();
  g.strokeStyle='#6e8389';g.lineWidth=2;for(const [x,y] of [[205,68],[272,106],[310,70]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+9,y+5);g.stroke();}
  return c;
 }
 image(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=(window.ASSET_BASE||'')+src;});}
 draw(ctx,x,feet,state,clock){
  const bowActive=state==='bow_attack'||this.bowOverlay!=null,bowClock=this.bowOverlay??clock;
  const meleeAttack=['sword_attack','dagger_attack','heavy_attack'].includes(state);
  const meleeOverlay=meleeAttack||!!this.deflect||state==='idle'&&['daggers','greatsword'].includes(this.weapon);
  const name=meleeAttack?'Idle':{idle:'Idle',bow_attack:'Idle',up:'Sliding',slide:'Sliding',jump_start:'Jump Start',jump_loop:'Jump Loop',fall:'Falling Down',hurt:'Hurt',dying:'Dying'}[state];
  const anim=this.animations.find(n=>n.a.name===name);if(!anim)return;
  const length=+anim.a.length;
  const release=state==='heavy_attack'?.52:.35;let moveClock=state==='heavy_attack'||state==='sword_attack'?(clock<release?.45*clock/release:.45+.45*Math.min(1,(clock-release)/(.85-release))):state==='dagger_attack'?(clock*(this.technique==='cross_cut'?2.12:3.4))%.9:clock;
  if(state==='dagger_attack'&&this.hitSchedule?.length){const next=this.hitSchedule.find(t=>t>=this.strikeTime-.03);if(next!=null){const delta=this.strikeTime-next;moveClock=delta<=0?.45*Math.max(0,Math.min(1,(delta+.06)/.06)):.45+.45*Math.min(1,delta/.03);}}
  const time=state==='idle'?(clock*1000)%length:state==='up'?Math.min(length-1,moveClock/.9*length):Math.min(length-1,moveClock/.9*length);
  const main=anim.c.find(n=>n.tag==='mainline').c;
  const key=[...main].reverse().find(k=>+(k.a.time||0)<=time)||main[0];
  const timelines=anim.c.filter(n=>n.tag==='timeline');
  // Blend the original slide with a tucked jump pose only for the Up preview.
  const jumpMix=state==='up'?this.animations.find(n=>n.a.name==='Jump Loop'):null;
  const mixWeight=state==='up'?.65*Math.pow(Math.sin(Math.PI*Math.min(1,clock/.9)),2):0;
  const sample=ref=>{
   const tl=timelines.find(n=>n.a.id===ref.a.timeline),ks=tl.c;
   const k=ks.find(n=>n.a.id===ref.a.key),j=ks.indexOf(k),next=ks[(j+1)%ks.length];
   const start=+(k.a.time||0),end=j+1<ks.length?+(next.a.time||0):length;
   const fraction=end>start?Math.max(0,Math.min(1,(time-start)/(end-start))):0;
   const a=k.c[0].a,b=next.c[0].a,t={...a};
   for(const field of ['x','y','scale_x','scale_y','a']){const fallback=field.startsWith('scale')||field==='a'?1:0;t[field]=+(a[field]??fallback)+(+(b[field]??fallback)-+(a[field]??fallback))*fraction;}
   let delta=+(b.angle||0)-+(a.angle||0),spin=+(k.a.spin??1);
   if(spin===0)delta=0;else if(spin>0&&delta<0)delta+=360;else if(spin<0&&delta>0)delta-=360;
   t.angle=+(a.angle||0)+delta*fraction;
   if(jumpMix&&mixWeight>0){
    const targetTimeline=jumpMix.c.find(n=>n.tag==='timeline'&&n.a.name===tl.a.name);
    const poseTime=+jumpMix.a.length*.35;
    const targetKey=targetTimeline&&([...targetTimeline.c].reverse().find(n=>+(n.a.time||0)<=poseTime)||targetTimeline.c[0]);
    const target=targetKey?.c[0]?.a;
    if(target){
     for(const field of ['x','y','scale_x','scale_y']){
      const fallback=field.startsWith('scale')?1:0;
      t[field]+=(+(target[field]??fallback)-t[field])*mixWeight;
     }
     const turn=((+(target.angle||0)-t.angle+540)%360)-180;
     t.angle+=turn*mixWeight;
    }
   }
   if(state==='up'&&(tl.a.name==='Left Leg'||tl.a.name==='Right Leg')){
    const trail=Math.pow(Math.sin(Math.PI*Math.min(1,clock/.9)),2);
    t.x-=3*trail;
    t.angle+=(tl.a.name==='Left Leg'?8:6)*trail;
   }
   if(state==='up'&&tl.a.name==='bone_007')t.angle-=7*Math.pow(Math.sin(Math.PI*Math.min(1,clock/.9)),2);
   if(state==='heavy_attack'&&this.technique==='fault_breaker'&&tl.a.name==='bone_002'){
    const phase=Math.min(1,clock/.85),lift=Math.sin(Math.PI*Math.min(1,phase/.61)),impact=Math.max(0,Math.sin(Math.PI*Math.max(0,(phase-.61)/.39)));
    t.angle+=35*lift-22*impact; // Rotate the arm hierarchy: hand and weapon share the socket.
   }
   return t;
  };
  const combine=(a,p)=>{if(!p)return a;const rad=p.angle*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad),lx=a.x*p.scale_x,ly=a.y*p.scale_y;return {...a,x:p.x+c*lx-s*ly,y:p.y+s*lx+c*ly,angle:p.angle+(p.scale_x*p.scale_y<0?-a.angle:a.angle),scale_x:p.scale_x*a.scale_x,scale_y:p.scale_y*a.scale_y,a:p.a*a.a};};
  const bones={};for(const ref of key.c.filter(n=>n.tag==='bone_ref'))bones[ref.a.id]=combine(sample(ref),bones[ref.a.parent]);
  ctx.save();ctx.translate(x,feet+6);if(state==='up'){const phase=Math.min(1,clock/.9);const lean=phase<.28?Math.sin(Math.PI*phase/.56):phase<.55?Math.cos((phase-.28)/.27*Math.PI/2):0;const originalLean=Math.PI/2*.75*Math.sin(Math.PI*phase);
const worldPart=name=>{const ref=key.c.find(n=>n.tag==='object_ref'&&this.files[+sample(n).file]?.name===name);return ref?combine(sample(ref),bones[ref.a.parent]):null;};
const head=worldPart('Head.png'),body=worldPart('Body.png');
const poseLean=head&&body?Math.atan2(head.x-body.x,head.y-body.y):0;
ctx.rotate(originalLean-.5*(originalLean+poseLean))};ctx.scale(.3,-.3);
  for(const ref of key.c.filter(n=>n.tag==='object_ref').sort((a,b)=>{const layer=r=>this.files[+sample(r).file]?.name==='Sword.png'?8.5:+(r.a.z_index||0);return layer(a)-layer(b);})){
   const t=combine(sample(ref),bones[ref.a.parent]),file=this.files[+t.file],im=state.startsWith('jump')||state==='fall'?(file.name.startsWith('Face ')?(this.hp<3&&this.healthFaces?this.healthFaces[this.hp]:this.jumpFace):this.images[+t.file]):this.images[+t.file];
   if(state==='heavy_attack'&&(file.name==='Body.png'||file.name==='Head.png'||file.name.startsWith('Face '))){const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);},wind=ease(clock/.46),drop=ease((clock-.46)/.06),recover=ease((clock-.62)/.28);t.x+=-14*wind+36*drop-22*recover;t.y+=-20*wind+8*drop+12*recover;}
   if(state==='up'&&['Left Leg.png','Right Leg.png'].includes(file.name)){
    const trail=Math.pow(Math.sin(Math.PI*Math.min(1,clock/.9)),2);
    t.y-=55*trail;t.x-=12*trail;
   }
   if((bowActive||meleeOverlay)&&['Left Arm.png','Right Arm.png','Left Hand.png','Right Hand.png'].includes(file.name))continue;
   if(file.name==='Sword.png'){
    if(bowActive||meleeOverlay)continue;
    if(this.weapon!=='bow'){const heavy=this.weapon==='greatsword',small=this.weapon==='daggers'?.72:heavy?1.1:1;ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x*small,-t.scale_y*small);ctx.drawImage(heavy?this.greatsword:this.weapon==='daggers'?this.dagger:this.sword,-2,heavy?-28:-2,heavy?520:this.weapon==='daggers'?330:400,heavy?180:128);ctx.restore();continue;}
    // Use the pack's original weapon socket and layer beneath its gripping hand.
    ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x,t.scale_y);
    const placement=[{x:65,y:-64,angle:0},{x:90,y:-72,angle:-.18},{x:82,y:-95,angle:.18}][this.bowPlacement||0];ctx.translate(placement.x,placement.y);ctx.rotate(placement.angle);const pull=bowActive?Math.sin(Math.PI*Math.min(1,bowClock/.55)):0;ctx.scale(-(1+.18*pull),-1);
    ctx.drawImage(this.bow,this.bow.width*.35,this.bow.height*.035,this.bow.width*.36,this.bow.height*.93,-28,-125,85,240);
    ctx.restore();continue;
   }
   if(file.name==='SlashFX.png')continue;
   if(this.weapon==='daggers'&&!meleeOverlay&&file.name==='Right Hand.png'){ctx.save();ctx.translate(t.x+20,t.y-20);ctx.rotate(t.angle*Math.PI/180);ctx.scale(.72,-.72);ctx.drawImage(this.dagger,-70,-64,330,128);ctx.restore();}
   if(!im||t.a<=0)continue;
   const px=+(t.pivot_x??file.pivot_x??0),py=+(t.pivot_y??file.pivot_y??1),w=+file.width,h=+file.height;
   ctx.save();ctx.globalAlpha*=t.a;ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x,-t.scale_y);ctx.drawImage(im,-px*w,-(1-py)*h,w,h);if(file.name.startsWith("Face ")&&typeof drawHeroSweat==="function")drawHeroSweat(ctx,this,clock,-px*w,-(1-py)*h);ctx.restore();
  }

  if(meleeOverlay)this.drawMelee(ctx,state,clock);
  if(bowActive){
   // Explicit grip and string anchors; both hands meet the bow during the draw.
   const progress=Math.min(1,bowClock/.85),pull=bowClock<.5?Math.min(1,bowClock/.45):Math.max(0,1-(bowClock-.5)/.18);
   const blend=progress>.8?Math.max(0,(1-progress)/.2):Math.min(1,progress/.2);
   const grip={x:65+45*blend,y:80+50*blend},string={x:grip.x-75*pull*blend,y:grip.y};
   const arm=(from,to)=>{ctx.lineCap='round';ctx.strokeStyle='#282326';ctx.lineWidth=27;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.strokeStyle='#c8ada0';ctx.lineWidth=16;ctx.stroke();};
   arm({x:28,y:150},grip);arm({x:-22,y:150},string);
   ctx.save();ctx.translate(grip.x,grip.y);ctx.scale(-1,-1);ctx.drawImage(this.bow,this.bow.width*.35,this.bow.height*.035,this.bow.width*.36,this.bow.height*.93,-28,-125,85,240);ctx.restore();
   ctx.strokeStyle='#e5d9bc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(grip.x-53,grip.y+120);ctx.lineTo(string.x,string.y);ctx.lineTo(grip.x-53,grip.y-115);ctx.stroke();
   if(bowClock<.5){ctx.strokeStyle='#71523a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(string.x-15,string.y);ctx.lineTo(grip.x+35,grip.y);ctx.stroke();}
   for(const [name,hand] of [['Left Hand.png',grip],['Right Hand.png',string]]){const index=this.files.findIndex(f=>f.name===name);ctx.save();ctx.translate(hand.x,hand.y);ctx.scale(.65,-.65);ctx.drawImage(this.images[index],-64,-64,128,128);ctx.restore();}
  }
  ctx.restore();
 }
 drawMelee(ctx,state,clock){
  const attack=state!=='idle',smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  const hand=(name,p,angle=0,flip=1,flipY=1)=>{const i=this.files.findIndex(f=>f.name===name);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle*Math.PI/180);ctx.scale(.55*flip,-.55*flipY);ctx.drawImage(this.images[i],-64,-64,128,128);ctx.restore();};
  const arm=(side,p)=>{const shoulder={x:side==='Left'?28:-22,y:150},dx=p.x-shoulder.x,dy=p.y-shoulder.y,length=Math.hypot(dx,dy),i=this.files.findIndex(f=>f.name===side+' Arm.png');ctx.save();ctx.translate(shoulder.x,shoulder.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);ctx.drawImage(this.images[i],28,24,78,104,-24,-8,48,length+8);ctx.restore();};
  const blade=(image,p,angle,scale,depth=1,flipY=1)=>{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle*Math.PI/180);ctx.scale(scale*depth,-scale*flipY);ctx.drawImage(image,-70,-64);ctx.restore();};
  if(this.weapon==='daggers'){
   const times=this.hitSchedule?.length&&this.strikeTime!=null?this.hitSchedule.map(t=>t-this.strikeTime+clock):[.28,.37,.46];
   const thrust=side=>Math.max(0,...times.filter((_,i)=>i%2===side).map(t=>clock<t?smooth((clock-t+.075)/.075):1-smooth((clock-t)/.075)));
   const left={x:65+100*(attack?thrust(0):0),y:118},right={x:20+100*(attack?thrust(1):0),y:82};
   arm('Right',right);blade(this.dagger,right,attack?2:12,.72);hand('Right Hand.png',right);
   arm('Left',left);blade(this.dagger,left,attack?-3:8,.72);hand('Left Hand.png',left);
  }else if(this.weapon==='greatsword'){
   const wind=attack?smooth(clock/.46):0,drop=attack?smooth((clock-.46)/.06):0,recover=attack?smooth((clock-.62)/.28):0;
   const angle=attack?18+112*wind-150*drop+38*recover:this.guarding?72:18;
   const grip={x:80-200*wind+240*drop-40*recover,y:110+105*wind-95*drop-10*recover};
   const rad=angle*Math.PI/180,back={x:grip.x-49*Math.cos(rad),y:grip.y-49*Math.sin(rad)};
   arm('Right',back);arm('Left',grip);blade(this.greatsword,grip,angle,1.1);hand('Right Hand.png',back);hand('Left Hand.png',grip);
  }else if(this.deflect){
   const lane=this.deflect.lane,grip={x:90,y:lane===0?230:lane===2?75:145},off={x:10,y:120};arm('Right',off);hand('Right Hand.png',off);const tip=this.contactPoint,angle=tip?Math.atan2(tip.y-grip.y,tip.x-grip.x)*180/Math.PI:lane===0?65:lane===2?-35:15,scale=tip?Math.max(.6,Math.min(1.3,Math.hypot(tip.x-grip.x,tip.y-grip.y)/319)):1;arm('Left',grip);blade(this.sword,grip,angle,scale);hand('Left Hand.png',grip,angle);
  }else{
   const wind=smooth(clock/.27),cut=smooth((clock-.27)/.08),recover=smooth((clock-.43)/.35);
   const grip={x:65-55*wind+135*cut-80*recover,y:115+8*Math.sin(Math.PI*cut)};
   // A horizontal sweep foreshortens as the blade crosses the viewing plane.
   const depth=Math.cos(Math.PI*(wind-cut)),off={x:0,y:100};
   arm('Right',off);hand('Right Hand.png',off);arm('Left',grip);blade(this.swordFlat,grip,0,1,Math.abs(depth)<.12?(depth<0?-.12:.12):depth,-1);hand('Left Hand.png',grip,Math.atan2(grip.y-150,grip.x-28)*180/Math.PI,1,-1);
  }
 }
}
