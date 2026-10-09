require('./major-one-final.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const calls=[],nodes=[];
function node(){const e={style:{},children:[],handlers:{},setAttribute(){},append(n){this.children.push(n)},addEventListener(type,fn){this.handlers[type]=fn}};nodes.push(e);return e;}
const context={document:{createElement:node},identityStage:{append(){}},paused:false,effects:{unlock(){}},game:{deflect:lane=>calls.push(lane)},weaponIcon:()=>''};
vm.createContext(context);
const src=fs.readFileSync('web-2d/weapon-final-ui.js','utf8');
vm.runInContext(src.slice(src.indexOf('const deflectInput='),src.indexOf("deflectInput.style.top=")),context);
const lanes=nodes.filter(n=>n.handlers.pointerdown&&n!==nodes.at(-1)),badge=nodes.at(-1);
let consumed=0;const event={preventDefault(){consumed++},stopPropagation(){consumed++},detail:1};
badge.handlers.pointerdown(event);badge.handlers.click(event);assert.equal(calls.length,0);assert.equal(consumed,4);
lanes.forEach(e=>e.handlers.pointerdown(event));assert.deepEqual(calls,[0,1,2]);
assert(!/(?:src=["'](?:review(?:-\w+)?|build-lab|checkpoint-lab)\.js)/.test(fs.readFileSync('web-2d/index.html','utf8')));
console.log('Input regression: badge triggers no deflect; each lane forwards only its own index; normal entry has no review scripts.');
for(const target of [0,1,2])for(const wrong of [false,true]){
 const g=new CampaignGame(()=>.4);g.start('katana');g.selectSkill('focus');g.selectNode(g.availableNodes()[0]);g.enemyHp=g.enemyMax=1000;assert(!g.test);g.beginChain([{family:'melee',kind:'melee',target}]);while(g.time<g.attack.impact-.1)g.update(1/120);g.deflect(wrong?(target+1)%3:target);while(!g.lastCombo)g.update(1/120);assert.equal(g.hp,wrong?2:3);assert.equal(g.lastCombo.results[0].deflected,!wrong);
}
console.log('Normal dungeon regression: all three correct lanes deflect, all three wrong lanes lose a heart.');

