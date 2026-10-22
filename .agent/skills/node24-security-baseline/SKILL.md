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

# Node 24 資安基準與 CI/CD 全面強化規範 (Node 24 Security Baseline & Supply Chain Hardening)

本技能定義本專案之執行環境資安基準、GitHub Actions 最小權限與不可變 SHA Pinning 規範、第三方依賴殘留檔清消流程，以及相依套件弱點邊界管理，確保專案架構完全排除已終止支援（EOL）之舊版 Node 環境與潛在供應鏈風險。

---

## 1. 核心資安原則 (Mandatory Security Policy)

1. **全面棄用 Node 18 與 Node 20**：
   * Node 18 已於 2025-04-30 終止支援（EOL）。
   * **Node 20 已 EOL（Node 20 於 2026-04-30 終止支援）**。
   * 本專案所有程式碼、註解、腳本說明、CI/CD 設定以及 `node_modules` 第三方套件殘留檔，**嚴禁使用舊版 18 或 20 之容器映像標籤或版本設定**，統一強制採用 **Node 24 Active LTS**（容器映像固定為 `FROM node:24-slim` 或 `FROM node:24-alpine`）。
2. **單一事實來源 (Single Lockfile Policy)**：
   * 統一使用 `npm` 與 [`package-lock.json`](../../../package-lock.json)。
   * 嚴禁於專案根目錄混用 `bun.lock`、`bun.lockb`、`yarn.lock` 或 `pnpm-lock.yaml`，避免 CI/CD 與本地依賴樹漂移。
3. **版本鎖定檔案一致性**：
   * [`package.json`](../../../package.json)：`"engines": { "node": ">=24.0.0", "npm": ">=10.0.0" }`
   * [`.nvmrc`](../../../.nvmrc) 與 [`.node-version`](../../../.node-version)：固定為 `24`
   * [`netlify.toml`](../../../netlify.toml)：`command = "npm run build"` 且 `[build.environment] NODE_VERSION = "24"`

---

## 2. GitHub Actions CI/CD 透明、最小權限與不可變 SHA 規範

編輯 [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) 或新增任何 Workflow 時，必須嚴格遵守以下四項結構要求：

1. **頂層強制 Node 24 Action Runtime**：
   * 必須在 Workflow **頂層（root-level `env:`）** 設定 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`（切勿只放在單一 step 的 `env:` 下），以強制所有第三方 JavaScript Actions 底層皆以 Node 24 執行。
2. **最小權限原則 (Principle of Least Privilege)**：
   * **嚴禁在 Workflow 頂層設置全域寫入權限**。
   * `build` job 僅賦予唯讀權限：
     ```yaml
     permissions:
       contents: read
     ```
   * 僅有最終發布的 `deploy` job 才允許設定 Pages 與 OIDC 憑證寫入權限：
     ```yaml
     permissions:
       pages: write
       id-token: write
     ```
3. **不可變 Commit SHA Pinning（防範標籤劫持與供應鏈篡改）**：
   * 嚴禁在生產 CI/CD 中使用浮動 Major Tag（如 `@v4`、`@v5`）。所有 Action 必須鎖定完整 40 位元 Git Commit SHA，並以註解標示對應版本號：
     * `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2`
     * `actions/setup-node@1d0ff469b7ec7b3cb9d8673fde0c81c44821de2a # v4.2.0`
     * `actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b # v5.0.0`
     * `actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1`
     * `actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e # v4.0.5`
4. **顯式展開步驟並禁用黑盒 Action**：
   * 嚴禁使用 `withastro/action@v3` 等隱藏內部 `setup-node` 預設值的複合黑盒 Action。
   * 必須顯式宣告 `actions/setup-node` 並指定 `node-version: 24` 與 `cache: npm`，隨後依序執行 `npm ci` 與 `npm run build`。

---

## 3. 第三方套件 (`node_modules`) 殘留檔強制清消機制

即使第三方套件（如 `@astrojs/check` 間接帶入的 `yaml-language-server` 或 `fast-uri`、`reusify` 等）隨 npm tarball 殘留的 `Dockerfile` 或 `.github/workflows/*.yml` 不會被本地或 CI 直接執行，資安掃描仍會檢出。

### 自動化守門腳本
本專案透過 [`scripts/enforce-node24.mjs`](../../../scripts/enforce-node24.mjs)（綁定於 `package.json` 的 `postinstall` 與 `prebuild`）自動執行以下兩階段保護：

1. **Runtime 版本檢查**：若當前 `process.versions.node` 主版本 $\le 20$，立即拋出資安錯誤並以 `exit(1)` 中斷執行。
2. **`node_modules` 殘留檔覆寫**：
   * 自動掃描 `node_modules/**/Dockerfile`，將模糊或舊版基礎映像改寫為 `FROM node:24-slim`。
   * 自動掃描 `node_modules/**/.github/workflows/*.{yml,yaml}`，將舊版 `node-version` 與 `node-versions` 統一改寫為 `'24'`。

---

## 4. 依賴弱點稽核與靜態威脅邊界 (Vulnerability & Threat Boundary Management)

1. **依賴修復政策**：
   * 定期執行 `npm audit fix` 消除既有已知 CVE。
   * 當核心框架（如 Astro）釋出相容性安全小版本（如 `astro@5.18.2`）時，應在維持主版本架構穩定前提下優先升級，縮減攻擊面。
2. **靜態站台威脅模型區分 (Threat Boundary)**：
   * **生產環境邊界**：本專案為純靜態網站（`output: "static"`），經 `npm run build` 僅產出純 HTML、CSS 與客戶端 JS 靜態檔案部屬至 GitHub Pages。伺服端執行期弱點（例如 Astro Server Islands、SSR 中介層、X-Forwarded-Host 反射等）在靜態部署架構下不存在伺服端執行環境，不構成線上漏洞。
   * **本機開發邊界**：本機啟動 `npm run dev` 或使用本機編譯工具時，仍需防範開發伺服器（Dev Server / Vite / esbuild）之任意檔案讀取弱點。

---

## 5. 資安稽核與驗證步驟 (Verification Runbook)

每次新增／更新套件或修改 CI/CD 設定後，依序執行以下指令驗證：

1. **執行守門與殘留清消腳本**：
   ```powershell
   node scripts/enforce-node24.mjs
   ```
2. **全庫（含 `node_modules`）靜態特徵掃描**：
   確認無任何舊版容器標籤或舊版 `node-version` 殘留：
   ```powershell
   git grep --untracked --no-exclude-standard -I -i -n -E "FROM[[:space:]]+node|node-version"
   ```
3. **依賴弱點掃描**：
   ```powershell
   npm audit
   ```
4. **完整型別與建置驗證**：
   ```powershell
   npm run build
   ```
