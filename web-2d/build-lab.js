// Explicit QA scenes, isolated by build-lab.html's session-scoped storage adapter.
if(window.BUILD_LAB){
 const lab=document.createElement('nav');lab.className='build-lab';lab.innerHTML='<strong>PREVIEW · không sửa save thật</strong><p>Hồ sơ mẫu đã unlock skill để xem các lựa chọn. Đây không phải tốc độ mở khóa thực tế.</p>';
 const freshProfile=document.createElement('label');freshProfile.innerHTML='<input type="checkbox" id="lab-fresh"> Dùng nhóm skill của tài khoản mới';lab.append(freshProfile);
 function setupBuildScene(kind){
  for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();game.start('katana');const p=ensureProgress(game.meta);p.legacyUnlocked={};if(!$('#lab-fresh').checked)for(const id of Object.keys(SKILLS))p.legacyUnlocked[id]=true;
  game.meta.gold=6;game.skills={focus:1};game.floor=kind==='boss'?8:3;game.log=[];game.buildOffers={};game.rewardKind=null;game.hp=3;paused=false;auto=selfPlay=false;
  if(kind==='starter'){game.skills={};game.state='starter';p.starterCharges=1;}
  if(kind==='shop')game.state='shop';
  if(kind==='event'){game.state='event';}
  if(kind==='elite'){game.state='reward';game.rewardKind='elite';game.skills={focus:1,flame_counter:1};game.deathTime=null;}
  if(kind==='boss'){game.loadEnemy('executioner',true);game.enemyHp=1;game.bossShownPhase=3;game.shots=[{damage:1,impact:game.time+.01,start:game.time,hit:false,perfect:false}];game.update(.02);game.deathTime=null;}
  game.persist();draftSignature=buildUISignature=mobileSignature=panelSignature='';nextAttack=game.time+1;updateUI();mobileUI();
 }
 for(const [id,title]of [['starter','Khởi đầu'],['shop','Shop'],['event','Sự kiện'],['elite','Thưởng Elite'],['boss','Thưởng boss']]){const b=document.createElement('button');b.textContent=title;b.onclick=()=>setupBuildScene(id);lab.append(b);}
 const reload=document.createElement('button');reload.textContent='Tải lại checkpoint mẫu';reload.onclick=()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();const g=new CampaignGame();game.meta=g.meta;game.savedRun=g.savedRun;if(game.resume()){draftSignature=buildUISignature=mobileSignature=panelSignature='';updateUI();mobileUI();}};lab.append(reload);
 document.querySelector('.shell').before(lab);const style=document.createElement('style');style.textContent='.build-lab{max-width:520px;margin:12px auto;padding:12px;color:#d6e0d8;font:13px system-ui}.build-lab p{font-size:12px;line-height:1.4}.build-lab button{font-size:12px;margin:5px;padding:8px}.build-lab label{display:block;margin-bottom:6px}';document.head.append(style);
 const sceneId=new URLSearchParams(location.search).get('scene');if(['starter','shop','event','elite','boss'].includes(sceneId))setupBuildScene(sceneId);
}


