// Small secondary gestures preserve the shared lane-reading grammar and registered grip.
const ENEMY_GESTURES={swordsman:[-12,3,0],heavy_knight:[22,-3,8],rogue:[-28,4,0],duelist:[-15,4,3],executioner:[0,0,0],warden:[35,-2,4],wraith:[-32,-2,-4],goblin_scout:[-35,3,0],orc_raider:[18,4,2],ogre_smith:[32,-3,6],frost_golem:[24,-2,0],moss_golem:[-18,2,5],rune_golem:[-38,-1,-4],minotaur_guard:[-22,3,2],minotaur_chief:[30,4,5],minotaur_oracle:[-24,-3,-4]};
function enemyIdentityMotion(m,id,kind,q){const v=ENEMY_GESTURES[id];if(!v||!m)return m;const weight=Math.min(1,q/.35)*Math.max(0,1-Math.max(0,q-.65)/.35);return {...m,left:m.left+v[0]*weight,lean:m.lean+v[1]*weight,drop:m.drop+v[2]*weight};}
if(typeof module!=='undefined')module.exports={ENEMY_GESTURES,enemyIdentityMotion};
