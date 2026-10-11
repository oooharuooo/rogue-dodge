require('./dungeon-42.cjs');
const assert55=require('node:assert/strict'),fs55=require('node:fs');const {biomeForDungeon55,backgroundFor55}=require('../web-2d/locations-55.js');
for(const phase of [1,2,3]){const g=new CampaignGame(()=>.4);g.enterTest('katana','frost_golem',true);g.enemyHp=g.enemyMax*([.9,.5,.2][phase-1]);for(let tick=0;tick<200;tick++)g.update(.01);assert55.equal(g.phase,phase);g.beginChain();assert55.equal(g.chainLength,[2,2,3][phase-1]);assert55.equal(g.combo.hits.length,g.chainLength);assert55.deepEqual([...new Set(g.combo.hits.map(h=>h.family))],phase===1?['melee']:phase===2?['ranged']:['melee','ranged']);assert55(g.combo.hits.every(h=>h.family!=='melee'||h.target===1));}
for(const phase of [1,2])for(let n=0;n<40;n++){const g=new CampaignGame(()=>n/40);g.enterTest('katana','executioner',true);g.test=false;g.enemyHp=g.enemyMax*(phase===1?.9:.4);for(let tick=0;tick<100;tick++)g.update(.01);g.beginChain();assert55.equal(g.combo.hits.length,phase);assert55(g.combo.hits.every(h=>h.family==='melee'&&h.target===1));}
for(let d=1;d<=6;d++)for(const role of ['normal','boss','merchant','rest']){const src=backgroundFor55(biomeForDungeon55(d),role);assert55(fs55.existsSync('web-2d/'+src),src);assert55(!src.includes('forest-original'));}
console.log('55: D2 phases 2/2/3 and gradual families, D1 campaign 80 chains, 24 approved biome/location assets passed.');



