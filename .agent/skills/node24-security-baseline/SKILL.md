---
name: node24-security-baseline
description: >-
  Enforces the project's Node 24 Active LTS security baseline, CI/CD workflow
  transparency and least-privilege permissions, immutable Action SHA pinning,
  single-lockfile policy, third-party dependency (node_modules) residual
  sanitization, and dependency vulnerability audit boundaries. Activate this
  skill whenever modifying CI/CD workflows (.github/workflows), Dockerfiles,
  package dependencies, build scripts, or performing security audits.
---

# Node 24 資安基準與 CI/CD 強化規範 (Henry Lu 簡歷主題站台)

本規範定義 **Henry Lu 個人線上履歷與作品集 (my-resume-Astrotheme)** 站台之執行環境資安基準、GitHub Actions 最小權限與不可變 SHA Pinning 規範、第三方依賴殘留檔清消機制，以及前端靜態站台資安威脅防護邊界。

---

## 1. 核心資安原則 (Mandatory Security Policy)

1. **全面棄用 Node 18 與 Node 20**：
   * Node 18 已於 2025-04-30 終止支援（EOL）。
   * **Node 20 已 EOL（Node 20 於 2026-04-30 終止支援）**。
   * 本專案所有程式碼、註解、腳本說明、CI/CD 設定以及 `node_modules` 第三方套件殘留檔，**嚴禁使用舊版 18 或 20 之容器映像標籤或版本設定**，統一強制採用 **Node 24 Active LTS**（容器映像固定為 `FROM node:24-slim` 或 `FROM node:24-alpine`）。
2. **單一事實來源 (Single Lockfile Policy)**：
   * 統一使用 `npm` 與 [`package-lock.json`](../../../package-lock.json)。
   * 專案目錄下嚴禁混用 `bun.lock`、`bun.lockb`、`yarn.lock` 或 `pnpm-lock.yaml`，避免相依樹發生環境漂移。
3. **版本鎖定檔案一致性**：
   * [`package.json`](../../../package.json)：`"engines": { "node": ">=24.0.0", "npm": ">=10.0.0" }`
   * [`.nvmrc`](../../../.nvmrc) 與 [`.node-version`](../../../.node-version)：固定為 `24`
   * [`netlify.toml`](../../../netlify.toml)：`command = "npm run build"` 且 `[build.environment] NODE_VERSION = "24"`

---

## 2. GitHub Actions CI/CD 透明、最小權限與不可變 SHA 規範

編輯 [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) 時必須遵守以下規範：

1. **頂層強制 Node 24 Action Runtime**：
   * 必須在 Workflow 頂層 `env:` 設定 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`（切勿只放在單一 step 的 `env:` 下），以強制所有 Runner 上的 JavaScript Actions 底層皆以 Node 24 執行。
2. **最小權限原則 (Principle of Least Privilege)**：
   * 嚴禁在 Workflow 頂層設置全域寫入權限。
   * `build` job 僅賦予唯讀權限：
     ```yaml
     permissions:
       contents: read
     ```
   * 僅有發布階段的 `deploy` job 才允許 Pages 與 OIDC 憑證權限：
     ```yaml
     permissions:
       pages: write
       id-token: write
     ```
3. **不可變 Commit SHA Pinning（防範供應鏈攻擊與標籤劫持）**：
   * 嚴禁在生產 CI/CD 中使用浮動 Major Tag（如 `@v4`、`@v5`）。所有 Action 必須鎖定完整 40 位元 Git Commit SHA，並以註解標示對應版本號：
     * `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
     * `actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0`
     * `actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b # v5.0.0`
     * `actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1`
     * `actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4.0.5`
4. **顯式設定 Node 24 與快取**：
   * 嚴禁使用 `withastro/action@v3` 等隱藏內部 `setup-node` 預設值的複合黑盒 Action。
   * 必須顯式宣告 `actions/setup-node` 並指定 `node-version: 24` 與 `cache: npm`，隨後依序執行 `npm ci` 與 `npm run build`。

---

## 3. 第三方套件 (`node_modules`) 殘留檔強制清消機制

針對第三方套件隨 npm tarball 釋出的殘留檔，透過 [`scripts/enforce-node24.mjs`](../../../scripts/enforce-node24.mjs) 進行自動清消與守門：
1. **執行期守門**：綁定於 `package.json` 的 `postinstall` 與 `prebuild`。當執行環境 Node 主版本 $\le 20$ 時立即中斷退出（`exit(1)`）。
2. **殘留設定修正**：自動將 `node_modules` 內部殘留的 Dockerfile 改寫為 `FROM node:24-slim`，並將工作流檔案中的 `node-version` 改寫為 `'24'`。

---

## 4. 專案資安威脅防護邊界 (Threat Model & Security Boundary)

1. **純靜態輸出架構 (SSG)**：
   * 本站採用 Astro 純靜態輸出 (`output: "static"`，產物位於 `./dist`) 並發佈於 GitHub Pages CDN / Netlify。
   * 線上正式環境不存在任何 Node.js 伺服器、後端 API 或資料庫連線，因此伺服端執行期漏洞（如 SSR 中介層繞過、Server Islands 反射 XSS、伺服器端請求偽造 SSRF）不構成線上威脅。
2. **防範點擊劫持 (Clickjacking) 與安全標頭整合**：
   * 因 GitHub Pages 為純靜態託管，不支援伺服端自訂標頭。本站採用 **OWASP 推薦之標準 Frame-Busting 防禦機制**（於 `Layout.astro` 注入防篡改 style 與腳本），若網站遭惡意外部 iframe 內嵌將自動隱藏並跳脫至頂層視窗。
   * 配置完整的標準化 `<meta http-equiv="Content-Security-Policy">`、`<meta http-equiv="X-Content-Type-Options" content="nosniff">` 與 `<meta name="referrer" content="strict-origin-when-cross-origin">`。
   * 同時在 `public/_headers` 配置完整的企業級 HTTP 安全標頭（含 HSTS、CSP、Nosniff、Permissions-Policy 等），便於透過 Netlify 或 Cloudflare Proxy / CDN Edge 發布時直接繼承生效。
3. **第三方指令碼供應鏈與 CSP 邊界**：
   * 目前站台載入外部 Google Analytics (`googletagmanager.com`) 與 YouTube 影片內嵌 (`www.youtube.com`, `www.youtube-nocookie.com`)，已於 CSP 中嚴格收斂 `script-src`、`img-src`、`connect-src` 與 `frame-src` 白名單，阻斷未授權之第三方腳本外連與內嵌風險。

---

## 5. 驗證步驟 (Verification Runbook)

每次更新相依套件或 CI/CD 流程後，請依序執行：
```powershell
# 1. 執行版本檢查與清消腳本
node scripts/enforce-node24.mjs

# 2. 靜態特徵掃描
git grep --untracked --no-exclude-standard -I -i -n -E "FROM[[:space:]]+node|node-version"

# 3. 依賴弱點掃描
npm audit

# 4. 完整建置測試 (確保站台型別與輸出正常)
npm run build
```
