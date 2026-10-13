# Trigger 模式 (Trigger Patterns)

兩種主要類型：**Polling (輪詢)**（定期檢查 API）和 **Webhook**（接收推送通知）。

如果 API 支援，請優先選用 Webhook —— 它們是即時的，且消耗更少資源。

---

## Polling Trigger (輪詢觸發器)

當 API 不支援 Webhook 時使用。Activepieces 每隔約 5 分鐘進行一次輪詢。

兩種去重策略：
- **TIMEBASED (基於時間)** —— 每個項目都有時間戳；僅返回晚於上次輪詢時間的項目。
- **LAST_ITEM (最後一項)** —— 每個項目都有 ID；返回最後一個已知 ID 之後的項目。

### TIMEBASED Polling (最常見)

```typescript
import { createTrigger, TriggerStrategy, AppConnectionValueForAuthProperty } from '@activepieces/pieces-framework';
import { DedupeStrategy, Polling, pollingHelper, httpClient, HttpMethod, AuthenticationType } from '@activepieces/pieces-common';
import { myAppAuth } from '../../';

const polling: Polling<AppConnectionValueForAuthProperty<typeof myAppAuth>, Record<string, never>> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const response = await httpClient.sendRequest<{ data: any[] }>({
      method: HttpMethod.GET,
      url: 'https://api.example.com/v1/records',
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: auth as string,
      },
      queryParams: {
        sort: 'created_at',
        order: 'desc',
        limit: '100',
      },
    });
    return response.body.data.map((item) => ({
      epochMilliSeconds: new Date(item.created_at).getTime(),
      data: item,
    }));
  },
};

export const newRecordTrigger = createTrigger({
  auth: myAppAuth,
  name: 'new_record',
  displayName: 'New Record',
  description: 'Triggers when a new record is created',
  props: {},
  sampleData: {},
  type: TriggerStrategy.POLLING,
  async test(context) {
    return await pollingHelper.test(polling, context);
  },
  async onEnable(context) {
    await pollingHelper.onEnable(polling, context);
  },
  async onDisable(context) {
    await pollingHelper.onDisable(polling, context);
  },
  async run(context) {
    return await pollingHelper.poll(polling, context);
  },
});
```

**真實示例:** `packages/pieces/community/airtable/src/lib/trigger/new-record.trigger.ts`

### LAST_ITEM Polling

當項目具有 ID 但沒有可靠的時間戳時使用：

```typescript
const polling: Polling<undefined, Record<string, never>> = {
  strategy: DedupeStrategy.LAST_ITEM,
  items: async ({ auth, propsValue, lastItemId }) => {
    const response = await httpClient.sendRequest<any[]>({
      method: HttpMethod.GET,
      url: 'https://api.example.com/v1/records',
      queryParams: { sort: 'id', order: 'desc', limit: '50' },
    });
    return response.body.map((item) => ({
      id: item.id,        // 唯一標識符
      data: item,
    }));
  },
};
```

### 帶屬性的 Polling

當 Trigger 具有用戶可配置的屬性 (Props) 時（例如，按項目過濾）：

```typescript
const props = {
  projectId: Property.Dropdown({ /* ... */ }),
};

const polling: Polling<
  AppConnectionValueForAuthProperty<typeof myAppAuth>,
  StaticPropsValue<typeof props>
> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue }) => {
    // 此處可使用 propsValue.projectId
    const response = await httpClient.sendRequest<{ data: any[] }>({
      method: HttpMethod.GET,
      url: `https://api.example.com/v1/projects/${propsValue.projectId}/records`,
      // ...
    });
    return response.body.data.map((item) => ({
      epochMilliSeconds: new Date(item.created_at).getTime(),
      data: item,
    }));
  },
};

export const newRecordTrigger = createTrigger({
  auth: myAppAuth,
  name: 'new_record',
  displayName: 'New Record',
  description: 'Triggers when a new record is created in a project',
  props,
  sampleData: {},
  type: TriggerStrategy.POLLING,
  // test, onEnable, onDisable, run -- 與上述模式相同
});
```

---

## Webhook Trigger

當 API 支援 Webhook 註冊時使用。流程如下：
1. `onEnable` —— 使用 `context.webhookUrl` 向第三方 API 註冊 Webhook。
2. `run` —— 處理傳入的 Webhook Payload。
3. `onDisable` —— 當流程關閉時刪除 Webhook。

```typescript
import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, AuthenticationType } from '@activepieces/pieces-common';
import { myAppAuth } from '../../';

