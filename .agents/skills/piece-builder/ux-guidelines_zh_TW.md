# UX 指南：讓 Piece 易於使用

Piece 是由非技術使用者用來建立自動化的。每個屬性 (prop)、描述和下拉選單都必須足夠清晰，讓完全沒有 API 知識的人也能在不閱讀外部文件的情況下使用 Piece。

---

## 1. 絕不要讓使用者輸入 ID

使用動態下拉選單，讓使用者透過名稱挑選項目，而不是貼上 ID。

**錯誤做法：**
```typescript
contactId: Property.ShortText({
  displayName: 'Contact ID',
  description: 'The ID of the contact',
  required: true,
})
```

**正確做法：**
```typescript
contactId: Property.Dropdown({
  displayName: 'Contact',
  description: 'Select the contact to update',
  refreshers: [],
  required: true,
  options: async ({ auth }) => {
    if (!auth) return { disabled: true, options: [], placeholder: 'Please connect your account first' };
    const response = await httpClient.sendRequest<{ data: { id: string; name: string; email: string }[] }>({ /* ... */ });
    return {
      disabled: false,
      options: response.body.data.map((c) => ({
        label: `${c.name} (${c.email})`,  // 顯示名稱 + 電子郵件，而非 ID
        value: c.id,
      })),
    };
  },
})
```

下拉選單的標籤應結合人類可讀的名稱與區分標識：
- 聯絡人：`"Jane Doe (jane@example.com)"`
- 發票：`"Invoice #1042 for Acme Inc ($150.00 USD)"`
- 專案：`"Marketing Website (active)"`
- 記錄：使用主要欄位值，而非記錄 ID

---

## 2. 撰寫具教育意義的描述

描述應告訴使用者**要輸入什麼**以及**如何找到它**。假設他們從未見過該 API。

**錯誤做法：**
```typescript
description: 'The thread timestamp'
```

**正確做法：**
```typescript
description: 'Provide the ts (timestamp) value of the parent message to reply in a thread. You can get this by clicking the three dots next to a message and selecting "Copy link". The timestamp is the number at the end of the URL (e.g. 1710304378.475129).'
```

**錯誤做法：**
```typescript
description: 'Enter the chat ID'
```

**正確做法：**
```typescript
description: 'The unique ID of the chat to send the message to. To find it: 1) Search for @getmyid_bot in Telegram, 2) Send /my_id, 3) Copy the number it replies with.'
```

---

## 3. 對於複雜的設定使用 Markdown 指標

當一個屬性需要多步驟配置時，在它的上方添加一個帶有清晰說明的 `Property.MarkDown()`：

```typescript
props: {
  instructions: Property.MarkDown({
    value: `### 設定說明

1. 前往儀表板中的 **Settings > API**
2. 點擊 **Create API Key**
3. 複製密鑰並貼在下方

**註：** 密鑰以 \`sk_\` 開頭。如果以 \`pk_\` 開頭，代表您使用了錯誤的密鑰。`,
  }),
  apiKey: Property.ShortText({
    displayName: 'API Key',
    required: true,
  }),
}
```

在以下情況使用 Markdown：
- Webhook 設定說明（包含 `{{webhookUrl}}` 佔位符）
- 在第三方應用程式中尋找特定設定的步驟
- 關於常見錯誤的警告
- 權限或範圍 (scope) 要求

---

## 4. 務必設置合理的預設值

如果一個屬性有「最常見」的值，請將其設置為預設值，讓使用者無需思考：

```typescript
// AI 的溫度 (Temperature) -- 大多數使用者想要預設值
temperature: Property.Number({
  displayName: 'Temperature',
  description: 'Controls randomness. Lower values (e.g. 0.2) make output more focused. Higher values (e.g. 0.8) make it more creative.',
  required: false,
  defaultValue: 0.7,
})

// 大多數使用者希望包含細節行 (Detail Rows)
includeDetails: Property.Checkbox({
  displayName: 'Include Detail Rows',
  description: 'Include individual record rows. If disabled, only summary data is returned.',
  required: false,
  defaultValue: true,
})

