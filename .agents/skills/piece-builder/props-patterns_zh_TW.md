# 屬性類型參考

同時用於 `createAction({ props: {...} })` 和 `createTrigger({ props: {...} })`。

---

## 文字 (Text)

```typescript
Property.ShortText({
  displayName: '標題',
  description: '選填的說明文字',
  required: true,
  defaultValue: '預設文字',
})

Property.LongText({
  displayName: '本文',
  required: false,
})
```

## 數字與布林值 (Number and Boolean)

```typescript
Property.Number({
  displayName: '限制',
  required: false,
  defaultValue: 10,
})

Property.Checkbox({
  displayName: '包含已封存？',
  required: false,
  defaultValue: false,
})
```

## 日期/時間 (Date/Time)

```typescript
Property.DateTime({
  displayName: '截止日期',
  required: false,
})
```

## 檔案 (File)

```typescript
Property.File({
  displayName: '附件',
  required: false,
})
```

## JSON 與物件 (JSON and Object)

```typescript
Property.Json({
  displayName: '自定義資料',
  description: '輸入有效的 JSON',
  required: false,
})

Property.Object({
  displayName: '元資料 (Metadata)',
  description: '鍵值對 (Key-value pairs)',
  required: false,
})
```

## 陣列 (Array)

```typescript
// 簡單字串陣列
Property.Array({
  displayName: '標籤',
  required: false,
})

// 具有結構化子屬性的陣列
Property.Array({
  displayName: '品項明細',
  required: true,
  properties: {
    name: Property.ShortText({ displayName: '項目名稱', required: true }),
    quantity: Property.Number({ displayName: '數量', required: true }),
    price: Property.Number({ displayName: '價格', required: false }),
  },
})
```

## 靜態下拉選單 (預定義選項) (Static Dropdown)

```typescript
Property.StaticDropdown({
  displayName: '狀態',
  required: true,
  options: {
    options: [
      { label: '啟用', value: 'active' },
      { label: '停用', value: 'inactive' },
      { label: '已封存', value: 'archived' },
    ],
  },
})

Property.StaticMultiSelectDropdown({
  displayName: '分類',
  required: false,
  options: {
    options: [
      { label: '銷售', value: 'sales' },
      { label: '行銷', value: 'marketing' },
    ],
  },
})
```

## 動態下拉選單 (從 API 獲取) (Dynamic Dropdown)

```typescript
Property.Dropdown({
  displayName: '專案',
  auth:myAppAuth,
  refreshers: [],  // 此屬性所依賴的屬性名稱陣列
  required: true,
  options: async ({ auth }) => {
    if (!auth) {
      return { disabled: true, options: [], placeholder: '請先連接您的帳戶' };
    }
    const response = await httpClient.sendRequest<{ data: { id: string; name: string }[] }>({
      method: HttpMethod.GET,
      url: 'https://api.example.com/v1/projects',
      authentication: { type: AuthenticationType.BEARER_TOKEN, token: auth as string },
    });
    return {
      disabled: false,
      options: response.body.data.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    };
  },
})
```

## 聯動下拉選單 (當父級變更時重新整理) (Dependent Dropdown)

```typescript
Property.Dropdown({
  displayName: '任務',
  refreshers: ['project'],  // 當 'project' 屬性變更時重新獲取
  required: true,
  auth:myAppAuth,
  options: async ({ auth, project }) => {
    if (!auth || !project) {
      return { disabled: true, options: [], placeholder: '請先選擇一個專案' };
    }
    const response = await httpClient.sendRequest<{ data: { id: string; name: string }[] }>({
      method: HttpMethod.GET,
      url: `https://api.example.com/v1/projects/${project}/tasks`,
      authentication: { type: AuthenticationType.BEARER_TOKEN, token: auth as string },
    });
    return {
      disabled: false,
      options: response.body.data.map((item) => ({ label: item.name, value: item.id })),
    };
  },
})
```

**實際案例：** `packages/pieces/community/github/src/lib/common/index.ts` -- 參考 `repositoryDropdown`, `issueDropdown`, `labelDropDown`

## 多選下拉選單 (動態) (Multi-Select Dropdown)

```typescript
Property.MultiSelectDropdown({
  displayName: '標籤',
  refreshers: ['repository'],
  required: false,
  auth:myAppAuth,
  options: async ({ auth, repository }) => {
    // 與 Dropdown 模式相同，回傳多個選定的值
  },
})
```

## 動態屬性 (欄位在執行時決定) (Dynamic Properties)

用於欄位本身來自 API 的表單 (例如：自定義表格欄位)：

```typescript
Property.DynamicProperties({
  displayName: '紀錄欄位',
  refreshers: ['tableId'],
  required: true,
  auth:myAppAuth,
  props: async ({ auth, tableId }) => {
    if (!auth || !tableId) return {};
    const fields = await fetchTableFields(auth, tableId);
    const properties: Record<string, any> = {};
    for (const field of fields) {
      properties[field.id] = Property.ShortText({
        displayName: field.name,
        required: field.required,
      });
    }
    return properties;
  },
})
```

## Markdown (僅供顯示，無使用者輸入)

```typescript
Property.MarkDown({
  value: '## 指示\n1. 前往設定\n2. 複製您的 API 金鑰',
})
```

用於設定說明、警告或 Webhook URL 顯示。請參閱 [ux-guidelines_zh_TW.md](./ux-guidelines_zh_TW.md) 以瞭解何時使用。

---

## PieceCategory 數值

用於 `createPiece({ categories: [...] })`：

`ARTIFICIAL_INTELLIGENCE`, `BUSINESS_INTELLIGENCE`, `COMMUNICATION`, `COMMERCE`, `ACCOUNTING`, `CONTENT_AND_FILES`, `CUSTOMER_SUPPORT`, `DEVELOPER_TOOLS`, `FORMS_AND_SURVEYS`, `HUMAN_RESOURCES`, `MARKETING`, `PAYMENT_PROCESSING`, `PRODUCTIVITY`, `SALES_AND_CRM`, `CORE`, `FLOW_CONTROL`, `UNIVERSAL_AI`