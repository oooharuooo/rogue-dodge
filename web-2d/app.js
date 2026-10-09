let rightHand=localStorage.getItem('rogue-preview-hand')!=='left';function readableText(ctx,text,x,y,stroke=false){ctx.save();ctx.translate(x,y);ctx.scale(1,1/(typeof arenaYScale==='undefined'?1:arenaYScale));if(rightHand){ctx.scale(-1,1);ctx.textAlign='right';}if(stroke)ctx.strokeText(translateText(text),0,0);else ctx.fillText(translateText(text),0,0);ctx.restore();}
const effects=new CombatFeedback();
let bowShot=-10,seenDodges=0,pendingCounter=false;const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),game=new CampaignGame();let auto=false,selfPlay=false,nextAttack=1,actorFrames={},previous=performance.now(),visualTime=0;
let heroRig=null; HeroRig.load().then(r=>{heroRig=r;heroRig.weapon=game.weapon;}).catch(e=>console.error(e)); const $=s=>document.querySelector(s);
async function assets(){try{await knightReady;$('#load-status').textContent='20 đối thủ sẵn sàng · CraftPix + trang phục mới';}catch(e){$('#load-status').textContent='Không tải được khung xương đối thủ. Hãy tải lại trang.';console.error(e);}}
assets();
function rounded(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function scene(){drawForestScene(ctx,canvas.height);}
function actor(role,x,feet,animation,clock){ctx.save();const hurt=role==='hero'?Math.max(0,1-(game.time-game.hurtTime)/.22):0;ctx.translate(x-6*hurt,feet);ctx.scale(1.15,1.15/arenaYScale);ctx.translate(-x,-feet);actorOriginal(role,x,feet,animation,clock);ctx.restore();}
function actorOriginal(role,x,feet,animation,clock){if(role==='hero'&&heroRig){heroRig.draw(ctx,x,feet,animation,clock);return;}let list=actorFrames[role+'_'+animation]||actorFrames[role+'_idle'];if(list?.length){let index=animation==='idle'?Math.floor(clock*20)%list.length:Math.min(list.length-1,Math.floor(clock/.9*list.length));let frame=list[index];let h=190,w=h*frame.width/frame.height;let anchor=animation==='slide'?172:158;ctx.save();if(role.startsWith('enemy')){ctx.translate(x,feet);ctx.scale(-1,1);ctx.drawImage(frame,-w/2,-anchor,w,h);}else ctx.drawImage(frame,x-w/2,feet-anchor,w,h);ctx.restore();return;}
 ctx.fillStyle=role==='hero'?'#347d8a':'#88566a';ctx.beginPath();ctx.arc(x,feet-76,20,0,Math.PI*2);ctx.fill();rounded(x-18,feet-60,36,50,8,ctx.fillStyle);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x-10,feet-12);ctx.lineTo(x-12,feet);ctx.moveTo(x+10,feet-12);ctx.lineTo(x+12,feet);ctx.stroke();}