// 具有推薦選項的輸出格式
outputFormat: Property.StaticDropdown({
  displayName: 'Output Format',
  required: false,
  defaultValue: 'simplified',
  options: {
    options: [
      { label: 'Simplified (recommended)', value: 'simplified' },
      { label: 'Raw API Response', value: 'raw' },
    ],
  },
})
```

---

## 5. 使用清晰且動作導向的顯示名稱 (Display Names)

顯示名稱應使用簡單通俗的語言，準確告知使用者該動作的作用。

**錯誤的顯示名稱：**
- `"POST Contact"` -- 太技術化
- `"Execute Query"` -- 專業術語
- `"API Call"` -- 對終端使用者毫無意義

**正確的顯示名稱：**
- `"Create Contact"`
- `"Find Contact by Email"`
- `"Send Message to Channel"`
- `"Add Row to Spreadsheet"`
- `"Get Invoice Details"`
- `"List All Projects"`

對於 Piece：使用`「動詞 + 受詞」`格式。
對於觸發器 (Triggers)：使用`「New [事物]」`或`「Updated [事物]」`格式。

---

## 6. 撰寫有幫助的身分驗證 (Auth) 描述

身分驗證描述應包含獲取憑證的分步說明：

```typescript
export const myAppAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: `欲獲取您的 API Key：
1. 登入您的 Example App 帳戶
2. 前往 **Settings > API Keys**
3. 點擊 **Create New Key**
4. 複製密鑰（以 \`ex_\` 開頭）

需要幫助？請參閱 https://docs.example.com/api-keys`,
  required: true,
});
```

---

## 7. 使用有幫助的佔位符 (Placeholders) 和錯誤訊息

下拉選單的佔位符應引導使用者下一步該怎麼做：

```typescript
// 當缺少身分驗證時
return { disabled: true, options: [], placeholder: 'Please connect your account first' };

// 當尚未選擇父級下拉選單時
return { disabled: true, options: [], placeholder: 'Please select a project first' };

// 當 API 返回空結果時
return { disabled: false, options: [], placeholder: 'No items found. Create one in your dashboard first.' };
```

下拉選單中的錯誤狀態：
```typescript
try {
  const response = await httpClient.sendRequest({ /* ... */ });
  return { disabled: false, options: [...] };
} catch (error) {
  return { disabled: true, options: [], placeholder: 'Failed to load items. Check your connection.' };
}
```

---

## 8. 清晰標記選填屬性

只有在該動作確實無法缺少該屬性時，才將屬性標記為 `required: true`。對於其他所有屬性，請使用 `required: false` 並配上合理的預設值或說明何時該使用它：

```typescript
// 必填 -- 沒有文字無法發送訊息
text: Property.LongText({
  displayName: 'Message',
  description: 'The message content to send',
  required: true,
})

// 選填 -- 大多數使用者不需要這個
threadId: Property.ShortText({
  displayName: 'Thread ID',
  description: 'Only fill this if you want to reply to an existing thread. Leave empty to send a new message.',
  required: false,
})
```

---

## 9. 邏輯性地組合相關屬性

依重要性從高到低排列屬性。將必填欄位放在前面，選填欄位放在後面：

```typescript
props: {
  // 必填欄位在前
  channel: channelDropdown,          // 發送到哪裡
  message: Property.LongText({...}), // 發送什麼內容

  // 選填欄位在後
  threadTs: Property.ShortText({...}),      // 回覆討論串
  username: Property.ShortText({...}),      // 自定義機器人名稱
  profilePicture: Property.ShortText({...}),// 自定義頭像
}
```

---

## 檢查清單

在完成任何動作之前，請確認：
- [ ] 沒有任何屬性要求使用者輸入 ID（若可以使用下拉選單代替）
- [ ] 每個屬性都有一個 `description` 來解釋它是什麼以及如何找到該值
- [ ] 複雜的設定步驟使用了帶有編號說明的 `Property.MarkDown()`
- [ ] 選填屬性在適用情況下有合理的 `defaultValue`
- [ ] 顯示名稱使用通俗語言（例如 `"Create Contact"` 而非 `"POST /contacts"`）
- [ ] 身分驗證描述包含獲取憑證的分步說明
- [ ] 下拉選單佔位符引導使用者（例如 `"Please select a project first"`）
- [ ] 在屬性順序中，必填欄位位於選填欄位之前