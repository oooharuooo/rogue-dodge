require('./mastery-passives-38.cjs');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('web-2d/mastery-passives-ui.js','utf8');
const update=source.slice(source.indexOf('const practiceLessonUpdate='),source.indexOf('const practiceLessonUI='));
let checks=0;
for(const weapon of ['katana','bow','daggers','greatsword'])for(const fps of [30,60,120]){
 const game=new CampaignGame(()=>.4);game.enterTest(weapon,'executioner',true);game.enemyHp=game.enemyMax=999;game.testTempo='slow';game.testLevel=1;
 const practice={weapon,stage:0,last:null,readyAt:1},lessons={active:true,waiting:false,message:'',update(){}};
 vm.runInNewContext(update,{weaponPractice:practice,lessons,locale:'vi'});
 function run(stage){practice.stage=stage;lessons.waiting=false;practice.readyAt=game.time+1;let acted=false;
  for(let frame=0;frame<fps*20&&!lessons.waiting;frame++){
   const a=game.attack;
   if(a&&!a.resolved&&!game.action){if(weapon==='katana'&&!a.deflectAttempt&&a.impact-game.time<.2)game.deflect(1);
    else if(weapon==='bow'&&!game.bowSpent&&(game.time-a.start)/(a.impact-a.start)>.3)game.weaponAction();
    else if(weapon!=='katana'&&weapon!=='bow'&&game.time>=a.impact-.45)game.act('up');}
   if(weapon==='daggers'&&game.daggerWindow&&game.time>=game.daggerWindow.start)acted=game.weaponAction()||acted;
   if(weapon==='greatsword'&&stage===1&&game.heavyWindow)acted=game.weaponAction()||acted;
   game.update(1/fps);lessons.update(game);
  }
  assert(lessons.waiting,weapon+' stage '+stage+' at '+fps+' FPS');
  if(weapon==='daggers'||weapon==='greatsword'&&stage===1)assert(acted);
  checks++;
 }
 run(0);
 if(weapon==='greatsword')run(1);
 assert.equal(game.test,true);assert.equal(game.hp,3);
}
console.log('Weapon practice: '+checks+' stages passed at 30/60/120 FPS: Deflect, Interrupt, Follow-up, earn stance and spend stance.');
