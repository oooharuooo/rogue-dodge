const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('web-2d/audio-ui.js','utf8');
const fn=source.slice(source.indexOf('function syncMusic'),source.indexOf('setInterval(syncMusic'));
const calls=[],context={game:{state:'combat',isBoss:false},effects:{enabled:true,audio:{music:(...a)=>calls.push(a)}},document:{hidden:false},paused:true};vm.createContext(context);vm.runInContext(fn,context);
for(const state of ['combat','route','menu','starter','shop','shrine','event','reward','won','lost','test-won']){context.game.state=state;for(const paused of [false,true]){context.paused=paused;context.syncMusic();assert.equal(calls.at(-1)[1],true);assert.equal(calls.at(-1)[0],state==='combat'?'normal':'map');}}
context.game.state='combat';context.game.isBoss=true;context.syncMusic();assert.equal(calls.at(-1)[0],'boss');context.document.hidden=true;context.syncMusic();assert.equal(calls.at(-1)[1],false);context.document.hidden=false;context.effects.enabled=false;context.syncMusic();assert.equal(calls.at(-1)[1],false);
console.log('Music survives paused popups across 11 states; boss track, mute and hidden-tab behavior pass.');
