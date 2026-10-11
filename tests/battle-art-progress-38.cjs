require('./mastery-passives-38.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');vm.runInThisContext(fs.readFileSync('web-2d/battle-art-progress.js','utf8'));
const g=new CampaignGame(()=>.4);g.start('katana');g.selectSkill('focus');g.loadEnemy('executioner',true);g.meta.progression.legacyUnlocked.momentum=false;g.meta.progression.legacyUnlocked.resolve=false;
g.flow=2;g.lastCombo={perfect:true,results:[{perfect:true}]};g.damage(true,false);assert.equal(unlockProgress(g.meta,'momentum')[0],0);g.damage(true,true);assert.equal(unlockProgress(g.meta,'momentum')[0],1);g.update(0);assert.equal(unlockProgress(g.meta,'resolve')[0],0);g.flow=0;g.damage(true,true);assert.equal(unlockProgress(g.meta,'momentum')[0],1);g.test=true;g.flow=2;g.damage(true,true);assert.equal(unlockProgress(g.meta,'momentum')[0],1);g.test=false;g.meta.progression.artAchievements.flow[1]=18;assert(g.unlocked('momentum'));assert(!g.unlocked('resolve'));assert.equal(g.meta.progression.xp.katana,0);console.log('Battle Art progress: 7 checks passed — Flow condition, preview/Test isolation, rank threshold and separate Mastery XP.');


