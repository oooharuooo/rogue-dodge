// Independent quadruped rig. Canvas parts rotate about joints; no humanoid skeleton.
const wolfClamp=t=>Math.max(0,Math.min(1,t));
function wolfPose(g){
 const a=g.attack,q=a?(g.time-a.start)/(a.impact-a.start):0,slam=a?.kind==='jump';
 const travel=a?wolfClamp((q-.18)/.48):0,returning=a?.resolved&&!g.combo?wolfClamp((g.time-a.impact)/.36):0;
 const release=wolfClamp((q-.78)/.22),target=a?.target??1;
 const prior=g.combo&&a?.index>0?g.combo.targets[a.index-1]:1;
 const lane=slam?1:prior+(target-prior)*wolfClamp((q-.7)/.25);
 const leap=slam?Math.sin(Math.PI*wolfClamp((q-.50)/.4))*82:Math.sin(Math.PI*release)*12;
 return {q,slam,x:g.study?380:670-365*travel*(1-returning)-70*release*(1-returning),y:552+(lane-1)*156-leap,
  crouch:a&&!slam?Math.sin(Math.PI*wolfClamp(q/.8))*12:0,pitch:slam?-.12+.3*release:(target-1)*.16*travel,
  stride:a?Math.sin(q*28)*wolfClamp(travel*2)*(1-release):Math.sin(g.time*2)*.08,
  jaw:a?wolfClamp((q-.58)/.22)*(1-wolfClamp((q-1.05)/.2)):0,active:!!a};
}
function drawWolf(ctx,g){
 const p=wolfPose(g),a=g.attack,q=p.q;
 const ellipse=(x,y,rx,ry,fill)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=g.wolfSkin?.colors?.[fill]||fill;ctx.fill();ctx.stroke();};
 const poly=(points,fill)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=g.wolfSkin?.colors?.[fill]||fill;ctx.fill();ctx.stroke();};
 ctx.save();ctx.fillStyle='#25332835';ctx.beginPath();ctx.ellipse(p.x,552+((a?.target??1)-1)*156+8,95,15,0,0,Math.PI*2);ctx.fill();
 ctx.translate(p.x,p.y);ctx.rotate(p.pitch);ctx.scale(-1.15,1.15);ctx.lineWidth=2.5;ctx.strokeStyle='#28373b';ctx.lineJoin='round';ctx.lineCap='round';
 // Four jointed legs, heavy shoulders and angular fur silhouette.
 WolfParts.leg(ctx,p,poly,-53,true,false);WolfParts.leg(ctx,p,poly,43,false,false);
 WolfParts.tail(ctx,p,poly);
 WolfParts.torso(ctx,p,poly);
 WolfParts.mane(ctx,p,poly);
 WolfParts.fur(ctx,p,poly);
 WolfParts.harness(ctx,p,poly);
 WolfParts.leg(ctx,p,poly,-51,true,true);WolfParts.leg(ctx,p,poly,44,false,true);
 WolfParts.head(ctx,p,poly);ctx.restore();

 if(a?.kind==='jump'&&q>=.9&&q<=1.35){
  // A connected radial shock begins exactly at the landing feet, not three separate lane strips.
  if(!a.groundOrigin)a.groundOrigin={x:p.x,y:552};
  const origin=a.groundOrigin,t=wolfClamp((q-.9)/.10),fade=1-wolfClamp((q-1.08)/.27),radius=12+215*t;
  ctx.save();ctx.globalAlpha=fade;
  for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(origin.x,origin.y,Math.max(1,radius-i*12),Math.max(1,radius-i*12),0,0,Math.PI*2);ctx.strokeStyle=i?'#e4c898':'#695540';ctx.lineWidth=i?4:12;ctx.stroke();}
  for(let i=0;i<12;i++){const theta=i*Math.PI/6,x=origin.x+Math.cos(theta)*radius,y=origin.y+Math.sin(theta)*radius;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(theta)*13,y+Math.sin(theta)*13);ctx.lineTo(x+Math.cos(theta+.2)*22,y+Math.sin(theta+.2)*22);ctx.strokeStyle='#5d4b39';ctx.lineWidth=3;ctx.stroke();}
  for(let i=0;i<9;i++){const theta=i*2.4,d=20+t*60;ctx.beginPath();ctx.ellipse(origin.x+Math.cos(theta)*d,origin.y+Math.sin(theta)*d,5+(1-t)*5,4,0,0,Math.PI*2);ctx.fillStyle='#bda67c';ctx.fill();}
  ctx.restore();
 }
 else if(a&&q>.88&&q<1.16){ctx.save();ctx.globalAlpha=1-wolfClamp((q-.88)/.28);ctx.strokeStyle='#f4dfb1';ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(p.x-65,p.y-65+i*15);ctx.quadraticCurveTo(150,p.y-45+i*15,125,p.y-20+i*15);ctx.stroke();}ctx.restore();}
 }
if(typeof module!=='undefined')module.exports={wolfPose};
