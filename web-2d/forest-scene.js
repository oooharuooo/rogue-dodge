// Temporary canvas scenery for framing; original CraftPix download is unavailable.
function drawForestScene(ctx,height){
 const top=(729.6-height)/.95;
 const sky=ctx.createLinearGradient(0,top,0,270);sky.addColorStop(0,'#405e51');sky.addColorStop(.6,'#b5bba0');sky.addColorStop(1,'#d6be97');ctx.fillStyle=sky;ctx.fillRect(-106,top,1012,768-top);
 for(let layer=0;layer<3;layer++)for(let i=0;i<10;i++){
  const x=i*102+(layer%2)*44,y=235-layer*33,w=20+layer*11;
  ctx.fillStyle=['#869185','#687b69','#566553'][layer];ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x-w*.65,top-30);ctx.lineTo(x+w*.6,top-30);ctx.lineTo(x+w,y);ctx.closePath();ctx.fill();
 }
 const bush=(x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();for(let j=0;j<5;j++){ctx.moveTo(x+j*r*.6+r,y);ctx.arc(x+j*r*.6,y-Math.sin(j*2)*r*.2,r,0,Math.PI*2);}ctx.fill();};
 for(let i=0;i<8;i++)bush(i*115,246,23,'#415c35');
 for(const x of [40,290,560,780]){ctx.fillStyle='#4c4144';ctx.strokeStyle='#302f30';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-34,252);ctx.lineTo(x-21,top-60);ctx.lineTo(x+28,top-60);ctx.lineTo(x+32,252);ctx.lineTo(x+48,263);ctx.lineTo(x-46,263);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#75615b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-10,238);ctx.bezierCurveTo(x+4,150,x-10,80,x+5,top);ctx.stroke();}
 for(let i=0;i<8;i++)bush(i*116,top+25,53,'#244739');
 const floor=ctx.createLinearGradient(0,260,0,768);floor.addColorStop(0,'#a59773');floor.addColorStop(1,'#776c50');ctx.fillStyle=floor;ctx.fillRect(-106,260,1012,508);
 for(let i=0;i<65;i++){const x=(i*137)%790,y=275+(i*79)%330;ctx.fillStyle=i%2?'#655e4538':'#c3b48c38';ctx.beginPath();ctx.ellipse(x,y,8+i%11,3+i%5,.2,0,Math.PI*2);ctx.fill();if(i%4===0){ctx.fillStyle='#b0a58b';ctx.beginPath();ctx.ellipse(x+15,y-5,4,2,0,0,Math.PI*2);ctx.fill();}}
 for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#efdcb20a':'#293c2310';ctx.fillRect(-106,260+i*156,1012,156);}
 ctx.strokeStyle='#ead9b75c';ctx.lineWidth=2;for(const y of [260,416,572,768]){ctx.beginPath();ctx.moveTo(-106,y);ctx.lineTo(905,y);ctx.stroke();}
}
