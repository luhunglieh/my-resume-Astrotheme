# Project Global Rules & Architecture Index (`my-resume-Astrotheme`)

> **Antigravity 2.0 Native Always-On Workspace Rule (`GEMINI.md`)**  
> Master Architecture Map: [ARCHITECTURE_GOVERNANCE_MAP.md](./ARCHITECTURE_GOVERNANCE_MAP.md) | Token Audit & Change Log: [TOKEN_OPTIMIZATION_GLOBAL.md](./TOKEN_OPTIMIZATION_GLOBAL.md)  
> Deployment & Security Blueprint: [DEPLOY_SPEC.md](./DEPLOY_SPEC.md) | Harness Engineering: [HARNESS_ENGINEERING.md](./HARNESS_ENGINEERING.md)  
> Cross-Thread Memory: [CONVERSATION_MEMORY.md](./CONVERSATION_MEMORY.md)  

---

## 1. 最高指導原則：資深 IT 工程素養與絕對資安紀律

> [!CAUTION]
> **「小心翼翼、零容忍資安洩漏、守護技術聲譽」**  
> 專案負責人為資深 IT 專家（CIO/資深架構師），本履歷作品集網站代表最高專業水準與個人品牌，絕不可表現出業餘或欠缺資安思維之行為。  
> 所有架構決策、權限邊界、代碼撰寫與外網暴露面，均須落實國防級防禦縱深（Defense-in-Depth）。

### 1.1 核心架構職責切割（GitHub vs 原生生產環境 GitHub Pages / Netlify）
- **GitHub 職責（私有保險箱）**：
  - **屬性**：**嚴格設為 Private Repository**。
  - **任務**：唯一的核心原始碼存放、Git 分支版控、全歷史備份、開發腳本與未公開經歷數據存放地。
  - **嚴格防線**：透過 `.gitignore` 嚴格阻絕對話軌跡（`*.jsonl`）、Token 統計簿、本機日誌、暫存與 IDE 設定，**不該上傳 Repo 的絕對不上傳**。
- **原生生產環境職責（全球公開展示櫃檯）**：
  - **屬性**：**公開 CDN 邊緣分發 (`https://dg.scanallgoods.com`)**（透過 GitHub Pages CI/CD 或 Netlify）。
  - **任務**：由 CI/CD 管線執行 `npm run build`，**僅將純靜態編譯產物 `dist` 發布至外網**。
  - **絕對邊界保證**：所有 TypeScript 原始碼、Astro 模板、內部維運腳本、AI 治理規格、批次檔均留在建置層外，**外網 0 內部檔案暴露，僅限網頁靜態資源**。

---

## 2. Top-to-Bottom (L0 -> L5) 六層檔案治理層級

嚴格遵循 Antigravity 2.0 階層規範，絕不在層級外建立散亂檔案：

| Layer | Scope | Path / Location | Antigravity 2.0 Loading Behavior | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **L0** | **Machine Global** | `C:\Users\User\.gemini\GEMINI.md` | **Always-On (Global)** | 繁體中文、直接代碼、不說空話、專家視角、重視工程論證。 |
| **L1** | **Workspace Always-On Rules & Protection** | `./GEMINI.md` (本檔)<br>`./.geminiignore`<br>`./ARCHITECTURE_GOVERNANCE_MAP.md` | **Always-On (Workspace)**<br>(共享 20K Tokens 預算) | 專案紅線、GitHub/Cloudflare 防火牆、低 Token 切片編輯守則、核心行號熱區索引。 |
| **L2** | **Progressive Disclosure Skills** | `.agent/skills/node24-security-baseline`<br>`.agent/skills/theme-factory` | **On-Demand (0 Idle Tokens)**<br>(靜態時僅載入名稱與描述) | 模組化任務調度：<br>1. `node24-security-baseline`<br>2. `theme-factory` |
| **L3** | **Domain Specs & Engineering Runbooks** | `./DEPLOY_SPEC.md`<br>`./HARNESS_ENGINEERING.md`<br>`./src/config/cv.json` (履歷資料中心) | **Read-On-Demand via L2 Links**<br>(0 Idle Tokens) | 雙平台部署架構白皮書、Harness 測試檢驗手冊、結構化職涯數據。 |
| **L4** | **Source Code & Executable Scripts** | `./astro.config.mjs`<br>`./src/layouts/Layout.astro`<br>`./src/pages/`<br>`./src/components/`<br>`./scripts/enforce-node24.mjs`<br>`./scripts/run_all_audits.py` | **Targeted Slice Read Only**<br>(`read_file` ≤ 80 lines + `edit_file`) | 生產代碼、Astro 組件、自動化巡檢腳本與資料庫。透過行號索引精準微創。 |
| **L5** | **Conversation Memory & Cross-Thread Ledger** | `./CONVERSATION_MEMORY.md`<br>`<appDataDir>\brain\<conv-id>\{task,walkthrough}.md` | **Conversation-Scoped** | 跨對話串進度交接母檔、凍結狀態鎖。禁止將對話軌跡（`*.jsonl`）上傳至 Git。 |

