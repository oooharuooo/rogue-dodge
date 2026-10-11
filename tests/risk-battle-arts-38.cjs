require('./mastery-passives-38.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');vm.runInThisContext(fs.readFileSync('web-2d/battle-art-progress.js','utf8'));
function fixture(w='katana'){const g=new CampaignGame(()=>.4);g.start(w);g.selectSkill('focus');g.loadEnemy('executioner',true);g.enemyHp=g.enemyMax=10000;for(const id of ['resolve','echo','last_stand'])g.meta.progression.legacyUnlocked[id]=false;g.lastCombo={results:[{perfect:true}]};return g;}
let n=0;
for(const w of ['katana','bow','daggers','greatsword'])for(const hp of [1,2,3])for(const rank of [1,2]){const g=fixture(w);g.hp=hp;g.skills.last_stand=rank;const base=g.damage(false,false),bonus=Math.floor(WEAPON_RULES[w].base*4*(hp===1?(rank===1?.25:.35):hp===2?(rank===1?.1:.15):0));delete g.skills.last_stand;assert.equal(base,g.damage(false,false)+bonus);n++;}
for(const key of ['armor','chainArmor','shield','pendingGuard','heavyChosen']){const g=fixture('greatsword');g.hp=1;g.skills.last_stand=2;g[key]=1;assert.equal(lastStandRate(g),0);n++;}
const g=fixture();g.flow=4;g.damage(true,false);assert(!g.unlocked('resolve'));g.damage(true,true);assert(g.unlocked('resolve'));n++;
for(let i=0;i<5;i++){g.opening=true;g.staggerRecorded=false;g.damage(false,true);}assert(g.unlocked('echo'));assert.equal(unlockProgress(g.meta,'echo')[0],5);n++;
g.test=true;g.opening=true;g.damage(false,true);assert.equal(unlockProgress(g.meta,'echo')[0],5);n++;
const t=fixture();t.lowHealthTrialDamage=30;t.enemyHp=0;t.awardEncounterXP();assert(t.unlocked('last_stand'));t.awardEncounterXP();assert.equal(unlockProgress(t.meta,'last_stand')[0],1);n++;
assert.equal(g.meta.progression.xp.katana,0);n++;console.log('Risk Battle Arts: '+n+' checks passed — four weapons, ranks/HP, protection exclusion, Flow 5, five boss Staggers, Test isolation and unlock once.');