function render(now){if(!heroRig||!knightRig){previous=now;ctx.fillStyle="#203f46";ctx.fillRect(0,0,960,canvas.height);ctx.fillStyle="#ecd8a6";ctx.font="28px system-ui";ctx.fillText("Đang tải nhân vật…",260,canvas.height/2);updateUI();mobileUI();updateTurnUI();updateProcUI();requestAnimationFrame(render);return;}let dt=Math.min(.05,(now-previous)/1000);previous=now;if(!paused)visualTime+=dt;if(!paused){game.update(dt);effects.update(game,dt);if(auto&&!lessons.active&&game.state==='combat'&&!game.attack&&!game.counter&&!game.shots.some(s=>!s.hit&&!s.followup)&&game.time>=nextAttack&&game.hp>0){if(game.begin(game.nextKind()))nextAttack=game.time+(game.isBoss?2.5:3);}
 if(selfPlay&&game.attack&&!game.attack.resolved&&!game.action&&game.time>=game.attack.impact-.45){const action=game.recommendedAction();if(action)game.act(action);}
 }if(heroRig){heroRig.weapon=game.weapon;heroRig.strikeTime=game.time;heroRig.bowOverlay=game.weapon==='bow'&&game.weaponMotion&&game.time<game.weaponMotion.end?game.time-game.weaponMotion.start:null;heroRig.hitSchedule=game.shots.filter(s=>!s.intercept&&!s.miss).map(s=>s.impact);if(game.weapon==='daggers'&&game.counter?.start!=null&&!game.counter.released)heroRig.hitSchedule=[.28,.37,.46].map(t=>game.counter.start+t);heroRig.technique=game.counter?game.weapon==='daggers'&&game.skills.cross_cut&&game.counter.perfect?'cross_cut':game.weapon==='greatsword'&&game.skills.fault_breaker&&game.counter.perfect&&(game.charge>=2||game.lastBonuses.some(b=>b.id==='fault_breaker'))?'fault_breaker':null:null;}if(!paused)autoDecisions();ctx.save();if(!effects.reduced&&effects.shake)ctx.translate((Math.random()-.5)*effects.shake,(Math.random()-.5)*effects.shake);ctx.fillStyle='#b5dfe2';ctx.fillRect(0,0,960,canvas.height);ctx.translate(rightHand?860:100,canvas.height-809.6);ctx.scale(rightHand?-.95:.95,.95);scene();ctx.restore();ctx.save();ctx.translate(rightHand?860:100,80);ctx.scale(rightHand?-.95:.95,.95*arenaYScale);ctx.strokeStyle='#ffffffa0';ctx.lineWidth=2;let a=game.attack,p=game.pose();telegraph(ctx,game,visualTime);
 if(p.kind==='up'&&p.progress<.35){ctx.strokeStyle='#fff4d8aa';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(70+i*20,553+p.offset+18);ctx.lineTo(70+i*20,553+Math.min(0,p.offset+65));ctx.stroke();}} if(p.kind!=='idle'){ctx.fillStyle='#f7efd7aa';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(90+(i-4)*10,558+p.offset+(i%3)*3,Math.max(1,5*(1-p.progress)),0,Math.PI*2);ctx.fill();}} ctx.fillStyle='#31575544';ctx.beginPath();ctx.ellipse(90,554+p.offset,40*(1-p.height/200),10,0,0,Math.PI*2);ctx.fill();let animation=p.kind==='idle'?'idle':p.kind==='jump'?(p.progress<.22?'jump_start':p.progress>.72?'fall':'jump_loop'):p.kind==='up'?'up':'slide';if(p.kind==='idle'&&(game.counter?.start!=null||game.weaponMotion&&game.time<game.weaponMotion.end)){animation={bow:'bow_attack',katana:'sword_attack',daggers:'dagger_attack',greatsword:'heavy_attack'}[game.weapon];}
if(game.state==='lost')animation='dying';else if(p.kind==='idle'&&game.time-game.hurtTime<.3)animation='hurt';
const recentHit=game.damageEvents.find(e=>game.time-e.time<.3);
let enemyAnimation=game.enemyHp<=0?'dying':recentHit?'hurt':a?(a.kind==='jump'?'slide':a.kind==='down'?'jump_start':'attack'):'idle';
let enemyClock=game.enemyHp<=0?Math.min(.9,game.time-game.deathTime):recentHit?game.time-recentHit.time:a?Math.min(.9,(game.time-a.start)/(a.impact-a.start)*.9):visualTime;
if(!BEAST_IDS.includes(game.enemyId)&&(game.attack?.family==='melee'||(!game.attack&&game.lastCombo?.results.at(-1)?.family==='melee')))drawCloseEncounter(ctx,game);else drawEncounter(ctx,game,enemyAnimation,enemyClock);const motionStart=game.weaponMotion&&game.time<game.weaponMotion.end?game.weaponMotion.start:game.counter?.start;const strikeAge=motionStart==null?-1:game.time-motionStart;const lunge=(game.weapon==='daggers'&&typeof weaponHeroPosition==='function'?weaponHeroPosition(game,strikeAge):counterPosition(strikeAge,game.weapon))-ARENA.heroX;actor('hero',90+lunge,554+p.offset-p.height,animation,animation==='dying'?game.time-game.lossTime:animation==='hurt'?game.time-game.hurtTime:['bow_attack','sword_attack','dagger_attack','heavy_attack'].includes(animation)?game.time-motionStart:p.kind==='idle'?visualTime:game.time-game.action.start);
for(const shot of game.shots){if(shot.hit||game.weapon!=='bow')continue;const progress=Math.max(0,Math.min(1,(game.time-shot.start)/(shot.impact-shot.start))),arrowX=120+((game.visualAnchor?.x||710)-120+(shot.miss?55:0))*progress,arrowY=((shot.originY??554+p.offset-p.height)-37/arenaYScale)+(((game.visualAnchor?.y||554)-37/arenaYScale)-((shot.originY??554+p.offset-p.height)-37/arenaYScale)+(shot.miss?30/arenaYScale:0))*progress;ctx.strokeStyle='#604b35';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(arrowX-35,arrowY);ctx.lineTo(arrowX,arrowY);ctx.stroke();ctx.fillStyle='#78dce3';ctx.beginPath();ctx.moveTo(arrowX+8,arrowY);ctx.lineTo(arrowX-2,arrowY-5/arenaYScale);ctx.lineTo(arrowX-2,arrowY+5/arenaYScale);ctx.fill();}

