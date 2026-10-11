// Static approved references only. Rejected cutout rig 66/67 is not loaded by Studio.
let knightData66=[{id:'1',name:'01 · Đại kiếm'},{id:'2',name:'02 · Búa chiến'},{id:'3',name:'03 · Giáp áo choàng'}],knightSettings66={},knightAngles66={};
function resetKnight66(){knightSettings66={};knightAngles66={};}
/* Independent drawn sprites. No source-character masks, underlayers or neutral overlays. */
let knight68Images={},knight68Settings={head:0,shoulder:0,body:0,weapon:0,gripX:0,gripY:0,frontLeg:0,rearLeg:0},knight68Hidden={},knight68Mode='neutral',knight68Group='head',knight68Debug=false;
const KNIGHT68_NAMES={helmet:'Mũ giáp',torso:'Thân giáp',pauldron:'Giáp vai trước',rear_shoulder:'Giáp vai sau',front_upper:'Tay trước · trên',front_forearm:'Tay trước · dưới',rear_upper:'Tay sau · trên',rear_forearm:'Tay sau · dưới',front_hand:'Găng trước',rear_hand:'Găng sau',front_leg:'Chân trước',rear_leg:'Chân sau',weapon:'Đại kiếm'};
const knight68Ready=fetch('/45-world-map/character-studio/knight-rig-73/parts.json?v=73').then(r=>r.json()).then(async m=>{knight68Images=Object.fromEntries(await Promise.all(m.parts.map(p=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve([p.id,im]);im.onerror=reject;im.src='/45-world-map/character-studio/knight-rig-73/'+p.file+'?v=73';}))));if(window.studioFamily65==='rebuilt')controls65();});
function resetKnight68(){knight68Settings={head:0,shoulder:0,body:0,weapon:0,gripX:0,gripY:0,frontLeg:0,rearLeg:0};knight68Hidden={};knight68Mode='neutral';}
function rotate68(p,angle){const a=angle*Math.PI/180;return [p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];}
function add68(a,b){return [a[0]+b[0],a[1]+b[1]];}
function solveArm68(start,target,upper,lower,side){const dx=target[0]-start[0],dy=target[1]-start[1],distance=Math.hypot(dx,dy);if(distance<1e-7&&upper===lower)return [start[0]+upper*side,start[1]];if(distance>upper+lower||distance<Math.abs(upper-lower))throw Error('Grip outside arm reach '+[distance,upper,lower]);const along=(upper*upper-lower*lower+distance*distance)/(2*distance),rise=Math.sqrt(Math.max(0,upper*upper-along*along)),ux=dx/distance,uy=dy/distance;return [start[0]+ux*along-side*uy*rise,start[1]+uy*along+side*ux*rise];}
function poseKnight68(time){const s=knight68Settings,p=Math.sin(time/1400);let angle=s.weapon,gx=-95+s.gripX,gy=12+s.gripY,head=s.head,body=s.body;
 if(knight68Mode==='idle'){body+=.6*p;head+=.6*p;gy+=1.2*p;}
 if(knight68Mode==='raise'){angle+=12*p;gy-=12*(p+1)/2;head+=2*p;}
 if(knight68Mode==='joints'){head+=8*p;angle+=12*p;gy-=8*(p+1)/2;}
 const grip=[gx,gy],rearGrip=add68(grip,rotate68([0,-30],angle)),frontWrist=add68(grip,rotate68([40,3],angle)),rearWrist=add68(rearGrip,rotate68([19,17],angle)),frontShoulder=[38,-12],rearShoulder=[-32,-50];
 return {angle,head,body,grip,rearGrip,frontWrist,rearWrist,frontShoulder,rearShoulder,frontElbow:solveArm68(frontShoulder,frontWrist,50,75,-1),rearElbow:solveArm68(rearShoulder,rearWrist,45,45,1)};
}
function drawKnight68(ctx,time){ctx.clearRect(0,0,700,650);if(!knight68Images.helmet)return;
 if(knight68Mode==='parts'){let i=0;for(const [id,im]of Object.entries(knight68Images)){const col=i%4,row=Math.floor(i/4),x=90+col*173,y=90+row*145,scale=Math.min(130/im.width,102/im.height);ctx.save();ctx.translate(x,y);if(id==='front_upper')ctx.scale(-1,1);ctx.drawImage(im,-im.width*scale/2,-im.height*scale/2,im.width*scale,im.height*scale);ctx.restore();ctx.fillStyle='#eed9a4';ctx.font='13px system-ui';ctx.textAlign='center';ctx.fillText(KNIGHT68_NAMES[id],x,y+65);i++;}return;}
 const p=poseKnight68(time);ctx.save();ctx.translate(350,420);ctx.scale(.88,.88);ctx.rotate(p.body*Math.PI/180);
 const sprite=(id,pos,width,height,anchor=[.5,.5],angle=0,mirror=false)=>{if(knight68Hidden[id])return;ctx.save();ctx.translate(...pos);ctx.rotate(angle*Math.PI/180);if(mirror)ctx.scale(-1,1);ctx.drawImage(knight68Images[id],-width*anchor[0],-height*anchor[1],width,height);ctx.restore();};
 const sockets={front_upper:[[.65,.30],[.30,.74]],front_forearm:[[.85,.48],[.08,.53]],rear_upper:[[.80,.20],[.22,.77]],rear_forearm:[[.84,.48],[.1,.52]]};
 const limb=(id,a,b)=>{if(knight68Hidden[id])return;const im=knight68Images[id],[u,v]=sockets[id],sx=u[0]*im.width,sy=u[1]*im.height,dx=(v[0]-u[0])*im.width,dy=(v[1]-u[1])*im.height,k=Math.hypot(b[0]-a[0],b[1]-a[1])/Math.hypot(dx,dy);ctx.save();ctx.translate(...a);const mirror=id==='front_upper';ctx.rotate(Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(dy,mirror?-dx:dx));ctx.scale(mirror?-k:k,k);ctx.drawImage(im,-sx,-sy);ctx.restore();};
 sprite('rear_leg',[-45,78],62,100,[.5,.08],knight68Settings.rearLeg);sprite('front_leg',[48,64],64,123,[.5,.08],knight68Settings.frontLeg);
 sprite('rear_shoulder',p.rearShoulder,36,30,[.5,.5]);
 limb('rear_upper',p.rearShoulder,p.rearElbow,31);limb('rear_forearm',p.rearElbow,p.rearWrist,27);
 sprite('torso',[0,-60],160,200,[.5,0]);sprite('helmet',[0,-53],180,170,[.60,.94],p.head);
 limb('front_upper',p.frontShoulder,p.frontElbow,49);limb('front_forearm',p.frontElbow,p.frontWrist,53);sprite('pauldron',p.frontShoulder,96,82,[.65,.83],knight68Settings.shoulder);
 if(!knight68Hidden.weapon){const im=knight68Images.weapon;ctx.save();ctx.translate(...p.grip);ctx.rotate(p.angle*Math.PI/180);const split=Math.round(im.height*.34);ctx.drawImage(im,0,0,im.width,split,-33,-112,66,133);ctx.drawImage(im,0,split,im.width,im.height-split,-33,21,66,143);ctx.restore();}
 sprite('rear_hand',p.rearGrip,40,48,[.28,.47],p.angle);sprite('front_hand',p.grip,62,45,[.24,.52],p.angle);
 if(knight68Debug){ctx.strokeStyle='#6ee7d499';ctx.fillStyle='#6ee7d4';ctx.lineWidth=1.5;for(const chain of [[p.frontShoulder,p.frontElbow,p.frontWrist],[p.rearShoulder,p.rearElbow,p.rearWrist]]){ctx.beginPath();ctx.moveTo(...chain[0]);chain.slice(1).forEach(j=>ctx.lineTo(...j));ctx.stroke();chain.forEach(j=>{ctx.beginPath();ctx.arc(...j,3,0,Math.PI*2);ctx.fill();});}for(const g of [p.grip,p.rearGrip]){ctx.beginPath();ctx.arc(...g,3,0,Math.PI*2);ctx.fill();}}
 ctx.restore();
}
function knightControls68(panel){const info=document.createElement('p');info.textContent='Mẫu 01 · 13 PNG được vẽ riêng. Tay dùng khớp vai–khuỷu–cổ tay, hai găng bám cán kiếm.';panel.append(info);if(!knight68Images.helmet){panel.append(document.createTextNode('Đang tải bộ phận độc lập…'));return;}
 const tools=document.createElement('div');tools.className='rig-tools';const mode=document.createElement('select');mode.setAttribute('aria-label','Chế độ rig mới');for(const [v,t]of [['neutral','Tư thế gốc'],['idle','Idle nhẹ'],['raise','Nâng / hạ kiếm'],['joints','Kiểm tra khớp'],['parts','Tách bộ phận']])mode.append(new Option(t,v));mode.value=knight68Mode;mode.onchange=()=>knight68Mode=mode.value;const debug=document.createElement('button');debug.textContent=knight68Debug?'Ẩn xương':'Hiện xương';debug.onclick=()=>{knight68Debug=!knight68Debug;debug.textContent=knight68Debug?'Ẩn xương':'Hiện xương';};const reset=document.createElement('button');reset.textContent='Khôi phục rig mới';reset.onclick=()=>{resetKnight68();controls65();};tools.append(mode,debug,reset);panel.append(tools);
 const tabs=document.createElement('div');tabs.className='rig-tools';const groups={head:'Đầu / vai',body:'Thân',arms:'Tay / kiếm',legs:'Chân',parts:'Hiện / ẩn'};for(const [g,t]of Object.entries(groups)){const b=document.createElement('button');b.textContent=t;b.classList.toggle('active',g===knight68Group);b.onclick=()=>{knight68Group=g;controls65();};tabs.append(b);}panel.append(tabs);
 const grid=document.createElement('div');grid.className='rig-part-grid';const defs={head:[['head','Góc đầu',-15,15],['shoulder','Góc giáp vai',-15,15]],body:[['body','Góc thân',-6,6]],arms:[['weapon','Góc kiếm',-20,20],['gripY','Nâng tay',-14,14],['gripX','Dịch tay ngang',-8,8]],legs:[['frontLeg','Góc chân trước',-10,10],['rearLeg','Góc chân sau',-10,10]]};
 if(knight68Group==='parts'){grid.classList.add('visibility68');for(const id of Object.keys(knight68Images)){const l=document.createElement('label');l.textContent=KNIGHT68_NAMES[id];const c=document.createElement('input');c.type='checkbox';c.checked=!knight68Hidden[id];c.setAttribute('aria-label','Hiện '+KNIGHT68_NAMES[id]);c.onchange=()=>knight68Hidden[id]=!c.checked;l.append(c);grid.append(l);}}
 else for(const [id,title,min,max]of defs[knight68Group]){const l=document.createElement('label');l.textContent=title;const c=document.createElement('input');c.type='range';c.min=min;c.max=max;c.step=.5;c.value=knight68Settings[id];c.setAttribute('aria-label',title);c.oninput=()=>knight68Settings[id]=+c.value;l.append(c);grid.append(l);}panel.append(grid);
}


knight68Ready.then(()=>{const params=new URLSearchParams(location.search);if(params.get('packages')==='74')chooseFamily66('package');});

const references68={};for(const id of ['1','2','3']){const im=new Image();im.src='/45-world-map/character-studio/knight-rig-66/'+id+'-neutral.png';references68[id]=im;}
function drawReference68(ctx,id){ctx.clearRect(0,0,700,650);const im=references68[id];if(!im?.complete||!im.naturalWidth)return;const scale=310/im.naturalHeight;ctx.drawImage(im,350-im.naturalWidth*scale/2,200,im.naturalWidth*scale,310);}







