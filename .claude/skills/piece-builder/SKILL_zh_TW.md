---
name: piece-builder
description: 構建帶有 Action 和 Trigger 的 Activepieces Piece（整合）。當用戶要求創建新的 Piece、向 Piece 添加 Action、向 Piece 添加 Trigger 或為第三方應用構建整合時使用。當用戶提到 Activepieces Piece、連接器 (connectors) 或整合開發時也適用。
---

# Activepieces Piece Builder

為 Activepieces 自動化平台構建 Piece（整合）。每個 Piece 提供 **Action**（用戶可以執行的操作）和 **Trigger**（啟動流程的事件）。

## 工作流程

每次都請遵循以下 5 個步驟：

### 步驟 1: 研究 (RESEARCH)

-   在網上搜索目標應用程式的 REST API 文檔
-   確定身份驗證方法（API Key、OAuth2、Basic Auth、自定義）
-   列出可用的端點；檢查是否支援 Webhooks
-   記錄 Base URL、分頁機制和頻率限制

### 步驟 2: 計劃 (PLAN)

-   **根據用戶請求確定 Piece 的位置：**
    -   如果用戶說 **"custom piece" (自定義 Piece)** → 使用 `packages/pieces/custom/`（無需詢問）
    -   否則 → 預設使用 `packages/pieces/community/`
    -   完整參考請參見下方的 Piece 類型表
-   選擇正確的身份驗證類型 —— 參見下方的身份驗證快速參考
-   選擇最有用的 Action（CRUD、搜索、列表）
-   選擇 Trigger（如果 API 支援則使用 Webhook，否則使用 Polling 輪詢）
-   如果不確定 OAuth2 配置、應優先處理哪些 Action 或 API 行為不明確，**請詢問用戶**

### 步驟 3: 建立腳手架 (SCAFFOLD)

#### 選項 A: CLI (推薦)

```bash
npm run cli pieces create
# 輸入: piece name, package name (@activepieces/piece-<name>), type (community)

npm run cli actions create
# 輸入: piece folder name, action display name, description

npm run cli triggers create
# 輸入: piece folder name, trigger display name, description, technique (polling/webhook)
```

#### 選項 B: 手動創建檔案 (當 CLI 失敗或不可用時)

在 `packages/pieces/community/<name>/` 下創建此結構：

```
src/
  index.ts
  lib/
    actions/            # 每個 Action 一個檔案
    triggers/           # 每個 Trigger 一個檔案
    common/             # 共享的輔助函式 (可選)
package.json
project.json
.eslintrc.json
tsconfig.json
tsconfig.lib.json
```

從現有的簡單 Piece（例如 `packages/pieces/core/qrcode/`）複製配置文件，並在整個過程中替換 `<name>`。模板如下：

**package.json**

```json
{
    "name": "@activepieces/piece-<name>",
    "version": "0.0.1",
    "dependencies": {}
}
```

**`.eslintrc.json`**

```json
{
    "extends": ["../../../../.eslintrc.base.json"],
    "ignorePatterns": ["!**/*"],
    "overrides": [
        { "files": ["*.ts", "*.tsx", "*.js", "*.jsx"], "rules": {} },
        { "files": ["*.ts", "*.tsx"], "rules": {} },
        { "files": ["*.js", "*.jsx"], "rules": {} }
    ]
}
```

**`tsconfig.json`**

```json
{
    "extends": "../../../../tsconfig.base.json",
    "compilerOptions": {
        "module": "commonjs",
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "noImplicitOverride": true,
        "noPropertyAccessFromIndexSignature": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true
    },
    "files": [],
    "include": [],
    "references": [{ "path": "./tsconfig.lib.json" }]
}
```

**`tsconfig.lib.json`**

