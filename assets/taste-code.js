/* 입맛코드 v1: 4 independent preferences, 3 fixed questions each. */
(function(root){
  'use strict';
  const axes=[
    {id:'company',name:'밥자리',letters:['E','I'],labels:['함께','혼자'],words:['Eating together','Individual dining'],descriptions:['이야기를 나누며 함께 먹는 쪽','내 속도대로 편하게 먹는 쪽']},
    {id:'flavor',name:'맛',letters:['S','M'],labels:['매콤','담백'],words:['Spicy','Mild'],descriptions:['먹을 수 있는 범위에서 매콤한 맛','자극이 적고 담백한 맛']},
    {id:'staple',name:'한 끼',letters:['R','N'],labels:['밥','면'],words:['Rice','Noodles'],descriptions:['밥이 중심인 한 끼','면이 중심인 한 끼']},
    {id:'choice',name:'선택',letters:['A','F'],labels:['도전','단골'],words:['Adventure','Familiar'],descriptions:['처음 보는 메뉴를 시도하는 쪽','좋아하는 메뉴를 다시 찾는 쪽']},
  ];
  const questions=[
    {id:'company-1',axis:0,q:'메뉴와 가격이 같다면, 더 마음 편한 점심은?',options:[{text:'좋아하는 사람과 이야기하며 먹기',letter:'E'},{text:'혼자 내 속도대로 먹기',letter:'I'}]},
    {id:'flavor-1',axis:1,q:'같은 요리의 양념을 고른다면?',options:[{text:'재료 맛이 잘 느껴지는 담백한 양념',letter:'M'},{text:'먹을 수 있는 만큼 매콤한 양념',letter:'S'}]},
    {id:'staple-1',axis:2,q:'둘 다 맛있는 집이라면, 오늘의 한 끼는?',options:[{text:'밥과 반찬이 있는 한 상',letter:'R'},{text:'국수나 파스타 한 그릇',letter:'N'}]},
    {id:'choice-1',axis:3,q:'가격과 대기 시간이 비슷한 두 식당. 어디로 갈까?',options:[{text:'맛을 알고 있는 단골집',letter:'F'},{text:'궁금했던 새로운 식당',letter:'A'}]},
    {id:'company-2',axis:0,q:'꼭 같이 먹어야 하는 약속이 없는 날이라면?',options:[{text:'혼자 편하게 식사하고 싶다',letter:'I'},{text:'함께 먹을 사람을 찾아보고 싶다',letter:'E'}]},
    {id:'flavor-2',axis:1,q:'찌개나 국수를 주문할 때 평소 내 선택은?',options:[{text:'얼큰하거나 칼칼한 맛',letter:'S'},{text:'맑고 순한 맛',letter:'M'}]},
    {id:'staple-2',axis:2,q:'한 끼를 먹고 더 든든하게 느끼는 쪽은?',options:[{text:'면 한 그릇이면 한 끼 완료',letter:'N'},{text:'밥을 먹어야 한 끼 먹은 느낌',letter:'R'}]},
    {id:'choice-2',axis:3,q:'좋아하는 식당에 못 보던 메뉴가 생겼다!',options:[{text:'이번에는 새 메뉴를 먹어본다',letter:'A'},{text:'늘 먹던 최애 메뉴를 주문한다',letter:'F'}]},
    {id:'company-3',axis:0,q:'맛있는 식당을 찾았다. 다음 방문은 어떻게 하고 싶어?',options:[{text:'같이 먹으면 좋을 사람을 데려간다',letter:'E'},{text:'혼자 조용히 한 번 더 즐긴다',letter:'I'}]},
    {id:'flavor-3',axis:1,q:'자주 먹어도 덜 질리는 맛은?',options:[{text:'은은하고 담백한 맛',letter:'M'},{text:'적당히 매콤해서 입맛 도는 맛',letter:'S'}]},
    {id:'staple-3',axis:2,q:'배달 메뉴를 딱 두 종류로 줄인다면?',options:[{text:'덮밥·볶음밥 같은 밥 메뉴',letter:'R'},{text:'라멘·파스타 같은 면 메뉴',letter:'N'}]},
    {id:'choice-3',axis:3,q:'여행 중 같은 예산으로 한 끼를 고른다면?',options:[{text:'평소 좋아하던 음식을 그 지역에서',letter:'F'},{text:'아직 안 먹어본 그 지역의 별미',letter:'A'}]},
  ];
  const definitions=[
    ['ESRA','불꽃 원정대','🔥','새로운 매운 밥집? 일단 친구부터 모은다.',['매콤 타코라이스','매콤 해산물 볶음밥','매운 닭갈비 쌈밥']],
    ['ESRF','제육 대장','🍳','우리 모임의 답은 늘 그 제육집.',['제육 쌈밥','김치찌개 백반','닭갈비 볶음밥']],
    ['ESNA','마라 크루','🌶️','새로운 매운 면을 찾아 함께 출동.',['마라탕과 당면','탄탄면','매콤 해산물 파스타']],
    ['ESNF','떡볶이 반장','🍜','늘 먹던 매콤한 한 그릇, 같이 먹으면 더 좋다.',['라볶이','짬뽕','비빔국수']],
    ['EMRA','한상 원정대','🍱','새로운 한 상을 발견하면 나누고 싶다.',['버섯솥밥','연어 포케','간장 찜닭과 밥']],
    ['EMRF','집밥 대장','🏡','익숙하고 담백한 한 상에 사람을 모은다.',['불고기 백반','된장국 백반','간장 돼지갈비와 밥']],
    ['EMNA','파스타 크루','🍝','새로운 면 요리는 같이 맛봐야 제맛.',['트러플 크림 파스타','버섯 들깨 칼국수','냉우동']],
    ['EMNF','국수 반장','🥢','단골 국숫집에 가면 모두의 주문을 안다.',['잔치국수','칼국수','우동']],
    ['ISRA','덮밥 탐험가','🧭','혼자서도 새로운 매콤 밥집은 못 지나친다.',['매콤 가지덮밥','스파이시 치킨 라이스볼','매콤 타코라이스']],
    ['ISRF','제육 장인','🍚','내 자리, 내 맵기, 늘 먹던 제육 한 그릇.',['제육덮밥','김치볶음밥','얼큰 순두부찌개와 밥']],
    ['ISNA','마라 개척자','🌋','내 속도로 찾아가는 새로운 매운 면의 세계.',['탄탄면','마라비빔면','매콤 볶음쌀국수']],
    ['ISNF','라면 장인','🍥','익숙한 매운 면 한 그릇이면 오늘도 만족.',['얼큰 라면','짬뽕','비빔국수']],
    ['IMRA','솥밥 탐험가','🌾','조용히 발견하고 천천히 즐기는 새로운 밥.',['버섯솥밥','연어 포케','간장 가지덮밥']],
    ['IMRF','백반 지킴이','🥣','담백한 단골 한 끼가 가장 확실한 행복.',['된장국 백반','소고기뭇국과 밥','간장 불고기덮밥']],
    ['IMNA','파스타 개척자','🍄','낯선 면 요리도 담백하다면 혼자 도전.',['버섯 크림 파스타','들깨 칼국수','냉우동']],
    ['IMNF','우동 집사','🍲','익숙한 면 한 그릇으로 조용히 충전.',['우동','잔치국수','사골 칼국수']],
  ];
  const types=definitions.map(([code,name,emoji,tag,menus])=>({code,name,emoji,tag,menus,color:code[1]==='S'?'#A8412C':'#35705A'}));
  function getType(code){if(typeof code!=='string')return null;return types.find(t=>t.code===code.trim().toUpperCase())||null;}
  function describe(code){
    const type=getType(code);if(!type)return null;
    return axes.map((axis,i)=>{const side=axis.letters.indexOf(type.code[i]);return {axis:axis.name,letter:type.code[i],label:axis.labels[side],word:axis.words[side],description:axis.descriptions[side]};});
  }
  function assess(answers){
    if(!Array.isArray(answers)||answers.length!==questions.length||!Array.from(answers).every(a=>Number.isInteger(a)&&(a===0||a===1)))return null;
    const counts=axes.map(()=>[0,0]);
    questions.forEach((q,i)=>{const side=axes[q.axis].letters.indexOf(q.options[answers[i]].letter);counts[q.axis][side]++;});
    const code=counts.map((votes,i)=>axes[i].letters[votes[0]>votes[1]?0:1]).join('');
    return {code,counts};
  }
  function compare(first,second){
    const a=getType(first),b=getType(second);if(!a||!b)return null;
    const same=axes.map((axis,i)=>({axis:axis.name,same:a.code[i]===b.code[i],mine:describe(a.code)[i].label,friend:describe(b.code)[i].label}));
    const tips=[];
    if(a.code[1]!==b.code[1])tips.push('매운 양념은 따로 곁들일 수 있는 메뉴로 골라보세요.');
    if(a.code[2]!==b.code[2])tips.push('밥과 면을 함께 파는 식당이면 둘 다 고르기 편해요.');
    if(a.code[3]!==b.code[3])tips.push('익숙한 메뉴 하나와 새 메뉴 하나를 나눠보세요.');
    if(a.code[0]!==b.code[0])tips.push('함께 먹고 싶은 날인지 먼저 물어보면 좋아요.');
    if(!tips.length)tips.push('네 가지 선택이 같아요. 서로의 최애 식당부터 나눠보세요.');
    return {same: same.filter(x=>x.same).length,axes:same,tips};
  }
  root.TasteCode=Object.freeze({version:1,axes,questions,types,getType,describe,assess,compare});
})(globalThis);
