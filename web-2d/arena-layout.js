const ARENA={heroX:90,enemyX:710,feet:554,laneTop:260,laneHeight:156,scale:.95,bottom:729.6};
function counterPosition(age,weapon){const release={katana:.35,daggers:.28,greatsword:.52}[weapon]||.5;if(age<0||weapon==='bow')return ARENA.heroX;const t=age<=release?age/release:1-(age-release)/(.85-release);return ARENA.heroX+540*Math.max(0,Math.min(1,t*t*(3-2*t)));}
function counterRelease(weapon){return {bow:.5,katana:.35,daggers:.28,greatsword:.52}[weapon];}
