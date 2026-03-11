# 輸出品質：適合表格的數據

每個 piece action 的輸出都必須能直接對應到 Google Sheets、Excel 和 Activepieces Tables，無需任何轉換。使用者經常將 piece 輸出連接到試算表列——如果您的數據是嵌套的或不一致的，他們的自動化流程將會中斷。

---

## 核心規則

### 1. 扁平化所有嵌套對象

API 回應通常具有嵌套結構。請務必將它們扁平化為點符號 (dot-notation) 或底線分隔的鍵 (keys)。

**錯誤 —— 嵌套對象會破壞試算表映射：**
```typescript
// 這無法直接映射到欄位
return {
  id: '123',
  user: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
  company: {
    name: 'Acme Inc',
    industry: 'Tech',
  },
};
```

**正確 —— 扁平化的鍵直接對應到欄位：**
```typescript
return {
  id: '123',
  user_name: 'Jane Doe',
  user_email: 'jane@example.com',
  company_name: 'Acme Inc',
  company_industry: 'Tech',
};
```

### 2. 紀錄陣列必須具有一致的鍵

清單中的每個對象都必須具有完全相同的鍵組。缺失的鍵應為 `null` 或 `''`，而不是省略。這可確保試算表中的每個欄位在每一列都有對應的值。

**錯誤 —— 鍵值不一致：**
```typescript
return [
  { name: 'Alice', email: 'alice@x.com', phone: '555-1234' },
  { name: 'Bob', email: 'bob@x.com' },  // 缺少 'phone' 會導致欄位對齊中斷
];
```

**正確 —— 鍵值一致，缺失部分使用 null：**
```typescript
return [
  { name: 'Alice', email: 'alice@x.com', phone: '555-1234' },
  { name: 'Bob', email: 'bob@x.com', phone: null },
];
```

### 3. 使用易於閱讀的鍵名

鍵名會成為試算表中的欄位標題。請使用清晰、具描述性的名稱。

**錯誤：**
```typescript
{ cNm: 'Acme', cId: '123', crtDt: '2024-01-01' }
```

**正確：**
```typescript
{ company_name: 'Acme', company_id: '123', created_date: '2024-01-01' }
```

### 4. 僅限原始值 (Primitive values)

每個值都應該是字串、數字、布林值或 null。不要使用物件、陣列或函式作為值。

**錯誤：**
```typescript
{ name: 'Alice', tags: ['vip', 'active'], metadata: { score: 95 } }
```

**正確：**
```typescript
{ name: 'Alice', tags: 'vip, active', metadata_score: 95 }
```

對於簡單值的陣列，請將它們合併為以逗號分隔的字串。

---

## 依 Action 類型劃分的輸出模式

### 單一紀錄 Action (Get, Create, Update)

返回單個扁平對象。如果使用者進行映射，每個鍵都會成為試算表的一個欄位。

```typescript
async run(context) {
  const response = await httpClient.sendRequest<ApiContact>({
    method: HttpMethod.GET,
    url: `https://api.example.com/v1/contacts/${context.propsValue.contactId}`,
    authentication: { type: AuthenticationType.BEARER_TOKEN, token: context.auth as string },
  });

  const contact = response.body;
  return {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone ?? null,
    company_name: contact.company?.name ?? null,
    company_id: contact.company?.id ?? null,
    created_at: contact.created_at,
    updated_at: contact.updated_at,
    tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : null,
  };
}
```

### 清單/搜尋 Action

返回一個扁平陣列或包含 `rows` 陣列的對象。每個元素代表一個試算表列。

```typescript
async run(context) {
  const response = await httpClient.sendRequest<{ data: ApiContact[] }>({
    method: HttpMethod.GET,
    url: 'https://api.example.com/v1/contacts',
    authentication: { type: AuthenticationType.BEARER_TOKEN, token: context.auth as string },
    queryParams: { limit: String(context.propsValue.limit ?? 100) },
  });

  return response.body.data.map((contact) => ({
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone ?? null,
    company_name: contact.company?.name ?? null,
    company_id: contact.company?.id ?? null,
    created_at: contact.created_at,
    tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : null,
  }));
}
```

### 報告/分析 Action

複雜的嵌套數據（如 Salesforce 報告）應轉換為扁平列。提供「簡化列 (Simplified Rows)」格式和「原始 (Raw)」轉義出口。

```typescript
props: {
  output_format: Property.StaticDropdown({
    displayName: 'Output Format',
    required: false,
    defaultValue: 'rows',
    options: {
      options: [
        { label: 'Simplified Rows (recommended)', value: 'rows' },
        { label: 'Raw API Response', value: 'raw' },
      ],
    },
  }),
},
async run(context) {
  const response = await httpClient.sendRequest<ComplexApiResponse>({ /* ... */ });

  if (context.propsValue.output_format === 'raw') {
    return response.body;
  }

  // 轉換為扁平列
  return {
    total_rows: response.body.results.length,
    columns: ['name', 'status', 'amount', 'date'],
    rows: response.body.results.map((item) => ({
      name: item.name,
      status: item.status,
      amount: item.financial_data?.amount ?? null,
      date: item.financial_data?.date ?? null,
    })),
  };
}
```

**實際範例：** `packages/pieces/community/salesforce/src/lib/action/run-report.ts`

### Trigger 輸出

Trigger 返回陣列，其中每個元素都會成為獨立的 flow 運行。每個元素也應該是扁平的。

```typescript
async run(context) {
  const payload = context.payload.body as WebhookPayload;
  return [{
    event_type: payload.event,
    record_id: payload.data?.id ?? null,
    record_name: payload.data?.name ?? null,
    record_email: payload.data?.email ?? null,
    occurred_at: payload.timestamp,
  }];
}
```

---

## 扁平化輔助函式 (Flattening Helper)

對於 API 返回深層嵌套數據的 action，請使用輔助函式：

```typescript
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const flatKey = prefix ? `${prefix}_${key}` : key;

    if (value === null || value === undefined) {
      result[flatKey] = null;
    } else if (Array.isArray(value)) {
      // 將簡單陣列合併為以逗號分隔的字串
      result[flatKey] = value
        .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
        .join(', ');
    } else if (typeof value === 'object') {
      // 遞迴扁平化嵌套物件
      Object.assign(result, flattenObject(value as Record<string, unknown>, flatKey));
    } else {
      result[flatKey] = value;
    }
  }

  return result;
}

// 在 action 中使用：
async run(context) {
  const response = await httpClient.sendRequest<any>({ /* ... */ });
  return flattenObject(response.body);
}
```

---

## 檢查清單

在完成任何 action 之前，請驗證：
- [ ] 輸出沒有嵌套對象（全部使用 `_` 分隔符號扁平化）
- [ ] 陣列值已合併為以逗號分隔的字串
- [ ] 清單中的所有對象都具有相同的鍵
- [ ] 鍵名易於閱讀（例如 `company_name`，而不是 `cNm`）
- [ ] 缺失值為 `null`，而不是省略
- [ ] 對於清單 action，輸出為陣列或 `{ rows: [...] }`
- [ ] 對於複雜/報告 action，提供「簡化列」與「原始」格式選項