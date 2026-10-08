// Original layered canvas scenery. Overscan keeps both mirrored camera edges filled.
let arenaBiome='ice';
const paintedBiomes={};
for(const id of ['ice']){const image=new Image();image.src='backgrounds/ice-depth-v2.png';paintedBiomes[id]=image;}
function drawForestScene(ctx,height){
 if(arenaBiome!=='forest'){drawBiomeScene(ctx,height,arenaBiome);return;}
 const top=(809.6-height)/.95;
 const sky=ctx.createLinearGradient(0,top,0,270);sky.addColorStop(0,'#405e51');sky.addColorStop(.6,'#b5bba0');sky.addColorStop(1,'#d6be97');ctx.fillStyle=sky;ctx.fillRect(-240,top,1400,850-top);
 for(let layer=0;layer<3;layer++)for(let i=-2;i<12;i++){
  const x=i*102+(layer%2)*44,y=235-layer*33,w=20+layer*11;
  ctx.fillStyle=['#869185','#687b69','#566553'][layer];ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x-w*.65,top-30);ctx.lineTo(x+w*.6,top-30);ctx.lineTo(x+w,y);ctx.closePath();ctx.fill();
 }
 const bush=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();for(let j=0;j<5;j++){ctx.moveTo(x+j*r*.6+r,y);ctx.arc(x+j*r*.6,y-Math.sin(j*2)*r*.2,r,0,Math.PI*2);}ctx.fill();};
 for(let i=-2;i<11;i++)bush(i*115,246,23,'#415c35');
 for(const x of [-170,40,290,560,780,1020]){ctx.fillStyle='#4c4144';ctx.strokeStyle='#302f30';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-34,252);ctx.lineTo(x-21,top-60);ctx.lineTo(x+28,top-60);ctx.lineTo(x+32,252);ctx.lineTo(x+48,263);ctx.lineTo(x-46,263);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#75615b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-10,238);ctx.bezierCurveTo(x+4,150,x-10,80,x+5,top);ctx.stroke();}
 for(let i=-2;i<11;i++)bush(i*116,top+25,53,'#244739');
 const floor=ctx.createLinearGradient(0,260,0,768);floor.addColorStop(0,'#a59773');floor.addColorStop(1,'#776c50');ctx.fillStyle=floor;ctx.fillRect(-240,260,1400,590);
 for(let i=0;i<65;i++){const x=(i*137)%790,y=275+(i*79)%330;ctx.fillStyle=i%2?'#655e4538':'#c3b48c38';ctx.beginPath();ctx.ellipse(x,y,8+i%11,3+i%5,.2,0,Math.PI*2);ctx.fill();if(i%4===0){ctx.fillStyle='#b0a58b';ctx.beginPath();ctx.ellipse(x+15,y-5,4,2,0,0,Math.PI*2);ctx.fill();}}
 for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#efdcb20a':'#293c2310';ctx.fillRect(-240,260+i*156,1400,156);}
 ctx.strokeStyle='#ead9b75c';ctx.lineWidth=2;for(const y of [260,416,572,768]){ctx.beginPath();ctx.moveTo(-240,y);ctx.lineTo(1160,y);ctx.stroke();}
}

