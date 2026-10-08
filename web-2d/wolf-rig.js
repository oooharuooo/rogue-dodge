// Independent quadruped rig. Canvas parts rotate about joints; no humanoid skeleton.
const wolfClamp=t=>Math.max(0,Math.min(1,t));
function wolfPose(g){
 const a=g.attack,q=a?(g.time-a.start)/(a.impact-a.start):0,slam=a?.kind==='jump';
 const continuation=a?.index>0;const recoil=a?.resolved&&g.combo?.index<g.combo?.hits.length?wolfClamp((g.time-a.impact)/.5)*.05:0;
 const travel=a?(continuation?.95+.05*wolfClamp(q/.65):wolfClamp((q-.18)/.48))-recoil:0,returning=a?.resolved&&!g.combo?wolfClamp((g.time-a.impact)/.36):0;
 const release=wolfClamp((q-.78)/.22)*(a?.resolved&&g.combo?1-wolfClamp((g.time-a.impact)/.5):1),target=a?.target??1;
 const recover=a?.resolved?wolfClamp((g.time-a.impact)/.32):0;const eased=recover*recover*(3-2*recover);
 const aim=wolfClamp((q-.7)/.25),aimEase=aim*aim*(3-2*aim);
 const lane=slam?1:1+(target-1)*aimEase*(1-eased);
 const leap=slam?Math.sin(Math.PI*wolfClamp((q-.50)/.4))*82:Math.sin(Math.PI*release)*12;
 return {q,slam,x:g.study?380:670-365*travel*(1-returning)-70*release*(1-returning),y:552+(lane-1)*156-leap,
  crouch:a&&!slam?Math.sin(Math.PI*wolfClamp(q/.8))*12:0,pitch:slam?-.12+.3*release:(target-1)*.16*travel,
  stride:a?Math.sin(q*28)*wolfClamp(travel*2)*(1-release):Math.sin(g.time*2)*.08,
  jaw:a?wolfClamp((q-.58)/.22)*(1-wolfClamp((q-1.05)/.2)):0,active:!!a};
}
function drawWolf(ctx,g){
 const p=wolfPose(g),a=g.attack,q=p.q,parts=g.quadParts||WolfParts;if(g.beastBear){p.stride*=.6;p.crouch*=1.5;p.pitch*=.6;const directed=a?.kind==='melee'&&a.target!==1;const weight=wolfClamp((q-.12)/.25)*(1-wolfClamp((q-1.05)/.25));p.bearHeadTilt=directed?p.pitch+(a.target===0?-.35:.42)*weight:-p.pitch*.4;p.bearHeadDrop=directed?(a.target===2?12:0)*weight:0;}
 g.visualAnchor={x:p.x,y:p.y};if(g.enemyHp<=0){const fall=wolfClamp((g.time-g.deathTime)/.6);p.pitch-=.18*fall;p.crouch+=18*fall;p.stride=0;p.bearHeadDrop=(p.bearHeadDrop||0)+18*fall;p.bearHeadTilt=(p.bearHeadTilt||0)+.45*fall;}const ellipse=(x,y,rx,ry,fill)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=g.wolfSkin?.colors?.[fill]||fill;ctx.fill();ctx.stroke();};
 const poly=(points,fill)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=g.wolfSkin?.colors?.[fill]||fill;ctx.fill();ctx.stroke();};
 ctx.save();const bodyAlpha=ctx.globalAlpha??1;ctx.fillStyle='#25332835';ctx.beginPath();ctx.globalAlpha=bodyAlpha*(a?wolfClamp((q-.86)/.1):1);ctx.ellipse(p.x,p.y+8,95,15,0,0,Math.PI*2);ctx.fill();
 ctx.globalAlpha=bodyAlpha;ctx.translate(p.x,p.y);ctx.scale(1,1/(typeof arenaYScale==='undefined'?1:arenaYScale));ctx.rotate(p.pitch);ctx.scale(-1.15,1.15);ctx.lineWidth=2.5;ctx.strokeStyle='#28373b';ctx.lineJoin='round';ctx.lineCap='round';
 // Four jointed legs, heavy shoulders and angular fur silhouette.
 parts.leg(ctx,p,poly,-53,true,false);parts.leg(ctx,p,poly,43,false,false);
 parts.tail(ctx,p,poly);
 parts.torso(ctx,p,poly);
 parts.mane(ctx,p,poly);
 parts.fur(ctx,p,poly);
 parts.harness(ctx,p,poly);
 parts.leg(ctx,p,poly,-51,true,true);parts.leg(ctx,p,poly,44,false,true);
 parts.head(ctx,p,poly);ctx.restore();
 if(typeof drawAttackTell==='function')drawAttackTell(ctx,g,{x:p.x-70,y:p.y-85/(typeof arenaYScale==='undefined'?1:arenaYScale)},q);

 if(a?.kind==='jump'&&q>=.9&&q<=1.35){
  // A connected radial shock begins exactly at the landing feet, not three separate lane strips.
  if(!a.groundOrigin)a.groundOrigin={x:p.x,y:552};
  if(typeof drawImpactRubble==='function')drawImpactRubble(ctx,a.groundOrigin,q);
 }
 else if(a&&q>.88&&q<1.16){ctx.save();ctx.globalAlpha=1-wolfClamp((q-.88)/.28);ctx.strokeStyle='#f4dfb1';ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(p.x-65,p.y-65+i*15);ctx.quadraticCurveTo(150,p.y-45+i*15,125,p.y-20+i*15);ctx.stroke();}ctx.restore();}
 }
if(typeof module!=='undefined')module.exports={wolfPose};
