const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/taste-code.js'),'utf8'),context);
const e=context.TasteCode;
test('12 balanced questions and 16 distinct memorable codes',()=>{
 assert.equal(e.questions.length,12);assert.equal(new Set(e.questions.map(q=>q.id)).size,12);
 for(let i=0;i<4;i++){
  const qs=e.questions.filter(q=>q.axis===i);assert.equal(qs.length,3);
  for(const q of qs)assert.equal([...q.options.map(o=>o.letter)].sort().join(''),[...e.axes[i].letters].sort().join(''));
 }
 assert.equal(e.types.length,16);assert.equal(new Set(e.types.map(t=>t.code)).size,16);assert.equal(new Set(e.types.map(t=>t.name)).size,16);
 for(const t of e.types){assert.equal(e.describe(t.code).length,4);assert.equal(new Set(t.menus).size,3);}
});
test('all 4096 answer patterns are deterministic, balanced, and change only the answered axis',()=>{
 const distribution={};
 for(let n=0;n<4096;n++){
  const answers=Array.from({length:12},(_,i)=>(n>>i)&1),r=e.assess(answers);
  assert.ok(e.getType(r.code));assert.equal(JSON.stringify(r),JSON.stringify(e.assess(answers)));
  distribution[r.code]=(distribution[r.code]||0)+1;
  r.counts.forEach(c=>assert.equal(c[0]+c[1],3));
  for(let i=0;i<12;i++){const altered=[...answers];altered[i]=1-altered[i];const next=e.assess(altered);for(let a=0;a<4;a++)if(a!==e.questions[i].axis)assert.equal(next.code[a],r.code[a]);}
 }
 assert.equal(Object.keys(distribution).length,16);Object.values(distribution).forEach(n=>assert.equal(n,256));
});
test('malformed answers and unknown codes safely reject',()=>{
 for(const bad of [null,{},[],new Array(12),Array(11).fill(0),Array(13).fill(1),Array(12).fill('0'),Array(12).fill(2),Array(12).fill(null)])assert.equal(e.assess(bad),null);
 for(const bad of [null,{},'', 'ABCD','<img src=x onerror=alert(1)>'])assert.equal(e.getType(bad),null);
 assert.equal(e.getType(' isrf ').code,'ISRF');assert.equal(e.compare('ISRF','invalid'),null);
});
test('comparison shows actual shared axes and practical differences',()=>{
 for(const a of e.types)for(const b of e.types){const result=e.compare(a.code,b.code);assert.equal(result.same,[...a.code].filter((c,i)=>c===b.code[i]).length);assert.ok(result.tips.length>0);assert.equal(e.compare(b.code,a.code).same,result.same);}
 assert.equal(e.compare('ESRA','IMNF').same,0);assert.equal(e.compare('ISRF','ISRF').same,4);
});
