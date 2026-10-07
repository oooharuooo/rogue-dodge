// Slot assets stay in their source rig's pixel space. Outfits share the same joints.
const MONSTER_STYLES={
 goblin_scout:{pack:'goblin',family:'knife',outfit:'scout',weapon:'dagger',fx:'wind',waveColor:'#a7d884'},
 orc_raider:{pack:'orc',family:'axe',outfit:'raider',weapon:'axe',fx:'ember',waveColor:'#eda15c'},
 ogre_smith:{scale:1.18,pack:'ogre',family:'hammer',outfit:'smith',weapon:'hammer',fx:'stone',waveColor:'#d7aa67'},
 frost_golem:{scale:1.25,pack:'golem_1',family:'fist',outfit:'frost',weapon:'fist',fx:'ice',waveColor:'#8be5ef'},
 moss_golem:{scale:1.25,pack:'golem_2',family:'fist',outfit:'moss',weapon:'fist',fx:'stone',waveColor:'#b0cb70'},
 rune_golem:{scale:1.25,pack:'golem_3',family:'mage',outfit:'rune',weapon:'staff',fx:'rune',waveColor:'#e1adff'},
 minotaur_guard:{scale:1.12,pack:'minotaur_1',family:'axe',outfit:'guard',weapon:'axe',fx:'wind',waveColor:'#e3cf9a'},
 minotaur_chief:{scale:1.12,pack:'minotaur_2',family:'charge',outfit:'chief',weapon:'hammer',fx:'ember',waveColor:'#f8ad6a'},
 minotaur_oracle:{scale:1.12,pack:'minotaur_3',family:'mage',outfit:'oracle',weapon:'staff',fx:'rune',waveColor:'#c8b6ff'}
};
const monsterRigs={};
async function loadMonsterRigs(){await Promise.all(Object.values(MONSTER_STYLES).map(async style=>{
 const dir='monster-parts/'+style.pack+'/',r=await(await fetch(dir+'pose.json')).json();
 r.images=await Promise.all(r.files.map(f=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Missing monster part '+f.name));im.src=dir+encodeURIComponent(f.name)})));
 monsterRigs[style.pack]=r;
}));}
// All pose deltas are relative to the pack's own idle skeleton, never another pack's bones.
function enemyMotion(family,kind,q,time){
 const prep=Math.min(1,q/.4),hit=Math.max(0,Math.min(1,(q-.66)/.18)),back=Math.max(0,Math.min(1,(q-1.08)/.32)),w=prep*(1-back),h=hit*(1-back),high=kind==='down',ground=kind==='jump';
 let right=0,left=0,re=0,le=0,lean=0,drop=0,shift=0,wa=0;
 if(family==='knife'){right=(high?115:-55)*w-105*h;left=-35*w;re=-65*w;le=-45*w;lean=-9*w+18*h;shift=-20*h;wa=(ground?90:high?80:190)*w-(ground?185:80)*h;drop=ground?20*w:6*w;}
 if(family==='axe'){right=(high?135:ground?120:-65)*w-(high?150:ground?165:-115)*h;left=-65*w+30*h;re=-20*w;le=-70*w;lean=-7*w+13*h;wa=(high||ground?95:185)*w-(ground?185:high?120:-45)*h;drop=ground?25*h:4*w;}
 if(family==='hammer'){right=(high||ground?130:-45)*w-150*h;left=(high||ground?110:20)*w-95*h;re=25*w;le=65*w;lean=-12*w+20*h;drop=18*w+18*h;wa=(high||ground?95:190)*w-(ground?185:85)*h;}
 if(family==='fist'){right=(high?120:ground?110:-60)*w-100*h;left=(ground?105:-30)*w-(ground?95:15)*h;re=-60*w+35*h;le=-70*w;lean=-8*w+17*h;drop=ground?35*h:8*w;shift=-26*h;wa=0;}
 if(family==='mage'){right=(high?95:ground?50:-30)*w;left=(high?105:ground?100:-50)*w-25*h;re=-40*w;le=-45*w;lean=ground?4*w:-4*w;drop=ground?12*w:-8*w;wa=(high?80:ground?65:185)*w;}
 if(family==='charge'){right=(high?105:ground?80:-65)*w-75*h;left=-90*w+50*h;re=-40*w;le=-30*w;lean=-10*w+25*h;drop=18*w;shift=-42*h;wa=(high?90:ground?65:175)*w-55*h;}
 const turn=Math.min(1,Math.max(0,(q-.54)/.14));
 // Wind-up may pull the weapon back, but the release always faces the hero.
 wa=ground?90*w-180*turn*(1-back):wa*(1-turn);
 const advance=Math.min(1,Math.max(0,(q-.55)/.37));
 const retreat=1-Math.min(1,Math.max(0,(q-1)/.2));
 const stride=advance*advance*(3-2*advance)*retreat;
 shift=-(({knife:470,charge:400,axe:80,hammer:60,fist:110,mage:0}[family]||0)+Math.abs(shift))*stride;
 return {right,left,re,le,lean,drop,shift,wa,stride};
}
function drawEnemyPlugin(ctx,slot,s){
 if(!s?.outfit)return;
 const palettes={scout:['#38695e','#d3cb91'],raider:['#8e4032','#e7bd76'],smith:['#634838','#c6a97c'],frost:['#3b7383','#a2edf3'],moss:['#425b38','#b9ce7c'],rune:['#625276','#d8b3f3'],guard:['#405d70','#d8d2a3'],chief:['#8e4c37','#edbe68'],oracle:['#655682','#cdb9e8']},[dark,light]=palettes[s.outfit];
 const poly=(points,fill)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#252726';ctx.lineWidth=6;ctx.lineJoin='round';ctx.stroke()};
 if(slot==='Body'){
  // New quilted armour/apron wraps the torso and moves as one body slot.
  poly([[94,105],[145,124],[211,102],[235,171],[208,205],[96,203],[74,166]],dark);
  poly([[98,185],[220,180],[222,202],[98,211]],light);
  ctx.strokeStyle=light;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(109,127);ctx.lineTo(195,178);ctx.moveTo(121,179);ctx.lineTo(189,121);ctx.stroke();
  if(['frost','moss','rune','oracle'].includes(s.outfit)){poly([[157,130],[176,153],[157,178],[140,154]],light);ctx.fillStyle=dark;ctx.beginPath();ctx.arc(157,154,6,0,Math.PI*2);ctx.fill();}
  if(['smith','chief'].includes(s.outfit))poly([[106,207],[211,200],[228,250],[96,249]],dark);
  if(s.outfit==='scout')poly([[98,106],[143,120],[123,152],[84,133]],light);
 }
 if(slot==='Right Arm'||slot==='Left Arm')poly([[37,31],[81,26],[94,49],[83,71],[41,68],[27,49]],dark);
 if(slot==='Head'&&['guard','chief','oracle','scout'].includes(s.outfit)){
  poly([[113,111],[181,86],[290,89],[351,119],[338,140],[271,119],[182,115],[124,142]],dark);
  if(s.outfit==='chief')poly([[195,96],[212,52],[239,83],[265,49],[284,96]],light);
  if(s.outfit==='oracle')poly([[230,94],[247,66],[265,94],[247,112]],light);
  if(s.outfit==='scout')poly([[137,110],[98,60],[89,88],[119,126]],light);
 }
}
function drawPluginWeapon(ctx,type){
 const path=(p,fill)=>{ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.strokeStyle='#272a2a';ctx.lineWidth=6;ctx.lineJoin='round';ctx.fill();ctx.stroke()};
 if(type==='fist')return;
 path([[38,55],[305,55],[309,69],[38,69]],'#876345');
 for(let x=48;x<105;x+=12){ctx.strokeStyle='#d7be8b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,55);ctx.lineTo(x+6,68);ctx.stroke()}
 if(type==='dagger'){path([[108,49],[260,61],[108,76]],'#d7e4df');path([[106,35],[120,36],[120,89],[106,89]],'#c5ad65');}
 if(type==='axe'){path([[267,17],[320,10],[374,29],[373,93],[320,118],[266,107],[296,65]],'#a8c1c1');path([[318,17],[321,108],[337,100],[337,23]],'#e5e5c9');}
 if(type==='hammer'){path([[279,14],[370,14],[382,30],[382,93],[367,111],[279,111],[269,91],[269,32]],'#777d80');path([[291,20],[308,20],[308,105],[291,105]],'#d0b46e');}
 if(type==='staff'){path([[272,62],[313,12],[359,17],[382,62],[351,108],[306,111]],'#776789');path([[307,62],[329,32],[358,62],[330,92]],'#cce8f3');}
}
function drawMonsterProjectile(ctx,s,x,y,w,h,q){
 ctx.save();ctx.translate(x,y);ctx.scale(w/110,h/312);
 const color=s.waveColor;ctx.fillStyle=color;ctx.strokeStyle='#fff1cb';ctx.lineWidth=3;
 // One connected silhouette occupies the two affected lanes; details reveal its weapon family.
 ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(90,40,108,78);ctx.lineTo(110,234);ctx.quadraticCurveTo(90,272,0,312);ctx.lineTo(32,245);ctx.quadraticCurveTo(75,156,32,67);ctx.closePath();ctx.globalAlpha*=.8;ctx.fill();ctx.stroke();
 if(s.fx==='stone'||s.fx==='ice')for(let i=0;i<6;i++){
  const cy=25+i*48,cx=45+Math.abs(cy-156)*.23;ctx.beginPath();ctx.moveTo(cx-18,cy);ctx.lineTo(cx-2,cy-17);ctx.lineTo(cx+17,cy-8);ctx.lineTo(cx+19,cy+13);ctx.lineTo(cx-8,cy+22);ctx.closePath();ctx.fillStyle=s.fx==='ice'?'#d9f8ff':'#b6ac85';ctx.fill();ctx.stroke();
 }
 if(s.fx==='rune'){ctx.strokeStyle='#f3deff';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(54,156,32,126,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<4;i++){const cy=58+i*65;ctx.beginPath();ctx.moveTo(38,cy);ctx.lineTo(55,cy-13);ctx.lineTo(72,cy);ctx.lineTo(55,cy+13);ctx.closePath();ctx.stroke();}}
 if(s.fx==='ember'){ctx.fillStyle='#ffe398';for(let i=0;i<7;i++){const cy=22+i*44;ctx.beginPath();ctx.moveTo(50,cy);ctx.lineTo(87,cy-12);ctx.lineTo(74,cy+25);ctx.closePath();ctx.fill();}}
 ctx.restore();
}
function drawMonsterGroundDetails(ctx,s,front,q){
 ctx.save();ctx.strokeStyle=s.waveColor;ctx.fillStyle=s.waveColor;ctx.lineWidth=3;
 for(let i=0;i<7;i++){const y=285+i*70,x=front+8-22*Math.sin(i/6*Math.PI);
  if(s.fx==='ice'){ctx.beginPath();ctx.moveTo(x,y+20);ctx.lineTo(x-12,y-21);ctx.lineTo(x-25,y+18);ctx.closePath();ctx.fill();}
  else if(s.fx==='rune'){ctx.beginPath();ctx.ellipse(x,y,15,25,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.moveTo(x,y-17);ctx.lineTo(x,y+17);ctx.stroke();}
  else if(s.fx==='stone'){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-20,y-13);ctx.lineTo(x-34,y+5);ctx.lineTo(x-13,y+14);ctx.closePath();ctx.fill();}
  else if(s.fx==='ember'){ctx.beginPath();ctx.moveTo(x,y+14);ctx.quadraticCurveTo(x-32,y-8,x-8,y-24);ctx.quadraticCurveTo(x+14,y-7,x,y+14);ctx.fill();}
 }
 ctx.restore();
}
