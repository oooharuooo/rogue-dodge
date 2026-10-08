function meleeMotion(game,q){const a=game.attack,target=a?.target??1,prep=Math.min(1,q/.3),swing=Math.max(0,Math.min(1,(q-.65)/.27));
 const family=ENCOUNTER_STYLES[game.enemyId]?.family||'axe';const c=game.combo,ongoing=a?.index>0;const approach=ongoing?.9+.1*Math.min(1,q/.55):Math.min(1,q/.55);const recoil=a?.resolved&&c?.index<c?.hits.length?Math.min(1,(game.time-a.impact)/.5)*.1:0;if(a?.kind==='jump'){const slam=Math.max(0,Math.min(1,(q-.72)/.18));return {right:150-170*slam,left:95-105*slam,re:-30,le:-35,lean:10*slam,drop:18*slam,shift:-440*(approach-recoil),wa:90-140*slam,stride:1,vertical:0};}
 const slashApproach=ongoing?.9+.1*Math.max(0,Math.min(1,q/.65)):Math.max(0,Math.min(1,(q-.2)/.45));
 const returnAmount=!c&&a?.resolved?Math.min(1,Math.max(0,(game.time-a.impact)/.28)):0;
 const travel=(slashApproach-recoil)*(1-returnAmount),height=(target-1)*156;
 let vertical=height*travel;
 if(c){const blend=Math.max(0,Math.min(1,(q-.70)/.22)),recenter=a?.resolved?Math.max(0,Math.min(1,(game.time-a.impact)/.32)):0;vertical=height*blend*blend*(3-2*blend)*(1-recenter*recenter*(3-2*recenter));}
 const flavor=enemyMotion(family,target===0?'down':target===2?'up':'melee',q,game.time);
 return {...flavor,right:({0:135,1:35,2:-55}[target])*prep-70*swing,left:({0:-25,1:45,2:100}[target])*prep,re:flavor.re,le:target===0?-65:target===2?25:flavor.le,lean:flavor.lean,drop:flavor.drop,shift:-440*travel,wa:({0:90,1:0,2:-45}[target])*prep*(1-swing),stride:travel,vertical};
}
function drawCloseEncounter(ctx,g){const a=g.attack,q=a?Math.max(0,(g.time-a.start)/(a.impact-a.start)):0;
 const style=ENCOUNTER_STYLES[g.enemyId],rig=encounterRig(style),fake={...g,attack:a?{...a,kind:a.kind}:null,visualStyle:style,visualRig:rig,meleePreview:g};
 ctx.save();if(g.damageEvents?.some(e=>g.time-e.time<.12)){ctx.filter='brightness(1.3)';if(a?.resolved)ctx.translate(4,0);}drawReadableBoss(ctx,fake,710,552);ctx.restore();g.visualAnchor=fake.visualAnchor;
 // The short contact slash appears only on release, at one lane; no travelling two-lane projectile.
 if(a?.kind==='jump'){drawBossWave(ctx,fake);a.groundOrigin=fake.attack.groundOrigin;}
 if(a?.kind==='melee'&&q>=.88&&q<=1.14){const y=338+a.target*156,age=(q-.88)/.26,origin=fake.bladeTip||{x:145,y};ctx.save();ctx.globalAlpha=1-age;ctx.strokeStyle='#f6e4af';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.quadraticCurveTo(85,y-30,95,y+30);ctx.stroke();ctx.restore();}
}
