// 離線快取（Yen 2026-11-23，平板／手機試玩報告 T13）：第二次打開遊戲直接用手機裡存的那份，不用再等 5 MB 下載。
// 2026-11-28 離線單機（Yen「有可能做到離線時玩單機對戰嗎」「好 要做」）：沒網路時也能打開、玩電腦對戰／殭屍單人／魔王關／教學。
// 首頁（/、/index.html）：
// - 一般打開：先給存著的那份（馬上開），同時在背景問網站有沒有新版（沒變只回一個很小的 304），有就存起來，下次打開就是新版
// - 網頁裡的更新檢查（v.txt?b=）直接走網路；發現新版會換到 ?v=新版號：存著的那份就是那一版就直接用，不是就從網路抓
// - 沒網路：用存著的那份
// 其他同網站的檔案（新造型模型 ip3d/*.glb、音樂 music/*.m4a、圖示、manifest）和 Google 字型：
// - 有網路時照樣問網站（cache: 'no-cache'，沒變只回 304），拿到就順便存一份，所以舊的永遠不會擋住新的
// - 沒網路或 4 秒沒回應：用存著的那份
// - 單機對戰要用的六隻 Q 版模型，第一次裝好這個快取時就先在背景存好
// 不管：登入中繼頁（/__/auth/）、v.txt、Firebase／Firestore／分析、連線中繼站（都是別的網站或要即時的資料）。
// 出問題時網址加 ?nosw 會把這個快取整個移除（09q_perf.js）
const C = 'sc-page-v1', KEY = '/', A = 'sc-asset-v1';
const PRE = ['mao', 'shuang', 'banban', 'taro', 'mochi', 'meiqiu'].map((k) => '/ip3d/' + k + '_q.glb');
const FONT = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
// 試玩報告 v317（M2）：安裝時就先存好首頁（通常直接用瀏覽器剛下載的那份），第 2 次打開就能秒開，不用等到第 3 次
self.addEventListener('install', (e) => e.waitUntil(caches.open(C).then((c) => c.match(KEY).then((h) => h || c.add(KEY))).catch(() => {}).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== C && k !== A) await caches.delete(k);
  await self.clients.claim();
  // 背景先存好單機對戰的模型（已經存過的跳過），不擋開遊戲
  try { const a = await caches.open(A); for (const u of PRE) if (!(await a.match(u))) { const r = await fetch(u); if (r.ok) await a.put(u, r); } } catch (x) {}
})()));
const OWN = /^\/(ip3d\/[\w-]+\.glb|music\/[\w-]+\.m4a|icon-\d+\.png|manifest\.webmanifest|favicon\.ico)$/;
function asset(e, r, u) {
  e.respondWith((async () => {
    const c = await caches.open(A), key = u.origin === location.origin ? u.pathname : r.url;
    const net = fetch(FONT.test(r.url) && u.hostname.startsWith('fonts.gstatic') ? r : new Request(r, { cache: 'no-cache' })).then((res) => {
      // 字型 CSS 是跨網站、不帶 cors 的請求，回來是看不到內容的 opaque，也照存（只限 Google 字型）
      if (res && (res.ok || (res.type === 'opaque' && FONT.test(r.url))) && !(res.status === 206)) c.put(key, res.clone()).catch(() => {});
      return res;
    });
    const hit = await c.match(key);
    if (!hit) return net;
    // 字型檔（fonts.gstatic.com）網址就是版本，內容不會變：直接用存著的
    if (u.hostname.startsWith('fonts.gstatic')) { e.waitUntil(net.catch(() => {})); return hit; }
    let t; const late = new Promise((ok) => { t = setTimeout(() => ok(hit), 4000); });
    return Promise.race([net.then((res) => (res && (res.ok || res.type === 'opaque') ? res : hit), () => hit), late]).finally(() => clearTimeout(t));
  })());
}
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode !== 'navigate') {
    if (r.headers.has('range')) return; // 音樂播放器的分段請求交給瀏覽器
    if ((u.origin === location.origin && OWN.test(u.pathname) && !u.search) || FONT.test(r.url)) asset(e, r, u);
    return;
  }
  if (u.origin !== location.origin || !(u.pathname === '/' || u.pathname === '/index.html') || u.searchParams.has('b') || u.searchParams.has('nosw')) return;
  e.respondWith((async () => {
    const c = await caches.open(C), hit = await c.match(KEY), want = u.searchParams.get('v');
    const keep = (res) => { if (res && res.ok && res.type === 'basic') c.put(KEY, res.clone()).catch(() => {}); return res; };
    const net = () => fetch(want ? r : new Request(KEY, { cache: 'no-cache' })).then(keep);
    if (!hit) return net().catch(() => fetch(r));
    if (want) { try { const t = await hit.clone().text(); if (t.includes("SC_BUILD='" + want + "'")) return hit; } catch (x) {} return net().catch(() => hit); }
    e.waitUntil(net().catch(() => {}));
    return hit;
  })());
});
