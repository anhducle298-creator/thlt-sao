import {writeFileSync} from 'node:fs';
import {progressionStudy,bossStudy,farmStudy} from '../src/simulation';
import {validateContent} from '../src/validate-content';
const seeds=Array.from({length:100},(_,i)=>i+1);
const bosses=[1,2,3].map(floor=>{const prepared=seeds.map(seed=>bossStudy(floor,seed));const noDefend=seeds.map(seed=>bossStudy(floor,seed,false));return {floor,preparedWinRate:prepared.filter(x=>x.win).length,noDefendWinRate:noDefend.filter(x=>x.win).length,meanMinutes:prepared.reduce((n,x)=>n+x.minutes,0)/100,examples:prepared.slice(0,3)};});
const farm=seeds.map(seed=>farmStudy(seed));
const report={dataErrors:validateContent(),progression:progressionStudy(100),bossSnapshots:{assumption:'100 seed/tầng, cấp 2/4/6; bộ đồ cửa hàng theo tầng; 6 HP/4 MP/3 STA. Đây là ảnh chụp đã chuẩn bị, không thay thế playthrough tự nhiên.',results:bosses},farm:{assumption:'100 seed mới, Lùm tần bì, 180 phút hoặc 6 quái, không dừng ngay khi hết thuốc.',meanMinutes:farm.reduce((n,x)=>n+x.minutes,0)/100,meanKills:farm.reduce((n,x)=>n+x.kills,0)/100,meanNetBeforeLootAndRepair:farm.reduce((n,x)=>n+x.netBeforeLootAndRepair,0)/100,meanNetAfterConsumablesAndRepair:farm.reduce((n,x)=>n+x.netAfterConsumablesAndRepair,0)/100,failures:farm.filter(x=>x.failed).length,examples:farm.slice(0,3)}};
writeFileSync('artifacts/balance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
