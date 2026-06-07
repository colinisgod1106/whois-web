# 🌐 WHOIS Web — 網域資訊查詢工具

一個美觀的 WHOIS 查詢網頁應用程式，部署在 [Render](https://render.com) 上。

## ✨ 功能特色

- 🔍 即時查詢任何網域的 WHOIS 資訊
- 📊 自動解析並結構化顯示關鍵欄位
- 📋 支援複製原始 WHOIS 資料
- ⚡ 內建速率限制保護
- 📱 完整響應式設計
- 🌙 精美暗色主題

## 🚀 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 或直接啟動
npm start
```

開啟 http://localhost:3000 即可使用。

## 📦 部署到 Render

1. 將此 repo 推送到 GitHub
2. 前往 [Render Dashboard](https://dashboard.render.com)
3. 點選 **New → Web Service**
4. 連接你的 GitHub repo
5. Render 會自動讀取 `render.yaml` 設定並部署

## 🛠 技術棧

- **後端**: Node.js + Express
- **前端**: 純 HTML / CSS / JavaScript
- **WHOIS**: [`whois`](https://www.npmjs.com/package/whois) npm 套件
- **部署**: Render Free Tier

## 📋 API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/whois/:domain` | 查詢網域 WHOIS 資訊 |
| GET | `/api/health` | 服務健康檢查 |

## 📄 授權

Apache 2.0 License
