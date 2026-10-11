// Enemy skill animations use approved, layered image assets rather than drawn silhouettes.
const GOBLIN_CRESCENT_47 = new Image();
GOBLIN_CRESCENT_47.src = 'monster-parts/goblin/Crescent47.png';
const GOBLIN_DAGGER_01 = new Image();
GOBLIN_DAGGER_01.src = 'monster-parts/goblin/SlashFX.png';
const EXECUTIONER_LATTICE_44 = new Image();
EXECUTIONER_LATTICE_44.src = 'monster-parts/executioner/Lattice44.png';

function drawGoblinDagger01(ctx, game, reducedMotion = false) {
 const attack=game.attack;
 if(!attack||attack.enemySkill!=='goblin_dagger_01'||attack.interrupted||!GOBLIN_DAGGER_01.complete||!GOBLIN_DAGGER_01.naturalWidth)return;
 const impact=attack.impact, travel=.38, start=impact-travel, finish=impact+.10, now=game.time;
 if(now<start||now>finish)return;
 const q=Math.max(0,Math.min(1,(now-start)/travel)),ease=q*q*(3-2*q);
 // The arena mirrors world x: 675 is Goblin's forward blade side, while 25
 // places the release beyond the hero. Do not mirror the asset locally too;
 // that used to make the visible crescent face backwards in the arena.
 const x=675+(25-675)*ease,y=338+156*attack.target;
 const size=174,fade=now>impact?Math.max(0,1-(now-impact)/.10):1;
 const drawSlash=(cx,cy,scale=1)=>{ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.drawImage(GOBLIN_DAGGER_01,-size/2,-size/2,size,size);ctx.restore();};
 ctx.save();
 if(reducedMotion){
  if(now<impact-.06||now>impact+.06){ctx.restore();return;}
  ctx.globalAlpha=.9;
  drawSlash(25,y);
 }else{
  // Staggered bitmap afterimages make its travel readable while keeping the
  // Goblin package's original SlashFX art as the only slash silhouette.
  for(const trail of [{lag:.20,alpha:.20,scale:.82},{lag:.10,alpha:.30,scale:.91}]){
   const tq=q-trail.lag/travel;if(tq<=0)continue;const te=tq*tq*(3-2*tq),tx=675+(25-675)*te;
   ctx.globalAlpha=trail.alpha*fade;drawSlash(tx,y+4,trail.scale);
  }
  ctx.globalAlpha=.96*fade;
  drawSlash(x,y);
 }
 ctx.restore();
}

function drawGoblinCrescent47(ctx, game, reducedMotion = false) {
 const attack=game.attack;
 if(!attack||attack.enemySkill!=='goblin_crescent_47'||attack.interrupted||!GOBLIN_CRESCENT_47.complete||!GOBLIN_CRESCENT_47.naturalWidth)return;
 const impact=attack.impact, start=impact-.44, finish=impact+.14, now=game.time;
 if(now<start||now>finish)return;
 const q=Math.max(0,Math.min(1,(now-start)/.44));
 // Canvas world coordinates are horizontally mirrored with the selected hand.
 // In world space, Goblin is at x=710 and the hero is at x=90.
 const ease=q*q*(3-2*q), x=710+(90-710)*ease;
 const height=470, width=height*GOBLIN_CRESCENT_47.naturalWidth/GOBLIN_CRESCENT_47.naturalHeight;
 const fade=now>impact?Math.max(0,1-(now-impact)/.14):1;
 const drawCrescent=(cx,cy,w,h)=>{ctx.save();ctx.translate(cx,cy);ctx.scale(-1,1);ctx.drawImage(GOBLIN_CRESCENT_47,-w/2,-h/2,w,h);ctx.restore();};
 ctx.save();
 if(reducedMotion){
  if(now<impact-.08||now>impact+.08){ctx.restore();return;}
  ctx.globalAlpha=.88;
  drawCrescent(710,554,width,height);
 }else{
  // Two restrained, staggered copies retain the approved trailing-image silhouette.
  for(const trail of [{lag:.19,alpha:.2,scale:.91,dy:-9},{lag:.095,alpha:.3,scale:.96,dy:6}]){
   const tq=q-trail.lag/.44;if(tq<=0)continue;const te=tq*tq*(3-2*tq),tx=710+(90-710)*te,w=width*trail.scale,h=height*trail.scale;
   ctx.globalAlpha=trail.alpha*fade;
   drawCrescent(tx,554+trail.dy,w,h);
  }
  ctx.globalAlpha=.94*fade;
  drawCrescent(x,554,width,height);
 }
 ctx.restore();
}

