const runDraft=renderSkillDraft;
renderSkillDraft=function(){
 if(game.state!=='reward'||game.rewardKind!=='boss')return runDraft();
 const dialog=$('#skill-dialog');$('#state-panel').classList.add('draft-behind');
 if(game.deathTime!=null&&game.time-game.deathTime<.9)return;
 const signature='run-boss:'+game.runId+':'+locale;
 if(draftSignature!==signature){draftSignature=signature;draftSelected=null;buildSlots.hidden=starterOption.hidden=true;$('#draft-supplies').hidden=$('#draft-skip').hidden=true;
  $('#draft-title').textContent=buildText('Hoàn thành dungeon','Dungeon cleared');$('#draft-kicker').textContent=buildText('Phần thưởng đã nhận','Rewards received');
  $('#draft-cards').style.setProperty('--offer-count',2);$('#draft-cards').replaceChildren();
  for(const [icon,title,value,note]of [['◆','Victory Marks','+'+game.runMarks,buildText('Giữ ngoài dungeon','Kept between runs')],['✦','Mastery XP','+'+(game.lastMasteryReward?.amount||0),buildText('Cho '+weaponLabel(game.runWeapon||game.weapon),'For '+weaponLabel(game.runWeapon||game.weapon))]]){const card=document.createElement('article');card.className='run-loot';card.innerHTML='<span class="run-loot-icon">'+icon+'</span><strong>'+title+'</strong><b>'+value+'</b><small>'+note+'</small>';$('#draft-cards').append(card);}
  $('#draft-detail').textContent=buildText('Supplies và build kết thúc cùng run này. Mastery, chiến kỹ đã unlock và Victory Marks được giữ.','Supplies and this build end with the run. Mastery, unlocked Battle Arts and Victory Marks are kept.');
  $('#draft-confirm').hidden=false;$('#draft-confirm').disabled=false;$('#draft-confirm').textContent=buildText('Hoàn tất','Finish');
 }
 if(!dialog.open)dialog.showModal();
};
const runConfirm=$('#draft-confirm').onclick;
$('#draft-confirm').onclick=()=>{if(game.state==='reward'&&game.rewardKind==='boss'){game.claimBossReward('complete');draftSignature=panelSignature=mobileSignature='';renderSkillDraft();}else runConfirm();};
Object.assign(TERM_HELP,{
 supplies:{label:'Supplies',vi:'Tiếp tế của run hiện tại. Mua skill, nâng cấp hoặc hồi tim trong dungeon. Mất khi run kết thúc.',en:'Current-run supplies. Buy skills, upgrades or healing inside the dungeon. Lost when the run ends.'},
 victorymarks:{label:'Victory Marks',vi:'Ấn chiến thắng nhận khi hạ boss. Giữ giữa các run; dùng cho shop ngoài world map về sau.',en:'Earned by defeating a boss. Kept between runs for the future world shop.'},
 gold:{label:'Supplies',vi:'Tiếp tế chỉ dùng trong dungeon hiện tại.',en:'Supplies are only used inside the current dungeon.'}
});
function runLoadout(){if(game.returnToLoadout()){auto=selfPlay=false;paused=false;for(const d of document.querySelectorAll('dialog[open]'))d.close();panelSignature=mobileSignature=draftSignature='';syncToggles();}}
const runUI=updateUI;
updateUI=function(){runUI();$('#draft-supplies').textContent=buildText('Hồi 1 tim · 2 Supplies','Heal 1 heart · 2 Supplies');$('#save-summary').textContent=game.meta.victoryMarks+' Victory Marks · '+game.meta.wins+buildText(' lần thắng dungeon',' dungeon clears');$('#meta-stats').textContent='Mastery Lv.'+game.level+' · '+game.meta.xp[game.weapon]+' XP · Supplies '+game.supplies+' · Victory Marks '+game.meta.victoryMarks;
 if(['won','lost'].includes(game.state)&&!game.test){const r=game.runResult||{},won=game.state==='won';$('#state-title').textContent=won?buildText('Dungeon hoàn thành','Dungeon cleared'):buildText('Run kết thúc','Run ended');$('#state-desc').textContent='Mastery XP +'+(r.xp||0)+' · Victory Marks +'+(r.marks||0)+'. '+buildText('Build và Supplies đã reset. Chọn vũ khí cho run mới.','Build and Supplies reset. Choose a weapon for a new run.');const sig=game.state+':'+game.runId+':'+locale;if(stateCards.dataset.runEnd!==sig){stateCards.dataset.runEnd=sig;stateCards.replaceChildren(button(buildText('Chọn vũ khí','Choose weapon'),buildText('Run mới: 3 tim · build mới · 0 Supplies','New run: 3 hearts · new build · 0 Supplies'),runLoadout));}}
};
const runMobileUI=mobileUI;
mobileUI=function(){runMobileUI();$('#gold-label').textContent='▣ '+game.supplies;$('#gold-label').setAttribute('aria-label','Supplies '+game.supplies);};
MOBILE_NODES.boss=[buildText('♛ Boss','♛ Boss'),'+10 Victory Marks',buildText('Thắng nhận Victory Marks và Mastery XP. Supplies không giữ sang run khác.','Win for Victory Marks and Mastery XP. Supplies do not carry to another run.')];
const runNodeDetails=nodeDetails;
nodeDetails=function(id,tier=game.floor){return id==='boss'?MOBILE_NODES.boss[2]:runNodeDetails(id,tier).replaceAll('Gold','Supplies');};
const runMap=buildMap;
buildMap=function(){runMap();$('#route-map').querySelectorAll('[data-node="boss"] .node-reward').forEach(n=>n.textContent='+10 Marks');const tip=$('#route-map .atlas-tip');if(tip)tip.textContent=buildText('Combat: Supplies/XP · Shop: skill/hồi tim · Elite/Đền: nâng cấp · Boss: Victory Marks','Combat: Supplies/XP · Shop: skills/heal · Elite/Shrine: upgrades · Boss: Victory Marks');};
const runStyle=document.createElement('style');runStyle.textContent='.run-loot{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border:1px solid #a39064;border-radius:12px;background:#213b3e;color:#eee0b9;min-height:210px;text-align:center;padding:12px}.run-loot-icon{font-size:48px;color:#e7c981}.run-loot b{font-size:30px}.run-loot small{font-size:12px;color:#b9cec6}.run-loot strong{font-size:15px}#state-panel:not(:has(#route-map:not([hidden]))){box-sizing:border-box;height:min(300px,40dvh);overflow:auto}';document.head.append(runStyle);

$('#home').onclick=()=>{if(!game.test)game.persist();auto=selfPlay=false;game.test=false;game.reset();$('#test-panel').hidden=true;$('#drawer').close();paused=false;syncToggles();};
