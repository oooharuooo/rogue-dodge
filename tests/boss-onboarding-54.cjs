const assert=require('node:assert/strict');global.LaneGame=require('../web-2d/lane-core.js');global.FullGame=require('../web-2d/full-core.js').FullGame;const {CombatGame}=require('../web-2d/combat-core.js');
for(const phase of [1,2])for(let seed=0;seed<40;seed++){
 let n=seed;const g=new CombatGame(()=>((n=n*1664525+1013904223)>>>0)/4294967296);g.enterTest('katana','executioner',true);g.test=false;g.enemyHp=g.enemyMax*(phase===1?.9:.4);assert.equal(g.phase,phase);g.beginChain();assert.equal(g.combo.hits.length,phase);assert(g.combo.hits.every(h=>h.family==='melee'&&h.target===1));assert.equal(g.combo.interval,phase===1?1.6:1.5);
}
const test=new CombatGame();test.enterTest('katana','executioner',true);test.testFamily='mixed';test.testLength=4;assert.equal(test.combatProfile,'mixed');assert.equal(test.chainLength,4);
console.log('D1 boss: 80 seeded chains, phase lengths 1/2, melee only, familiar targets, unchanged tells and explicit Test Mode overrides passed.');
