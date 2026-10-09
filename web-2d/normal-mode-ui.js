// Normal play is the default. Test controls are enabled only by the Test Mode button.
const normalModeStyle=document.createElement('style');normalModeStyle.textContent='body:not(.test-mode) #auto,body:not(.test-mode) #self-play,body:not(.test-mode) #reset,body:not(.test-mode) [data-cue]{display:none!important}';document.head.append(normalModeStyle);
function syncModeSurface(){document.body.classList.toggle('test-mode',!!game.test);requestAnimationFrame(syncModeSurface);}requestAnimationFrame(syncModeSurface);

