// Prime past audio events on resume; only future releases/contacts should play.
function primeCheckpointAudio(){
 const a=game.attack,last=(game.combo?.results||game.lastCombo?.results||[]).at(-1),now=game.time;
 effects.last={time:now,hp:game.hp,damage:game.totalDamage,dodged:game.dodged,state:game.state,action:game.action?.start,attack:a?.start,skills:new Set((game.skillEvents||[]).map(e=>e.id+':'+e.time))};
 if(game.action?.kind==='jump'&&now<game.action.start+.9)effects.last.landing=game.action.start+.9;
 if(a){if(now>=a.start+(a.impact-a.start)*.12)effects.last.slamCue=a.start;if(now>=a.start+(a.impact-a.start)*.7)effects.last.release=a.start;if(now>=a.impact)effects.last.slamImpact=a.impact;}
 if(last)effects.last.verdict=last.impact+':'+last.index;
 effects.weaponCueTime=now;effects.weaponCueSeen=new Set();const c=game.counter;
 if(c?.start!=null&&now>=c.start+counterRelease(game.weapon)-.06)effects.weaponCueSeen.add('release:'+c.start);
 for(const s of game.shots||[])if(now>=s.start-(s.secondary&&!s.followup?.06:0))effects.weaponCueSeen.add((s.counterKey??game.attackCount)+':'+s.start+':'+(s.followup?'follow':'shot'));
 effects.weaponEventSeen=new WeakSet([...(game.skillEvents||[]),...(game.damageEvents||[])].filter(e=>e.time<=now));
}
const checkpointResumeUI=CampaignGame.prototype.resume;
CampaignGame.prototype.resume=function(){const ok=checkpointResumeUI.call(this);if(ok){primeCheckpointAudio();if(this.state==='combat'){paused=true;const note=document.createElement('p');note.id='checkpoint-resume-note';note.textContent=locale==='vi'?'Trận đấu tiếp tục từ thời điểm đã lưu. Bấm Tiếp tục khi sẵn sàng.':'Combat resumes at the saved moment. Press Continue when ready.';$('#checkpoint-resume-note')?.remove();$('#drawer .drawer-head').after(note);if(!$('#drawer').open)$('#drawer').showModal();}}return ok;};
for(const type of ['pagehide','beforeunload'])window.addEventListener(type,()=>{if(!game.test)game.persist();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!game.test)game.persist();});