function drawBiomeScene(ctx,height,id){
 const top=(809.6-height)/.95;
 const image=paintedBiomes[id];if(image?.complete&&image.naturalWidth){const viewW=960/.95,viewH=height/.95;const scale=Math.max(viewW/image.naturalWidth,viewH/image.naturalHeight);const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;ctx.drawImage(image,-100/.95-(dw-viewW)/2,top-(dh-viewH)/2,dw,dh);ctx.fillStyle='#376b8310';ctx.fillRect(-110,416,1024,156);for(const y of []){ctx.strokeStyle='#ffffffa0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-110,y);ctx.lineTo(914,y);ctx.stroke();ctx.strokeStyle='#355d77ad';ctx.lineWidth=2.5;ctx.stroke();}return;}
 const palettes={volcano:['#392d39','#ad7053','#77604f','#483e3a'],desert:['#7c9b9c','#ebc88f','#d1b27d','#a78b60'],ice:['#486c84','#c3d8dc','#a3bac0','#738f9f'],dark:['#262d42','#67677b','#827c76','#54535e']};
 const p=palettes[id]||palettes.dark;
 const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 const sky=ctx.createLinearGradient(0,top,0,260);sky.addColorStop(0,p[0]);sky.addColorStop(1,p[1]);ctx.fillStyle=sky;ctx.fillRect(-240,top,1400,850-top);
 // All landmarks stay behind the arena. No rocks obstruct fighters or weapons.
 for(let i=-2;i<7;i++){let x=i*210;
  if(id==='desert'){ctx.fillStyle=i%2?'#c99e6f':'#d7b47b';ctx.beginPath();ctx.moveTo(x-160,265);ctx.quadraticCurveTo(x,100+(i%3)*25,x+220,265);ctx.fill();}
  else{let peak=top+60+(i%3)*35;poly([[x-160,264],[x+20,peak],[x+200,264]],i%2?p[0]:p[1]);if(id==='ice')poly([[x-38,peak+68],[x+20,peak],[x+73,peak+66],[x+29,peak+43],[x+4,peak+67]],'#e1e7dc');}
 }
 if(id==='volcano'){
  poly([[190,260],[350,top+48],[390,top+62],[423,top+48],[620,260]],'#514342');
  poly([[350,top+48],[390,top+62],[423,top+48],[405,top+90],[382,top+105]],'#dc9462');
  for(let i=0;i<5;i++){ctx.fillStyle='#6b596260';ctx.beginPath();ctx.ellipse(390-i*15,top+35-i*28,40+i*13,24,0,0,Math.PI*2);ctx.fill();}
 }
 for(let i=-1;i<6;i++){let x=i*210;
  if(id==='dark'){poly([[x-18,265],[x-10,top+90],[x+20,top+83],[x+24,265]],'#393d4b');poly([[x-12,150],[x-70,105],[x-60,97],[x+4,132],[x+50,88],[x+58,96],[x+10,168]],'#393d4b');}
  else if(id==='desert'){poly([[x-22,260],[x-20,217],[x-7,217],[x-7,242],[x+16,242],[x+17,206],[x+28,206],[x+30,264]],'#847b57');}
  else if(id==='ice'){poly([[x-42,267],[x-23,220],[x+7,245],[x+23,220],[x+58,269]],'#a8c7cd');}
  else poly([[x-55,266],[x-34,219],[x+5,211],[x+41,267]],'#554b45');
 }
 const floor=ctx.createLinearGradient(0,260,0,850);floor.addColorStop(0,p[2]);floor.addColorStop(1,p[3]);ctx.fillStyle=floor;ctx.fillRect(-240,260,1400,590);
 for(let i=0;i<85;i++){let x=-220+(i*137)%1380,y=280+(i*79)%485;ctx.fillStyle=id==='ice'?'#d3e1dd28':'#302c2920';ctx.beginPath();ctx.ellipse(x,y,8+i%12,2+i%4,.15,0,Math.PI*2);ctx.fill();}
 // Quiet accents outside the three playable lanes; no glowing attack-like markings.
 if(id==='volcano')for(let x=-230;x<1150;x+=160)poly([[x,795],[x+34,765],[x+75,780],[x+110,751],[x+130,850],[x,850]],'#c57b4a');
 if(id==='dark')for(let x=-220;x<1150;x+=180)poly([[x,810],[x+20,774],[x+48,793],[x+90,770],[x+130,850],[x,850]],'#30333f');
 ctx.strokeStyle=id==='ice'?'#e6eee15c':'#ead9b74a';ctx.lineWidth=2;for(const y of [260,416,572,768]){ctx.beginPath();ctx.moveTo(-240,y);ctx.lineTo(1160,y);ctx.stroke();}
}






