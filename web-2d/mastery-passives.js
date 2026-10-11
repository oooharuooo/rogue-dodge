// One permanent weapon branch, separate from the four run Battle Art slots.
const MASTERY_ARTS={
 katana:{id:'crescent',name:['Vững nhịp','Poise'],vi:['Clean Chain chuẩn bị +1 damage cho phản công kế; không cộng dồn.','Clean Chain chuẩn bị +2 damage cho phản công kế; không cộng dồn.'],en:['A Clean Chain prepares +1 damage for the next counter; does not stack.','A Clean Chain prepares +2 damage for the next counter; does not stack.']},
 bow:{id:'twin_fang',name:['Mũi ghim','Pinning Shot'],vi:['Interrupt đúng thêm 1 damage.','Interrupt đúng thêm 2 damage.'],en:['Successful Interrupt adds 1 damage.','Successful Interrupt adds 2 damage.']},
 daggers:{id:'cross_cut',name:['Đâm nối','Follow-through'],vi:['Follow-up thêm 1 damage tổng cho hai nhát đâm.','Follow-up thêm 2 damage tổng cho hai nhát đâm.'],en:['Follow-up adds 1 total damage across its two stabs.','Follow-up adds 2 total damage across its two stabs.']},
 greatsword:{id:'fault_breaker',name:['Dư chấn','Rebound'],vi:['Guard Break đầu tiên: phản công kế +1 damage, một lần mỗi encounter.','Guard Break đầu tiên: phản công kế +2 damage, một lần mỗi encounter.'],en:['First Guard Break: next counter +1 damage, once per encounter.','First Guard Break: next counter +2 damage, once per encounter.']}
};
const MASTERY_ART_IDS=new Set(Object.values(MASTERY_ARTS).map(a=>a.id));
for(const [w,art]of Object.entries(MASTERY_ARTS))WEAPONS[w].upgrades=art.vi.map((text,i)=>art.name[0]+' Lv.'+(i+2)+': '+text);
WEAPON_RULES.daggers.masterySkip=[0,0,0];
function stripMasteryCards(g){for(const id of MASTERY_ART_IDS)delete g.skills[id];}
const passiveEligible=eligibleExtra;eligibleExtra=function(g,id){return !MASTERY_ART_IDS.has(id)&&passiveEligible(g,id);};
const passiveUnlocked=CampaignGame.prototype.unlocked;CampaignGame.prototype.unlocked=function(id){return !MASTERY_ART_IDS.has(id)&&passiveUnlocked.call(this,id);};
const passiveSelect=CampaignGame.prototype.selectSkill;CampaignGame.prototype.selectSkill=function(id){return MASTERY_ART_IDS.has(id)?false:passiveSelect.call(this,id);};
for(const name of ['update','damage','resume']){const original=CampaignGame.prototype[name];CampaignGame.prototype[name]=function(...args){stripMasteryCards(this);const result=original.apply(this,args);stripMasteryCards(this);return result;};}
const passiveWeaponAction=CampaignGame.prototype.weaponAction;
CampaignGame.prototype.weaponAction=function(){stripMasteryCards(this);const start=this.shots.length,ok=passiveWeaponAction.call(this);if(ok&&this.weapon==='daggers'&&this.level>=2){const follow=this.shots.slice(start).filter(s=>s.followup);if(follow.length){follow.at(-1).damage+=1;const event=follow[0].bonuses?.find(b=>b.id==='cross_cut');if(event)event.text='Follow-through · +'+(this.level-1)+' DMG';this.persist();}}return ok;};

