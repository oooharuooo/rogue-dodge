// Original atlas artwork: three depth layers and reusable terrain symbols.
function mapLandscapeMarkup(){return `<svg class="map-landscape" viewBox="0 0 440 1450" preserveAspectRatio="none" aria-hidden="true"><defs>
 <linearGradient id="atlas-ground" x2="0" y2="1"><stop stop-color="#3b3444"/><stop offset=".42" stop-color="#45544c"/><stop offset="1" stop-color="#294f43"/></linearGradient>
 <linearGradient id="atlas-mist" x2="0" y2="1"><stop stop-color="#bfc5a2" stop-opacity=".14"/><stop offset="1" stop-color="#172e35" stop-opacity="0"/></linearGradient>
 <symbol id="atlas-pine" viewBox="0 0 36 60"><path d="m16 24-1 36h8l-3-36" fill="#7d7051"/><path d="M17 3Q7 1 6 12Q-3 17 3 25Q-3 35 8 38Q14 47 22 39Q34 43 34 33Q42 23 31 16Q34 4 17 3Z" fill="#1c392e" stroke="#5b7951" stroke-width="1.1"/><path d="M17 5Q9 3 8 13Q1 17 6 23Q13 21 17 25Q28 25 30 16Q31 8 24 7Z" fill="#436347"/><path d="M8 27q6 7 12 2m-4-17 6 3m-4 33 5-11" fill="none" stroke="#69825a" stroke-width="1"/><path d="M7 59q12-7 22 0" fill="none" stroke="#172e26" stroke-width="4"/></symbol>
 <symbol id="atlas-mountain" viewBox="0 0 100 80"><path d="M0 80 48 0 100 80Z" fill="#293d40" stroke="#67796c" stroke-width="2"/><path d="m48 0 11 33 41 47H48Z" fill="#3e5350"/><path d="m48 0-16 28 13-4 8 8 6 1Z" fill="#b5bba0" opacity=".7"/><path d="m48 32-17 43m29-33 21 33" stroke="#182f34" stroke-width="3"/></symbol>
 <symbol id="atlas-ruin" viewBox="0 0 90 70"><path d="M8 67V28h12V17h18v12h18V14h15v19h10v34Z" fill="#444949" stroke="#8e9680" stroke-width="2"/><path d="M35 67V47q11-20 23 0v20" fill="#172b30"/><path d="M14 38h13m34 0h14M13 53h13m34 0h14M38 30v11" stroke="#727c6d" stroke-width="2"/><path d="m7 68 20-4m35 1 24 4" stroke="#293f35" stroke-width="6"/></symbol>
 </defs><rect width="440" height="1450" fill="url(#atlas-ground)"/>
 <path d="M320 0Q225 118 300 250T244 475Q179 554 258 680T265 932Q337 1110 212 1450" fill="none" stroke="#142f37" stroke-width="47" opacity=".55"/><path d="M320 0Q225 118 300 250T244 475Q179 554 258 680T265 932Q337 1110 212 1450" fill="none" stroke="#6f9290" stroke-width="14" opacity=".22"/>
 <path d="M0 70Q115 17 216 93T440 49V260H0Z" fill="#262e37" opacity=".55"/>
 <use href="#atlas-ruin" x="174" y="5" width="92" height="75"/><use href="#atlas-ruin" x="25" y="211" width="72" height="66"/><use href="#atlas-ruin" x="341" y="345" width="84" height="75"/>
 <path d="M0 495Q107 432 211 490T440 477V640H0Z" fill="#273b3d" opacity=".7"/>
 <use href="#atlas-mountain" x="-12" y="478" width="130" height="105"/><use href="#atlas-mountain" x="340" y="610" width="128" height="105"/><use href="#atlas-mountain" x="1" y="776" width="94" height="92"/>
 <path d="M0 935Q144 868 253 945T440 904V1450H0Z" fill="#24483a"/>
 ${Array.from({length:28},(_,i)=>{const side=i%2,x=side?365+(i%3)*22:8+(i%3)*22,y=950+Math.floor(i/2)*35;return `<use href="#atlas-pine" x="${x}" y="${y}" width="${28+i%4*5}" height="${52+i%4*7}" opacity="${.55+i%3*.15}"/>`;}).join('')}
 ${Array.from({length:28},(_,i)=>`<path d="m${17+(i*79)%400} ${85+(i*113)%1300} 8-4 10 5-4 6Z" fill="#b4b897" opacity=".09"/>`).join('')}
 <path d="M0 865Q133 824 243 872T440 830" fill="none" stroke="#c6c9a3" stroke-width="20" opacity=".055"/>${Array.from({length:18},(_,i)=>`<path d="M-10 ${90+i*73} Q${80+i%3*30} ${40+i*73} 211 ${100+i*73} T450 ${80+i*73}" fill="none" stroke="#c5bd93" stroke-width=".6" opacity=".045"/>`).join('')}<rect width="440" height="1450" fill="url(#atlas-mist)"/>
 <path d="M8 0V1450M432 0V1450" stroke="#c0af7d" stroke-opacity=".17" stroke-width="2"/>
 </svg>`;}
function mapNodeIcon(id){const shape={
 swordsman:'<path d="m19 5 4 5-8 15-6-3Z"/><path d="m5 20 13 7m-9-2-4 7"/>',
 heavy_knight:'<path d="M7 8q9-7 18 0v12l-9 10-9-10Z"/><path d="M9 14h14m-7 0v11"/>',
 rogue:'<path d="m21 4 6 6-14 15-6-6Z"/><path d="m4 22 10 8m-7-3-3 4"/>',
 duelist:'<path d="m5 8 5 9 6-13 6 13 5-9v20H5Z"/><path d="m10 21 6 4 6-4"/>',
 rest:'<path d="m5 27 10-20 12 20Zm10-20v20m-6 0 6-10 6 10"/>',
 camp:'<path d="m5 27 10-20 12 20Zm10-20v20m-6 0 6-10 6 10"/>',
 shop:'<path d="M5 14h22v15H5Zm-2 0 4-8h18l4 8m-17 0v15m9-15v15"/>',
 shrine:'<path d="m16 3 5 9 10 4-10 4-5 10-5-10-10-4 10-4Z"/>',
 treasure:'<path d="M4 14q12-12 24 0v15H4Zm0 4h24m-14-5h4v10h-4Z"/>',
 event:'<path d="M10 10q0-7 7-6 9 1 6 9l-7 6v3m0 5v3"/>',
 boss:'<path d="m3 9 8 7 5-12 5 12 8-7-3 20H6Z"/><path d="M8 24h16"/>'
 }[id]||'';return `<svg viewBox="0 0 32 34" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;}
