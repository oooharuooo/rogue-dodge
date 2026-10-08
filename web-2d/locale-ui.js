$('#language').value=locale;$('#language').onchange=e=>setLanguage(e.target.value);
$('#skill-demo').onclick=skillDemo;
const skillHelp=document.createElement('p');skillHelp.className='help';skillHelp.textContent='Skill FX · Demo: Flame Counter Lv.2 + Momentum. Auto Perfect → Flow 3 → +damage. Test Mode: no XP / Gold.';$('#test-panel').append(skillHelp);
// Generated UI is refreshed by the combat loop; localize only changed text.
let localeQueued=false;new MutationObserver(()=>{if(localeQueued)return;localeQueued=true;requestAnimationFrame(()=>{localeQueued=false;localizeUI();localizeAttributes();});}).observe(document.body,{childList:true,subtree:true,characterData:true});localizeUI();localizeAttributes();
