# Piece 類型與分類

## Piece 的 3 個存放位置

Monorepo 有三個 Piece 目錄，各具不同用途：

```
packages/pieces/
  community/    ← 第三方整合 (Slack, Stripe, GitHub 等)
  core/         ← 內置的 Activepieces 工具 (HTTP, Store, Schedule 等)
  custom/       ← 由個別 Activepieces 客戶構建的私有 Piece
```

### 何時使用各個位置

| 位置 | 使用時機 | 示例 |
|---|---|---|
| `community/` | 構建任何人都可以使用的第三方應用整合 | Slack, Notion, Trello, Stripe |
| `core/` | 構建非針對特定外部應用的平台工具 | HTTP, Store, Math Helper, Delay |
| `custom/` | 為特定客戶的內部系統構建私有 Piece | 內部 CRM, 專有 API |

**對於幾乎所有的 Piece 構建工作，你都會使用 `community/`。** CLI 預設會在 `community/` 中建立腳手架。
---

## PieceType 枚舉 (運行時)

在運行時，Piece 被分類為 `OFFICIAL` (官方) 或 `CUSTOM` (自定義)：

```typescript
enum PieceType {
  CUSTOM = 'CUSTOM',    // 私有 Piece，以 .tgz 壓縮檔形式上傳
  OFFICIAL = 'OFFICIAL', // 發佈到 npm 註冊表 (@activepieces/piece-*)
}
```

Community 和 Core 類別的 Piece 屬於 `OFFICIAL`（發佈到 npm）。Custom 類別的 Piece 屬於 `CUSTOM`（作為壓縮檔上傳到特定的平台/帳戶）。

---

## 封裝命名規範

| 位置 | 封裝名稱格式 | 示例 |
|---|---|---|
| `community/` | `@activepieces/piece-<name>` | `@activepieces/piece-slack` |
| `core/` | `@activepieces/piece-<name>` | `@activepieces/piece-http` |
| `custom/` | 任何有效的 npm 名稱 | `@mycompany/piece-internal-crm` |

---

## PieceCategory 值

使用來自 `@activepieces/shared` 的 `PieceCategory` 來分類你的 Piece。選擇最相關的分類：

| 分類 | 用於 |
|---|---|
| `ARTIFICIAL_INTELLIGENCE` | AI/LLM 服務 (OpenAI, Anthropic 等) |
| `COMMUNICATION` | 聊天、電子郵件、訊息 (Slack, Gmail, Twilio) |
| `COMMERCE` | 電子商務平台 (Shopify, WooCommerce) |
| `ACCOUNTING` | 財務/會計工具 (QuickBooks, Xero) |
| `BUSINESS_INTELLIGENCE` | 分析、報告 (Google Analytics, Looker) |
| `CONTENT_AND_FILES` | 檔案存儲、文檔 (Google Drive, Notion, Dropbox) |
| `DEVELOPER_TOOLS` | 開發工具 (GitHub, Jira, Linear) |
| `CUSTOMER_SUPPORT` | 客戶支援平台 (Intercom, Zendesk) |
| `FORMS_AND_SURVEYS` | 表單構建器 (Typeform, Google Forms) |
| `HUMAN_RESOURCES` | 人力資源工具 (BambooHR, Workday) |
| `MARKETING` | 行銷工具 (Mailchimp, HubSpot Marketing) |
| `PAYMENT_PROCESSING` | 支付網關 (Stripe, PayPal) |
| `PRODUCTIVITY` | 一般生產力 (Trello, Airtable, Calendar) |
| `SALES_AND_CRM` | 銷售與 CRM (Salesforce, HubSpot CRM, Pipedrive) |
| `CORE` | 平台工具 (僅用於 `core/` 下的 Piece) |
| `FLOW_CONTROL` | 流程邏輯 (僅用於 `core/` 下的 Piece) |
| `UNIVERSAL_AI` | 通用 AI 連接器 (僅用於 `core/` 下的 Piece) |

允許使用多個分類：
```typescript
categories: [PieceCategory.COMMERCE, PieceCategory.PAYMENT_PROCESSING]
```

---

## Core Piece — 可用工具

Core Piece 是內置於 Activepieces 平台中的工具。請勿重複開發這些工具——請將其作為模式參考：

| Piece | 封裝名稱 | 功能 |
|---|---|---|
| `http` | `@activepieces/piece-http` | 通用 HTTP 請求 |
| `store` | `@activepieces/piece-store` | 流程內的鍵值 (Key-value) 存儲 |
| `schedule` | `@activepieces/piece-schedule` | 基於 Cron 的定時觸發器 |
| `delay` | `@activepieces/piece-delay` | 暫停流程執行 |
| `webhook` | `@activepieces/piece-webhook` | 通用 Webhook 觸發器 |
| `manual-trigger` | `@activepieces/piece-manual-trigger` | 手動執行流程 |
| `data-mapper` | `@activepieces/piece-data-mapper` | 數據轉換/映射 |
| `math-helper` | `@activepieces/piece-math-helper` | 數學運算 |
| `text-helper` | `@activepieces/piece-text-helper` | 字串操作 |
| `date-helper` | `@activepieces/piece-date-helper` | 日期/時間操作 |
| `file-helper` | `@activepieces/piece-file-helper` | 檔案操作 |
| `approval` | `@activepieces/piece-approval` | 人工審核步驟 |
| `smtp` | `@activepieces/piece-smtp` | 通過 SMTP 發送電子郵件 |
| `sftp` | `@activepieces/piece-sftp` | SFTP 檔案傳輸 |
| `csv` | `@activepieces/piece-csv` | CSV 解析/生成 |
| `pdf` | `@activepieces/piece-pdf` | PDF 生成 |
| `qrcode` | `@activepieces/piece-qrcode` | 二維碼生成 |
| `tables` | `@activepieces/piece-tables` | Activepieces Tables 整合 |
| `subflows` | `@activepieces/piece-subflows` | 調用其他流程 |
| `connections` | `@activepieces/piece-connections` | 管理連接 |
| `forms` | `@activepieces/piece-forms` | Activepieces Forms |
| `tags` | `@activepieces/piece-tags` | 流程標籤 |
| `graphql` | `@activepieces/piece-graphql` | 通用 GraphQL 請求 |
| `crypto` | `@activepieces/piece-crypto` | 加密工具 |
| `xml` | `@activepieces/piece-xml` | XML 解析 |
| `image-helper` | `@activepieces/piece-image-helper` | 圖像處理 |
