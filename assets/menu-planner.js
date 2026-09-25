/* Curated meal tags: update these when adding new dishes to OH_MENUS. */
(function(root){
  'use strict';
  const breakfast=new Set(['콩나물국밥','봄동된장국','시래기밥','호박죽','만두국','된장국백반','소고기뭇국','사골국','곰탕','미역국','매생이국','전복죽']);
  const snacks=new Set(['무화과 그릭요거트','버터떡','콩물꽈배기','두바이 초콜릿','밤고구마단호박크림치즈빵','고구마맛탕','흑임자 버터크림 라떼','벽돌 치즈스틱','감자전','호박전','굴전','청포묵무침','문어숙회']);
  const spicy=new Set(['두부김치','열무국수','깻잎장아찌덮밥','불닭볶음면','짬뽕','떡볶이','마라비빔면','김치찌개','육개장','매운돈까스','닭갈비','낙곱새','매운쭈꾸미볶음','부대찌개','아귀찜','돼지불백 정식','매운갈비찜','곱창전골','마라탄탄면','매운 낙지볶음','마라샹궈','감자탕','카레라이스','순두부찌개','비빔밥','나물비빔밥','두릅나물 곁들인 산채비빔밥','코다리조림','로제투도우펀','치폴레 웜볼 도시락','열무냉면','해물탕','해물순두부찌개','오징어볶음','꽃게탕','물회']);
  function pick(items,seed){const n=Math.sin(seed+1)*10000;return items[Math.floor((n-Math.floor(n))*items.length)];}
  function unique(items){return [...new Map(items.map(item=>[item.m,item])).values()];}
  function plan(data,element,mood,seed,mildOnly=false){
    const all=unique(Object.values(data).flatMap(groups=>Object.values(groups).flat()));
    const suitable=item=>!snacks.has(item.m)&&(!mildOnly||!spicy.has(item.m));
    const preferred=data[element][mood].filter(suitable);
    const sameElement=unique(Object.values(data[element]).flat()).filter(suitable);
    const available=all.filter(suitable);
    const main=pick(preferred.length?preferred:sameElement.length?sameElement:available,seed+7);
    if(!main)throw new Error('추천할 식사 메뉴가 없습니다. 메뉴 데이터를 확인하세요.');
    const morning=all.filter(item=>breakfast.has(item.m)&&item.m!==main.m);
    const breakfastItem=pick(morning,seed+11);
    const dinnerAllowed=item=>suitable(item)&&item.m!==main.m&&item.m!==breakfastItem.m&&(!spicy.has(main.m)||!spicy.has(item.m));
    const dinnerPreferred=unique(Object.values(data[element]).flat()).filter(dinnerAllowed);
    const dinner=pick(dinnerPreferred.length?dinnerPreferred:all.filter(dinnerAllowed),seed+17);
    if(!dinner)throw new Error('저녁 메뉴 후보를 추가해주세요.');
    return {main,breakfast:breakfastItem,dinner};
  }
  root.MenuPlanner=Object.freeze({plan,isSpicy:name=>spicy.has(name),isSnack:name=>snacks.has(name),isBreakfast:name=>breakfast.has(name)});
})(globalThis);