```json
{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "rootDir": ".",
        "baseUrl": ".",
        "paths": {},
        "outDir": "./dist",
        "declaration": true,
        "types": ["node"]
    },
    "include": ["src/**/*.ts"],
    "exclude": ["jest.config.ts", "src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

### 步驟 4: 實現 (IMPLEMENT)

**在編寫任何代碼之前閱讀這些檔案：**

| 你正在實現的內容 | 閱讀此檔案 |
| ----------------------------------------------- | --------------------- |
| 身份驗證設置 | `auth-patterns_zh_TW.md` |
| Action 結構 | `action-patterns_zh_TW.md` |
| Trigger 結構 (Polling 或 Webhook) | `trigger-patterns_zh_TW.md` |
| 任何屬性 (Props) -- Action 或 Trigger | `props-patterns_zh_TW.md` |
| HTTP 客戶端、共享輔助函式、分頁 | `common-patterns_zh_TW.md` |
| 每個屬性和下拉選單 **(所有均為強制性)** | `ux-guidelines_zh_TW.md` |
| 每個返回值 **(所有均為強制性)** | `output-quality_zh_TW.md` |

`ux-guidelines_zh_TW.md` 和 `output-quality_zh_TW.md` 適用於**每一個** Action 和 Trigger —— 請在開始前閱讀，而不僅僅是在不確定時。

### 步驟 5: 連接與驗證 (WIRE & VERIFY)

#### 連接清單 (在構建前完成所有項)

-   [ ] 在 `src/index.ts` 中導入每個 Action 並添加到 `actions: [...]`
-   [ ] 在 `src/index.ts` 中導入每個 Trigger 並添加到 `triggers: [...]`
-   [ ] 從 `src/index.ts` 導出身份驗證 (Auth)，以便 Action/Trigger 可以通過 `import { myAppAuth } from '../../'` 進行導入
-   [ ] 為進階用戶在 `actions: [...]` 中添加 `createCustomApiCallAction`
-   [ ] 在倉庫根目錄的 `tsconfig.base.json` 中註冊（按**字母順序**插入）：
    ```json
    "@activepieces/piece-<name>": ["packages/pieces/community/<name>/src/index.ts"]
    ```
    **不執行此步驟將導致構建失敗。**

#### 構建

```bash
bun install
npx turbo run build --filter=@activepieces/piece-<name>
```

對於新的 Piece，需要運行 `bun install` 才能在 TypeScript 解析導入之前創建工作區符號連結 (workspace symlinks)。後續重新構建時可以跳過此步驟。

修復 TypeScript 錯誤並重新構建。常見原因：`src/index.ts` 中缺少導入、`tsconfig.base.json` 條目缺失、`context.auth` 上的類型轉換錯誤（對於 SecretText 使用 `context.auth as unknown as string`）、Trigger 缺少 `sampleData`。

#### 本地測試

添加到 `packages/server/api/.env`：

```
AP_DEV_PIECES=<name>
```

啟動開發伺服器 (`npm start`)，打開 `localhost:4200`，使用 `dev@ap.com` / `12345678` 登錄，並在流程編輯器中找到你的 Piece。

---

## Piece 類型

| 位置 | 用途 |
|---|---|
| `packages/pieces/community/` | 第三方整合 (Slack, Stripe 等) -- 幾乎所有的工作都使用此處 |
| `packages/pieces/core/` | 內置平台工具 (HTTP, Store, Math 等) -- 請勿重複開發 |
| `packages/pieces/custom/` | 私有的客戶特定 Piece |

完整參考：[piece-types_zh_TW.md](piece-types_zh_TW.md) —— 包含所有 `PieceCategory` 值和現有的 Core Piece 列表。

## 資料夾結構

```
packages/pieces/community/<piece-name>/
  src/
    index.ts              # Piece 定義 (身份驗證 + 導入 + createPiece)
    lib/
      actions/            # 每個 Action 一個檔案
      triggers/           # 每個 Trigger 一個檔案
      common/             # 共享的 API 輔助函式和下拉選單定義
  package.json
  project.json
  .eslintrc.json
  tsconfig.json
  tsconfig.lib.json
```

## 身份驗證快速參考

| API 驗證方法 | Activepieces 類型 | 存取模式 |
| ---------------------- | ------------------------ | ------------------------------------ |
| API Key / Bearer Token | `PieceAuth.SecretText()` | `context.auth` (string)              |
| OAuth2                 | `PieceAuth.OAuth2()`     | `context.auth.access_token`          |
| 用戶名 + 密碼 | `PieceAuth.BasicAuth()`  | `context.auth.username`, `.password` |
| 多個欄位 | `PieceAuth.CustomAuth()` | `context.auth.<field_name>`          |
| 不需要驗證 | `PieceAuth.None()`       | 無 `context.auth` 可用 |

完整代碼示例：請閱讀 `auth-patterns_zh_TW.md`

## 快速 Piece 定義模板

```typescript
import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { PieceCategory } from '@activepieces/shared';
import { myAction } from './lib/actions/my-action';
import { myTrigger } from './lib/triggers/my-trigger';

export const myAppAuth = PieceAuth.SecretText({
    displayName: 'API Key',
    description: 'Go to Settings > API Keys in your dashboard to generate a key.',
    required: true,
});

