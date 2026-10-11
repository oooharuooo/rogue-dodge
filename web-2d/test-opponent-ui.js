// One opponent picker keeps regular enemies and bosses together while clearly separating categories.
(()=>{
 const enemy=$('#test-enemy'),boss=$('#test-boss'),bar=$('#test-scenario-bar');if(!enemy||!boss||!bar)return;
 const label=document.createElement('label');label.textContent='Đối thủ';
 const picker=document.createElement('select');picker.id='test-opponent';picker.setAttribute('aria-label','Đối thủ · Enemy / Boss');
 for(const [groupName,prefix,source] of [['ENEMY · Đối thủ thường','enemy',enemy],['BOSS · Boss','boss',boss]]){
  const group=document.createElement('optgroup');group.label=groupName;
  for(const option of source.options){const item=document.createElement('option');item.value=prefix+':'+option.value;item.textContent=option.textContent;group.append(item);}
  picker.append(group);
 }
 picker.value='enemy:'+enemy.value;label.append(picker);bar.insertBefore(label,bar.firstChild);
 for(const source of [enemy,boss])source.closest('label').hidden=true;
 picker.addEventListener('change',()=>{const [kind,id]=picker.value.split(':');(kind==='boss'?boss:enemy).value=id;});
 const coverageLabel=document.createElement('label');coverageLabel.textContent='Kiểu đòn enemy';
 const coverage=document.createElement('select');coverage.id='test-coverage';coverage.setAttribute('aria-label','Kiểu đòn enemy');
 coverage.innerHTML='<option value="combo">Combo nhịp · né từng đòn theo lane</option><option value="all">Skill phủ cả 3 lane · nhảy đúng nhịp</option>';
 coverageLabel.append(coverage);bar.insertBefore(coverageLabel,label.nextSibling);
 const lengthLabel=$('#test-length')?.closest('label');if(lengthLabel){lengthLabel.firstChild.textContent='Số nhịp combo';}
 for(const id of ['spawn-enemy','spawn-boss'])$('#'+id).hidden=true;
 coverage.addEventListener('change',()=>{if(!game.test)return;game.testCoverage=coverage.value;game.testLength=coverage.value==='all'?1:(+$('#test-length').value||3);game.combo=null;game.attack=null;game.action=null;game.counter=null;game.shots=[];nextAttack=game.time+.8;});
 const toggle=document.createElement('button');toggle.type='button';toggle.id='test-tools-toggle';toggle.textContent='Test ⚙';toggle.hidden=true;toggle.setAttribute('aria-expanded','false');$('#open-menu').before(toggle);
 toggle.onclick=()=>{const open=document.body.classList.toggle('test-tools-open');toggle.setAttribute('aria-expanded',String(open));};
 const style=document.createElement('style');style.textContent='#test-tools-toggle[hidden]{display:none!important}#test-tools-toggle{min-height:32px;padding:5px 9px;font-size:11px}#test-scenario-bar{display:none!important}body.test-tools-open #test-scenario-bar{display:flex!important;position:fixed;z-index:40;top:58px;left:50%;transform:translateX(-50%);width:min(560px,calc(100vw - 20px));max-height:calc(100dvh - 72px);overflow:auto;align-content:flex-start;gap:6px;padding:10px;background:#142f36f5;border:1px solid #b9aa78;border-radius:12px;box-shadow:0 12px 40px #000a}#test-scenario-bar>label{flex:1 1 100%;font-size:11px}#test-scenario-bar>label select{width:100%;min-height:34px;padding:5px;background:#203f46;color:#eed5a0}#test-scenario-bar label[hidden]{display:none!important}';document.head.append(style);
 const ui=updateUI;updateUI=function(){ui();toggle.hidden=!game.test;if(!game.test){document.body.classList.remove('test-tools-open');toggle.setAttribute('aria-expanded','false');}};
 scenarioStart.textContent='Bắt đầu test';scenarioStart.onclick=()=>{startScenario();document.body.classList.remove('test-tools-open');toggle.setAttribute('aria-expanded','false');};
 [...qaBar.querySelectorAll('button')].find(button=>button.textContent.trim()==='Chạy lại')?.setAttribute('hidden','');
})();
