const LESSONS=[
 {title:'1 · Né lên',hint:'Đòn quét hai lane dưới: chạm ↑ gần lúc đòn tới.',hits:[{family:'ranged',kind:'up',target:0}]},
 {title:'2 · Né xuống',hint:'Vũ khí giơ cao, quét hai lane trên: chạm ↓.',hits:[{family:'ranged',kind:'down',target:2}]},
 {title:'3 · Nhảy',hint:'Hai tay nâng rồi đập đất: chạm ◇. Né lên/xuống không tránh được.',hits:[{family:'melee',kind:'jump',target:1}]},
 {title:'4 · Đứng yên',hint:'Đòn nhắm lane trên, bạn ở giữa: không chạm. Đứng yên không nhận Perfect.',hits:[{family:'melee',kind:'melee',target:0}]},
 {title:'5 · Hai nhịp rồi phản công',hint:'Né đòn giữa, trở về giữa, rồi nhảy qua đập đất. Chỉ phản công sau cả chuỗi.',hits:[{family:'melee',kind:'melee',target:1},{family:'melee',kind:'jump',target:1}]}
];
class LessonController{
 constructor(){this.step=-1;this.last=null;this.readyAt=0;this.waiting=false;this.message='';}
 start(game){game.enterTest('bow','heavy_knight');game.enemyHp=game.enemyMax=999;game.testTempo='slow';this.step=0;this.last=null;this.waiting=false;this.readyAt=game.time+1;this.message='';}
 get active(){return this.step>=0;}
 update(game){if(!this.active)return;game.hp=3;
  if(game.lastCombo&&game.lastCombo!==this.last){this.last=game.lastCombo;this.waiting=game.lastCombo.clean;this.message=this.waiting?'Đúng! Chờ nhân vật phản công tự động, rồi sang bài tiếp.':'Chưa đúng · thử lại. Quan sát động tác trước khi chạm.';this.readyAt=game.time+2;}
  if(!this.waiting&&!game.attack&&!game.combo&&!game.action&&!game.counter&&!game.shots.some(s=>!s.hit)&&game.time>=this.readyAt){game.beginChain(LESSONS[this.step].hits.map(h=>({...h})));this.readyAt=game.time+5;}
 }
 next(game){if(!this.waiting||game.combo||game.action||game.counter||game.shots.some(s=>!s.hit))return false;this.step++;this.waiting=false;this.message='';this.readyAt=game.time+1;if(this.step===LESSONS.length){this.step=-1;game.feedback='Đã hoàn thành: né, nhảy, đứng yên và phản công sau combo.';}return true;}
 stop(){this.step=-1;this.waiting=false;}
}
if(typeof module!=='undefined')module.exports={LessonController,LESSONS};
