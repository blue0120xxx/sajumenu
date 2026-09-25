const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const context=vm.createContext({});
for(const file of ['assets/vendor/korean-lunar-calendar-0.4.0.min.js','assets/calendar.js','assets/menu-planner.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const {MenuCalendar:calendar,MenuPlanner:planner}=context;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const menuData=vm.runInContext('('+html.match(/const OH_MENUS=([\s\S]*?);\s*\/\/ 기분별/)[1]+')',context);
const plain=value=>JSON.parse(JSON.stringify(value));

test('custom dates validate only their own tab, including past-date rejection',()=>{
  for(const tab of [0,1,2]){
    const inputs=[0,1,2].map(i=>({value:'2026-10-01',validity:{valid:i===tab}}));
    const scope=vm.createContext({MenuCalendar:calendar,now:new Date(2026,8,25),...Object.fromEntries(inputs.map((input,i)=>['tg'+i+'DateInput',input])),...Object.fromEntries([0,1,2].map(i=>['targetMode'+i,1]))});
    const fn=html.match(new RegExp('function getTargetDate'+tab+'\\(\\)\\{[\\s\\S]*?\\n\\}'))[0];
    vm.runInContext(fn,scope);
    const getDate=scope['getTargetDate'+tab];
    assert.equal(getDate().getDate(),1,'other tabs must not block this date');
    inputs[tab].validity.valid=false;
    for(const i of [0,1,2])if(i!==tab)inputs[i].validity.valid=true;
    assert.equal(getDate(),null,'an invalid date in this tab must be rejected');
    inputs[tab].validity.valid=true;inputs[tab].value='2026-02-31';
    assert.equal(getDate(),null);
    inputs[tab].value='';assert.equal(getDate(),null);
    scope['targetMode'+tab]=0;assert.ok(getDate());
  }
});

test('group-result names are escaped in every HTML insertion',()=>{
  const scope=vm.createContext({});
  vm.runInContext(html.match(/function escapeHtml\(value\)\{[^\n]+/)[0],scope);
  const input='<b>별명</b> & "친구"';
  assert.equal(scope.escapeHtml(input),'&lt;b&gt;별명&lt;/b&gt; &amp; &quot;친구&quot;');
  const fn=html.match(/function determinePayer\(\)\{[\s\S]*?\n\}/)[0];
  assert.ok(fn.includes('<div class="rank-name">${escapeHtml(r.displayName)}'));
  assert.ok(fn.includes('scores:results.map((r,i)=>`${i+1}위 ${escapeHtml(r.displayName)}'));
});

test('all inline scripts parse; structured data stays valid',()=>{
  for(const [,attrs,body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
    if(attrs.includes('application/ld+json'))JSON.parse(body);
    else if(body.trim())new vm.Script(body);
  }
});
test('invalid Gregorian dates are rejected, including non-leap February 29',()=>{
  for(const date of [[1990,2,31],[1990,2,29],[2000,4,31],[2024,0,10],[2024,13,1],[2024,1,0],[2024,1,1.5]])assert.equal(calendar.convert(...date),null);
  assert.deepEqual(plain(calendar.convert(2000,2,29)),{y:2000,m:2,d:29});
  assert.equal(calendar.daysInMonth(1990,2),28);
  assert.equal(calendar.daysInMonth(2000,2),29);
});
test('known Korean lunar dates and intercalary month convert correctly',()=>{
  assert.deepEqual(plain(calendar.convert(1956,1,21,true)),{y:1956,m:3,d:3});
  assert.deepEqual(plain(calendar.convert(2017,5,1,true,true)),{y:2017,m:6,d:24});
  assert.deepEqual(plain(calendar.convert(2023,2,1,true,true)),{y:2023,m:3,d:22});
  assert.deepEqual(plain(calendar.convert(2024,1,1,true)),{y:2024,m:2,d:10});
  assert.equal(calendar.convert(2017,3,1,true,true),null);
  assert.equal(calendar.convert(2024,1,31,true),null);
  assert.equal(calendar.convert(2050,11,19,true),null);
});
test('lunar month limits match the conversion table for every supported birth year',()=>{
  for(let y=1940;y<=2026;y++)for(let m=1;m<=12;m++)for(const leap of [false,true]){
    const days=calendar.daysInMonth(y,m,true,leap);
    assert.ok([0,29,30].includes(days));
    if(days){assert.ok(calendar.convert(y,m,days,true,leap));assert.equal(calendar.convert(y,m,days+1,true,leap),null);}
  }
});
test('missing lunar asset fails closed but Gregorian validation still works',()=>{
  const isolated=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'assets/calendar.js'),'utf8'),isolated);
  assert.equal(isolated.MenuCalendar.convert(2024,1,1,true),null);
  assert.ok(isolated.MenuCalendar.convert(2000,2,29));
});
test('day pillars match the Korean calendar across 1940–2050',()=>{
  for(const name of ['GAN','GAN_HJ','ZHI','ZHI_HJ','GAN_OH']){
    const declaration=html.match(new RegExp('const '+name+'\\s*=[^;]+;'))[0];
    vm.runInContext(declaration,context);
  }
  vm.runInContext(html.match(/function dayPillar\(y,m,d\)\{[\s\S]*?\n\}/)[0],context);
  for(let y=1940;y<=2050;y++)for(let m=1;m<=12;m++){
    const ref=new context.KoreanLunarCalendar();
    assert.ok(ref.setSolarDate(y,m,15));
    assert.equal(context.dayPillar(y,m,15).name+'일',ref.getKoreanGapja().day);
  }
});
test('meal plans stay practical across all elements and moods (6,000 plans)',()=>{
  for(let element=0;element<5;element++)for(let mood=0;mood<6;mood++)for(let seed=0;seed<100;seed++)for(const mild of [false,true]){
    const plan=planner.plan(menuData,element,mood,seed,mild);
    const names=[plan.main.m,plan.breakfast.m,plan.dinner.m];
    assert.equal(new Set(names).size,3,'no duplicate meals');
    assert.ok(planner.isBreakfast(plan.breakfast.m));
    for(const name of names)assert.equal(planner.isSnack(name),false);
    if(mild)for(const name of names)assert.equal(planner.isSpicy(name),false);
    if(planner.isSpicy(plan.main.m))assert.equal(planner.isSpicy(plan.dinner.m),false);
    assert.deepEqual(plain(planner.plan(menuData,element,mood,seed,mild)),plain(plan),'stable daily result');
  }
});
test('the reported fire-element example has a breakfast dish and mild dinner',()=>{
  const plan=planner.plan(menuData,1,0,20260925+1990+600+15);
  assert.equal(planner.isSpicy(plan.breakfast.m),false);
  assert.equal(planner.isSpicy(plan.dinner.m),false);
});
