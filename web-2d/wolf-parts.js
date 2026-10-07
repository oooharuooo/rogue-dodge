// Quadruped body modules. Art is independent of wolf-rig.js motion and combat rules.
function wolfLeg(ctx,p,poly,x,back,near){
 ctx.strokeStyle='#192530';ctx.lineWidth=2;
 const swing=p.stride*(back?-1:1)*(near?1:-1),rootY=(back?-54:-80)+p.crouch,kx=x+(back?23:10)+swing*12,ky=-29+p.crouch*.3,fx=x+(back?6:23)-swing*13;
 const base=near?'#56616b':'#303b45',light=near?'#88949b':'#4a5661';
 poly([[x-15,rootY],[x+17,rootY-3],[kx+14,ky-10],[fx+12,-11],[fx+23,-1],[fx+19,7],[fx-17,6],[fx-19,-9],[kx-8,ky+2],[x-22,rootY+19]],base);
 poly([[x-12,rootY+3],[x+6,rootY+3],[kx+6,ky-4],[fx+2,-15],[fx-10,-10],[kx-9,ky+4]],light);
 poly([[x-16,rootY+10],[x-26,rootY+24],[x-11,rootY+20],[x-19,rootY+34],[kx-7,ky+4]],'#343f49');
 ctx.strokeStyle='#161d25';ctx.lineWidth=2;
 for(let i=0;i<3;i++){const tx=fx+5+i*7;poly([[tx,-1],[tx+5,0],[tx+11,10],[tx+4,8]],'#c0bda8');}
}
function wolfTail(ctx,p,poly){
 ctx.save();ctx.translate(-60,-58);ctx.rotate(Math.sin(p.q*2)*.08);
 poly([[0,-9],[-31,-25],[-57,-29],[-76,-16],[-71,-29],[-88,-11],[-96,4],[-78,0],[-87,13],[-63,5],[-65,18],[-45,9],[-24,3],[2,11]],'#34404a');
 poly([[-8,-8],[-37,-17],[-58,-17],[-77,-4],[-51,-6],[-28,-1]],'#77848c');ctx.restore();
}
function wolfTorso(ctx,p,poly){
 // Back arch rises into a heavy shoulder mass rather than a straight dog torso.
 ctx.beginPath();ctx.moveTo(-76,-55);ctx.bezierCurveTo(-73,-101,-44,-98,-15,-93);ctx.bezierCurveTo(8,-131,45,-138,65,-108);ctx.bezierCurveTo(85,-83,83,-55,61,-36);ctx.bezierCurveTo(30,-24,10,-42,-10,-36);ctx.bezierCurveTo(-43,-24,-68,-34,-76,-55);ctx.closePath();ctx.fillStyle='#45525e';ctx.fill();ctx.stroke();
 poly([[-58,-87],[-26,-93],[3,-110],[35,-124],[50,-110],[13,-83],[-15,-70],[-46,-70]],'#6e7c87');
 poly([[-66,-56],[-40,-65],[-6,-62],[15,-79],[46,-88],[63,-65],[44,-43],[20,-37],[-11,-44],[-34,-37]],'#303b48');
}
function wolfMane(ctx,p,poly){
 poly([[-37,-95],[-26,-120],[-16,-100],[0,-143],[11,-113],[21,-156],[34,-130],[45,-150],[51,-117],[68,-126],[72,-93],[91,-83],[76,-72],[90,-59],[70,-55],[82,-35],[59,-42],[57,-21],[37,-39],[24,-25],[22,-53],[6,-57],[-4,-77]],'#36434f');
 poly([[0,-119],[17,-136],[15,-105],[36,-128],[31,-93],[56,-104],[50,-80],[71,-83],[58,-61],[68,-48],[44,-57],[39,-35],[24,-64],[8,-73]],'#8b98a0');
 poly([[15,-99],[26,-115],[24,-84],[39,-91],[33,-70],[49,-72],[39,-56],[26,-69]],'#64737e');
}
function wolfFur(ctx,p,poly){
 poly([[-65,-78],[-50,-89],[-35,-85],[-19,-92],[-7,-88],[-25,-68],[-15,-64],[-33,-56],[-29,-49],[-50,-56]],'#7b8891');
 poly([[-51,-72],[-33,-76],[-17,-82],[-31,-63],[-23,-59],[-46,-63]],'#51616d');
}
function wolfEars(ctx,p,poly){
 poly([[-20,-21],[-27,-57],[-17,-69],[-3,-42],[14,-36],[27,-50],[29,-27]],'#35434e');
 poly([[-19,-51],[-16,-58],[-10,-41]],'#8c8580');
}
function wolfJaw(ctx,p,poly){
 ctx.save();ctx.translate(33,9);ctx.rotate(.08+p.jaw*.43);
 poly([[-10,-5],[6,-8],[35,-3],[45,5],[38,14],[16,19],[-8,13]],'#384751');
 poly([[2,-4],[20,-1],[35,3],[31,9],[13,10],[-1,6]],'#785250');
 for(const [x,size]of [[6,10],[19,6],[31,8]])poly([[x,2],[x+5,3],[x+2,3-size]],'#e2dcc6');
 ctx.restore();
}
function wolfHead(ctx,p,poly){
 ctx.save();ctx.translate(64,-77+p.crouch);ctx.rotate(.13-p.pitch*.6);
 WolfParts.ears(ctx,p,poly);
 poly([[-23,-23],[-12,-44],[10,-37],[31,-29],[42,-15],[36,9],[13,17],[-7,12],[-19,26],[-21,7],[-34,10],[-28,-8],[-38,-6]],'#788792');
 poly([[-9,-29],[8,-34],[28,-26],[32,-18],[12,-12],[1,-15],[-7,-2],[-16,-5]],'#a7b1b6');
 WolfParts.jaw(ctx,p,poly);
 poly([[21,-17],[39,-20],[46,-12],[65,-8],[79,2],[76,11],[56,13],[40,5],[22,4]],'#8e9aa0');
 poly([[38,-7],[57,-5],[67,1],[56,4],[35,0]],'#b6bdbb');
 poly([[69,-2],[80,3],[75,10],[67,8]],'#18232c');
 // Deep brow and a tiny eye. No large iris or cheerful rounded cheeks.
 poly([[7,-23],[28,-24],[21,-17],[11,-17]],'#c4b37b');
 poly([[18,-23],[22,-22],[20,-17],[17,-17]],'#242720');
 poly([[2,-30],[17,-32],[34,-27],[28,-22],[12,-25],[4,-23]],'#25343f');
 poly([[-8,-6],[7,-9],[18,-1],[4,4],[-10,10]],'#4e606e');
 poly([[40,8],[47,9],[44,22]],'#e1dcc8');poly([[59,12],[64,12],[62,21]],'#e1dcc8');
 ctx.lineWidth=1.5;ctx.strokeStyle='#c5cbd0';ctx.beginPath();ctx.moveTo(-4,-23);ctx.lineTo(-12,-4);ctx.moveTo(1,-22);ctx.lineTo(-6,-3);ctx.stroke();ctx.restore();
}
function wolfHarness(ctx,p,poly){
 // A replaceable medieval leather harness and tarnished shoulder plate.
 poly([[5,-109],[18,-111],[39,-38],[27,-34]],'#40312b');
 poly([[10,-112],[32,-131],[50,-119],[57,-92],[46,-80],[27,-89]],'#5c6567');
 poly([[16,-111],[32,-125],[44,-116],[47,-99],[29,-103]],'#8d9692');
 ctx.strokeStyle='#b0a27b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,-109);ctx.lineTo(29,-127);ctx.lineTo(46,-117);ctx.stroke();
 poly([[19,-68],[30,-72],[34,-61],[23,-57]],'#ad9771');poly([[23,-66],[28,-67],[29,-63],[24,-62]],'#40312b');
}
const WolfParts={leg:wolfLeg,tail:wolfTail,torso:wolfTorso,mane:wolfMane,fur:wolfFur,head:wolfHead,ears:wolfEars,jaw:wolfJaw,harness:wolfHarness};
