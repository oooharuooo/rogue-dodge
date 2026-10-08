// Reusable cartoon effects. Age is seconds; coordinates are natural actor space.
// No hitboxes or timing rules live here. Each effect has build, peak and decay.
const ElementFX={
 envelope(age,duration=1.4){return Math.max(0,Math.min(1,age/.09,(duration-age)/.45));},
 smoke(ctx,age,{x=0,y=0,size=28,color='#b9c8b8'}={}){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;
  for(let i=0;i<5;i++){const a=i*2.4,travel=Math.min(1,age/.65),px=Math.cos(a)*size*.65*travel,py=-travel*size*.4+Math.sin(a)*size*.2;ctx.globalAlpha=.17*Math.max(0,1-age/.8);ctx.beginPath();ctx.ellipse(px,py,size*(.24+travel*.15),size*(.17+travel*.09),a,0,Math.PI*2);ctx.fill();}
  ctx.restore();
 },
 slash(ctx,age,{color='#ef9b54',radius=47,rotation=-.4}={}){
  const t=Math.max(0,Math.min(1,age/.48));ctx.save();ctx.rotate(rotation);ctx.strokeStyle=color;ctx.lineCap='round';
  ctx.globalAlpha*=Math.max(0,1-age/.7);ctx.lineWidth=9*(1-t)+2;ctx.beginPath();ctx.ellipse(0,0,radius,radius*.5,0,-2.5+t*.7,.7+t*1.7);ctx.stroke();
  ctx.strokeStyle='#fff1c7';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-2,radius-4,radius*.5-3,0,-2+t*.7,.5+t*1.6);ctx.stroke();ctx.restore();
 },
 sparks(ctx,age,{color='#f5d09a',count=6,radius=45}={}){
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha*=Math.max(0,1-age/1.1);
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count+.3,r=radius*(.4+Math.min(age,1)*.7),x=Math.cos(a)*r,y=Math.sin(a)*r*.65;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*5,y+Math.sin(a)*5);ctx.stroke();}ctx.restore();
 },
 skill(ctx,id,age){
  const v=SKILL_VISUALS[id]||{color:'#f0da93',shape:'eye'};ctx.save();ctx.globalAlpha*=this.envelope(age);const bloom=1+Math.sin(Math.min(1,age/.22)*Math.PI)*.08;ctx.scale(bloom,bloom);
  if(id==='flame_counter'){this.smoke(ctx,age,{y:26,color:'#bca98b'});this.slash(ctx,age,{color:v.color});this.sparks(ctx,age,{color:'#ffc77b',count:7});}
  else if(id==='momentum'){this.slash(ctx,age,{color:v.color,rotation:.45,radius:43});this.slash(ctx,Math.max(0,age-.13),{color:'#bde7d8',rotation:-.6,radius:34});}
  else if(id==='bloodlust'){this.sparks(ctx,age,{color:v.color,count:3,radius:40});}
  else if(id==='guardian'){ctx.strokeStyle=v.color;ctx.lineWidth=2;ctx.globalAlpha*=.8;ctx.beginPath();ctx.ellipse(0,26,29+age*16,9+age*2,0,0,Math.PI*2);ctx.stroke();this.sparks(ctx,age,{color:'#dce3b3',count:4,radius:43});}
  else this.sparks(ctx,age,{color:v.color,count:4,radius:48});
  paintSkillMotif(ctx,id,age);ctx.restore();
 }
};
if(typeof module!=='undefined')module.exports={ElementFX};
