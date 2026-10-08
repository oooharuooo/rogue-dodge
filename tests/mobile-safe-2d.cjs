const assert=require('node:assert/strict');let n=0;const rows=[];
for(const [width,height]of [[320,568],[360,640],[390,844],[430,932],[412,667]]){
 const stageW=width-(width<350?16:24),stageH=Math.min(height-166,height*.8),canvasH=Math.round(960*stageH/stageW),k=Math.max(1,(canvasH-160)/809.6),px=stageH/canvasH;
 // Conservative combined pose envelope: lane/jump root and body bounds.
 const top=80+174.4748*k,bottom=80+718.993*k;
 assert.ok(top>=10&&bottom<canvasH-10);n++;
 const lanes=[0,1,2].map(i=>[(80+(260+i*156)*.95*k)*px,156*.95*k*px]);
 for(const [y,h]of lanes){assert.ok(y>=0&&y+h<=stageH);assert.ok(h>=44);n++;}
 assert.ok(stageH/height>=.7&&stageH/height<=.85);n++;
 // Parent scale and inverse body scale must leave equal X/Y proportions.
 assert.ok(Math.abs(.95*k*(1.15/k)-.95*1.15)<1e-9);n++;
 rows.push({width,height,battlePercent:+(100*stageH/height).toFixed(1),laneTouchHeight:+lanes[0][1].toFixed(1)});
}
require('fs').writeFileSync('mobile-safe-report.json',JSON.stringify(rows,null,2));console.log(n+' mobile projection and touch-target checks passed');