strikeArt(ctx,game,strikeAge);
if(false&&game.weapon!=='bow'&&strikeAge>.18&&strikeAge<.65){ctx.strokeStyle='#e8f4ffaa';ctx.lineWidth=8;ctx.beginPath();ctx.arc(770,355,65,-1.5,1.2);ctx.stroke();}

 const enemyHit=game.damageEvents.some(e=>game.time-e.time<.18);
 // Impact marks stay local to the enemy; no rectangular flash over the tell.
 for(const event of game.damageEvents){const age=game.time-event.time;ctx.save();ctx.globalAlpha=Math.max(0,1-age/1.2);ctx.font='bold 32px system-ui';ctx.fillStyle=event.perfect?'#ffdf75':'#fff';ctx.strokeStyle='#553c2e';ctx.lineWidth=4;readableText(ctx,'-'+event.damage,game.visualAnchor?.x||710,(game.visualAnchor?.y||552)-(145+age*50)/arenaYScale,true);readableText(ctx,'-'+event.damage,game.visualAnchor?.x||710,(game.visualAnchor?.y||552)-(145+age*50)/arenaYScale);ctx.restore();}
 effects.draw(ctx,game);drawSkills(ctx,game);ctx.restore();
 updateUI();mobileUI();updateTurnUI();updateProcUI();
 $('#health').textContent='♥ '.repeat(game.hp)+'♡ '.repeat(3-game.hp);$('#score').textContent='Né '+game.dodged;$('#feedback').textContent=!['combat','won','lost','test-won'].includes(game.state)?'':game.attack&&!game.attack.resolved?'':game.hp<=0?'Tập tiếp':game.feedback;$('#cue').textContent='Quan sát tư thế boss';$('#fill').style.width=(a?Math.min(100,(game.time-a.start)/(a.impact-a.start)*100):0)+'%';document.querySelectorAll('[data-action]').forEach(b=>b.disabled=!!game.action||game.counter?.start!=null||game.hp<=0||game.state!=='combat');requestAnimationFrame(render);}
window.addEventListener("load",()=>requestAnimationFrame(render),{once:true});





 




