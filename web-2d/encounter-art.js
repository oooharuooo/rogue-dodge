const ENCOUNTER_STYLES={
 swordsman:{variant:1,lean:.7,brace:true,family:'axe'},heavy_knight:{variant:3,lean:1,family:'hammer'},
 rogue:{variant:2,sword:1,lean:.5,brace:true,family:'knife'},duelist:{variant:1,lean:.6,brace:true,family:'charge',filter:'hue-rotate(25deg)'},
 executioner:{variant:3,lean:1},warden:{variant:3,lean:.8,family:'hammer',filter:'hue-rotate(150deg) saturate(.65)',waveColor:'#83b4bb'},
 wraith:{variant:2,lean:.4,family:'mage',filter:'hue-rotate(35deg)',waveColor:'#b9a3e8'}
};
if(typeof MONSTER_STYLES!=='undefined')Object.assign(ENCOUNTER_STYLES,MONSTER_STYLES);
function encounterRig(style){if(style.pack)return monsterRigs[style.pack]||knightRig;const original=enemyRigs[style.variant];if(!original)return knightRig;if(!style.sword)return original;const images=original.images.slice();images[9]=enemyRigs[style.sword].images[9];images[10]=enemyRigs[style.sword].images[10];return {...original,images};}
function drawEncounter(ctx,g){
 if(g.enemyId==='dread_wolf'){ctx.save();if(g.enemyHp<=0){ctx.globalAlpha=Math.max(0,1-(g.time-g.deathTime)/1.2);ctx.translate(670,552);ctx.rotate(-Math.min(1,(g.time-g.deathTime)/.6));ctx.translate(-670,-552);}if(g.damageEvents.some(e=>g.time-e.time<.12))ctx.filter='brightness(1.5)';drawWolf(ctx,g);ctx.restore();return;}
 const style=ENCOUNTER_STYLES[g.enemyId]||ENCOUNTER_STYLES.executioner;
 g.visualStyle=style;g.visualRig=encounterRig(style);
 ctx.save();if(style.filter)ctx.filter=style.filter;
 if(g.enemyHp<=0){const fall=Math.min(1,(g.time-g.deathTime)/.6);ctx.globalAlpha=Math.max(.15,1-(g.time-g.deathTime)/1.2);if(g.enemyId!=='executioner'){ctx.translate(710,552);ctx.rotate(-.9*fall);ctx.translate(-710,-552);}}else if(g.damageEvents.some(e=>g.time-e.time<.12))ctx.filter='brightness(1.5)';
 drawReadableBoss(ctx,g,710,552);ctx.restore();
 if(g.isBoss&&g.enemyHp>0){ctx.save();ctx.strokeStyle={executioner:'#d7a268',warden:'#83b4bb',wraith:'#c3a1e7'}[g.enemyId]||style.waveColor;ctx.lineWidth=3;ctx.globalAlpha=.5;ctx.beginPath();ctx.ellipse(710,556,45+g.phase*4,10,0,0,Math.PI*2);ctx.stroke();if(g.enemyId==='wraith'){ctx.beginPath();ctx.arc(710,485,58,g.time,g.time+1.2);ctx.stroke();}if(g.enemyId==='warden'&&g.freeHand){const h=g.freeHand;ctx.globalAlpha=1;ctx.fillStyle='#5a827d';ctx.strokeStyle='#c7d7ba';ctx.beginPath();ctx.moveTo(h.x-14,h.y-18);ctx.lineTo(h.x+14,h.y-18);ctx.lineTo(h.x+12,h.y+10);ctx.lineTo(h.x,h.y+22);ctx.lineTo(h.x-12,h.y+10);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}
 drawBossWave(ctx,g);
}
