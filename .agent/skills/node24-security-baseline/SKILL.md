---
name: node24-security-baseline
description: >-
  Enforces the project's Node 24 Active LTS security baseline, CI/CD workflow
  transparency, single-lockfile policy, and third-party dependency (node_modules)
  residual sanitization. Activate this skill whenever modifying CI/CD workflows
  (.github/workflows), Dockerfiles, package dependencies, build scripts, or
  performing security audits.
---

# Node 24 資安基準與 CI/CD 透明化規範 (Node 24 Security Baseline)

本技能定義本專案之執行環境資安基準、GitHub Actions CI/CD 展開規範與第三方依賴殘留檔清消流程，確保專案與供應鏈完全排除已終止支援（EOL）之舊版 Node 環境。

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

## 2. GitHub Actions CI/CD 透明可控規範

編輯 [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) 或新增任何 Workflow 時，必須遵守以下三項結構要求：

1. **頂層強制 Node 24 Action Runtime**：
   * 必須在 Workflow **頂層（root-level `env:`）** 設定 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`（切勿只放在單一 step 的 `env:` 下），以強制所有第三方 JavaScript Actions（如 `actions/checkout@v4`、`actions/configure-pages@v5`、`actions/upload-pages-artifact@v3`、`actions/deploy-pages@v4`）底層皆以 Node 24 執行。
2. **禁用黑盒封裝 Action**：
   * 嚴禁使用 `withastro/action@v3` 等隱藏內部 `setup-node` 預設值的複合黑盒 Action。
3. **顯式展開建置步驟**：
   * 必須顯式宣告 `actions/setup-node@v4` 並指定 `node-version: 24` 與 `cache: npm`，隨後依序執行 `npm ci` 與 `npm run build`。

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

## 4. 資安稽核與驗證步驟 (Verification Runbook)

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
3. **完整型別與建置驗證**：
   ```powershell
   npm run build
   ```
