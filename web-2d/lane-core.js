(function(root){
class LaneGame {
  constructor(){this.reset();}
  reset(){this.time=0;this.action=null;this.attack=null;this.hp=3;this.dodged=0;this.hits=0;this.feedback='Chọn đòn để tập, hoặc bật Auto';}
  begin(kind){if(this.attack||this.hp<=0)return false;this.attack={kind,start:this.time,impact:this.time+1.2,resolved:false};this.feedback=kind==='jump'?'QUÉT THẤP — JUMP':kind==='up'?'PHỦ GIỮA + DƯỚI — UP':'PHỦ GIỮA + TRÊN — DOWN';return true;}
  act(kind){if(this.action||this.hp<=0)return false;this.action={kind,start:this.time};return true;}
  pose(at=this.time){if(!this.action)return {kind:'idle',progress:0,offset:0,height:0};let p=(at-this.action.start)/.9;if(p>=1||p<0)return {kind:'idle',progress:0,offset:0,height:0};let envelope=Math.sin(Math.PI*p);if(this.action.kind==='up'){const ease=t=>t*t*(3-2*t);envelope=p<.25?ease(p/.25):p<.55?1:1-ease((p-.55)/.45);}return {kind:this.action.kind,progress:p,offset:this.action.kind==='up'?-95*envelope:this.action.kind==='down'?95*envelope:0,height:this.action.kind==='jump'?135*envelope:this.action.kind==='up'?40.5*Math.sin(Math.PI*p):0};}
  update(dt){let next=this.time+dt;if(this.attack&&!this.attack.resolved&&next>=this.attack.impact){let p=this.pose(this.attack.impact), k=this.attack.kind;let success=p.progress>=.28&&p.progress<=.72&&p.kind===k&&(k==='jump'?p.height>=85:Math.abs(p.offset)>=70);this.attack.resolved=true;if(success){this.dodged++;this.feedback='NÉ ĐÚNG • trở về giữa';}else{this.hp--;this.hits++;this.feedback='TRÚNG ĐÒN • chọn đúng hướng và đúng nhịp';}}
    this.time=next;if(this.action&&this.time-this.action.start>=.9)this.action=null;if(this.attack&&this.time-this.attack.impact>.6)this.attack=null;}
}
if(typeof module!=='undefined')module.exports=LaneGame;else root.LaneGame=LaneGame;
})(typeof window!=='undefined'?window:globalThis);


