const BOSS_ART={executioner:{color:'#bb6351',title:'Rìu phán quyết',symbol:'◆'},warden:{color:'#578899',title:'Khiên thành trì',symbol:'▣'},wraith:{color:'#9a72bb',title:'Lưỡi hái linh hồn',symbol:'☽'}};
function telegraph(){}
function strikeArt(ctx,g,age){if(age<0)return;const release=counterRelease(g.weapon),dt=age-release;ctx.save();
 if(g.weapon==='bow'&&dt>=0&&dt<.4){const x=120+590*dt/.4;ctx.strokeStyle='#e6eebaaa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-55,517);ctx.lineTo(x-15,517);ctx.stroke();}
 if(g.weapon==='katana'&&dt>-.06&&dt<.15){ctx.strokeStyle='#d9fbff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(650,462);ctx.lineTo(750,525);ctx.stroke();}
 if(g.weapon==='daggers')for(let i=0;i<3;i++){const k=dt-i*.09;if(k>-.03&&k<.07){ctx.strokeStyle=i%2?'#b3ebe5':'#fff0c1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(650,465+i*12);ctx.lineTo(745,515-i*10);ctx.stroke();}}
 if(g.weapon==='greatsword'&&dt>-.05&&dt<.18){ctx.strokeStyle='#ffe0a0';ctx.lineWidth=9;ctx.beginPath();ctx.arc(710,485,55,Math.PI,Math.PI*2);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(660,552);ctx.lineTo(700,565);ctx.lineTo(730,552);ctx.lineTo(765,566);ctx.stroke();}ctx.restore();
}
function bossIdentity(ctx,g,t){if(!g.isBoss||g.enemyHp<=0)return;const a=BOSS_ART[g.enemyId];ctx.save();ctx.globalAlpha=.24;ctx.strokeStyle=a.color;ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(630,422,68,17,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=a.color;ctx.font='bold 28px Georgia';ctx.fillText(a.symbol,793,275);
 if(g.enemyId==='warden'){ctx.fillStyle='#517b6ee0';ctx.strokeStyle='#a6d8de';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(765,345);ctx.lineTo(803,350);ctx.lineTo(800,390);ctx.lineTo(782,407);ctx.lineTo(762,389);ctx.closePath();ctx.fill();ctx.stroke();}
 if(g.enemyId==='executioner'){ctx.strokeStyle='#583f30';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(843,404);ctx.lineTo(860,325);ctx.stroke();ctx.fillStyle='#7c8690';ctx.beginPath();ctx.moveTo(858,325);ctx.lineTo(890,335);ctx.lineTo(884,365);ctx.lineTo(853,345);ctx.fill();}
 if(g.enemyId==='wraith'){ctx.strokeStyle='#ad8bcabb';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(630,350,55+i*10,t+i,t+i+1.8);ctx.stroke();}}ctx.restore();}
