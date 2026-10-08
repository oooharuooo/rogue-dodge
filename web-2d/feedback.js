function attackSoundCue(a){if(a.kind==='jump')return {freq:90,duration:.28,type:'sawtooth',bell:true};const lane=a.family==='melee'?a.target:a.kind==='up'?2:0;return {freq:[620,350,170][lane],duration:.16,type:lane===1?'square':'triangle'};}

function enemySoundProfile(id,attack,style={}){
 if(['iron_bear','elder_bear'].includes(id))return 'bear-claw';
 if(['dread_wolf','frost_wolf'].includes(id))return 'claw';
 if(attack.family==='ranged'||style.weapon==='staff'||style.family==='mage')return 'magic';
 if(['hammer','fist'].includes(style.weapon)||['hammer','fist'].includes(style.family))return 'heavy';
 if(style.weapon==='axe')return 'axe';return 'blade';
}
// Sampled production cues; synthesis retained only for unselected UI notifications.
class CombatFeedback {
 constructor(){this.enabled=localStorage.getItem('rogue-audio')!=='off';this.volume=Number(localStorage.getItem('rogue-volume')||.25);this.ctx=null;this.particles=[];this.last={};this.shake=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 unlock(){if(!this.enabled)return;try{this.ctx ||= new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});if(typeof GameAudio!=="undefined"&&!this.audio){this.audio=new GameAudio(this.ctx);this.audio.preload();}this.bearLoad ||= fetch('audio/bear-claw.wav').then(r=>{if(!r.ok)throw new Error('Bear audio unavailable');return r.arrayBuffer()}).then(b=>this.ctx.decodeAudioData(b)).then(b=>{this.bearBuffer=b}).catch(()=>{this.bearLoad=null});}catch{}}
 tone(freq,duration=.09,type='sine',gain=1){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.6),t+duration);g.gain.setValueAtTime(Math.max(.0001,this.volume*.15*gain),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+duration);}
 noise(duration=.2,frequency=1500,gain=.6,delay=0,type='bandpass'){
 if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx;
 if(!this.noiseBuffer){this.noiseBuffer=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=this.noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
 const source=c.createBufferSource(),filter=c.createBiquadFilter(),amp=c.createGain(),t=c.currentTime+delay;source.buffer=this.noiseBuffer;filter.type=type;filter.Q.value=.7;filter.frequency.setValueAtTime(frequency,t);filter.frequency.exponentialRampToValueAtTime(Math.max(70,frequency*.35),t+duration);amp.gain.setValueAtTime(.0001,t);amp.gain.linearRampToValueAtTime(this.volume*.3*gain,t+.015);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(amp);amp.connect(c.destination);source.start(t);source.stop(t+duration+.01);
 }
 swipe(kind){if(!this.enabled)return;if(typeof GameAudio!=='undefined'){this.audio?.sample('dodge',this.volume*.7);return;}this.noise(kind==='jump'?.3:.18,kind==='jump'?1100:1700,.65);}
 land(){if(!this.enabled)return;if(typeof GameAudio!=='undefined'){this.audio?.sample('land',this.volume*.7);return;}this.noise(.17,350,.55,0,'lowpass');this.tone(95,.1,'sine',.45);}
 weaponSound(profile){
 if(typeof GameAudio!=='undefined'){const v=this.volume,a=this.audio;if(!this.enabled)return;
  if(profile==='bear-claw')a?.sample('bear',v*.72);
  else if(profile==='claw'){a?.sample('swing',v*.35);a?.sample('claw',v*.55,.025);}
  else if(profile==='blade'||profile==='axe'){a?.sample('swing',v*.45);a?.sample('blade',v*.35,.035);}
  else if(profile==='heavy'){a?.sample('heavy',v*.6);a?.sample('rock',v*.4,.045);}
  else if(profile==='magic'){a?.sample('earth',v*.3);a?.sample('swing',v*.3);}
  else if(profile==='bow'){a?.sample('cloth',v*.3);a?.sample('swing',v*.35);}
  return;
 }
 if(profile==='bear-claw'){if(!this.enabled||!this.ctx||this.ctx.state!=='running'||!this.bearBuffer)return;const s=this.ctx.createBufferSource(),g=this.ctx.createGain();s.buffer=this.bearBuffer;g.gain.value=this.volume*.72;s.connect(g).connect(this.ctx.destination);s.start();}
 else if(profile==='claw'){for(let i=0;i<2;i++)this.noise(.13,2500-i*500,.9,i*.065);}
 else if(profile==='blade'||profile==='axe'){this.noise(.17,profile==='axe'?950:2400,.7);for(const f of (profile==='axe'?[420,1160]:[1200,3310]))this.tone(f,.19,'sine',.4);}
 else if(profile==='heavy'){this.noise(.25,480,.9,0,'lowpass');this.tone(75,.2,'sine',1);}
 else if(profile==='magic'){this.noise(.38,2300,.6);this.tone(240,.38,'sawtooth',.25);this.tone(720,.32,'sine',.35);}
 else if(profile==='bow'){this.noise(.15,3100,.5);this.tone(220,.08,'triangle',.25);}
 }
 bell(){if(typeof GameAudio!=='undefined'){if(this.enabled)this.audio?.sample('bell',this.volume*.18);return;}if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const a=new Audio('audio/slam-cue.ogg');a.volume=Math.min(1,this.volume*.18);a.play().catch(()=>{});}
 quake(){if(typeof GameAudio!=='undefined'){if(this.enabled){this.audio?.sample('earth',this.volume*.6);this.audio?.sample('rock',this.volume*.65,.04);}return;}if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;this.tone(65,.5,'sine',2);const c=this.ctx,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*.65),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/data.length*4);const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=900;gain.gain.value=this.volume*.4;source.connect(filter);filter.connect(gain);gain.connect(c.destination);source.start();for(const freq of [180,260,380])this.tone(freq,.24,'triangle',.7);}
 burst(x,y,color,n=12){if(this.reduced)return;for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*180,vy:-Math.random()*170,age:0,color});this.particles=this.particles.slice(-140);}
 update(game,dt){const l=this.last;if(game.time<(l.time||0))this.last={};const prev=this.last;
 if(game.action&&game.action.start!==prev.action){this.swipe(game.action.kind);if(game.action.kind==='jump')prev.landing=game.action.start+.9;this.burst(90,552,'#f6efdc',8);prev.action=game.action.start;}
 if(game.attack&&game.attack.start!==prev.attack){const cue=attackSoundCue(game.attack);prev.attack=game.attack.start;}
 if(prev.landing!=null&&game.time>=prev.landing){this.land();prev.landing=null;}
 if(game.attack?.kind==='jump'&&game.time>=game.attack.start+(game.attack.impact-game.attack.start)*.12&&prev.slamCue!==game.attack.start){this.bell();prev.slamCue=game.attack.start;}
 if(game.attack&&game.attack.kind!=='jump'&&game.time>=game.attack.start+(game.attack.impact-game.attack.start)*.7&&prev.release!==game.attack.start){const style=typeof ENCOUNTER_STYLES!=='undefined'?ENCOUNTER_STYLES[game.enemyId]||{}:{};this.weaponSound(enemySoundProfile(game.enemyId,game.attack,style));prev.release=game.attack.start;}
 if(game.attack?.kind==='jump'&&game.time>=game.attack.impact&&prev.slamImpact!==game.attack.impact){this.quake();this.shake=this.reduced?0:6;prev.slamImpact=game.attack.impact;}
 const resolved=game.combo?.results||game.lastCombo?.results||[];for(const result of resolved){const key=result.impact+':'+result.index;if(prev.verdict!==key&&game.time-result.impact<.15){if(this.enabled&&this.audio)this.audio.sample(result.perfect?'blade':'cloth',this.volume*(result.perfect?.16:.1),0,result.perfect?1.65:1);prev.verdict=key;}}
 if(game.dodged>(prev.dodged??game.dodged)){this.burst(90,482,game.counter?.perfect?'#ffe08b':'#a6ece5');}
 if(game.totalDamage>(prev.damage??game.totalDamage)){if(game.damageEvents.at(-1)?.element){if(this.enabled)this.audio?.sample('earth',this.volume*.12);}else this.weaponSound(game.weapon==='bow'?'bow':game.weapon==='greatsword'?'heavy':'blade');this.burst(game.visualAnchor?.x||710,(game.visualAnchor?.y||552)-70/(typeof arenaYScale==='undefined'?1:arenaYScale),'#ffdf8a',10);this.shake=game.weapon==='greatsword'?5:2;}
 if(game.hp<(prev.hp??game.hp)){if(this.enabled&&this.audio){this.audio.sample('cloth',this.volume*.3);this.audio.sample('land',this.volume*.2);}else this.noise(.18,550,.5,0,'lowpass');const p=game.pose();this.burst(90,554+p.offset-p.height-70/(typeof arenaYScale==='undefined'?1:arenaYScale),'#e77d6e',8);this.shake=3;}
 if(['won','test-won'].includes(game.state)&&game.state!==prev.state){if(this.enabled)this.audio?.sample('cloth',this.volume*.2);}
 for(const e of game.skillEvents||[]){const key=e.id+':'+e.time;if(!prev.skills)prev.skills=new Set();if(!prev.skills.has(key)){if(this.enabled)this.audio?.sample('cloth',this.volume*.18);prev.skills.add(key);}}if(prev.skills?.size>40)prev.skills=new Set();
 prev.time=game.time;prev.hp=game.hp;prev.damage=game.totalDamage;prev.dodged=game.dodged;prev.state=game.state;
 this.shake=Math.max(0,this.shake-dt*25);for(const p of this.particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*230;}this.particles=this.particles.filter(p=>p.age<.55);
 }
 draw(ctx,game){const tell=game?.attack&&!game.attack.resolved&&game.time<game.attack.impact,anchor=game?.visualAnchor;for(const p of this.particles){if(tell&&anchor&&Math.abs(p.x-anchor.x)<110&&Math.abs(p.y-anchor.y)<180)continue;ctx.globalAlpha=1-p.age/.55;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
}

if(typeof module!=='undefined')module.exports={attackSoundCue,enemySoundProfile,CombatFeedback};