export const newRecordWebhookTrigger = createTrigger({
  auth: myAppAuth,
  name: 'new_record_webhook',
  displayName: 'New Record',
  description: 'Triggers when a new record is created',
  props: {},
  sampleData: {
    id: '123',
    name: 'Example record',
    created_at: '2024-01-01T00:00:00Z',
  },
  type: TriggerStrategy.WEBHOOK,

  async onEnable(context) {
    // 向外部服務註冊 Webhook
    const response = await httpClient.sendRequest<{ id: string }>({
      method: HttpMethod.POST,
      url: 'https://api.example.com/v1/webhooks',
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth as string,
      },
      body: {
        url: context.webhookUrl,         // Activepieces 提供的 URL
        events: ['record.created'],
      },
    });
    // 存儲 Webhook ID 以便清理
    await context.store.put('webhookId', response.body.id);
  },

  async onDisable(context) {
    const webhookId = await context.store.get<string>('webhookId');
    if (webhookId) {
      await httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `https://api.example.com/v1/webhooks/${webhookId}`,
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: context.auth as string,
        },
      });
    }
  },

  async run(context) {
    // 將 Webhook Payload 作為數組返回 (每個元素都會變成一個獨立的流程執行)
    return [context.payload.body];
  },

  async test(context) {
    // 可選：獲取最近項目以便在 UI 中測試
    const response = await httpClient.sendRequest<{ data: any[] }>({
      method: HttpMethod.GET,
      url: 'https://api.example.com/v1/records',
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth as string,
      },
      queryParams: { limit: '5' },
    });
    return response.body.data || [];
  },
});
```

**真實示例:** `packages/pieces/community/stripe/src/lib/trigger/new-customer.ts`

### 帶有嵌套事件數據的 Webhook

許多 API 會對事件數據進行包裝。請提取相關部分：

```typescript
async run(context) {
  const payload = context.payload.body as { data: { object: unknown } };
  return [payload.data.object];  // Stripe 模式
}
```

### Webhook 握手 (Challenge-Response)

某些 API（如 Slack, Okta）在註冊時會發送驗證挑戰：

```typescript
import { WebhookHandshakeStrategy } from '@activepieces/pieces-framework';

export const myTrigger = createTrigger({
  // ...
  type: TriggerStrategy.WEBHOOK,
  handshakeConfiguration: {
    strategy: WebhookHandshakeStrategy.HEADER_PRESENT,
    paramName: 'x-verification-challenge',
  },
  async onHandshake(context) {
    const challenge = context.payload.headers['x-verification-challenge'];
    return {
      status: 200,
      body: { challenge },
      headers: { 'Content-Type': 'application/json' },
    };
  },
  // ... 其餘觸發器代碼
});
```

### Webhook 續訂

對於 Webhook 會過期的 API（例如 Google Sheets）：

```typescript
import { WebhookRenewStrategy } from '@activepieces/pieces-framework';

export const myTrigger = createTrigger({
  // ...
  renewConfiguration: {
    strategy: WebhookRenewStrategy.CRON,
    cronExpression: '0 */12 * * *',  // 每 12 小時一次
  },
  async onRenew(context) {
    // 刪除舊的 Webhook 並創建新的
    const oldId = await context.store.get<string>('webhookId');
    if (oldId) await deleteWebhook(oldId, context.auth);
    const newWebhook = await createWebhook(context.webhookUrl, context.auth);
    await context.store.put('webhookId', newWebhook.id);
  },
  // ...
});
```

---

## Trigger 策略摘要

| 策略 | 何時使用 | 關鍵點 |
|----------|------------|------------|
| `TriggerStrategy.POLLING` | API 不具備 Webhook 功能 | 使用帶有 TIMEBASED 或 LAST_ITEM 的 `pollingHelper` |
| `TriggerStrategy.WEBHOOK` | API 支援 Webhook 註冊 | 在 `onEnable` 註冊，在 `onDisable` 刪除 |
| `TriggerStrategy.APP_WEBHOOK` | 具有平台級 Webhook 的 OAuth2 應用 (Slack) | 使用 `context.app.createListeners()` |
