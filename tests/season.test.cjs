// 제철 메뉴 만료 검사: index.html 에서 `// trend:날짜 season-end:YYYY-MM-DD` 가 붙은 메뉴는
// 그 날짜가 지나면 이 테스트가 실패한다 → 해당 메뉴를 빼라는 신호(GitHub Actions season-check 가 매일 실행).
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const today=process.env.SEASON_TODAY||new Date(Date.now()+9*3600e3).toISOString().slice(0,10); // 한국 날짜

function seasonalMenus(){
 const out=[],re=/"m":\s*"([^"]+)"[^}]*\}\s*\/\/[^\n]*season-end:(\d{4}-\d{2}-\d{2})/g;
 for(let m;(m=re.exec(html));)out.push({name:m[1],end:m[2]});
 return out;
}

test('seasonal menus are removed once their season ends',()=>{
 const expired=seasonalMenus().filter(m=>m.end<today);
 assert.deepEqual(expired,[],'제철이 끝난 메뉴를 index.html·common-menu-catalog.json 에서 빼고 메뉴 개수 테스트를 줄이세요: '+expired.map(m=>m.name+'('+m.end+')').join(', '));
});

test('season marker parser finds the current seasonal menus',()=>{
 for(const m of seasonalMenus())assert.match(m.end,/^\d{4}-\d{2}-\d{2}$/);
});
