# 雙平台架構佈署與全維度資安白皮書 (`DEPLOY_SPEC.md`)

> **文件位階**：專案生產環境部署與資安架構最高規範 (L3 Domain Spec)  
> **適用架構**：GitHub (Private Code Repository) ＋ 原環境 GitHub Pages / Netlify (Production Edge Distribution)  
> **發布端點**：`https://dg.scanallgoods.com`  
> **最後更新**：2026-10-29

---

## 一、架構設計理念：資深 IT 的雙平台職責分離 (Separation of Concerns)

身為資深 IT 專家主持的專案，網站發布落實業界標準的**「雙平台職責分離」**與**「外網零原始碼暴露」**：
- **本專案不佈署上 Cloudflare，維持原環境**（GitHub Actions 自動部署至 GitHub Pages，或透過 Netlify 發布）。
- **不該上傳 Repo 的絕對不上傳**（AI 對話記錄、Token 簿、本地維運腳本、環境暫存、IDE 配置等完全隔離）。
- **外網端點只暴露純靜態編譯產物 `dist`**，確保 0 原始碼與內部檔案洩漏。

```mermaid
flowchart TD
    subgraph PrivateZone["【本機與 GitHub 私有安全區 (Private Security Zone)】"]
        Local["本機開發環境<br/>(my-resume-Astrotheme)"]
        GitRepo["GitHub Private Repo<br/>(代碼與版本管控)"]
        PrivateData["未公開資產與內部治理 (不上傳 Repo)：<br/>• AI 提示規則、對話軌跡 (brain/, *.jsonl)<br/>• Token 統計簿 (TOKEN_OPTIMIZATION_GLOBAL.md)<br/>• 本機維運工具 (scripts/run_all_audits.py, *.bat)<br/>• IDE 設定 (.vscode/) 與環境暫存"]
        
        Local -->|1. git push (安全認證)| GitRepo
        GitRepo --- PrivateData
    end

    subgraph BuildPipeline["【原生雲端獨立建置管線 (Isolated Build Sandbox)】"]
        Webhook["GitHub Actions CI/CD / Netlify<br/>(Node 24 Active LTS)"]
        AstroBuild["自動建置流程<br/>• 執行 scripts/enforce-node24.mjs<br/>• 執行 npm run build (astro build)"]
        SiteOutput["產出純靜態目錄：dist/<br/>(僅包含 HTML5, CSS3, WebP, SVG, PDF, XML)"]
        
        GitRepo -->|2. Webhook 觸發拉取| Webhook
        Webhook --> AstroBuild
        AstroBuild --> SiteOutput
    end

    subgraph PublicZone["【原環境生產端點 (Production Edge Distribution)】"]
        EdgeCDN["GitHub Pages / Netlify CDN<br/>• 自訂網域 dg.scanallgoods.com<br/>• 注入 _headers 企業級資安標頭<br/>• 啟用 404.html 自動路由防護"]
        Visitor["全世界公眾訪客<br/>https://dg.scanallgoods.com"]
        
        SiteOutput -->|3. 發布純 dist| EdgeCDN
        EdgeCDN --> Visitor
    end
```

---

## 二、平台職責邊界矩陣 (Responsibility Boundary Matrix)

| 治理維度 | GitHub (私有端) | Cloudflare Pages (公開端) |
| :--- | :--- | :--- |
| **可見性 (Visibility)** | **100% Private (僅負責人帳號授權可見)** | **100% Public (全球公眾存取)** |
| **核心職責** | 完整代碼管理、版本歷史追蹤、雲端災難備份、內部行政腳本存放。 | 靜態 HTML/CSS/WebP 渲染、全球 CDN 快取、DDoS 阻斷、SSL 憑證簽發。 |
| **外網暴露檔案** | **0 (外網無法直連任何 Git 檔案)** | **僅限 `dist` 目錄下的純靜態編譯產物**。 |
| **敏感資產保護** | 透過 `.gitignore` 阻絕底層對話 Log（`*.jsonl`）、本機暫存與 IDE 設定。 | 原始 TypeScript/Astro 檔案、`package.json`、`scripts/` 完全不發布。 |
| **404 處理機制** | 不適用。 | 自動導向 `dist/404.html`，具備 `noindex` 防禦與雙語友善導航。 |
| **自訂網域安全** | 不適用。 | 綁定 `dg.scanallgoods.com`，提供免費 HSTS 與 TLS 1.3。 |

