(()=>{
 const oldScene=scene;scene=function(){arenaBiome=game.dungeonId===2?'ice':'forest';if(arenaBiome==='forest'){
 // Project the original forest ground with the combat lanes on tall screens.
 // Its art stays intact; only the viewport transform follows actor positioning.
 ctx.save();ctx.translate(0,(80-(canvas.height-809.6))/.95);ctx.scale(1,arenaYScale);ctx.fillStyle='#776c50';ctx.fillRect(-240,260,1400,canvas.height/arenaYScale+1000);oldScene();ctx.restore();
 }else oldScene();};
 const landscape=mapLandscapeMarkup;mapLandscapeMarkup=function(){let svg=landscape();
 // Retain the existing illustrated atlas tree symbols, removing other biome landmarks.
 svg=svg.replace(/<use href="#atlas-(?:ruin|mountain)"[^>]*\/>/g,m=>m.replace(/#atlas-(?:ruin|mountain)/,'#atlas-pine'));
 if(game.dungeonId===2)for(const [from,to]of Object.entries({'#3b3444':'#7e9cb3','#45544c':'#d5e8ed','#294f43':'#88b4cd','#24483a':'#416b83','#1c392e':'#496b83','#436347':'#bddbe7','#69825a':'#edf8ff','#bfc5a2':'#edf9ff','#262e37':'#7597ae','#273b3d':'#9bbdd0','#172e26':'#557787'}))svg=svg.replaceAll(from,to);
 return svg;};
 const node=openNode;openNode=function(id){node(id);if(id==='boss'&&!game.test){$('#boss-choice').replaceChildren();$('#boss-choice').hidden=true;const boss=BOSSES[DUNGEON_BOSSES[game.dungeonId||1]];$('#node-title').textContent=boss.name;$('#node-description').textContent=`${boss.hp} HP · ${boss.phases} phase · +${game.dungeonId===2?15:10} Victory Marks · Mastery XP`;}};
 const map=buildMap;buildMap=function(){map();$('#route-map').dataset.biome=game.dungeonId===2?'snow':'forest';$('#route-map').querySelectorAll('[data-node="boss"] .node-reward').forEach(n=>n.textContent='+'+(game.dungeonId===2?15:10)+' Marks');};
 const details=nodeDetails;nodeDetails=function(id,...args){return id==='boss'?`Boss: +${game.dungeonId===2?15:10} Victory Marks và Mastery XP.`:details(id,...args);};
 const ui=updateUI;updateUI=function(){ui();if(!game.test&&game.state!=='menu')$('#mode-label').textContent=`DUNGEON ${game.dungeonId||1} · chặng ${game.floor+1}/${game.route.length}`;
 if(game.state==='reward'&&game.rewardKind==='boss')$('#draft-kicker').textContent='Dungeon '+(game.dungeonId||1)+' hoàn thành';};
 const style=document.createElement('style');style.textContent='#route-map[data-biome="snow"] .atlas-heading{background:linear-gradient(130deg,#24495d,#2c5868)}#route-map[data-biome="snow"] .map-region-label{color:#e0f5ff}#route-map[data-biome="snow"] .vertical-map-scroll{background:#416b83;scrollbar-color:#b8dbe5 #24495d}';document.head.append(style);
})();
