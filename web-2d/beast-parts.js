// Bear modules use the quadruped joints, with an independent head and silhouette.
const BearParts={...WolfParts,
 leg(ctx,p,poly,x,back,near){const colors={'#56616b':'#6b4c35','#303b45':'#3e3027','#88949b':'#9b7754','#4a5661':'#614b36','#343f49':'#4c392b'};wolfLeg(ctx,p,(points,color)=>poly(points,colors[color]||color),x,back,near);},
 tail(ctx,p,poly){poly([[-67,-56],[-83,-60],[-86,-49],[-71,-45]],'#4d392c');},
 torso(ctx,p,poly){poly([[-79,-56],[-69,-102],[-42,-119],[5,-122],[42,-145],[69,-117],[82,-70],[66,-35],[20,-29],[-24,-32],[-60,-27]],'#5b4432');poly([[-63,-94],[-31,-110],[18,-104],[44,-128],[65,-105],[42,-77],[-2,-64]],'#927357');},
 mane(ctx,p,poly){poly([[7,-114],[18,-137],[35,-145],[48,-132],[64,-122],[75,-91],[64,-67],[78,-53],[48,-49],[26,-55]],'#42362e');},
 fur(ctx,p,poly){poly([[-62,-78],[-44,-91],[-18,-86],[-31,-67],[-54,-59]],'#816346');},
 ears(ctx,p,poly){for(const x of [-18,21]){poly([[x-8,-20],[x-12,-35],[x-6,-46],[x+5,-44],[x+12,-34],[x+8,-20]],'#5f4634');}},
 head(ctx,p,poly){ctx.save();ctx.translate(64,-78+(p.bearHeadDrop||0));ctx.rotate(p.bearHeadTilt??-p.pitch*.4);BearParts.ears(ctx,p,poly);poly([[-27,-23],[-16,-40],[19,-36],[36,-20],[37,7],[21,25],[-10,23],[-26,8]],'#87654a');poly([[12,-6],[40,-7],[54,3],[50,19],[18,22],[5,9]],'#b08b64');poly([[39,-4],[53,1],[49,9],[37,8]],'#262a28');poly([[-10,-21],[9,-25],[19,-18],[9,-14],[-8,-15]],'#302c27');poly([[3,-19],[9,-20],[8,-15],[3,-15]],'#d9a85c');ctx.save();ctx.translate(16,17);ctx.rotate(p.jaw*.28);poly([[-3,0],[30,-3],[34,9],[6,15],[-8,8]],'#46352c');for(const x of [7,23])poly([[x,0],[x+5,0],[x+2,10]],'#e2d7b8');ctx.restore();ctx.restore();},
};
const ElderBearParts={...BearParts,harness(ctx,p,poly){WolfParts.harness(ctx,p,poly);poly([[9,-112],[34,-140],[59,-113],[55,-87],[25,-86]],'#746545');poly([[18,-114],[35,-129],[46,-115],[34,-102]],'#b4a078');for(const x of [20,36,51])poly([[x,-119],[x-2,-148],[x+8,-124]],'#b1aba0');poly([[26,-86],[45,-80],[39,-43],[27,-46]],'#834638');}};
// Bake the original CSS color transform once, rather than filtering dozens of
// paths into full-canvas intermediate surfaces every frame.
function frostWolfColor(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)),c=Math.cos(155*Math.PI/180),s=Math.sin(155*Math.PI/180);
 const matrix=[[.213+.787*c-.213*s,.715-.715*c-.715*s,.072-.072*c+.928*s],[.213-.213*c+.143*s,.715+.285*c+.140*s,.072-.072*c-.283*s],[.213-.213*c-.787*s,.715-.715*c+.715*s,.072+.928*c+.072*s]];
 const hue=matrix.map(row=>Math.max(0,Math.min(255,row.reduce((v,x,i)=>v+x*rgb[i],0)))),lum=.213*hue[0]+.715*hue[1]+.072*hue[2];
 return '#'+hue.map(v=>Math.round(Math.max(0,Math.min(255,(lum+(v-lum)*.65)*1.12))).toString(16).padStart(2,'0')).join('');
}
const FROST_WOLF_COLORS=Object.fromEntries(['#161d25','#18232c','#192530','#242720','#25343f','#303b45','#303b48','#343f49','#34404a','#35434e','#36434f','#384751','#40312b','#45525e','#4a5661','#4e606e','#51616d','#56616b','#5c6567','#64737e','#6e7c87','#77848c','#785250','#788792','#7b8891','#88949b','#8b98a0','#8c8580','#8d9692','#8e9aa0','#a7b1b6','#ad9771','#b0a27b','#b6bdbb','#c0bda8','#c4b37b','#c5cbd0','#e1dcc8','#e2dcc6'].map(hex=>[hex,frostWolfColor(hex)]));
function drawBeast(ctx,g){const bear=['iron_bear','elder_bear'].includes(g.enemyId),view=Object.create(g);view.quadParts=g.enemyId==='elder_bear'?ElderBearParts:bear?BearParts:WolfParts;view.beastBear=bear;if(g.enemyId==='frost_wolf')view.wolfSkin={colors:FROST_WOLF_COLORS};ctx.save();try{drawWolf(ctx,view);g.visualAnchor=view.visualAnchor;}finally{ctx.restore();}}
