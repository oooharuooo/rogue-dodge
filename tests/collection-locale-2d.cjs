const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({localStorage:{getItem:()=>null},console});
for(const file of ['i18n.js','collection.js'])vm.runInContext(fs.readFileSync('web-2d/'+file,'utf8'),context);
assert.equal(vm.runInContext("translateText('Phần thưởng chiến thắng')",context),'Phần thưởng chiến thắng');
assert.equal(vm.runInContext("locale='en';translateText('Phần thưởng chiến thắng')",context),'Victory reward');
assert.equal(vm.runInContext("translateText('Mỗi 2 Perfect thêm 1 damage')",context),'Every 2 Perfects add 1 damage');
for(const [id,field,threshold] of [['momentum','perfect',12],['guardian','clean',3],['bloodlust','elite',1]]){
 for(const value of [0,threshold-1,threshold,threshold+1]){
  const result=vm.runInContext(`collectionProgress({${field}:${value}},'${id}')`,context);assert.equal(result[0],value);assert.equal(result[1],threshold);
 }
}
global.LaneGame=require('../web-2d/lane-core.js');const core=require('../web-2d/full-core.js');Object.assign(global,core);Object.assign(global,require('../web-2d/combat-core.js'));const {CampaignGame}=require('../web-2d/campaign-core.js');
const g=new CampaignGame(),before=JSON.stringify(g.meta);g.enterTest('katana','iron_bear');g.enemyMax=g.enemyHp=200;g.testLength=1;g.testLevel=3;g.skills={flame_counter:2,momentum:1,guardian:1,focus:1};g.flow=2;
let seen=new Set();for(let n=0;n<3;n++){g.begin(g.nextKind());for(let i=0;i<1000&&(g.attack||g.combo||g.counter||g.shots.some(s=>!s.hit)||g.action);i++){if(g.attack&&!g.attack.resolved&&!g.action&&g.time>=g.attack.impact-.45){const action=g.recommendedAction();if(action)g.act(action);}g.update(1/60);for(const event of g.skillEvents)seen.add(event.id);}}
assert(seen.has('flame_counter'));assert(seen.has('momentum'));assert.equal(JSON.stringify(g.meta),before);assert(g.totalDamage>0);
console.log('Locale, real unlock thresholds and combat skill demo with unchanged meta passed');
