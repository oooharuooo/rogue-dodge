// Test access is a view-only override. Normal unlock/release gates stay authoritative.
(()=>{
 let testingWorld=false;const enterTest56=game.enterTest;game.enterTest=function(...args){const dungeon=this.test&&testingWorld?this.dungeonId:null;const ok=enterTest56.apply(this,args);if(dungeon)this.dungeonId=dungeon;return ok;};const frostOption56=document.createElement('option');frostOption56.value='frost_golem';frostOption56.textContent='Frost Sentinel';$('#test-boss').append(frostOption56);const world=$('#world-selection'),button=document.createElement('button');button.id='world-test-56';button.className='secondary';button.textContent='Test Mode';world.querySelector('.world-heading').after(button);
 const note=document.createElement('p');note.id='test-world-note';note.hidden=true;note.textContent='Chọn emblem để thử dungeon. Dungeon 3–6 hiện chỉ thử biome với đối thủ có sẵn; chưa có hành trình riêng.';button.after(note);
 button.onclick=()=>{testingWorld=!testingWorld;button.textContent=testingWorld?'Thoát chọn dungeon test':'Test Mode';note.hidden=!testingWorld;};
 const prior=updateUI;updateUI=function(){prior();world.classList.toggle('testing-world-56',testingWorld);for(const [i,b]of [...world.querySelectorAll('.world-node')].entries()){
  if(!b.dataset.testWorldBound){const normal=b.onclick;b.onclick=()=>{if(!testingWorld){normal();return;}const id=i+1;game.enterTest($('#test-weapon').value,id===2?'frost_wolf':'swordsman',false);game.dungeonId=id;$('#test-enemy').value=id===2?'frost_wolf':'swordsman';$('#test-boss').value=id===2?'frost_golem':'executioner';$('#test-panel').hidden=false;game.testLevel=+$('#test-mastery').value;game.testTempo=$('#test-tempo').value;auto=false;selfPlay=false;paused=false;$('#drawer').close();syncToggles();};b.dataset.testWorldBound='1';}
  if(testingWorld){b.hidden=false;b.disabled=false;b.setAttribute('aria-label',['Rừng','Tuyết','Sa mạc','Núi lửa','Phế tích','Vực sâu'][i]+' · Dungeon '+(i+1)+' · Test');}
 }
 };
 const style=document.createElement('style');style.textContent='.testing-world-56 .world-fog{display:none}#world-test-56{align-self:center;padding:7px 18px;min-height:34px}#test-world-note{font-size:11px;line-height:1.4;text-align:center;margin:0;color:#b9ceca}.testing-world-56 .world-node{display:flex!important}';document.head.append(style);
})();


