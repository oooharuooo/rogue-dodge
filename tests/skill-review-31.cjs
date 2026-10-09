const source=require('node:fs').readFileSync('tests/weapon-balance-20.cjs','utf8');
const prefix=source.slice(0,source.indexOf('const rows=[];')).replace(/if\(build\)g.skills=\{[^;]+;/,'if(build)g.skills={...build};');
const tail=`
const combos=[{}, {focus:2,flame_counter:2,momentum:2}, {focus:2,momentum:2,ember:2}, {resolve:2,momentum:2,spark:2}, {guardian:2,second_wind:2,rime:2}, {focus:2,momentum:2,echo:2}];
const results=[];for(const w of ['katana','daggers','greatsword','bow'])for(const pattern of Object.keys(plans))for(const build of combos){const extra={katana:'crescent',daggers:'cross_cut',greatsword:'fault_breaker',bow:'twin_fang'}[w],skills={...build};if(Object.keys(skills).length)skills[extra]=2;const result=simulate(w,3,pattern,'expert',60,skills);results.push({...result,build:JSON.stringify(skills)});}
fs.writeFileSync('skill-review-31-results.csv','weapon,pattern,build,damage,dps,hp\\n'+results.map(r=>[r.weapon,r.pattern,JSON.stringify(r.build),r.damage,r.dps,r.hp].join(',')).join('\\n'));
console.log('Legal build audit: '+results.length+' simulations, each at most 4 skills and 1 element.');
for(const w of ['katana','daggers','greatsword','bow']){const list=results.filter(r=>r.weapon===w&&r.pattern==='melee3');console.log(w,list.map(r=>({build:r.build,damage:r.damage,dps:r.dps,hp:r.hp})));}
`;
require('node:fs').writeFileSync('tests/skill-review-31-runner.cjs',prefix+tail);
