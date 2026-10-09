// Visible enemy-side lane bounds, with feedback for the actual touched lane.
const deflectRegionStyle=document.createElement('style');deflectRegionStyle.textContent=`
#deflect-input button{background:transparent;box-shadow:none;color:#f0dfad;text-align:left}
#deflect-input button span{display:none;align-items:center;gap:5px;margin-left:9px;font:600 10px system-ui;text-shadow:0 1px 3px #17373d;pointer-events:none;opacity:.7}
#deflect-input button span b{font-size:16px}#deflect-input button[data-pressed="true"],#deflect-input button:active{background:linear-gradient(270deg,#c5dca022,#73c6d357);box-shadow:inset 0 0 0 1px #b4e4df55}
#deflect-input button[data-pressed="true"] span{opacity:1;color:#fff}
.left-hand #deflect-input button{background:transparent;text-align:right}.left-hand #deflect-input button span{margin-left:0;margin-right:9px}.left-hand #deflect-input button[data-pressed="true"],.left-hand #deflect-input button:active{background:linear-gradient(90deg,#c5dca022,#73c6d357)}
`;document.head.append(deflectRegionStyle);
for(const [i,b]of [...deflectInput.children].entries()){b.innerHTML='<span><b aria-hidden="true">'+['↑','◇','↓'][i]+'</b> Deflect</span>';let timer;b.addEventListener('pointerdown',()=>{if(paused)return;clearTimeout(timer);b.dataset.pressed='true';timer=setTimeout(()=>{b.dataset.pressed='false';},220);});}


