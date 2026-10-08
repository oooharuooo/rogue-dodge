// One reusable draft for starter, rewards, shop and shrine; max three offers.
let draftSignature='',draftSelected=null;
function renderSkillDraft(){
 const dialog=$('#skill-dialog'),active=['starter','reward','shop','shrine'].includes(game.state);
 $('#state-panel').classList.toggle('draft-behind',active);
 if(!active){if(dialog.open)dialog.close();draftSignature='';return;}
 const signature=game.state+':'+game.floor+':'+JSON.stringify(game.skills)+':'+game.meta.gold+':'+game.hp;
 if(signature===draftSignature)return;
 draftSignature=signature;
 const offers=game.offerSkills(availableSkills()),titles={starter:'Chọn lời thề',reward:'Phần thưởng chiến thắng',shop:'Lều thương nhân',shrine:'Đền cổ'};
 $('#draft-title').textContent=titles[game.state];
 $('#draft-kicker').textContent=!offers.length?'Build hoàn thiện':game.state==='shop'?'Một món · 2 Gold · Có '+game.meta.gold+' Gold':game.state==='shrine'?'Nâng skill đang có':'Chọn một trong ba';
 const cards=$('#draft-cards');cards.replaceChildren();cards.style.setProperty('--offer-count',Math.max(1,offers.length));draftSelected=offers[0]||null;
 for(const id of offers){const v=SKILL_VISUALS[id],level=(game.skills[id]||0)+1,b=document.createElement('button');b.type='button';b.className='skill-card';b.dataset.skill=id;b.style.setProperty('--skill-color',v.color);b.setAttribute('aria-label',SKILLS[id].name+' Lv.'+level+' · '+SKILLS[id].desc[level-1]);b.setAttribute('aria-pressed',String(id===draftSelected));
  b.innerHTML=`<span class="skill-level">${level===2?'II':'I'}</span><span class="skill-type">${v.tag}</span>${skillIconMarkup(id)}<strong>${v.title}</strong><span class="skill-name-en">${SKILLS[id].name}</span><span class="skill-brief">${v.brief[level-1]}</span><span class="skill-card-foot">${level===2?'NÂNG CẤP':'SKILL MỚI'}</span>`;
  b.onclick=()=>{draftSelected=id;updateDraftDetail();};cards.append(b);
 }
 $('#draft-supplies').hidden=game.state!=='shop';$('#draft-supplies').disabled=game.hp>=3||game.meta.gold<2;
 $('#draft-skip').hidden=game.state==='starter';$('#draft-skip').textContent=game.state==='shop'?'Rời shop':game.state==='shrine'?'Rời đền':'Bỏ qua';
 updateDraftDetail();if(!dialog.open)dialog.showModal();
}
function updateDraftDetail(){
 const id=draftSelected,level=id?(game.skills[id]||0)+1:0;
 $('#draft-detail').textContent=id?SKILLS[id].name+' · '+SKILLS[id].desc[level-1]:'Các skill phù hợp đã đạt cấp tối đa. Bạn có thể đi tiếp.';
 $('#draft-confirm').disabled=!id||game.state==='shop'&&game.meta.gold<2;
 $('#draft-confirm').textContent=id?'Nhận '+SKILL_VISUALS[id].title:'Không còn skill';
 document.querySelectorAll('.skill-card').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.skill===id)));
}
$('#draft-confirm').onclick=()=>{if(draftSelected&&game.selectSkill(draftSelected)){draftSignature='';collectionUI();renderSkillDraft();}};
$('#draft-skip').onclick=()=>{game.skip();draftSignature='';renderSkillDraft();};
$('#draft-supplies').onclick=()=>{game.buySupplies();draftSignature='';renderSkillDraft();};
$('#skill-dialog').addEventListener('cancel',e=>e.preventDefault());
