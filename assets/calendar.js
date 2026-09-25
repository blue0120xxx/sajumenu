/* Date validation shared by personal, compatibility and group forms. */
(function(root){
  'use strict';
  function solarValid(y,m,d){
    if(![y,m,d].every(Number.isInteger)||y<1940||y>2050||m<1||m>12||d<1)return false;
    const date=new Date(Date.UTC(y,m-1,d));
    return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
  }
  function convert(y,m,d,lunar=false,leap=false){
    if(![y,m,d].every(Number.isInteger)||y<1940||y>2050||m<1||m>12||d<1)return null;
    if(!lunar)return solarValid(y,m,d)?{y,m,d}:null;
    if(typeof root.KoreanLunarCalendar!=='function')return null;
    const calendar=new root.KoreanLunarCalendar();
    if(!calendar.setLunarDate(y,m,d,leap))return null;
    const checked=calendar.getLunarCalendar();
    if(checked.year!==y||checked.month!==m||checked.day!==d||Boolean(checked.intercalation)!==leap)return null;
    const solar=calendar.getSolarCalendar();
    return {y:solar.year,m:solar.month,d:solar.day};
  }
  function daysInMonth(y,m,lunar=false,leap=false){
    if(!convert(y,m,1,lunar,leap))return 0;
    if(lunar){for(let d=30;d>=1;d--)if(convert(y,m,d,true,leap))return d;return 0;}
    return new Date(Date.UTC(y,m,0)).getUTCDate();
  }
  root.MenuCalendar=Object.freeze({convert,daysInMonth,solarValid});
})(globalThis);