---

## 三、Cloudflare Pages 建置與配置標準規範

登入 [Cloudflare Dashboard](https://dash.cloudflare.com/) 進行專案配置時，必須嚴格依照下列參數設定：

### 1. 專案基本設定 (Basic Setup)
- **Project name**：`my-resume-astrotheme`
- **Production branch**：`main`
- **Framework preset**：`Astro`

### 2. 建置與輸出設定 (Build & Output Settings)
- **Build command**：`npm run build`
- **Build output directory**：`dist`
- **Root directory**：`/`（留空或預設根目錄）

### 3. 環境變數設定 (Environment Variables)
在 **Settings ➔ Environment variables** 必須配置：
- `NODE_VERSION` = `24.22.1`（確保使用 Node 24 Active LTS 執行時期環境）
- `NPM_FLAGS` = `--legacy-peer-deps=false`

---

## 四、資安防禦縱深與標頭規範 (Security Headers)

全站於 `src/layouts/Layout.astro`、`public/_headers` 與根目錄 `_headers` 實施 OWASP 等級資安強化：

1. **Anti-Clickjacking 防點擊劫持 (Frame-Busting)**：
   ```html
   <style id="anti-clickjack">body{display:none !important;}</style>
   <script>
     if (self === top) {
       var antiClickjack = document.getElementById("anti-clickjack");
       if (antiClickjack) antiClickjack.parentNode.removeChild(antiClickjack);
     } else {
       top.location = self.location;
     }
   </script>
   ```
2. **嚴格內容安全策略 (Content-Security-Policy)**：
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self' data:; connect-src 'self' https://*.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self';
   ```
3. **MIME 嗅探防禦**：`X-Content-Type-Options: nosniff`。
4. **推薦來源保護**：`Referrer-Policy: strict-origin-when-cross-origin`。
5. **強制傳輸安全 (HSTS)**：`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`。
6. **404 頁面安全隔離**：`404.html` 內嵌 `<meta name="robots" content="noindex, nofollow" />`，避免搜尋引擎將錯誤路由收錄入搜尋索引。

---

## 五、上線前標準自動化巡檢程序 (Pre-Flight Audit Protocol)

身為資深技術人，發布任何變更絕不依賴「肉眼觀察」，必須落實程式化驗收：

### 1. 執行整合巡檢腳本
```bash
python scripts/run_all_audits.py
```
- **SEO & AEO 驗核**：
  - 核心發布頁面包含合法 `<title>` 與 `<meta name="description">`。
  - Canonical URL 與 Sitemap-index 就緒。
- **404 頁面安全檢核**：
  - `dist/404.html` 確實生成，且包含 `noindex` 防禦宣告。
- **Cloudflare 邊界滲透檢核 (Zero Leakage Check)**：
  - 掃描 `dist/` 目錄，確認 0 原始碼（無 `.ts`, `.astro`, `.mjs`, `.py` 等）。
  - 確認 0 內部設定與敏感檔案（無 `.env`, `package.json`, `tsconfig.json`, `scripts/`, `node_modules/` 等）。
  - 確認純靜態網頁資產比例 100%。
- **靜態資源與連結驗核**：
  - 0 遺失內部檔案（CSS、JS、WebP 圖片、Favicon、PDF）。
  - 0 壞軌外部連結。

### 2. 外部防護驗證指令（外網滲透探測）
```bash
python -c "import urllib.request; print(urllib.request.urlopen('https://dg.scanallgoods.com/').status)"
```
確認正式端點秒級回傳 `200 OK`，且內部檔案路徑對外網完全不可達（回傳 404）。
