for(const [id,v]of Object.entries(EXTRA_SKILLS))SKILL_COLORS[id]=v.color;
// Technique effects originate at the counter weapon or its actual contact point.
function drawTechniqueFX(ctx,g){const k=arenaYScale||1;
 for(const event of g.weaponTechniqueEvents||[]){const age=g.time-event.time,t=Math.min(1,age/.6),p=g.pose(),enemy=g.visualAnchor||{x:710,y:552};if(age<0||age>.6)continue;ctx.save();ctx.globalAlpha=(1-t)*.85;
  if(event.id==='twin_fang'){const travel=Math.min(1,age/(event.travel||.4)),x=130+(enemy.x-130)*travel,y=554+p.offset-p.height-40/k;ctx.strokeStyle='#b7ede3';ctx.lineWidth=3;for(const offset of [-8,8]){ctx.beginPath();ctx.moveTo(x-35,y+offset/k);ctx.lineTo(x+9,y+offset/k);ctx.moveTo(x+1,y+(offset-5)/k);ctx.lineTo(x+9,y+offset/k);ctx.lineTo(x+1,y+(offset+5)/k);ctx.stroke();}}
  else{ctx.translate(enemy.x,enemy.y);ctx.scale(1,1/k);ctx.translate(0,-55);
   if(event.id==='crescent'){ElementFX.slash(ctx,age,{color:'#c1d1ff',radius:70,rotation:-.7});}
   else if(event.id==='cross_cut'){ctx.strokeStyle='#ffd0b5';ctx.lineWidth=7*(1-t)+1;for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(-42,sign*-35);ctx.lineTo(42,sign*35);ctx.stroke();}}
   else if(event.id==='fault_breaker'){ctx.translate(0,55);ctx.strokeStyle='#d9b985';ctx.lineWidth=4*(1-t)+1;for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,dx=Math.cos(angle)*75,dy=Math.sin(angle)*22;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(dx*.35,dy*.3-3);ctx.lineTo(dx*.55+4,dy*.65);ctx.lineTo(dx,dy);ctx.stroke();ctx.fillStyle='#ac9576';ctx.beginPath();const y=-Math.sin(t*Math.PI)*37;ctx.moveTo(dx*.6,y+dy);ctx.lineTo(dx*.6+8,y+dy-13);ctx.lineTo(dx*.6+15,y+dy);ctx.closePath();ctx.fill();}}
  }ctx.restore();
 }
 const element=Object.keys(g.skills).find(id=>EXTRA_SKILLS[id]?.element),state=g.elementState;if(!element||!state)return;const enemy=g.visualAnchor||{x:710,y:552},v=EXTRA_SKILLS[element],count=state[v.element]||0;ctx.save();ctx.translate(enemy.x,enemy.y-160/k);ctx.fillStyle='#17363e';ctx.beginPath();ctx.roundRect(-48,-19,96,28,7);ctx.fill();ctx.fillStyle=v.color;ctx.font='bold 20px Arial';readableText(ctx,({fire:'Fire',ice:'Ice',lightning:'Spark'}[v.element])+' '+count+'/3',-42,0);
 const proc=g.skillEvents.findLast(e=>e.id===element&&g.time-e.time<.6);if(proc){const age=g.time-proc.time;ctx.globalAlpha=1-age/.6;ctx.translate(0,85);ctx.strokeStyle=v.color;ctx.lineWidth=3;if(element==='spark'){ctx.beginPath();ctx.moveTo(-20,-30);ctx.lineTo(6,-4);ctx.lineTo(-4,4);ctx.lineTo(20,29);ctx.stroke();}else if(element==='rime'){for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*35,Math.sin(a)*35);ctx.stroke();}}else{for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-25+i*17,12-Math.sin(age*12+i)*8,4,0,Math.PI*2);ctx.fill();}}}ctx.restore();
}
const baseDrawSkills=drawSkills;drawSkills=function(ctx,g){baseDrawSkills(ctx,g);drawTechniqueFX(ctx,g);};