const weaponCards=$('#weapon-cards'),stateCards=$('#state-cards');let panelSignature='';
function button(text,description,fn){const b=document.createElement('button');b.textContent=text;if(description){const small=document.createElement('small');small.textContent=description;b.append(small);}b.onclick=fn;return b;}
function selectOptions(selector,catalog){for(const [id,data]of Object.entries(catalog)){const option=document.createElement('option');option.value=id;option.textContent=data.name;$(selector).append(option);}}
selectOptions('#test-weapon',WEAPONS);selectOptions('#test-enemy',ENEMIES);selectOptions('#test-boss',BOSSES);selectOptions('#test-skill',SKILLS);
for(const [id,data]of Object.entries(WEAPONS)){const card=button('', '',()=>{game.weapon=id;$('#test-weapon').value=id;panelSignature='';});card.innerHTML='<span class=weapon-choice-icon>'+weaponIcon(id)+'</span><strong class=weapon-choice-name>'+weaponLabel(id)+'</strong>';card.setAttribute('aria-label',weaponLabel(id));card.classList.add('weapon-select');card.dataset.weapon=id;const choice=document.createElement('div');choice.className='weapon-choice';const detail=document.createElement('button');detail.className='weapon-guide';detail.textContent='Chi tiết';detail.dataset.weaponGuide=id;detail.setAttribute('aria-label','Chi tiết '+weaponLabel(id));detail.onclick=()=>showWeaponGuide(id);choice.append(card,detail);weaponCards.append(choice);}
function syncToggles(){$('#auto').textContent='Enemy tự đánh: '+(auto?'ON':'OFF');$('#self-play').textContent='Tự chơi: '+(selfPlay?'ON':'OFF');}
function startRun(){game.start(game.weapon);auto=true;nextAttack=game.time+.4;panelSignature='';syncToggles();}
$('#start').onclick=startRun;$('#resume').onclick=()=>{if(game.resume()){auto=true;nextAttack=game.time+.4;syncToggles();}};
$('#home').onclick=()=>{auto=false;selfPlay=false;game.test=false;$('#test-panel').hidden=true;game.reset();syncToggles();};
$('#reset').onclick=()=>{if(game.test)game.enterTest(game.weapon,game.enemyId,game.isBoss);else startRun();nextAttack=game.time+.4;};
$('#auto').onclick=()=>{auto=!auto;nextAttack=game.time+.4;syncToggles();};
$('#self-play').onclick=()=>{selfPlay=!selfPlay;if(selfPlay){auto=true;if(['menu','won','lost'].includes(game.state))startRun();nextAttack=game.time+.4;}syncToggles();};
$('#collection-toggle').onclick=()=>{openMastery();};
$('#test-toggle').onclick=()=>{const open=$('#test-panel').hidden;$('#test-panel').hidden=!open;if(open){selfPlay=false;game.enterTest($('#test-weapon').value,$('#test-enemy').value);game.testLevel=+$('#test-mastery').value;game.testTempo=$('#test-tempo').value;auto=false;}else{auto=false;selfPlay=false;game.test=false;game.reset();}syncToggles();};
function spawn(boss){game.enterTest($('#test-weapon').value,$(boss?'#test-boss':'#test-enemy').value,boss);game.testLevel=+$('#test-mastery').value;game.testTempo=$('#test-tempo').value;nextAttack=game.time+.4;}
$('#spawn-enemy').onclick=()=>spawn(false);$('#spawn-boss').onclick=()=>spawn(true);
$('#test-weapon').onchange=()=>{if(game.test){game.weapon=$('#test-weapon').value;game.attack=null;game.combo=null;game.action=null;game.counter=null;game.shots=[];game.aim=game.charge=game.bank=game.flow=game.perfects=0;}};
$('#test-mastery').onchange=()=>{if(game.test)game.testLevel=+$('#test-mastery').value;};
$('#test-apply-skill').onclick=()=>{if(game.test){const id=$('#test-skill').value;game.skills[id]=+$('#test-skill-level').value;if(id==='guardian')game.shield=1;}};
$('#test-refill').onclick=()=>{if(game.test){game.hp=3;if(game.state==='lost')spawn(game.isBoss);}};
document.querySelectorAll('[data-action]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(!paused)game.act(b.dataset.action)});
document.querySelectorAll('[data-cue]').forEach(b=>b.onclick=()=>{if(game.test){auto=false;syncToggles();game.beginSingle(b.dataset.cue);}});
document.addEventListener('keydown',e=>{if(paused||e.repeat||document.activeElement.closest('[data-term],#active-build')||['SELECT','INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;const action={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'jump'}[e.key];if(action){e.preventDefault();game.act(action);}});
function collectionUI(){renderCollection();}
function availableSkills(){return Object.keys(SKILLS).filter(id=>eligibleExtra(game,id)&&(game.unlocked(id)||game.skills[id])&&(game.skills[id]||0)<2&&(game.state!=='shrine'||game.skills[id]));}
function autoDecisions(){if(!selfPlay)return;if(game.state==='event')game.chooseEvent('safe');if(game.state==='starter'){game.selectSkill(game.offerSkills(availableSkills())[0]);}else if(game.state==='route'){const ids=game.availableNodes();if(ids)game.selectNode(ids.includes('rest')?'rest':ids[0]);}else if(['reward','shop','shrine'].includes(game.state)&&(!game.deathTime||game.time-game.deathTime>1.2)){const id=game.offerSkills(availableSkills())[0];if(!id||!game.selectSkill(id))game.skip();}}
function updateUI(){
 $('#mode-label').textContent=game.test?'TEST · không ghi tiến trình':'DUNGEON · tầng '+(game.floor+1)+'/'+game.route.length;$('#menu-panel').hidden=game.state!=='menu';$('#resume').hidden=!game.savedRun;$('#save-summary').textContent=`Gold ${game.meta.gold} · ${game.meta.wins} lần thắng dungeon`;
 const stateText=game.weaponRulesVersion?`Sức bền ${game.stamina}/${game.staminaMax} · ${WEAPONS[game.weapon].state}`:game.weapon==='bow'?`Aim ${game.aim}/2`:game.weapon==='greatsword'?`Charge ${game.charge}/${game.level>=2?3:2}`:game.weapon==='daggers'?`Hit bank ${game.bank}/4`:`Perfect ${game.perfects}`;
 $('#combat-stats').textContent=`${WEAPONS[game.weapon].name} • Normal ${game.damage(false)} / Perfect ${game.damage(true)} • Damage vừa gây ${game.lastDamage||'—'} • ${stateText} • Flow ${game.flow} • Shield ${game.shield} • Proc: ${game.lastBonuses.map(b=>b.text).join(', ')||'—'}`;
 $('#meta-stats').textContent=`Mastery Lv.${game.level} · ${game.meta.xp[game.weapon]} XP · Gold ${game.meta.gold}${game.test?' · TEST không ghi XP/Gold':''} · Skill: ${Object.entries(game.skills).map(([id,l])=>SKILLS[id].name+' '+l).join(', ')||'chưa có'}`;
 const show=['starter','route','event','reward','shop','shrine','won','lost','test-won'].includes(game.state);$('#state-panel').hidden=!show;
 const signature=game.state+game.floor+game.bossId+JSON.stringify(game.skills)+game.meta.gold+game.weapon;
 if(show&&signature!==panelSignature){panelSignature=signature;stateCards.replaceChildren();const titles={starter:'Chọn skill khởi đầu',route:'Chọn đường · tầng '+(game.floor+1),reward:'Thắng encounter · chọn skill',shop:'Shop · chọn một món, 2 Gold',shrine:'Shrine · nâng cấp skill đang có',won:'Chiến thắng dungeon',lost:'Lượt chơi kết thúc','test-won':'Test hoàn thành'};$('#state-title').textContent=titles[game.state];$('#state-desc').textContent=['won','lost'].includes(game.state)?`${game.dodged} lần né · ${game.totalDamage} damage · ${game.runXP} XP · ${game.runGold} Gold nhận được · Đường: ${game.log.map(id=>ENEMIES[id]?.name||({rest:'Rest',shrine:'Shrine',shop:'Shop',event:'Sự kiện',treasure:'Kho báu',camp:'Trại trước boss',boss:BOSSES[game.bossId].name}[id])).join(' → ')}`:game.state==='test-won'?'Không ghi tiến trình. Chọn enemy/boss khác ở Test Mode.':'';
 if(false&&game.state==='route')for(const id of ROUTE[game.floor]||[]){if(id==='boss'){for(const [boss,data]of Object.entries(BOSSES))stateCards.append(button(data.name,`${data.phases} phase · ${data.hp} HP`,()=>{game.bossId=boss;game.selectNode('boss');}));continue;}const name=ENEMIES[id]?.name||{rest:'Rest · hồi 1 HP',shrine:'Shrine · nâng cấp skill',shop:'Shop · mua skill',boss:BOSSES[game.bossId].name}[id];stateCards.append(button(name,id==='duelist'?'Elite · 4 Gold':id==='boss'?'Boss · nhiều phase':'',()=>game.selectNode(id)));}
 if(['starter','reward','shop','shrine'].includes(game.state)){for(const id of game.offerSkills(availableSkills())){const next=(game.skills[id]||0)+1,b=button(SKILLS[id].name+' Lv.'+next,SKILLS[id].desc[next-1],()=>{game.selectSkill(id);collectionUI();});b.disabled=game.state==='shop'&&game.meta.gold<2;stateCards.append(b);}if(game.state!=='starter')stateCards.append(button('Bỏ qua','',()=>game.skip()));}
 if(['won','lost'].includes(game.state))stateCards.append(button('Lượt mới','Giữ mastery và Gold',startRun));
 if(game.state==='test-won')stateCards.append(button('Thử lại','Test Mode · không ghi tiến trình',()=>spawn(game.isBoss)));
 }
 weaponCards.querySelectorAll('.weapon-select').forEach(b=>{const selected=b.dataset.weapon===game.weapon;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));const label=weaponLabel(b.dataset.weapon);if(b.querySelector('.weapon-choice-name').textContent!==label)b.querySelector('.weapon-choice-name').textContent=label;b.setAttribute('aria-label',label);});if(!$('#collection-panel').hidden)collectionUI();renderSkillDraft();
}


if(window.REVIEW_VIEW){const view=window.REVIEW_VIEW;if(['tools','combat','weapons','enemy','boss'].includes(view)){
 $('#test-panel').hidden=false;const weapon=view==='weapons'?'daggers':'bow';$('#test-weapon').value=weapon;game.enterTest(weapon,view==='boss'?'executioner':view==='enemy'?'dread_wolf':'swordsman',view==='boss');game.enemyMax=game.enemyHp=50;if(view==='boss'){game.testFamily='mixed';game.testLength=3;$('#test-family').value='mixed';$('#test-length').value='3';game.enemyHp=24;}auto=true;selfPlay=true;nextAttack=game.time+.4;syncToggles();
}else if(view==='dungeon'){startRun();game.selectSkill('focus');}else if(view==='skills'){openMastery();}else if(view==='ui'){openMastery();document.querySelector('details').open=true;}}



document.addEventListener('pointerdown',()=>effects.unlock());document.addEventListener('keydown',()=>effects.unlock());
$('#sound').onclick=()=>{effects.enabled=!effects.enabled;localStorage.setItem('rogue-audio',effects.enabled?'on':'off');$('#sound').textContent='Âm thanh: '+(effects.enabled?'ON':'OFF');effects.unlock();};
$('#sound').textContent='Âm thanh: '+(effects.enabled?'ON':'OFF');$('#volume').value=effects.volume;
$('#volume').oninput=e=>{effects.volume=+e.target.value;localStorage.setItem('rogue-volume',effects.volume);};
const pauseButton=$('#pause');let paused=false;pauseButton.onclick=()=>{paused=!paused;pauseButton.textContent=paused?'Tiếp tục':'Tạm dừng';};

function applyTestRules(){if(game.test){game.testFamily=$('#test-family').value;game.testLength=+$('#test-length').value;game.combo=null;game.attack=null;game.action=null;game.counter=null;game.shots=[];nextAttack=game.time+.8;}}
$('#test-family').onchange=applyTestRules;$('#test-length').onchange=applyTestRules;

if(window.REVIEW_VIEW==='skill-procs'){$('#test-panel').hidden=false;game.enterTest('katana','heavy_knight');game.testLevel=3;game.enemyMax=game.enemyHp=50;game.skills={flame_counter:1,momentum:1,bloodlust:1,guardian:1,focus:1};game.shield=1;auto=selfPlay=true;nextAttack=game.time+.8;syncToggles();}

if(window.REVIEW_VIEW==='tools'){paused=true;$('#drawer').showModal();}
