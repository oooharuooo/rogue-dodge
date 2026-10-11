(()=>{
 const shapes={supplies:'<path d="M10 16h20l4 20H6z" fill="#bd9364"/><path d="M14 16v-5h12v5M8 25h24"/><path d="M17 22h6v10h-6z" fill="#f0d89d"/>',shield:'<path d="M20 5l14 6v12c0 8-8 13-14 16C14 36 6 31 6 23V11z" fill="#9db7bf"/><path d="M20 10v23M11 15h18"/>',victorymarks:'<path d="M20 3l5 6 8 1 1 8 4 6-7 5-3 8-8-2-8 2-3-8-7-5 4-6 1-8 8-1z" fill="#cbaa64"/><path d="M13 25l7-13 7 13-7-3z" fill="#29474b"/>',xp:'<path d="M20 4l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#81b9ae"/>'};
 function badge(term,value){const b=document.createElement('button');b.className='resource-badge';b.dataset.term=term;b.setAttribute('aria-label',(TERM_HELP[term]?.label||term)+' '+value);b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="#f3ddb0" stroke-width="2" stroke-linejoin="round">'+shapes[term]+'</svg><span>'+value+'</span>';return b;}
 function wallet(root){root.replaceChildren(badge('hp',game.hp+'/3'),badge('supplies',game.supplies),badge('shield',game.shield));root.firstChild.querySelector('svg').innerHTML='<path d="M20 34C-3 19 10 2 20 14 30 2 43 19 20 34" fill="#ed9c8c"/>';}
 const shield=badge('shield',1);shield.id='shield-50';$('#hero-combat-hud').append(shield);
 const oldMobile=mobileUI;mobileUI=function(){oldMobile();$('#gold-label').replaceChildren(badge('supplies',game.supplies));};
 const oldDraft=renderSkillDraft;let rewardKey='';
 renderSkillDraft=function(){oldDraft();const compact=game.state==='reward'&&game.rewardKind==='combat';$('#skill-dialog').classList.toggle('simple-reward',compact);if(!compact){rewardKey='';if(game.state==='reward'&&game.rewardKind==='boss')$('#draft-cards').querySelectorAll('.run-loot').forEach((card,i)=>{if(card.querySelector('.resource-badge'))return;const value=card.querySelector('b')?.textContent||'0';card.replaceChildren(badge(i?'xp':'victorymarks',value));});return;}
 if(!$('#skill-dialog').open)return;
 const key=game.runId+':'+game.floor+':'+locale+':'+game.supplies;if(key===rewardKey&&$('#draft-cards .reward-icons'))return;rewardKey=key;
 $('#draft-kicker').textContent=buildText('Đã nhận','Received');$('#draft-detail').textContent='';
 const root=$('#draft-cards');root.replaceChildren();const loot=document.createElement('div');loot.className='reward-icons';loot.append(badge('supplies','+2'),badge('xp','+'+(game.lastMasteryReward?.amount||0)));root.append(loot);
 const label=document.createElement('p');label.className='reward-progress-label';label.textContent=weaponLabel(game.weapon)+' · '+buildText('Hành trình','Journey')+' '+Math.min(game.floor+1,game.route.length)+' / '+game.route.length;
 const progress=document.createElement('progress');progress.max=game.route.length;progress.value=Math.min(game.floor+1,game.route.length);progress.setAttribute('aria-label',buildText('Tiến trình dungeon','Dungeon progress'));root.append(label,progress);
 };
 const oldEvent=renderEventDialog;renderEventDialog=function(){oldEvent();if(!eventDialog.open)return;eventDialog.classList.add('traveler-50');const w=eventDialog.querySelector('.event-wallet');if(w&&w.dataset.wallet!==game.hp+':'+game.supplies+':'+game.shield){w.dataset.wallet=game.hp+':'+game.supplies+':'+game.shield;wallet(w);}
 const icons=eventDialog.querySelectorAll('.event-choice-icon');icons.forEach((n,i)=>{if(n.dataset.painted)return;n.dataset.painted='true';if(i===2)n.innerHTML=badge('shield', '').querySelector('svg').outerHTML;});};
 const oldUI=updateUI;updateUI=function(){oldUI();shield.hidden=!game.shield||game.state!=='combat';const summary=$('#save-summary');if(summary&&!summary.querySelector('.resource-badge'))summary.replaceChildren(badge('victorymarks',game.meta.victoryMarks));};
 const image=new Image();image.src='backgrounds/forest-normal-50.png';const oldScene=scene;
 scene=function(){if(game.dungeonId===2||!image.complete||!image.naturalWidth){oldScene();return;}ctx.save();ctx.setTransform(1,0,0,1,0,0);const scale=Math.max(canvas.width/image.width,canvas.height/image.height),w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);ctx.restore();};
})();
