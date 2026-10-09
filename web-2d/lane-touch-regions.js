// Narrow visible dodge zones, mirrored with the selected control hand.
const laneTouchStyle=document.createElement('style');laneTouchStyle.textContent=`
.lane-input button{left:auto;right:0;width:28%;border:0;background:linear-gradient(90deg,transparent,#234d631c);text-align:right}
.left-hand .lane-input button{left:0;right:auto;border:0;background:linear-gradient(270deg,transparent,#234d631c);text-align:left}
.lane-input button span{margin:0 5px;font:600 10px system-ui;color:#eef4e7;opacity:.9;background:transparent;border:0;border-radius:50%;width:44px;height:44px;padding:0;justify-content:center;text-shadow:0 1px 3px #17373d,0 0 4px #17373d;pointer-events:none;display:inline-flex;align-items:center;gap:5px}
.lane-input button span b{font-size:20px;line-height:36px;color:#f0dfad;display:grid;place-items:center;width:36px;height:36px;background:transparent;border-radius:50%;clip-path:none}.lane-input button span small{display:none}
.lane-input button.pressed,.lane-input button:active{background:linear-gradient(90deg,#c5dca022,#73c6d357);box-shadow:none}
.lane-input button.pressed span,.lane-input button:active span{background:transparent;color:#fff;opacity:1}.lane-input button.pressed span b,.lane-input button:active span b{background:transparent;color:#fff;text-shadow:0 0 6px #b5eaf1}.left-hand .lane-input button.pressed,.left-hand .lane-input button:active{background:linear-gradient(270deg,#c5dca022,#73c6d357)}
`;document.head.append(laneTouchStyle);
document.querySelectorAll('.lane-input button span').forEach((span,i)=>span.innerHTML='<b aria-hidden="true">'+['↑','◇','↓'][i]+'</b><small>'+['Up','Jump','Down'][i]+'</small>');

// Show touch acknowledgement without changing dodge timing or input handling.
document.querySelectorAll('.lane-input button').forEach(button=>{
 let releaseTimer;
 button.addEventListener('pointerdown',()=>{
  clearTimeout(releaseTimer);
  button.classList.add('pressed');
  releaseTimer=setTimeout(()=>button.classList.remove('pressed'),350);
 });
 const release=()=>{
  clearTimeout(releaseTimer);
  releaseTimer=setTimeout(()=>button.classList.remove('pressed'),180);
 };
 button.addEventListener('pointerup',release);
 button.addEventListener('pointercancel',release);
 button.addEventListener('pointerleave',release);
});



