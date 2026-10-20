const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const catalog=require('./common-menu-catalog.json'),allowed=new Set(catalog.names);
const read=key=>vm.runInNewContext('('+html.match(new RegExp('const '+key+'=([\\s\\S]*?);'))[1]+')');
const data=read('OH_MENUS');
test('all general recommendation surfaces use reviewed common menu names',()=>{
 const scope={};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/taste-code.js'),'utf8'),scope);
 const names=[...Object.values(data).flatMap(g=>Object.values(g).flat()).map(m=>m.m),...Object.values(read('COMPAT_FOCUS_MENUS')).flat().map(m=>m.m),...Object.values(read('WX_MENU')).flatMap(w=>w.menus),...scope.TasteCode.types.flatMap(t=>t.menus)];
 for(const name of names)assert.ok(allowed.has(name),'Review availability before adding: '+name);
 for(const name of ['된장비빔국수','로제투도우펀','치폴레 웜볼 도시락','매콤 타코라이스','벽돌 치즈스틱'])assert.ok(!names.includes(name));
});
// 기본 5개 + 주간 트렌드 메뉴(// trend: 주석)로 한 칸에 최대 6개. 트렌드 2종(굴국밥·꽃게탕) 반영 후 92종(2026-10-20)
test('each element and mood has five base meals (+ at most one trend); metadata stays complete',()=>{
 assert.equal(Object.keys(data).length,5);
 for(const group of Object.values(data)){
  assert.equal(Object.keys(group).length,6);
  for(const menus of Object.values(group)){assert.ok(menus.length>=5&&menus.length<=6);assert.equal(new Set(menus.map(m=>m.m)).size,menus.length);for(const m of menus){assert.ok(m.s.trim());assert.ok(m.r.trim());}}
 }
 assert.equal(new Set(Object.values(data).flatMap(g=>Object.values(g).flat()).map(m=>m.m)).size,92);
});
