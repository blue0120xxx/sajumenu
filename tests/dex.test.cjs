const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const data=vm.runInNewContext('('+html.match(/const OH_MENUS=([\s\S]*?);\s*\/\/ 기분별/)[1]+')');
const block=html.slice(html.indexOf('const MENU_DEX='),html.indexOf('// 다이어리 탭 안에서 기록 / 도감 화면 전환'));
function setup(raw='[]',diary=[],fail=false){
 let stored=raw;const nodes={dexProgress:{},dexGrid:{}};
 const c=vm.createContext({OH_MENUS:data,OH_EMOJI:['a','b','c','d','e'],OH_NICK:['a','b','c','d','e'],loadDiary:()=>diary,document:{getElementById:id=>nodes[id]},localStorage:{getItem:()=>stored,setItem:(_,v)=>{if(fail)throw Error('blocked');stored=v;}}});
 vm.runInContext(block,c);return {c,nodes,stored:()=>stored};
}
test('dex initializes diary migration after catalog and has exactly 90 unique entries',()=>{
 const {c,nodes}=setup('[]',[{menu:'만두국'},{menu:'된장비빔국수'}]);
 assert.equal(c.loadDex().join(','),'만둣국');c.renderDex();
 assert.match(nodes.dexProgress.innerHTML,/1 .*\/ 90/);assert.equal((nodes.dexGrid.innerHTML.match(/class="dex-item[ "]/g)||[]).length,90);
});
test('old aliases merge without duplicates or awarding unrelated replacements; history stays intact',()=>{
 const old=['만두국','만둣국','쌈밥 정식','된장비빔국수','로제투도우펀'];const {c,stored}=setup(JSON.stringify(old));
 assert.equal(c.loadDex().join(','),'만둣국,쌈밥');assert.equal(c.collectMenus(['만두국','쌈밥','김밥','김밥','된장비빔국수']),1);
 assert.deepEqual(JSON.parse(stored()),[...old,'김밥']);assert.equal(c.loadDex().length,3);
});
test('corrupted and unavailable storage cannot crash or claim successful collection',()=>{
 for(const raw of ['null','{}','42','"bad"','{broken','[null,42,"김밥"]']){const {c}=setup(raw);assert.doesNotThrow(()=>c.renderDex());}
 const {c}=setup('[]',[],true);assert.equal(c.collectMenus(['김밥']),0);assert.equal(c.collectMenus(null),0);
});
test('full collection reaches exactly 100%, ignoring retired dishes',()=>{
 const names=[...new Set(Object.values(data).flatMap(g=>Object.values(g).flat()).map(m=>m.m))];const {c,nodes}=setup(JSON.stringify([...names,'된장비빔국수']));c.renderDex();
 assert.match(nodes.dexProgress.innerHTML,/90 .*\/ 90/);assert.match(nodes.dexProgress.innerHTML,/100%/);
});
