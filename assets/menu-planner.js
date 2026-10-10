/* Curated meal tags: update these when adding new dishes to OH_MENUS. */
(function(root){
  'use strict';
  const breakfast=new Set(["콩나물국밥","야채죽","소고기야채죽","설렁탕","소고기뭇국","곰탕","만둣국","호박죽","전복죽","미역국","북엇국","떡국"]);
  const snacks=new Set([]);
  const lateNight=new Set(["후라이드치킨","양념치킨","떡볶이","라볶이","라면","보쌈","고구마피자","페퍼로니피자","오징어볶음","낙지볶음"]);
  const spicy=new Set(["비빔밥","돌솥비빔밥","쫄면","비빔국수","김치볶음밥","제육덮밥","참치비빔밥","짬뽕","떡볶이","김치찌개","라면","육개장","순두부찌개","닭갈비","양념치킨","라볶이","부대찌개","제육볶음","닭볶음탕","감자탕","짬뽕밥","낙지볶음","오징어볶음","비빔냉면","카레라이스","해물탕","회덮밥","해물순두부찌개","오징어덮밥","참치김치찌개"]);
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
    const used=new Set([main.m,breakfastItem.m,dinner.m]);
    const lateNightAllowed=item=>suitable(item)&&lateNight.has(item.m)&&!used.has(item.m);
    const lateNightPreferred=unique(Object.values(data[element]).flat()).filter(lateNightAllowed);
    const lateNightTagged=all.filter(lateNightAllowed);
    const lateNightFallback=available.filter(item=>!used.has(item.m));
    const lateNightItem=pick(lateNightPreferred.length?lateNightPreferred:lateNightTagged.length?lateNightTagged:lateNightFallback,seed+23);
    if(!lateNightItem)throw new Error('야식 메뉴 후보를 추가해주세요.');
    return {main,breakfast:breakfastItem,dinner,lateNight:lateNightItem};
  }
  root.MenuPlanner=Object.freeze({plan,isSpicy:name=>spicy.has(name),isSnack:name=>snacks.has(name),isBreakfast:name=>breakfast.has(name),isLateNight:name=>lateNight.has(name)});
})(globalThis);
