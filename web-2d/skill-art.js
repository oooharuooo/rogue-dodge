// Compact skill confirmation follows the hero; the full text stays in the HUD toast.
function drawSkills(ctx,g){
 const recent=g.skillEvents.filter(e=>g.time-e.time<1.4),newest=recent.at(-1);if(!newest)return;
 const group=recent.filter(e=>e.time===newest.time),page=Math.floor((g.time-newest.time)/.45)%Math.max(1,Math.ceil(group.length/2));
 const k=typeof arenaYScale==='undefined'?1:arenaYScale,p=g.pose(),root=554+p.offset-p.height;
 const tell=g.attack&&!g.attack.resolved&&g.time<g.attack.impact;
 group.slice(page*2,page*2+2).forEach((e,i)=>{
  const age=g.time-e.time,color=SKILL_COLORS[e.id]||'#efcc72',y=root-(125+i*34)/k;
  ctx.save();ctx.globalAlpha=Math.min(1,(1.4-age)*3)*(tell?.45:1);ctx.fillStyle='#173a3bea';ctx.fillRect(-35,y-23/k,230,28/k);
  const names={flame_counter:'Flame',momentum:'Flow',bloodlust:'Bloodlust',guardian:'Shield',focus:'Focus',mastery:'Mastery'};
  ctx.fillStyle=color;ctx.font='bold 28px system-ui';readableText(ctx,e.amount?`${names[e.id]||SKILLS[e.id]?.name||e.id} +${e.amount} DMG`:names[e.id]||SKILLS[e.id]?.name||'Skill ✓',-23,y-4/k);
  ctx.translate(90,root-65/k);ctx.scale(1,1/k);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha*=.65;ctx.beginPath();
  if(e.id==='mastery')ElementFX.skill(ctx,e.id,age);else{ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 });
}
