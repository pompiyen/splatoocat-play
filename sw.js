// 離線快取（Yen 2026-11-23，平板／手機試玩報告 T13）：第二次打開遊戲直接用手機裡存的那份，不用再等 5 MB 下載。
// 只管遊戲首頁（/、/index.html）；登入中繼頁（/__/auth/）和其他檔案照常走網路。
// - 一般打開：先給存著的那份（馬上開），同時在背景問網站有沒有新版（沒變只回一個很小的 304），有就存起來，下次打開就是新版
// - 網頁裡的更新檢查（?b=）直接走網路；發現新版會換到 ?v=新版號：存著的那份就是那一版就直接用，不是就從網路抓
// - 出問題時網址加 ?nosw 會把這個快取整個移除（09q_perf.js）
const C = 'sc-page-v1', KEY = '/';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== C) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || r.mode !== 'navigate') return;
  const u = new URL(r.url); if (u.origin !== location.origin || !(u.pathname === '/' || u.pathname === '/index.html') || u.searchParams.has('b') || u.searchParams.has('nosw')) return;
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
