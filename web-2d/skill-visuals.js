// Original vector motifs shared by cards, collection icons and combat VFX.
// Keep silhouettes legible at 48 px; effects share colors and shape language.
const SKILL_VISUALS={
 flame_counter:{title:'Hỏa phản',color:'#ef9b54',dark:'#3b252c',tag:'PHẢN CÔNG',brief:['2 Perfect → +1 DMG','Perfect → +1 DMG'],shape:'flame'},
 focus:{title:'Tĩnh tâm',color:'#bba8f2',dark:'#262842',tag:'CHÍNH XÁC',brief:['Perfect +0,04s','Perfect +0,06s'],shape:'eye'},
 momentum:{title:'Phong hành',color:'#84dce0',dark:'#173e47',tag:'NHỊP CHIẾN',brief:['Flow 3 → +1 DMG','Flow 2 → +1 DMG'],shape:'wind'},
 guardian:{title:'Vững tâm',color:'#a9d8a0',dark:'#263d35',tag:'PHÒNG THỦ',brief:['Giữ Flow khi mất tim ×1','Giữ Flow khi mất tim ×2'],shape:'shield'},
 bloodlust:{title:'Huyết lực',color:'#eb8d9c',dark:'#442630',tag:'SỨC MẠNH',brief:['Flow 4 → +1 DMG','Flow 3 → +1 DMG'],shape:'claw'}
};
function skillIconMarkup(id){
 const v=SKILL_VISUALS[id]||SKILL_VISUALS.focus,c=v.color;
 const paths={
 flame:`<path d="M27 103Q17 82 39 58L43 80Q66 56 62 27Q105 64 96 88L108 74Q119 114 82 127Q45 137 27 103Z" fill="url(#light)"/><path d="M52 107Q50 89 72 74Q67 99 85 94Q91 117 71 121Q57 121 52 107" fill="#fff0b0"/><path d="M23 49l5-12m76 0 8 13M47 22l3-9" stroke="${c}" stroke-width="3"/><path d="M24 126Q65 111 114 127" fill="none" stroke="#ffdca5" stroke-width="3"/>`,
 eye:`<circle cx="70" cy="72" r="43" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="6 8"/><path d="M24 73Q70 27 116 73Q70 116 24 73Z" fill="#222d42" stroke="${c}" stroke-width="5"/><circle cx="70" cy="72" r="18" fill="url(#light)"/><path d="M70 47v13m0 25v14M44 72h12m28 0h12" stroke="#fff3cf" stroke-width="3"/><circle cx="70" cy="72" r="5" fill="#fff"/><path d="M62 17l8 11 8-11m-16 110 8-11 8 11" fill="none" stroke="${c}" stroke-width="3"/>`,
 wind:`<path d="M17 98Q24 83 56 82H91Q123 79 111 57Q102 47 90 56" fill="none" stroke="url(#light)" stroke-width="11" stroke-linecap="round"/><path d="M25 63Q34 47 67 49Q94 51 92 31Q86 18 75 28M37 113H79Q108 112 96 100" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path d="M27 75h35m-22-39 21 0m-7 88h24" stroke="#d6faf1" stroke-width="2"/><path d="M45 91l12-19 15 14-12 22Z" fill="#e3ecd0" stroke="#284a50" stroke-width="2"/>`,
 shield:`<path d="M28 35Q70 45 112 35L106 90Q99 119 70 134Q41 119 34 90Z" fill="url(#light)" stroke="#f6e4a4" stroke-width="4"/><path d="M42 52H98L92 90Q87 106 70 118Q53 106 48 90Z" fill="#284c47" stroke="#b9e6b3" stroke-width="2"/><path d="M70 61l8 15 17 3-13 12 3 17-15-8-15 8 3-17-13-12 17-3Z" fill="#e5eabb"/><path d="M16 62l-7-7m114 7 7-7M18 106l-9 4m113-4 9 4" stroke="${c}" stroke-width="3"/>`,
 claw:`<path d="M31 34Q48 60 61 120L46 128Q44 84 25 55ZM66 22Q72 54 86 110L72 120Q71 75 57 41ZM97 30Q101 57 116 94L103 107Q100 67 90 42Z" fill="url(#light)"/><path d="M35 40l20 75m12-83 13 74m19-65 10 45" stroke="#ffdbc8" stroke-width="2"/><path d="M22 126Q45 142 79 131" fill="none" stroke="${c}" stroke-width="3"/>`
 };
 // Gradient IDs are scoped to each inline SVG instance.
 const uid='skill-'+id+'-'+(++skillIconSerial);
 return `<svg viewBox="0 0 140 150" aria-hidden="true" class="skill-illustration"><defs><radialGradient id="${uid}-bg"><stop stop-color="${c}" stop-opacity=".3"/><stop offset="1" stop-color="${v.dark}"/></radialGradient><linearGradient id="${uid}-light" x2=".8" y2="1"><stop stop-color="#fff0be"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${v.dark}"/></linearGradient></defs><rect width="140" height="150" rx="14" fill="url(#${uid}-bg)"/><path d="M9 39V13H35m70 0h26v26m0 72v26h-26m-70 0H9v-26" fill="none" stroke="${c}" opacity=".4"/><circle cx="70" cy="76" r="56" fill="none" stroke="${c}" opacity=".13"/>${paths[v.shape].replaceAll('url(#light)',`url(#${uid}-light)`)}</svg>`;
}
let skillIconSerial=0;
function paintSkillMotif(ctx,id,age){
 const v=SKILL_VISUALS[id]||{color:'#f0da93',shape:id==='mastery'?'gem':'eye'};
 ctx.strokeStyle=v.color;ctx.fillStyle=v.color;ctx.lineWidth=3;
 if(v.shape==='flame'){
  for(let i=0;i<3;i++){const x=-29+i*29,h=23+Math.sin(age*15+i)*7;ctx.beginPath();ctx.moveTo(x-8,27);ctx.quadraticCurveTo(x-18,9,x,27-h);ctx.quadraticCurveTo(x+14,12,x+8,27);ctx.closePath();ctx.fill();}
 }else if(v.shape==='shield'){
  ctx.beginPath();ctx.moveTo(-31,-24);ctx.quadraticCurveTo(0,-15,31,-24);ctx.lineTo(25,15);ctx.quadraticCurveTo(15,33,0,39);ctx.quadraticCurveTo(-15,33,-25,15);ctx.closePath();ctx.stroke();ctx.globalAlpha*=.25;ctx.fill();
 }else if(v.shape==='claw'){
  for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-30+i*23,-25);ctx.quadraticCurveTo(-12+i*23,-2,-16+i*23,29);ctx.stroke();}
 }else if(v.shape==='wind'){
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,9+i*8,42-i*6,12,0,age*3+i,age*3+i+Math.PI*1.45);ctx.stroke();}
 }else if(v.shape==='gem'){
  ctx.beginPath();ctx.moveTo(0,-32);ctx.lineTo(26,0);ctx.lineTo(0,32);ctx.lineTo(-26,0);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(15,0);ctx.lineTo(0,19);ctx.lineTo(-15,0);ctx.closePath();ctx.stroke();
 }else{
  ctx.beginPath();ctx.moveTo(-34,0);ctx.quadraticCurveTo(0,-29,34,0);ctx.quadraticCurveTo(0,29,-34,0);ctx.stroke();ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();
 }
}
if(typeof module!=='undefined')module.exports={SKILL_VISUALS,skillIconMarkup,paintSkillMotif};