export const myApp = createPiece({
    displayName: 'My App',
    description: 'What the app does in one sentence.',
    minimumSupportedRelease: '0.36.1',
    // Logo: 將 PNG 檔案添加到 packages/pieces/community/<name>/ 並在此處引用。
    logoUrl: 'https://cdn.activepieces.com/pieces/my-app.png',
    categories: [PieceCategory.PRODUCTIVITY],
    auth: myAppAuth,
    authors: ['your-github-username'], // 貢獻者的 GitHub 用戶名
    actions: [
        myAction,
        createCustomApiCallAction({
            baseUrl: () => 'https://api.example.com/v1',
            auth: myAppAuth,
            authMapping: async (auth) => ({
                Authorization: `Bearer ${auth}`,
            }),
        }),
    ],
    triggers: [myTrigger],
    // 如果 Piece 需要第三方 npm 封裝，請在此處聲明：
    // npmDependencies: { 'some-sdk': '^1.0.0' },
});
```

## UX 品質：對非技術用戶友好

Piece 是由從未見過 API 的人使用的。每個屬性 (Prop)、下拉選單和描述都必須清晰到無需閱讀外部文檔即可使用。

**規則：**

1. **切勿要求用戶輸入 ID** —— 使用動態下拉選單，以便他們按名稱選擇項目（例如：使用 `"Jane Doe (jane@x.com)"` 而非 `"cus_abc123"`）。
2. **描述必須具有教學意義** —— 不要只說 "輸入線索時間戳 (thread timestamp)"。應說 "點擊訊息旁邊的三個點，選擇複製連結，並貼上末尾的數字。"
3. **對於複雜設置使用 Markdown 指令** —— 當某個屬性需要在第三方應用程式中進行配置時，添加帶有編號步驟的 `Property.MarkDown()`。
4. **設置合理的預設值** —— 如果 90% 的用戶都想要相同的值，請將其設為預設值。
5. **使用通俗易懂的顯示名稱** —— 使用 `"Create Contact"` (創建聯絡人) 而非 `"POST /contacts"`。Trigger 範例：使用 `"New Order"` (新訂單) 而非 `"order.created webhook"`。
6. **身份驗證描述** 必須包含獲取 API Key 或設置 OAuth 的分步說明。
7. **有幫助的下拉選單佔位符** —— 使用 `"請先選擇一個項目"` 而不僅僅是空白。

完整模式和示例：請閱讀 `ux-guidelines_zh_TW.md`

## 輸出品質：表格就緒數據 (Table-Ready Data)

每個 Action 的輸出必須能夠直接映射到 Google Sheets、Excel 和 Activepieces Tables。用戶不斷將 Piece 輸出導入試算表 —— 如果你的輸出是嵌套的或不一致的，就會破壞他們的流程。

**規則：**

1. **扁平化嵌套對象** —— 輸出中不能有嵌套對象。將 `{ user: { name: "Jo", email: "jo@x.com" } }` 轉換為 `{ user_name: "Jo", user_email: "jo@x.com" }`。
2. **記錄數組必須具有一致的扁平鍵名** —— 列表中的每個對象必須具有相同的鍵，以便每個鍵對應到一列。
3. **單條記錄 Action** 返回一個扁平對象（一行）。
4. **列表/搜索 Action** 返回一個扁平數組，其中每個元素代表一行。
5. **使用易於閱讀的鍵名** —— 使用 `company_name` 而非 `cName`。這些將成為列標題。

完整模式和示例：請閱讀 `output-quality_zh_TW.md`

## 關鍵提醒

1. **在 tsconfig.base.json 中註冊** —— 按字母順序排在 `compilerOptions.paths` 中。不執行此操作構建會失敗。
2. **Action 名稱是永久性的** —— `createAction`/`createTrigger` 中的 `name` 欄位在發佈後切勿更改。
3. **從 index.ts 導出身份驗證 (Auth)** —— Action 和 Trigger 通過 `import { myAppAuth } from '../../'` 導入 Auth。
4. **務必在 Trigger 上提供 sampleData** —— 即使只是 `{}`。
5. **ux-guidelines_zh_TW.md 和 output-quality_zh_TW.md 是強制性的** —— 在實現任何 Action 或 Trigger 之前請先閱讀它們。

## 何時詢問用戶

在以下情況下，請務必暫停並詢問：

-   在 API 文檔中找不到 OAuth2 的 authUrl/tokenUrl/scopes
-   身份驗證方法不明確或未記錄
-   存在超過 10 個可能的 Action —— 詢問應優先處理哪些
-   API 使用 Webhook 簽名驗證
-   你需要測試憑據或沙箱存取權限
