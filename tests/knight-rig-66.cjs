const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const sharp=require('C:/Users/harut/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=path.resolve(__dirname,'../../balance-previews/63-character-studio/knight-rig-66');
async function main(){
 const rows=JSON.parse(fs.readFileSync(path.join(dir,'rig.json'))),{data:source,info}=await sharp(path.resolve(dir,'../../64-heavy-knight-art/heavy-knight-concepts.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const labelsBuffer=fs.readFileSync(path.join(dir,'labels.bin')),labels=new Int32Array(labelsBuffer.buffer,labelsBuffer.byteOffset,labelsBuffer.length/4),components=JSON.parse(fs.readFileSync(path.join(dir,'segmentation.json')));
 assert.equal(rows.length,3);let pixels=0,parts=0;
 for(let k=0;k<rows.length;k++){
  const r=rows[k],ids=new Set(r.parts.map(p=>p.id));assert(ids.has('helmet')&&ids.has('weapon')&&ids.has('front_hand')&&ids.has('rear_hand'));assert.equal(r.parts.find(p=>p.id==='weapon').parent,'front_hand');
  const assembled=Buffer.alloc(source.length),coverage=new Uint8Array(info.width*info.height);
  for(const p of r.parts){parts++;assert.equal(p.pivot.length,2);assert(p.pivot.every(Number.isFinite));let seen=new Set([p.id]),parent=p.parent;while(parent){assert(ids.has(parent));assert(!seen.has(parent),'Bone cycle');seen.add(parent);parent=r.parts.find(q=>q.id===parent).parent;}
   const {data,info:pi}=await sharp(path.join(dir,p.file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(pi.width,p.size[0]);assert.equal(pi.height,p.size[1]);
   for(let y=0;y<pi.height;y++)for(let x=0;x<pi.width;x++){const j=(y*pi.width+x)*4;if(!data[j+3])continue;const i=(y+p.origin[1])*info.width+x+p.origin[0];assert.equal(labels[i],components[k].id,'Another character/background leaked into part');assert.equal(coverage[i],0,'Overlapping source ownership');coverage[i]=1;data.copy(assembled,i*4,j,j+4);pixels++;}
  }
  let matched=0;for(let i=0;i<coverage.length;i++)if(labels[i]===components[k].id){assert(coverage[i],'Missing visible artwork');assert.deepEqual([...assembled.subarray(i*4,i*4+4)],[...source.subarray(i*4,i*4+4)],'Changed source pixel');matched++;}assert.equal(matched,r.validation.sourcePixels);
  for(const file of ['torso','arm','leg','hand']){const m=await sharp(path.join(dir,r.id+'-under-'+file+'.png')).metadata();assert(m.hasAlpha);}
 }
 // Exercise the actual runtime renderer at neutral, motion, maximum angles and every donor slot.
 const renderer=fs.readFileSync(path.resolve(dir,'../knight-rig-66.js'),'utf8').split('const knightReady66=')[0];assert(renderer.includes('image66'));
 const code=fs.readFileSync(path.resolve(dir,'../knight-rig-66.js'),'utf8');const start=code.indexOf('function matrix66'),end=code.indexOf('function knightControls66');
 let calls=0;const fake=new Proxy({drawImage:(...args)=>{assert(args.slice(1).every(Number.isFinite));calls++;}}, {get:(t,p)=>p in t?t[p]:(...args)=>assert(args.every(a=>typeof a!=='number'||Number.isFinite(a)))});
 const testRows=rows.map(r=>({...r,images:Object.fromEntries(r.parts.map(p=>[p.id,{}])),under:{torso:{},arm:{},leg:{},hand:{},weapon:{}},complete:Object.fromEntries(r.parts.map(p=>[p.id,{}]))}));
 const ctx={knightData66:testRows,knightSettings66:{},knightAngles66:{},knightMode66:'neutral',knightDebug66:false,variant65:'1',console};vm.createContext(ctx);vm.runInContext(code.slice(start,end),ctx);
 for(const r of rows){ctx.variant65=r.id;for(const mode of ['neutral','idle','joints']){ctx.knightMode66=mode;for(const time of [0,1750,3450])ctx.drawKnight66(fake,time);}ctx.knightMode66='neutral';
  for(const p of r.parts){for(const angle of [-r.limits[p.id],r.limits[p.id]]){ctx.knightAngles66={[p.id]:angle};ctx.drawKnight66(fake,0);}for(const donor of rows){if(donor.parts.some(q=>q.id===p.id)){ctx.knightSettings66={[p.id]:donor.id};ctx.drawKnight66(fake,0);}}ctx.knightSettings66={};ctx.knightAngles66={};}
 }
 console.log(JSON.stringify({characters:3,parts,pixelsPreserved:pixels,sourcePixelMismatches:0,rendererDraws:calls,result:'PASS'}));
}
main().catch(e=>{console.error(e);process.exit(1)});

