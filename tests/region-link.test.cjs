// ?m=region 링크로 들어와도 지역 목록이 채워지는지: 모드 링크 처리는 지역 초기화 뒤에 있어야 한다.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('mode link runs after region data and dropdown init', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const data = html.indexOf('const REGION_MENUS=[');
  const init = html.indexOf('(function initRegion(){');
  const link = html.indexOf('(function handleModeLink(){');
  assert.ok(data >= 0 && init >= 0 && link >= 0);
  assert.ok(data < init && init < link);
});
