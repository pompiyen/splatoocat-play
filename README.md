# SplatooCat 貓咪漆彈・公開版

打開就能玩：https://pompiyen.github.io/splatoocat-play/

- 不用登入。連線對戰：一個人開房間，把 4 位數房號告訴朋友，朋友打開同一個網址輸入房號就能加入（2 到 4 人）。
- 連線走免費的公開 MQTT 中繼站（broker.emqx.io，連不上時改用 broker.hivemq.com、test.mosquitto.org），沒有自己的伺服器。房號不是密碼，知道房號的人都進得來。
- 這個倉庫只放建置好的單一檔案 `index.html`。原始碼在私人倉庫 SplatooCat 的 `web/`，用 `python3 web/build.py --standalone --public <three.min.js 路徑>` 產生 `web/dist/public/index.html`。

角色、場地、介面與音效都是本專案自己的設計。
