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
  return r;
 }
 image(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=(window.ASSET_BASE||'')+src;});}
 draw(ctx,x,feet,state,clock){
  const name={idle:'Idle',bow_attack:'Idle',sword_attack:'Slashing',dagger_attack:'Run Slashing',heavy_attack:'Slashing',up:'Sliding',slide:'Sliding',jump_start:'Jump Start',jump_loop:'Jump Loop',fall:'Falling Down',hurt:'Hurt',dying:'Dying'}[state];
  const anim=this.animations.find(n=>n.a.name===name);if(!anim)return;
  const length=+anim.a.length;
  const release=state==='heavy_attack'?.52:.35;const moveClock=state==='heavy_attack'||state==='sword_attack'?(clock<release?.45*clock/release:.45+.45*Math.min(1,(clock-release)/(.85-release))):state==='dagger_attack'?(clock*3.4)%.9:clock;
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
   const t=combine(sample(ref),bones[ref.a.parent]),file=this.files[+t.file],im=state.startsWith('jump')||state==='fall'?(file.name.startsWith('Face ')?this.jumpFace:this.images[+t.file]):this.images[+t.file];
   if(state==='up'&&['Left Leg.png','Right Leg.png'].includes(file.name)){
    const trail=Math.pow(Math.sin(Math.PI*Math.min(1,clock/.9)),2);
    t.y-=55*trail;t.x-=12*trail;
   }
   if(state==='bow_attack'&&['Left Arm.png','Right Arm.png','Left Hand.png','Right Hand.png'].includes(file.name))continue;
   if(file.name==='Sword.png'){
    if(state==='bow_attack')continue;
    if(this.weapon!=='bow'){const small=this.weapon==='daggers'?.48:this.weapon==='greatsword'?1.1:1;ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x*small,-t.scale_y*small);ctx.drawImage(this.weapon==='greatsword'?this.greatsword:this.katana,-2,-2,400,128);ctx.restore();continue;}
    // Use the pack's original weapon socket and layer beneath its gripping hand.
    ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x,t.scale_y);
    const placement=[{x:65,y:-64,angle:0},{x:90,y:-72,angle:-.18},{x:82,y:-95,angle:.18}][this.bowPlacement||0];ctx.translate(placement.x,placement.y);ctx.rotate(placement.angle);const pull=state==='bow_attack'?Math.sin(Math.PI*Math.min(1,clock/.55)):0;ctx.scale(-(1+.18*pull),-1);
    ctx.drawImage(this.bow,this.bow.width*.35,this.bow.height*.035,this.bow.width*.36,this.bow.height*.93,-28,-125,85,240);
    ctx.restore();continue;
   }
   if(file.name==='SlashFX.png')continue;
   if(this.weapon==='daggers'&&file.name==='Right Hand.png'){ctx.save();ctx.translate(t.x+20,t.y-20);ctx.rotate(t.angle*Math.PI/180);ctx.scale(.48,-.48);ctx.drawImage(this.katana,0,0,400,128);ctx.restore();}
   if(!im||t.a<=0)continue;
   const px=+(t.pivot_x??file.pivot_x??0),py=+(t.pivot_y??file.pivot_y??1),w=+file.width,h=+file.height;
   ctx.save();ctx.globalAlpha*=t.a;ctx.translate(t.x,t.y);ctx.rotate(t.angle*Math.PI/180);ctx.scale(t.scale_x,-t.scale_y);ctx.drawImage(im,-px*w,-(1-py)*h,w,h);ctx.restore();
  }

  if(state==='bow_attack'){
   // Explicit grip and string anchors; both hands meet the bow during the draw.
   const progress=Math.min(1,clock/.85),pull=clock<.5?Math.min(1,clock/.45):Math.max(0,1-(clock-.5)/.18);
   const blend=progress>.8?Math.max(0,(1-progress)/.2):Math.min(1,progress/.2);
   const grip={x:65+45*blend,y:80+50*blend},string={x:grip.x-75*pull*blend,y:grip.y};
   const arm=(from,to)=>{ctx.lineCap='round';ctx.strokeStyle='#282326';ctx.lineWidth=27;ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();ctx.strokeStyle='#c8ada0';ctx.lineWidth=16;ctx.stroke();};
   arm({x:28,y:150},grip);arm({x:-22,y:150},string);
   ctx.save();ctx.translate(grip.x,grip.y);ctx.scale(-1,-1);ctx.drawImage(this.bow,this.bow.width*.35,this.bow.height*.035,this.bow.width*.36,this.bow.height*.93,-28,-125,85,240);ctx.restore();
   ctx.strokeStyle='#e5d9bc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(grip.x-53,grip.y+120);ctx.lineTo(string.x,string.y);ctx.lineTo(grip.x-53,grip.y-115);ctx.stroke();
   if(clock<.5){ctx.strokeStyle='#71523a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(string.x-15,string.y);ctx.lineTo(grip.x+35,grip.y);ctx.stroke();}
   for(const [name,hand] of [['Left Hand.png',grip],['Right Hand.png',string]]){const index=this.files.findIndex(f=>f.name===name);ctx.save();ctx.translate(hand.x,hand.y);ctx.scale(.65,-.65);ctx.drawImage(this.images[index],-64,-64,128,128);ctx.restore();}
  }
  ctx.restore();
 }
}

