---

## 3. 絕對安全防護紅線（資深架構師級守則）

1. **正式網站代碼全面凍結原則 (`Website Codebase Frozen Lock`)**：
   - 履歷首頁、卡片組件、版面佈局均已通過驗證並穩定運作。
   - **零未授權重構**：嚴禁擅自調整 HTML 結構、CSS 樣式或修改導覽連結，所有修改須有使用者明確指令。
2. **生產邊界零洩漏防線 (`Production Zero-Leakage Boundary`)**：
   - 生產發布目錄強制鎖定為 `dist`。
   - `public/` 目錄嚴禁存放任何未公開文檔、原始代碼、內部腳本。
   - 外網絕對不能出現內部檔案，只能出現編譯後純靜態網頁資源。
3. **404 頁面安全與體驗規範 (`404 Error Page Protocol`)**：
   - `dist/404.html` 必須注入 `<meta name="robots" content="noindex, nofollow" />`，避免 SEO 權重稀釋。
   - 提供雙語友善引導、返回首頁機制，並受到 CSP 與 Frame-Busting 標頭保護。
4. **對話日誌與 Token 檔案完全隔離 (`Conversation Log Privacy Gate`)**：
   - `brain/`、`*.jsonl`、`transcript*.jsonl`、`CONVERSATION_MEMORY.md` 必須被 `.gitignore` 徹底遮蔽，絕不進入 Git。
5. **部署標準化驗證 (`Audit-Before-Push Law`)**：
   - 每次 Push 前必須執行 `python scripts/run_all_audits.py`，確保 SEO、AEO、404、Cloudflare 產物邊界與安全標頭 100% 通過。

---

## 4. 核心程式碼熱區行號索引 (Codebase Hot-Zone Line Index)

進行任何代碼微調，必須先查閱此行號表，使用 `read_file(StartLine, EndLine)` 切片（≤ 80 行），並以 `edit_file` 精準置換：

### 4.1 核心設定與全域佈局
- **`astro.config.mjs`** (12 行):
  - `L1 - L7`: 整合套件引入 (`tailwind`, `icon`, `mdx`, `sitemap`)
  - `L8 - L12`: 站台設定 (`site: "https://dg.scanallgoods.com"`, `base: "/"`)
- **`src/layouts/Layout.astro`** (83 行):
  - `L7 - L12`: 屬性定義與 Props 接收 (`title`, `description`, `noindex`)
  - `L28 - L32`: CSP 安全標頭與 Nosniff 防護
  - `L34 - L42`: OWASP Anti-Clickjacking Frame-Busting 防點擊劫持
  - `L48 - L56`: Google Analytics 4 (`G-9NFMSHCDD9`)
  - `L58 - L70`: 淺色 / 深色主題自動時區判斷與 LocalStorage 狀態管理
  - `L72 - L80`: Body 佈局結構 (`Header`, `slot`, `Footer`)

### 4.2 共用版型組件 (Layout Components)
- **`src/components/layouts/Header.astro`** (50 行):
  - `L1 - L18`: 導覽列資料讀取與主題切換按鈕 (`ThemeToggle.astro`)
  - `L19 - L50`: 桌機與行動版 RWD 漢堡選單渲染
- **`src/components/layouts/Footer.astro`** (38 行):
  - `L1 - L15`: 版權宣告、端詳互動資訊連結
  - `L16 - L38`: 社群平台圖示連結渲染
- **`src/components/layouts/NotFound.astro`** (35 行):
  - `L5 - L15`: 404 大字視覺呈現、雙語文案
  - `L20 - L33`: 返回首頁與上一頁友善操作按鈕

### 4.3 核心發布頁面與資料中心
- **`src/pages/index.astro`** (10 行):
  - `L1 - L5`: 首頁組件組合 (`Hero`, `Resume`, `Project`)
- **`src/pages/404.astro`** (12 行):
  - `L1 - L10`: 404 路由進入點，強制 `noindex={true}`
- **`src/config/cv.json`** (100 行):
  - `L2 - L15`: 個人基本資訊 (姓名、職稱、聯絡信箱、電話、頭銜)
  - `L16 - L40`: 專業經歷、職涯成就與組織角色
  - `L41 - L75`: 核心專案清冊、技術成果與亮點
  - `L76 - L100`: 教育背景、專業認證與社群連結
