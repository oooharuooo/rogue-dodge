// The approved cartoon gallery is the only source of dungeon scenery.
const BIOME_ORDER_55=['forest','snow','desert','volcano','ruins','abyss'];
function biomeForDungeon55(id){return BIOME_ORDER_55[(id||1)-1]||'forest';}
function backgroundFor55(biome,role){return 'backgrounds/approved-55/'+(biome==='snow'&&role==='boss'?'snow-original':biome+'-'+role)+'.webp';}
if(typeof module!=='undefined')module.exports={biomeForDungeon55,backgroundFor55};
if(typeof document!=='undefined')(()=>{
 const images=new Map(),surfaces=new Map(),backdropStyle=document.createElement('style');document.head.append(backdropStyle);let inspectedNode=null,lastPresentation='',lastDialogs='';
 function imageFor(src){if(!images.has(src)){const image=new Image();image.src=src;images.set(src,image);while(images.size>6)images.delete(images.keys().next().value);}return images.get(src);}
 function presentation(){const biome=biomeForDungeon55(game.dungeonId);let role=game.isBoss&&['combat','reward','won','lost','test-won'].includes(game.state)?'boss':'normal';
  if(game.state==='shop'||game.state==='event')role='merchant';
  if($('#node-dialog').open){if(['rest','camp'].includes(inspectedNode))role='rest';else if(['event','shop'].includes(inspectedNode))role='merchant';else if(inspectedNode==='boss')role='boss';else role='normal';}
  return {biome,role,src:backgroundFor55(biome,role)};
 }
 function sync(){const p=presentation(),key=p.src;imageFor(key);if(key!==lastPresentation){lastPresentation=key;document.body.style.setProperty('--location-art-55',`url("${p.src}")`);document.body.dataset.locationBiome=p.biome;document.body.dataset.locationRole=p.role;backdropStyle.textContent=`body[data-location-role] #node-dialog::backdrop,body[data-location-role] #event-dialog::backdrop,body[data-location-role] #skill-dialog::backdrop{background:linear-gradient(#071b2555,#06171e88),url("${p.src}") center/cover no-repeat}`;}
  const dialogs=[$('#node-dialog'),$('#event-dialog'),$('#skill-dialog')],signature=key+dialogs.map(d=>d.open).join(':');if(signature!==lastDialogs){lastDialogs=signature;for(const d of dialogs)d.classList.toggle('location-sheet-55',d.open&&['merchant','rest'].includes(p.role));}return p;
 }
 const previousNode=openNode;openNode=function(id){inspectedNode=id;previousNode(id);sync();};
 const previousUI=updateUI;updateUI=function(){previousUI();sync();};
 const previousScene=scene;scene=function(){const p=sync(),image=imageFor(p.src);if(!image.complete||!image.naturalWidth){previousScene();return;}
  const key=p.src+':'+canvas.width+':'+canvas.height;let surface=surfaces.get(key);
  if(!surface){surface=document.createElement('canvas');surface.width=canvas.width;surface.height=canvas.height;const c=surface.getContext('2d'),scale=Math.max(surface.width/image.width,surface.height/image.height),w=image.width*scale,h=image.height*scale;c.drawImage(image,(surface.width-w)/2,(surface.height-h)/2,w,h);surfaces.set(key,surface);while(surfaces.size>4)surfaces.delete(surfaces.keys().next().value);}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(surface,0,0);ctx.restore();
 };
 sync();
})();

