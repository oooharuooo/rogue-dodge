// Bear modules use the quadruped joints, with an independent head and silhouette.
const BearParts={...WolfParts,
 leg(ctx,p,poly,x,back,near){const colors={'#56616b':'#6b4c35','#303b45':'#3e3027','#88949b':'#9b7754','#4a5661':'#614b36','#343f49':'#4c392b'};wolfLeg(ctx,p,(points,color)=>poly(points,colors[color]||color),x,back,near);},
 tail(ctx,p,poly){poly([[-67,-56],[-83,-60],[-86,-49],[-71,-45]],'#4d392c');},
 torso(ctx,p,poly){poly([[-79,-56],[-69,-102],[-42,-119],[5,-122],[42,-145],[69,-117],[82,-70],[66,-35],[20,-29],[-24,-32],[-60,-27]],'#5b4432');poly([[-63,-94],[-31,-110],[18,-104],[44,-128],[65,-105],[42,-77],[-2,-64]],'#927357');},
 mane(ctx,p,poly){poly([[7,-114],[18,-137],[35,-145],[48,-132],[64,-122],[75,-91],[64,-67],[78,-53],[48,-49],[26,-55]],'#42362e');},
 fur(ctx,p,poly){poly([[-62,-78],[-44,-91],[-18,-86],[-31,-67],[-54,-59]],'#816346');},
 ears(ctx,p,poly){for(const x of [-18,21]){poly([[x-8,-20],[x-12,-35],[x-6,-46],[x+5,-44],[x+12,-34],[x+8,-20]],'#5f4634');}},
 head(ctx,p,poly){ctx.save();ctx.translate(64,-78+p.crouch);ctx.rotate(-p.pitch*.4);BearParts.ears(ctx,p,poly);poly([[-27,-23],[-16,-40],[19,-36],[36,-20],[37,7],[21,25],[-10,23],[-26,8]],'#87654a');poly([[12,-6],[40,-7],[54,3],[50,19],[18,22],[5,9]],'#b08b64');poly([[39,-4],[53,1],[49,9],[37,8]],'#262a28');poly([[-10,-21],[9,-25],[19,-18],[9,-14],[-8,-15]],'#302c27');poly([[3,-19],[9,-20],[8,-15],[3,-15]],'#d9a85c');ctx.save();ctx.translate(16,17);ctx.rotate(p.jaw*.28);poly([[-3,0],[30,-3],[34,9],[6,15],[-8,8]],'#46352c');for(const x of [7,23])poly([[x,0],[x+5,0],[x+2,10]],'#e2d7b8');ctx.restore();ctx.restore();},
};
const ElderBearParts={...BearParts,harness(ctx,p,poly){WolfParts.harness(ctx,p,poly);poly([[9,-112],[34,-140],[59,-113],[55,-87],[25,-86]],'#746545');poly([[18,-114],[35,-129],[46,-115],[34,-102]],'#b4a078');for(const x of [20,36,51])poly([[x,-119],[x-2,-148],[x+8,-124]],'#b1aba0');poly([[26,-86],[45,-80],[39,-43],[27,-46]],'#834638');}};
function drawBeast(ctx,g){const bear=['iron_bear','elder_bear'].includes(g.enemyId);const view={...g,quadParts:g.enemyId==='elder_bear'?ElderBearParts:bear?BearParts:WolfParts,beastBear:bear};ctx.save();if(g.enemyId==='frost_wolf')ctx.filter='hue-rotate(155deg) saturate(.65) brightness(1.12)';drawWolf(ctx,view);if(g.attack&&view.attack?.groundOrigin)g.attack.groundOrigin=view.attack.groundOrigin;ctx.restore();}
