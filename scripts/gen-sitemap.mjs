// sitemap.xml 을 자동으로 다시 만들어요.
// 쓰는 법: 사이트 폴더(루트)에서  node scripts/gen-sitemap.mjs
//
// 하는 일:
//  - 고정 페이지(홈, 가이드 목록, 소개, 개인정보처리방침)를 넣어요.
//  - guide/ 안의 글 폴더를 모두 찾아서 넣어요. ('_' 나 '.' 로 시작하는 폴더는 건너뛰어요)
//  - lastmod(마지막 수정일)는 각 index.html 파일이 바뀐 날짜로 채워요.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://sajumenu.com";

// 파일이 바뀐 날짜를 YYYY-MM-DD 로 (한국 시간 기준)
function ymd(path) {
  const d = statSync(path).mtime;
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(d);
}

// 고정 페이지들
const urls = [
  { loc: `${BASE}/`,        file: join(ROOT, "index.html"),        changefreq: "daily",   priority: "1.0" },
  { loc: `${BASE}/guide/`,  file: join(ROOT, "guide/index.html"),  changefreq: "weekly",  priority: "0.7" },
  { loc: `${BASE}/about/`,  file: join(ROOT, "about/index.html"),  changefreq: "monthly", priority: "0.5" },
  { loc: `${BASE}/privacy/`,file: join(ROOT, "privacy/index.html"),changefreq: "yearly",  priority: "0.3" },
];

// guide/ 안의 글 폴더 자동 수집
const guideDir = join(ROOT, "guide");
for (const name of readdirSync(guideDir)) {
  if (name.startsWith("_") || name.startsWith(".")) continue;
  const idx = join(guideDir, name, "index.html");
  try {
    if (!statSync(idx).isFile()) continue;
  } catch {
    continue; // index.html 없는 폴더는 건너뛰기
  }
  urls.push({
    loc: `${BASE}/guide/${name}/`,
    file: idx,
    changefreq: "monthly",
    priority: "0.8",
  });
}

const body = urls
  .map(
    (u) =>
      `  <url>\n` +
      `    <loc>${u.loc}</loc>\n` +
      `    <lastmod>${ymd(u.file)}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      `  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

writeFileSync(join(ROOT, "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml 갱신 완료 — 주소 ${urls.length}개`);
for (const u of urls) console.log(`  ${u.loc}`);
