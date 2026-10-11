require('./run-economy-38.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(fs.readFileSync('web-2d/mastery-passives.js','utf8'));
let checks=0;global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
function fresh(w,rank){const g=new CampaignGame(()=>.4),p=ensureProgress(g.meta);p.xp[w]=rank===3?96:rank===2?36:0;p.tiers[w]=rank===3?{1:24,2:36,3:36}:rank===2?{1:24,2:12}:{};g.meta.xp[w]=p.xp[w];g.start(w);g.selectSkill('focus');g.loadEnemy('executioner',true);g.enemyHp=g.enemyMax=10000;return g;}
function turn(g,follow=false,hit=false){while(g.time<(g.enemyRecoveryUntil||0))g.update(1/60);assert(g.beginChain([{family:'melee',kind:'melee',target:1}]));let extra=null;for(let i=0;i<700&&(g.combo||g.counter||g.action||g.shots.some(s=>!s.hit)||g.daggerWindow||g.pendingGuard);i++){if(!hit&&g.attack&&!g.attack.resolved&&!g.action&&g.time>=g.attack.impact-.45)g.act('up');if(follow&&g.daggerWindow&&g.time>=g.daggerWindow.start){const before=g.shots.length;assert(g.weaponAction());extra=g.shots.slice(before).filter(s=>s.followup).reduce((a,s)=>a+s.damage,0);}g.update(1/60);}return extra;}
for(const w of Object.keys(WEAPONS))for(const rank of [1,2,3]){const g=fresh(w,rank);assert.equal(g.level,rank);assert.equal(Object.keys(g.skills).length,1);const art=MASTERY_ARTS[w].id;assert(!g.unlocked(art));assert(!g.selectSkill(art));assert(!g.offerSkills(Object.keys(SKILLS)).includes(art));g.skills[art]=2;g.damage(false);assert(!g.skills[art]);checks++;}
for(const rank of [1,2,3]){
 const g=fresh('katana',rank);turn(g);assert.equal(g.totalDamage,8);const prior=g.totalDamage;turn(g);assert.equal(g.totalDamage-prior,8+(rank-1));checks++;
 const bow=fresh('bow',rank);bow.beginChain([0,1].map(target=>({family:'melee',kind:'melee',target})));bow.update(.3);assert(bow.weaponAction());assert.equal(bow.shots.filter(s=>s.intercept).reduce((sum,s)=>sum+s.damage,0),rank);checks++;
 const dagger=fresh('daggers',rank);assert.equal(turn(dagger,true),3+(rank-1));assert.equal(dagger.totalDamage,10+(rank-1));checks++;
 const skip=fresh('daggers',rank);turn(skip);assert.equal(skip.pendingWeaponBonus,0);assert.equal(skip.totalDamage,7);checks++;
 const heavy=fresh('greatsword',rank);heavy.armor=1;turn(heavy,false,true);assert.equal(heavy.hp,3);assert.equal(heavy.pendingWeaponBonus,(rank-1)*.25);assert.equal(heavy.damage(false),6+(rank-1));checks++;
}
console.log('Mastery consolidation: '+checks+' checks passed — passive ranks, no duplicate cards/slots/bonuses, Sword/Bow/Guard conditions and integer dagger follow-up.');
