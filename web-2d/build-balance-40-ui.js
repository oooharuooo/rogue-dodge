const BALANCE_COPY={
 last_stand:{vi:['2 tim +10%, 1 tim +25% damage cơ bản của phản công. Không Shield/Guard Stance; không tăng Stagger, skill hoặc tap.','2 tim +15%, 1 tim +35%. Giữ cùng điều kiện.'],en:['At 2 hearts: +10%; at 1 heart: +25% base counter damage. No Shield/Guard Stance; excludes Stagger multipliers, skills and taps.','At 2 hearts: +15%; at 1 heart: +35%. Same restrictions.'],brief:['2 HP +10% · 1 HP +25%','2 HP +15% · 1 HP +35%']},
 flame_counter:{vi:['Mỗi 3 phản công Perfect: +2 damage.','Mỗi 2 phản công Perfect: +2 damage.'],en:['Every 3 Perfect counters: +2 damage.','Every 2 Perfect counters: +2 damage.'],brief:['3 Perfect → +2 DMG','2 Perfect → +2 DMG']},
 momentum:{vi:['Flow 3+: phản công +2 damage.','Flow 2+: phản công +2 damage.'],en:['At Flow 3+: counters gain +2 damage.','At Flow 2+: counters gain +2 damage.'],brief:['Flow 3 → +2 DMG','Flow 2 → +2 DMG']}
};
for(const [id,v]of Object.entries(BALANCE_COPY)){SKILLS[id].desc=v.vi;SKILL_VISUALS[id].brief=v.brief;if(EXTRA_SKILLS[id])EXTRA_SKILLS[id].desc=v.vi;v.vi.forEach((t,i)=>UI_EN[t]=v.en[i]);}
SKILL_VISUALS.echo.brief=['Stagger → đòn kế +1 DMG','Stagger → đòn kế +2 DMG'];
const challengeEnglish={recover_flow:'Recover Flow 3 after losing a heart, in 4 encounters',wounded_clean:'Win without losing a heart, starting at 1–2 hearts, in 3 encounters',perfect_triple:'Complete 3 consecutive Perfect counters, 3 times',stagger_any:'Create Stagger 3 times',ranged_perfect:'Perfect Dodge 12 ranged attacks',boss_double:'Create Stagger twice in the same boss encounter'};
for(const r of Object.values(SKILL_UNLOCKS))if(challengeEnglish[r.achievement])UI_EN[r.label]=challengeEnglish[r.achievement];
TRANSLATION_KEYS.splice(0,TRANSLATION_KEYS.length,...Object.keys(UI_EN).sort((a,b)=>b.length-a.length));
const balanceDraft=renderSkillDraft;
renderSkillDraft=function(){balanceDraft();if(game.state==='reward'&&game.rewardKind==='milestone'){$('#draft-title').textContent=locale==='vi'?'Chọn chiến kỹ':'Choose a Battle Art';$('#draft-kicker').textContent=(locale==='vi'?'Sau trận ':'After encounter ')+game.buildCombats+' · '+(locale==='vi'?'Chọn 1 skill mới hoặc nâng cấp':'Choose 1 new skill or upgrade');}};
const balanceDetail=showCollectionSkill;
showCollectionSkill=function(row){if(BALANCE_COPY[row.id])row={...row,descs:SKILLS[row.id].desc};balanceDetail(row);if(!row.weaponGuide)document.querySelector('#collection-detail')?.querySelectorAll('details').forEach(el=>{if(/Cách nhận skill|How to get this skill/.test(el.querySelector('summary')?.textContent||''))el.remove();});};

const balanceCardStyle=document.createElement('style');balanceCardStyle.textContent='#skill-dialog .skill-card{min-height:220px}#skill-dialog .skill-illustration{max-height:104px}@media(max-height:620px){#skill-dialog .skill-card{min-height:190px}#skill-dialog .skill-illustration{max-height:80px}}';document.head.append(balanceCardStyle);
