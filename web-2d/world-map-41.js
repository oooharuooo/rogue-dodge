// Selection gates are separate from release gates: only Dungeon 1 has content.
const WORLD_DUNGEONS=Array.from({length:6},(_,i)=>({id:i+1,name:i===0?'Rừng cổ':i===1?'Miền tuyết':'Dungeon '+(i+1),released:i===0}));
function worldProgress(g){
 if(!g.meta.dungeonClears){let saved;try{saved=JSON.parse(localStorage.getItem('rogue-lane-main-v1'));}catch{}g.meta.dungeonClears=saved?.dungeonClears||{1:Math.max(0,g.meta.wins||0)};}
 return g.meta.dungeonClears;
}
CampaignGame.prototype.dungeonStatus=function(id){const d=WORLD_DUNGEONS.find(d=>d.id===id);if(!d)return null;const clears=worldProgress(this);return {...d,clears:clears[id]||0,requirementMet:id===1||(clears[id-1]||0)>0,available:d.released&&(id===1||(clears[id-1]||0)>0)};};
CampaignGame.prototype.startDungeon=function(id,weapon=this.weapon,replaceSaved=false){if(!this.dungeonStatus(id)?.available||this.savedRun&&!replaceSaved)return false;const ok=this.start(weapon);if(ok){this.dungeonId=id;this.persist();}return ok;};
const worldFinish=CampaignGame.prototype.finishRun;
CampaignGame.prototype.finishRun=function(won){const clears=worldProgress(this);const ok=worldFinish.call(this,won);if(ok&&won){const id=this.dungeonId||1;clears[id]=(clears[id]||0)+1;}return ok;};
