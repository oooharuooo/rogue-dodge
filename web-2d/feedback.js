// Local synthesized audio: no downloads, tracking or autoplay.
class CombatFeedback {
 constructor(){this.enabled=localStorage.getItem('rogue-audio')!=='off';this.volume=Number(localStorage.getItem('rogue-volume')||.25);this.ctx=null;this.particles=[];this.last={};this.shake=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 unlock(){if(!this.enabled)return;try{this.ctx ||= new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch{}}
 tone(freq,duration=.09,type='sine',gain=1){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.6),t+duration);g.gain.setValueAtTime(Math.max(.0001,this.volume*.15*gain),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration);}
 burst(x,y,color,n=12){if(this.reduced)return;for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*180,vy:-Math.random()*170,age:0,color});this.particles=this.particles.slice(-140);}
 update(game,dt){const l=this.last;if(game.time<(l.time||0))this.last={};const prev=this.last;
 if(game.action&&game.action.start!==prev.action){this.tone(game.action.kind==='jump'?540:380,.1,'triangle');this.burst(300,420,'#f6efdc',8);prev.action=game.action.start;}
 if(game.attack&&game.attack.start!==prev.attack){this.tone(190,.12,'sine',.5);prev.attack=game.attack.start;}
 if(game.dodged>(prev.dodged??game.dodged)){this.tone(game.counter?.perfect?880:650,.12,'sine');this.burst(300,350,game.counter?.perfect?'#ffe08b':'#a6ece5');}
 if(game.totalDamage>(prev.damage??game.totalDamage)){this.tone(game.weapon==='bow'?640:game.weapon==='greatsword'?110:260,.14,'triangle');this.burst(735,345,'#ffdf8a',20);this.shake=game.weapon==='greatsword'?5:2;}
 if(game.hp<(prev.hp??game.hp)){this.tone(100,.2,'sawtooth',.5);this.burst(300,350,'#e77d6e');this.shake=5;}
 if(['won','test-won'].includes(game.state)&&game.state!==prev.state){this.tone(780,.35,'triangle');}
 prev.time=game.time;prev.hp=game.hp;prev.damage=game.totalDamage;prev.dodged=game.dodged;prev.state=game.state;
 this.shake=Math.max(0,this.shake-dt*25);for(const p of this.particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*230;}this.particles=this.particles.filter(p=>p.age<.55);
 }
 draw(ctx){for(const p of this.particles){ctx.globalAlpha=1-p.age/.55;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
}
