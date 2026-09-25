(function(root){
  'use strict';
  const engine=root.TasteCode;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey='sajuTasteV1';
  let answers=[],step=0,current=null,incomingType=null;
  function readSaved(){
    try{
      const stored=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(!stored||stored.version!==engine.version)return null;
      const result=engine.assess(stored.answers);
      return result?{...result,answers:stored.answers}:null;
    }catch{return null;}
  }
  function refreshSaved(){
    const saved=readSaved();
    $('tasteSaved').hidden=!saved;
    if(saved){const type=engine.getType(saved.code);$('tasteSavedName').textContent=`${type.code} · ${type.name}`;}
  }
  function renderDirectory(myCode){
    $('tasteTypes').innerHTML=engine.types.map(type=>`<button class="tc-type-tile${type.code===myCode?' is-me':''}" type="button" onclick="showTasteType('${type.code}')" aria-label="${type.code} ${esc(type.name)} 유형 보기"><b>${type.code}</b><span>${type.emoji} ${esc(type.name)}</span><small>${engine.describe(type.code).map(d=>d.label).join(' · ')}${type.code===myCode?' · 내 유형':''}</small></button>`).join('');
  }
  function startTaste(){
    answers=[];step=0;current=null;
    $('tasteIntro').style.display='none';
    $('tasteResult').classList.remove('show');
    $('tasteQuiz').style.display='block';
    $('tasteTypesCard').hidden=true;
    $('tasteError').textContent='';
    setMode(2);
    renderQuestion();
    $('tasteQuiz').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderQuestion(){
    const q=engine.questions[step];
    $('tasteBar').style.width=`${step/engine.questions.length*100}%`;
    $('tasteProgress').setAttribute('aria-valuenow',String(step));
    $('tasteQNum').textContent=`${step+1} / ${engine.questions.length}`;
    $('tasteQ').textContent=q.q;
    $('tasteOpts').innerHTML=q.options.map((option,i)=>`<button type="button" class="taste-opt" aria-pressed="${answers[step]===i}" onclick="tastePick(${i})">${esc(option.text)}</button>`).join('');
    $('tasteBack').disabled=step===0;
    $('tasteNext').disabled=!Number.isInteger(answers[step]);
    $('tasteNext').textContent=step===engine.questions.length-1?'내 입맛코드 보기 →':'다음 질문 →';
    $('tasteQ').focus({preventScroll:true});
  }
  function tastePick(choice){
    if(choice!==0&&choice!==1)return;
    answers[step]=choice;
    $('tasteOpts').querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===choice)));
    $('tasteNext').disabled=false;
  }
  function tasteNext(){
    if(!Number.isInteger(answers[step]))return;
    if(step<engine.questions.length-1){step++;renderQuestion();return;}
    const assessment=engine.assess(answers);if(!assessment)return;
    let saved=true;
    try{localStorage.setItem(storageKey,JSON.stringify({version:engine.version,answers}));}catch{saved=false;}
    refreshSaved();
    renderResult(assessment.code,assessment,'mine');
    $('tasteSaveNote').textContent=saved?'이 브라우저에 결과를 기억했어요. 다음에 다시 볼 수 있어요.':'이 브라우저에는 저장하지 못했어요. 결과 링크나 이미지를 남겨주세요.';
  }
  function tastePrev(){if(step>0){step--;renderQuestion();}}
  function showSavedTaste(){
    const saved=readSaved();if(!saved){refreshSaved();startTaste();return;}
    renderResult(saved.code,saved,'mine');
  }
  function showTasteType(code){if(engine.getType(code))renderResult(code,null,'preview');}
  function guideFor(code){return [
    code[0]==='E'?['밥자리','좋아하는 사람과 메뉴를 나누는 쪽을 더 자주 골랐어요.']:['밥자리','혼자 내 속도대로 식사하는 쪽을 더 자주 골랐어요.'],
    code[1]==='S'?['주문할 때','매콤한 메뉴를 먼저 살펴보세요. 맵기는 먹기 편한 수준으로요.']:['주문할 때','담백한 메뉴를 먼저 살펴보세요. 양념을 따로 받는 것도 좋아요.'],
    code[3]==='A'?['다음 한 끼','좋아하는 '+(code[2]==='R'?'밥':'면')+' 메뉴를 처음 가보는 식당에서 찾아보세요.']:['다음 한 끼','좋아하는 단골집의 '+(code[2]==='R'?'밥':'면')+' 메뉴로 편하게 정해보세요.'],
  ];}
  function renderAxes(type,assessment){
    $('tasteAxes').innerHTML=engine.describe(type.code).map((part,i)=>{
      const axis=engine.axes[i];
      const votes=assessment?assessment.counts[i]:null;
      return `<div class="tc-axis"><div class="tc-axis-head"><b>${esc(axis.name)} · ${part.letter} ${esc(part.label)}</b><span>${axis.letters[0]} / ${axis.letters[1]}</span></div>`+
        (votes?`<div class="tc-axis-track" aria-hidden="true"><i style="width:${votes[0]/3*100}%"></i></div><div class="tc-axis-caption">${axis.labels[0]} ${votes[0]}개 · ${axis.labels[1]} ${votes[1]}개 선택 / 총 3문항</div>`:`<div class="tc-axis-caption">${esc(part.word)} · ${esc(part.description)}</div>`)+`</div>`;
    }).join('');
    $('tasteAxesNote').textContent=assessment?'각 축을 3문항씩 물어 더 많이 선택한 쪽으로 정했어요. 2:1인 축은 상황에 따라 달라질 수 있어요.':'유형 코드에 담긴 네 가지 취향이에요. 개별 답변과 선택 개수는 공유되지 않아요.';
  }
  function renderResult(code,assessment,origin){
    const type=engine.getType(code);if(!type)return;
    current={type,assessment,origin};
    $('tasteIntro').style.display='none';
    $('tasteQuiz').style.display='none';
    $('tasteTypesCard').hidden=false;
    $('tasteTypesDetails').open=false;
    const hero=$('tasteHero');
    hero.style.cssText=`background:linear-gradient(160deg,${type.color}1c,${type.color}08);border:1px solid ${type.color}55`;
    hero.innerHTML=`<div class="tc-origin">${origin==='mine'?'나의 입맛코드':origin==='shared'?'공유받은 입맛코드':'입맛코드 구경하기'}</div><div class="th-emoji">${type.emoji}</div><div class="tc-letters" aria-label="입맛코드 ${type.code}">${engine.describe(type.code).map(part=>`<div class="tc-letter"><b style="color:${type.color}">${part.letter}</b><span>${part.label}</span></div>`).join('')}</div><div class="tc-type-name" style="color:${type.color}">${esc(type.name)}</div><p class="tc-tag">“${esc(type.tag)}”</p>`;
    $('tasteTry').hidden=origin==='mine';
    $('tasteTry').textContent=origin==='shared'?'나도 테스트하고 비교하기 →':'내 입맛코드 찾기 →';
    $('tasteOwnReturn').hidden=origin==='mine'||!readSaved();
    $('tasteOwnReturn').textContent=origin==='shared'?'저장된 내 결과와 비교하기':'저장된 내 결과 보기';
    $('tasteSaveNote').textContent=origin==='mine'?'취향은 달라질 수 있어요. 지금의 평소 입맛으로 기억해 주세요.':'이 유형은 내 검사 결과로 저장되지 않아요.';
    $('tasteMenus').innerHTML=type.menus.map((name,i)=>`<div class="taste-menu-item"><span class="tm-name">${i+1}. ${esc(name)}</span></div>`).join('');
    $('tasteGuide').innerHTML=guideFor(code).map(([label,text])=>`<li><b>${label}</b>${esc(origin==='mine'?text:text.replace('더 자주 골랐어요.','선호하는 유형이에요.'))}</li>`).join('');
    renderAxes(type,assessment);
    $('tasteCompareCard').hidden=origin!=='mine';
    $('tasteFriendCode').value=incomingType||'';
    renderTasteComparison();
    const params=new URLSearchParams({m:'taste',type:type.code});
    root._tasteLink=`${location.origin}${location.pathname}?${params}`;
    const labels=engine.describe(type.code).map(part=>part.label).join(' · ');
    root._tasteKakao=`🍽️ ${origin==='mine'?'내 입맛코드는':'이 입맛코드는'} ${type.code} · ${type.name}!\n${labels}\n“${type.tag}”\n너는 무슨 입맛코드야?`;
    root._tasteShare=`${root._tasteKakao}\n\n추천 메뉴: ${type.menus.join(' · ')}\n내 유형 보기 / 친구와 비교하기 👉 ${root._tasteLink}\n#입맛코드 #사주메뉴`;
    refreshTasteMiniCard();
    const own=origin==='mine'?type.code:readSaved()?.code;
    renderDirectory(own);
    $('tasteResult').classList.add('show');
    $('tasteResult').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function renderTasteComparison(){
    const code=$('tasteFriendCode').value;
    if(!current||current.origin!=='mine'||!engine.getType(code)){$('tasteComparison').replaceChildren();return;}
    const friend=engine.getType(code),comparison=engine.compare(current.type.code,code);
    $('tasteComparison').innerHTML=`<div class="tc-compare-title">${esc(friend.name)}와<br>네 가지 취향 중 ${comparison.same}개가 같아요</div>`+
      '<div class="tc-compare-row"><span>기준</span><b>나</b><b>친구</b></div>'+
      comparison.axes.map(axis=>`<div class="tc-compare-row"><span>${axis.axis}</span><span>${axis.mine}</span><span class="${axis.same?'match':''}">${axis.friend}${axis.same?' ✓':''}</span></div>`).join('')+
      `<p class="tc-compare-tip">${comparison.tips.map(esc).join('<br>')}</p><p class="tc-note">다르다고 안 맞는 사이는 아니에요. 같이 메뉴를 고를 때 참고해 주세요.</p>`;
  }
  function refreshTasteMiniCard(){
    if(!current)return;
    const type=current.type;
    fillMiniCard({brand:'사주메뉴 · 입맛코드',date:null,emoji:type.emoji,sub2:engine.describe(type.code).map(part=>part.label).join(' · '),eyebrow:type.name,big:type.code,sub:'“'+type.tag+'”',rel:null,accent:type.color,scores:`추천 메뉴 <b>${type.menus.map(esc).join(' · ')}</b>`,cta:'너는 무슨 입맛코드야? · sajumenu.com'});
  }
  async function downloadTasteImage(){if(!current)return;refreshTasteMiniCard();await downloadMiniCard('miniCardX','tasteImgBtn','입맛코드-'+current.type.code);}
  async function copyTaste(){
    if(!root._tasteShare)return;
    try{await navigator.clipboard.writeText(root._tasteShare);$('tasteCopyBtn').textContent='✓ 복사했어요';setTimeout(()=>$('tasteCopyBtn').textContent='🔗 결과 링크 복사',2000);}
    catch{window.prompt('결과 링크를 복사해주세요.',root._tasteLink);}
  }
  Object.assign(root,{startTaste,tastePick,tasteNext,tastePrev,showSavedTaste,showTasteType,renderTasteComparison,downloadTasteImage,copyTaste});
  $('tasteFriendCode').innerHTML='<option value="">친구의 코드를 골라주세요</option>'+engine.types.map(type=>`<option value="${type.code}">${type.code} · ${esc(type.name)}</option>`).join('');
  refreshSaved();
  renderDirectory(readSaved()?.code);
  const params=new URLSearchParams(location.search);
  if(params.get('m')==='taste'&&params.has('type')){
    const shared=engine.getType(params.get('type'));
    if(shared){incomingType=shared.code;setMode(2);renderResult(shared.code,null,'shared');}
    else{$('tasteError').textContent='찾을 수 없는 유형 코드예요. 새 테스트로 내 코드를 찾아보세요.';}
  }
})(globalThis);