function drawD1Crescent47(ctx, game, reducedMotion = false) {
 const attack=game.attack;
 if(!attack||!['orc_crescent_47','minotaur_crescent_47'].includes(attack.enemySkill)||attack.interrupted||!GOBLIN_CRESCENT_47.complete||!GOBLIN_CRESCENT_47.naturalWidth)return;
 drawCrescent47Layers(ctx,game,reducedMotion,GOBLIN_CRESCENT_47);
}

function drawCrescent47Layers(ctx, game, reducedMotion, image) {
 const attack=game.attack,impact=attack.impact,start=impact-.44,finish=impact+.14,now=game.time;
 if(now<start||now>finish)return;
 const q=Math.max(0,Math.min(1,(now-start)/.44)),ease=q*q*(3-2*q),x=710+(90-710)*ease;
 const height=470,width=height*image.naturalWidth/image.naturalHeight,fade=now>impact?Math.max(0,1-(now-impact)/.14):1;
 const draw=(cx,cy,w,h)=>{ctx.save();ctx.translate(cx,cy);ctx.scale(-1,1);ctx.drawImage(image,-w/2,-h/2,w,h);ctx.restore();};
 ctx.save();
 if(reducedMotion){if(now<impact-.08||now>impact+.08){ctx.restore();return;}ctx.globalAlpha=.9;draw(90,554,width,height);}
 else{
  for(const trail of [{lag:.19,alpha:.19,scale:.9,dy:-8},{lag:.095,alpha:.3,scale:.96,dy:5}]){const tq=q-trail.lag/.44;if(tq<=0)continue;const te=tq*tq*(3-2*tq),tx=710+(90-710)*te;ctx.globalAlpha=trail.alpha*fade;draw(tx,554+trail.dy,width*trail.scale,height*trail.scale);}
  ctx.globalAlpha=.94*fade;draw(x,554,width,height);
 }
 ctx.restore();
}

function drawExecutionerLattice44(ctx, game, reducedMotion = false) {
 const attack=game.attack;
 if(!attack||attack.enemySkill!=='executioner_lattice_44'||attack.interrupted||!EXECUTIONER_LATTICE_44.complete||!EXECUTIONER_LATTICE_44.naturalWidth)return;
 const impact=attack.impact,start=impact-.48,finish=impact+.16,now=game.time;if(now<start||now>finish)return;
 const q=Math.max(0,Math.min(1,(now-start)/.48)),ease=q*q*(3-2*q),x=710+(90-710)*ease,size=470,fade=now>impact?Math.max(0,1-(now-impact)/.16):1;
 const draw=(cx,scale,alpha,rotation=0)=>{ctx.save();ctx.globalAlpha=alpha*fade;ctx.translate(cx,494);ctx.rotate(rotation);ctx.drawImage(EXECUTIONER_LATTICE_44,-size*scale/2,-size*scale/2,size*scale,size*scale);ctx.restore();};
 if(reducedMotion){if(now>=impact-.08&&now<=impact+.08)draw(90,1,.9);return;}
 for(const trail of [{lag:.2,alpha:.18,scale:.9,rotation:-.035},{lag:.1,alpha:.28,scale:.96,rotation:.02}]){const tq=q-trail.lag/.48;if(tq<=0)continue;const te=tq*tq*(3-2*tq);draw(710+(90-710)*te,trail.scale,trail.alpha,trail.rotation);}
 draw(x,1,.92,Math.sin(q*Math.PI)*.025);
}

if(typeof module!=='undefined')module.exports={drawGoblinCrescent47,drawGoblinDagger01,drawD1Crescent47,drawExecutionerLattice44};
