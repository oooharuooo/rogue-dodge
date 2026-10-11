function sizeLaneInput(){const stage=$('.stage');if(!stage.clientWidth||!stage.clientHeight)return;canvas.height=Math.round(960*stage.clientHeight/stage.clientWidth);arenaYScale=Math.max(.25,(canvas.height-160)/809.6);const ratio=stage.clientHeight/canvas.height;document.querySelectorAll('[data-action]').forEach((b,i)=>{b.style.top=((80+(260+i*156)*.95*arenaYScale)*ratio)+'px';b.style.height=(156*.95*arenaYScale*ratio)+'px';});}
new ResizeObserver(sizeLaneInput).observe($('.stage'));sizeLaneInput();


