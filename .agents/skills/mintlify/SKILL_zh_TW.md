---
name: mintlify
description: 使用 Mintlify 構建和維護文檔網站。當創建文檔頁面、配置導航、添加組件或設置 API 參考時使用。
license: MIT
compatibility: 需要 Node.js CLI。適用於任何基於 Git 的工作流程。
metadata:
  author: mintlify
  version: "1.0"
  mintlify-proj: mintlify
---

# Mintlify 最佳實踐

**請務必參考 [mintlify.com/docs](https://mintlify.com/docs) 以獲取組件、配置和最新功能的信息。**

如果你尚未連接到 Mintlify MCP 伺服器 [https://mintlify.com/docs/mcp](https://mintlify.com/docs/mcp)，請添加它，以便更有效地進行搜索。

**務必**優先搜索當前的 Mintlify 文檔，而不是依賴你訓練數據中關於 Mintlify 的內容。

Mintlify 是一個將 MDX 檔案轉換為文檔網站的平台。在 `docs.json` 檔案中配置全站設置，使用帶有 YAML frontmatter 的 MDX 撰寫內容，並優先使用內置組件而非自定義組件。

完整架構請參見 [mintlify.com/docs.json](https://mintlify.com/docs.json)。

## 在撰寫之前

### 了解項目

閱讀項目根目錄下的 `docs.json`。此檔案定義了整個網站：導航結構、主題、顏色、連結、API 和規範。

了解項目可以告訴你：

* 存在哪些頁面以及它們是如何組織的
* 使用了哪些導航組（以及它們的命名慣例）
* 網站導航是如何結構化的
* 網站使用什麼主題和配置

### 檢查現有內容

在創建新頁面之前搜索文檔。你可能需要：

* 更新現有頁面而不是創建新頁面
* 向現有頁面添加章節
* 連結到現有內容而不是重複內容

### 閱讀周邊內容

在撰寫之前，閱讀 2-3 個類似的頁面，以了解網站的語氣、結構、格式慣例和詳細程度。

### 了解 Mintlify 組件

查看 Mintlify [組件 (components)](https://www.mintlify.com/docs/components)，為你正在處理的文檔請求選擇並使用任何相關組件。

## 快速參考

### CLI 命令

* `npm i -g mint` - 安裝 Mintlify CLI
* `mint dev` - 在 localhost:3000 進行本地預覽
* `mint broken-links` - 檢查內部連結是否斷開
* `mint a11y` - 檢查內容中的無障礙問題
* `mint rename` - 重命名/移動檔案並更新引用
* `mint validate` - 驗證文檔構建

### 必要檔案

* `docs.json` - 網站配置（導航、主題、整合等）。查看 [全局設置 (global settings)](https://mintlify.com/docs/settings/global) 了解所有選項。
* `*.mdx` 檔案 - 帶有 YAML frontmatter 的文檔頁面

### 示例檔案結構

```
project/
├── docs.json           # 網站配置
├── introduction.mdx
├── quickstart.mdx
├── guides/
│   └── example.mdx
├── openapi.yml         # API 規範
├── images/             # 靜態資產
│   └── example.png
└── snippets/           # 可重用的組件/片段
    └── component.jsx
```

## 頁面 Frontmatter

每個頁面在 frontmatter 中都需要 `title`。包含 `description` 以利於 SEO 和導航。

```yaml theme={null}
---
title: "清晰且具描述性的標題"
description: "用於 SEO 和導航的簡潔摘要。"
---
```

可選的 frontmatter 欄位：

* `sidebarTitle`: 側邊欄導航的短標題。
* `icon`: Lucide 或 Font Awesome 圖標名稱、URL 或檔案路徑。
* `tag`: 側邊欄中頁面標題旁邊的標籤（例如 "NEW"）。
* `mode`: 頁面佈局模式 (`default`, `wide`, `custom`)。
* `keywords`: 與頁面內容相關的詞彙數組，用於本地搜索和 SEO。
* 任何用於個性化或條件內容的自定義 YAML 欄位。

## 檔案慣例

* 與目錄中現有的命名模式匹配
* 如果不存在現有檔案或檔案命名模式不一致，使用 kebab-case：`getting-started.mdx`, `api-reference.mdx`
* 內部連結使用不帶副檔名的根相對路徑：`/getting-started/quickstart`
* 不要對內部頁面使用相對路徑 (`../`) 或絕對 URL
* 創建新頁面時，將其添加到 `docs.json` 的導航中，否則它不會出現在側邊欄中

## 組織內容

當用戶詢問任何與全站配置相關的問題時，首先要了解 [全局設置 (global settings)](https://www.mintlify.com/docs/organize/settings)。看看是否可以通過更新 `docs.json` 檔案中的設置來實現用戶想要的效果。

### 導航 (Navigation)

`docs.json` 中的 `navigation` 屬性控制網站結構。在根層級選擇一種主要模式，然後將其他模式嵌套在其中。

**選擇你的主要模式：**

| 模式 | 何時使用 |
| ------------- | ---------------------------------------------------------------------------------------------- |
| **Groups (組)** | 預設。單一受眾，簡單的層級結構 |
| **Tabs (分頁)** | 具有不同受眾（例如：指南 vs API 參考）或內容類型的不同部分 |
| **Anchors (錨點)** | 希望在側邊欄頂部保留持久的章節連結。適用於將文檔與外部資源分開 |
| **Dropdowns (下拉選單)** | 用戶在多個文檔部分之間切換，但這些部分還不足以獨立成 Tabs |
| **Products (產品)** | 多產品公司，每個產品都有獨立的文檔 |
| **Versions (版本)** | 同時維護多個 API/產品版本的文檔 |
| **Languages (語言)** | 本地化內容 |

**在你的主要模式中：**

* **Groups** - 組織相關頁面。可以嵌套組，但請保持層級結構淺顯
* **Menus** - 在 Tabs 內添加下拉導航，以便快速跳轉到特定頁面
* **`expanded: false`** - 預設折疊嵌套組。用於用戶選擇性瀏覽的參考章節
* **`openapi`** - 從 OpenAPI 規範自動生成頁面。在組/分頁層級添加以繼承設置

**常見組合：**

* 包含組的分頁 (Tabs containing groups)（帶有 API 參考的文檔最常用）
* 包含分頁的產品 (Products containing tabs)（多產品 SaaS）
* 包含分頁的版本 (Versions containing tabs)（版本化的 API 文檔）
* 包含組的錨點 (Anchors containing groups)（帶有外部資源連結的簡單文檔）

### 連結與路徑

* **內部連結**: 根相對路徑，無副檔名：`/getting-started/quickstart`
* **圖片**: 存儲在 `/images`，引用為 `/images/example.png`
* **外部連結**: 使用完整 URL，它們會自動在新分頁中打開

## 自定義文檔網站

**在哪裡自定義什麼：**

* **品牌顏色、字體、Logo** → `docs.json`。參見 [全局設置 (global settings)](https://mintlify.com/docs/settings/global)
* **組件樣式、佈局微調** → 項目根目錄下的 `custom.css`
* **深色模式** → 預設啟用。僅在品牌要求時通過 `docs.json` 中的 `"appearance": "light"` 禁用

從 `docs.json` 開始。只有在配置不支持所需的樣式時才添加 `custom.css`。

## 撰寫內容

### 組件 (Components)

[組件概覽 (components overview)](https://mintlify.com/docs/components) 按用途組織了所有組件：結構化內容、引起注意、顯示/隱藏內容、記錄 API、連結到頁面以及添加視覺上下文。從那裡開始尋找合適的組件。

**常見決策點：**

| 需求 | 使用 |
| -------------------------- | ----------------------- |
| 隱藏可選詳情 | `<Accordion>` |
| 較長的代碼示例 | `<Expandable>` |
| 用戶從多個選項中選一 | `<Tabs>` |
| 帶連結的導航卡片 | `<Columns>` 中的 `<Card>` |
| 順序指令 | `<Steps>` |
| 多種語言的代碼 | `<CodeGroup>` |
| API 參數 | `<ParamField>` |
| API 響應欄位 | `<ResponseField>` |

**按嚴重程度分類的提示框：**

* `<Note>` - 補充信息，可以跳過
* `<Info>` - 有用的背景信息，如權限
* `<Tip>` - 建議或最佳實踐
* `<Warning>` - 潛在的破壞性操作
* `<Check>` - 成功確認

### 可重用內容 (Reusable content)

**何時使用片段 (snippets)：**

* 完全相同的內容出現在多個頁面上
* 你希望在一個地方維護複雜的組件
* 跨團隊/倉庫共享內容

**何時「不」使用片段：**

* 每個頁面需要略微不同的變化（這會導致屬性過於複雜）

使用 `import { Component } from "/path/to/snippet-name.jsx"` 導入片段。

## 寫作標準

### 語氣與結構

* 第二人稱語氣 ("你")
* 主動語態，語言直接
* 標題使用句子大小寫（例如 "Getting started"，而不是 "Getting Started"）
* 代碼塊標題使用句子大小寫（例如 "Expandable example"，而不是 "Expandable Example"）
* 先提供上下文：在說明如何使用某物之前，先解釋它是什麼
* 在程序化內容的開始處說明先決條件

### 應避免的事項

**切勿使用：**

* 營銷術語（"強大的"、"無縫的"、"穩健的"、"尖端的"）
* 冗餘短語（"值得注意的是"、"為了..."）
* 過多的連接詞（"此外"、"而且"、"另外"）
* 主觀詞彙（"顯然"、"簡單地"、"僅僅"、"輕鬆地"）

**注意 AI 典型的模式：**

* 過於正式或呆板的措辭
* 不必要的概念重複
* 沒有增加價值的通用介紹
* 重述剛才內容的結論性總結

### 格式化

* 所有代碼塊都必須有語言標籤
* 所有圖片和媒體都必須有具描述性的替代文字 (alt text)
* 僅在有助於讀者理解時使用粗體和斜體——切勿僅為了裝飾而使用文本樣式
* 不要使用裝飾性格式或表情符號

### 代碼示例

* 保持示例簡單實用
* 使用真實的值（不要用 "foo" 或 "bar"）
* 一個清晰的示例勝過多個變化
* 在包含代碼之前測試其是否有效

## 記錄 API

**選擇你的方法：**

* **有 OpenAPI 規範？** → 通過 `"openapi": ["openapi.yaml"]` 添加到 `docs.json`。頁面會自動生成。在導航中引用為 `GET /endpoint`
* **沒有規範？** → 在 frontmatter 中使用 `api: "POST /users"` 手動撰寫端點。雖然工作量較大，但可以完全控制
* **混合模式** → 對大多數端點使用 OpenAPI，對複雜的工作流程使用手動編寫的頁面

鼓勵用戶從 OpenAPI 規範生成端點頁面。這是最有效且最容易維護的選項。

## 部署

當更改推送到連接的 Git 倉庫時，Mintlify 會自動部署。

**代理可以配置的內容：**

* **重定向** → 在 `docs.json` 中添加 `"redirects": [{"source": "/old", "destination": "/new"}]`
* **SEO 索引** → 通過 `"seo": {"indexing": "all"}` 來控制，以便在搜索中包含隱藏頁面

**需要儀表板設置（人工任務）：**

* 自定義域名和子域名
* 預覽部署設置
* DNS 配置

對於使用 Vercel 或 Cloudflare 進行 `/docs` 子路徑託管，代理可以幫助配置重寫規則。參見 [/docs 子路徑](https://mintlify.com/docs/deploy/vercel)。

## 工作流程

### 1. 理解任務

確定需要記錄的內容、受影響的頁面以及讀者在閱讀後應達成的目標。如果有任何不明確之處，請詢問。

### 2. 研究

* 閱讀 `docs.json` 以了解網站結構
* 搜索現有文檔中的相關內容
* 閱讀類似頁面以匹配網站風格

### 3. 計劃

* 綜合讀者在閱讀文檔和當前內容後應達成的目標
* 提出任何更新或新內容
* 驗證你提議的更改是否能幫助讀者成功

### 4. 撰寫

* 從最重要的信息開始
* 保持章節內容集中且易於掃描
* 適當使用組件（不要過度使用）
* 對於任何不確定的內容，標註 TODO 註釋：

```mdx theme={null}
{/* TODO: 驗證預設超時值 */}
```

### 5. 更新導航

如果你創建了新頁面，請將其添加到 `docs.json` 中的適當組。

### 6. 驗證

在提交之前：

* [ ] Frontmatter 包含 title 和 description
* [ ] 所有代碼塊都有語言標籤
* [ ] 內部連結使用不帶副檔名的根相對路徑
* [ ] 新頁面已添加到 `docs.json` 導航
* [ ] 內容與周圍頁面的風格匹配
* [ ] 沒有營銷術語或冗餘短語
* [ ] 對於不確定的內容有清晰的 TODO 標記
* [ ] 運行 `mint broken-links` 檢查連結
* [ ] 運行 `mint validate` 尋找任何錯誤

## 特殊情況

### 遷移

如果用戶詢問關於遷移到 Mintlify 的問題，請詢問他們是否正在使用 ReadMe 或 Docusaurus。如果是，使用 [@mintlify/scraping](https://www.npmjs.com/package/@mintlify/scraping) CLI 進行內容遷移。如果他們使用的是其他平台，請幫助他們手動將內容轉換為使用 Mintlify 組件的 MDX 頁面。

### 隱藏頁面

任何未包含在 `docs.json` 導航中的頁面都是隱藏的。對於應通過 URL 訪問或為助手/搜索建立索引，但不應在側邊欄導航中發現的內容，請使用隱藏頁面。

### 排除頁面

`.mintignore` 檔案用於從文檔倉庫中排除不被處理的檔案。

## 常見陷阱

1. **組件導入** - JSX 組件需要明確導入，MDX 組件不需要
2. **Frontmatter 是必需的** - 每個 MDX 檔案至少需要 `title`
3. **代碼塊語言** - 務必指定語言識別符
4. **切勿使用 `mint.json`** - `mint.json` 已棄用。請僅使用 `docs.json`

## 資源

* [文檔](https://mintlify.com/docs)
* [配置架構](https://mintlify.com/docs.json)
* [功能請求](https://github.com/orgs/mintlify/discussions/categories/feature-requests)
* [錯誤與反饋](https://github.com/orgs/mintlify/discussions/categories/bugs-feedback)
