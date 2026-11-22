# splatoocat-play

這個倉庫的 `main` 推上去就會馬上上線到 spalacat.com。

- 這裡只放建置好的 `index.html`（加上 `CNAME`、圖示、manifest）。原始碼在私人倉庫 `pompiyen/splatoocat` 的 `web/`。
- **發布只用 `pompiyen/splatoocat` 的 `tools/web/publish.py`**，不要手動複製或改這裡的檔案。Yen 這邊的 Claude、小威和小威的 Claude 都可以發布，規則見那邊的 `COLLABORATION.md`。
- 腳本會先確認網站上現在的版本已經包含在要發布的 `main` 裡，所以不會蓋掉別人剛發布的版本。不要 force-push，不要改 `CNAME`。
