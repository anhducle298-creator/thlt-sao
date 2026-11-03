import {writeFileSync} from 'node:fs';
import {createGame,reduce,defaultFarm,skillAvailable,type Action,type State} from '../src/engine';
import {maxHp,maxMp,maxSta} from '../src/balance';
import {items,place,skills} from '../src/content';
import {validateSave} from '../src/saves';

function campaign(seed:number){let s=createGame(seed);let actions=0;const trace:string[]=[];let failure='';
 const dispatch=(a:Action)=>{if(++actions>30000)throw new Error('Vượt 30.000 hành động');s=reduce(s,a);validateSave(s);};
 function drain(){for(let i=0;i<4000&&(s.activity||s.choice||s.battle);i++){
  if(s.hp<=0){failure=s.summary||'Thất bại';return;}
  if(s.choice){const c=s.choice;const id=c.kind==='encounter'?(c.enemy?.startsWith('boss')?'fight':'avoid'):c.kind==='arrival'?'explore':c.kind==='trap'?'disarm':c.kind==='quest'?'pay':c.kind==='rescue'?'unlock':c.kind==='chest'?'open':c.kind==='clue'?'read':c.kind==='traveler'?'ignore':c.options[0].id;dispatch({type:'choose',id:c.options.some(o=>o.id===id)?id:c.options[0].id});}
  else if(s.battle?.important){const b=s.battle;let id='attack';if(b.round%3===2&&b.enemy.boss)id='defend';else if(s.hp<maxHp(s)*.6&&s.bag.hp)id='potion:hp';else{const k=skills.filter(k=>k.mult&&skillAvailable(s,k.id)).sort((a,c)=>c.mult*(c.element===b.enemy.weak?1.5:1)-a.mult*(a.element===b.enemy.weak?1.5:1))[0];if(k)id=k.id;else if(s.mp<4&&s.bag.mp)id='potion:mp';else if(s.sta<3&&s.bag.sta)id='potion:sta';}dispatch({type:'turn',id});}
  else dispatch({type:'tick'});
 }if(s.activity||s.choice||s.battle)throw new Error('Hoạt động không kết thúc');}
 function travel(id:string){if(s.location===id)return;dispatch({type:'travel',id});drain();if(s.location!==id)throw new Error(`Không tới ${id}: ${s.lastStop}`);}
 function heal(){for(let i=0;i<5&&(s.hp<maxHp(s)-.01||s.mp<maxMp(s)-.01||s.sta<maxSta(s)-.01);i++){dispatch({type:'rest',value:240});drain();}}
 function town(){travel('village');heal();
  for(const id of ['fang','ore','cloth','herb','crystal'])for(let i=0;i<50&&(s.bag[id]||0)>0;i++)dispatch({type:'sell',id});
  for(const g of [...s.gear])if(!Object.values(s.equipped).includes(g.uid))dispatch({type:'sellGear',value:g.uid});
  for(const id of ['hp','mp','sta'])for(let i=0;i<10&&(s.bag[id]||0)<({hp:6,mp:4,sta:3}[id]||0)&&s.gold>=items.find(x=>x.id===id)!.price;i++)dispatch({type:'buy',id});
  dispatch({type:'repair'});
  for(const id of ['first','hunt']){dispatch({type:'claim',id});if(s.choice)drain();}
 }
 function loadout(floor:number){const targets=floor===1?['shot','fire','heal','ward']:['fire','light','heal','ward'];for(const id of [...s.active])dispatch({type:'skill',id});for(const id of targets)dispatch({type:'skill',id});}
 function gear(id:string){const existing=s.gear.find(g=>g.id===id);if(!existing&&s.gold>=items.find(i=>i.id===id)!.price)dispatch({type:'buy',id});const found=s.gear.find(g=>g.id===id);if(found)dispatch({type:'equip',value:found.uid});}
 try{
  for(let floor=1;floor<=3&&!failure;floor++){
   const targetLevel=[2,4,6][floor-1];const field=['grove','garden','forge'][floor-1];
   for(let farm=0;s.level<targetLevel&&farm<12;farm++){
    town();if(floor===1)travel('grove');else{travel(floor===2?'root':'quay');travel(field);}heal();
    dispatch({type:'farm',config:{...defaultFarm,target:3,duration:180,stopEmpty:false}});drain();
    if(failure)break;
   }
   if(failure)break;town();loadout(floor);
   gear(floor===1?'bow':'staff');gear('ash0');if(floor>=2){gear('ash1');gear('ash2');}if(floor===3){gear('ash5');gear('ash6');}
   // Supplies take precedence over additional gear; remaining gaps are earned at the tavern.
   for(let job=0;job<15&&((s.bag.hp||0)<6||(s.bag.mp||0)<4||(s.bag.sta||0)<3);job++){dispatch({type:'job',id:'tavern'});drain();town();}
   if(floor===1){travel('road');travel('mine');travel('bell');}else if(floor===2){travel('root');travel('garden');travel('pond');travel('heart');}else{travel('quay');travel('forge');travel('bridge');travel('dawn');}
   heal();dispatch({type:'boss'});drain();trace.push(`Tầng ${floor}: cấp ${s.level}, ${s.minutes-360} phút tích lũy, ${s.gold} đồng, boss ${s.flags.includes('boss'+floor)?'đã vượt':'chưa vượt'}`);
   if(!s.flags.includes('boss'+floor)){failure=s.summary||'Không thắng boss';break;}
  }
 }catch(e){failure=String(e);}
 return {seed,completed:s.bosses===3,failure:failure||null,actions,minutes:s.minutes-360,level:s.level,stats:s.stats,gold:s.gold,trace,tail:s.log.slice(0,6)};
}
const result=[1,17,104729].map(campaign);writeFileSync('artifacts/campaign.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(result.some(r=>!r.completed))process.exitCode=1;
