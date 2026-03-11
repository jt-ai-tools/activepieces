# HTTP 用戶端與常見模式

## HTTP 用戶端

務必使用來自 `@activepieces/pieces-common` 的 `httpClient`：

```typescript
import { httpClient, HttpMethod, AuthenticationType } from '@activepieces/pieces-common';
```

### 使用 Bearer Token 的 GET 請求

```typescript
const response = await httpClient.sendRequest<{ data: Item[] }>({
  method: HttpMethod.GET,
  url: 'https://api.example.com/v1/records',
  authentication: {
    type: AuthenticationType.BEARER_TOKEN,
    token: apiKey,
  },
  queryParams: { limit: '100', page: '1' },
});
// response.body, response.status, response.headers
```

### 帶有 Body 的 POST 請求

```typescript
const response = await httpClient.sendRequest({
  method: HttpMethod.POST,
  url: 'https://api.example.com/v1/records',
  authentication: {
    type: AuthenticationType.BEARER_TOKEN,
    token: apiKey,
  },
  body: { name: 'New Record', status: 'active' },
});
```

### 基本身份驗證 (Basic Auth)

```typescript
const response = await httpClient.sendRequest({
  method: HttpMethod.GET,
  url: 'https://api.example.com/v1/records',
  authentication: {
    type: AuthenticationType.BASIC,
    username: 'user',
    password: 'pass',
  },
});
```

### 自定義標頭 (不使用身份驗證輔助程式)

```typescript
const response = await httpClient.sendRequest({
  method: HttpMethod.GET,
  url: 'https://api.example.com/v1/records',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'X-Custom-Header': 'value',
  },
});
```

### 可用的 HttpMethod 值
`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`

### 可用的 AuthenticationType 值
`BEARER_TOKEN`, `BASIC`

---

## 常見的 API 輔助模式

對於有多個 Action 共享 API 邏輯的 Piece，請建立 `src/lib/common/index.ts`：

```typescript
import {
  httpClient,
  HttpMethod,
  AuthenticationType,
  HttpMessageBody,
  HttpResponse,
} from '@activepieces/pieces-common';
import { Property } from '@activepieces/pieces-framework';
import { myAppAuth } from '../..';

const BASE_URL = 'https://api.example.com/v1';

// 集中式 API 呼叫函式
export async function myAppApiCall<T extends HttpMessageBody>({
  token,
  method,
  path,
  body,
  queryParams,
}: {
  token: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  queryParams?: Record<string, string>;
}): Promise<HttpResponse<T>> {
  return await httpClient.sendRequest<T>({
    method,
    url: `${BASE_URL}${path}`,
    authentication: {
      type: AuthenticationType.BEARER_TOKEN,
      token,
    },
    queryParams,
    body,
  });
}

// 可重複使用的下拉選單定義
export const myAppCommon = {
  projectDropdown: Property.Dropdown({
    displayName: 'Project',
    refreshers: [],
    required: true,
    options: async ({ auth }) => {
      if (!auth) {
        return { disabled: true, options: [], placeholder: 'Connect your account first' };
      }
      const response = await myAppApiCall<{ data: { id: string; name: string }[] }>({
        token: auth as string,
        method: HttpMethod.GET,
        path: '/projects',
      });
      return {
        disabled: false,
        options: response.body.data.map((p) => ({
          label: p.name,
          value: p.id,
        })),
      };
    },
  }),
};
```

接著在 Action 中使用：

```typescript
import { myAppCommon, myAppApiCall } from '../common';
import { myAppAuth } from '../../';

export const listTasksAction = createAction({
  auth: myAppAuth,
  name: 'list_tasks',
  displayName: 'List Tasks',
  description: 'Lists tasks in a project',
  props: {
    project: myAppCommon.projectDropdown,  // 重複使用下拉選單
  },
  async run(context) {
    const response = await myAppApiCall<{ data: any[] }>({
      token: context.auth as string,
      method: HttpMethod.GET,
      path: `/projects/${context.propsValue.project}/tasks`,
    });
    return response.body;
  },
});
```

**實際範例：**
- `packages/pieces/community/github/src/lib/common/index.ts`
- `packages/pieces/community/stripe/src/lib/common/index.ts`

---

## 分頁輔助模式

對於回傳分頁結果的 API：

```typescript
export async function myAppPaginatedApiCall<T>({
  token, method, path, queryParams,
}: {
  token: string;
  method: HttpMethod;
  path: string;
  queryParams?: Record<string, string | number>;
}): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await myAppApiCall<{ data: T[]; has_more: boolean }>({
      token,
      method,
      path,
      queryParams: {
        ...queryParams,
        page: String(page),
        per_page: String(perPage),
      } as Record<string, string>,
    });
    results.push(...response.body.data);
    hasMore = response.body.has_more;
    page++;
  }

  return results;
}
```

**實際範例：** `packages/pieces/community/github/src/lib/common/index.ts` -- `githubPaginatedApiCall`

---

## 自定義 API 呼叫 Action

務必新增此 Action，以便為進階使用者提供通用的 HTTP Action：

```typescript
import { createCustomApiCallAction } from '@activepieces/pieces-common';

// 在 createPiece 的 actions 陣列中：
createCustomApiCallAction({
  baseUrl: () => 'https://api.example.com/v1',
  auth: myAppAuth,
  authMapping: async (auth) => ({
    Authorization: `Bearer ${auth}`,
  }),
})
```

對於 OAuth2 驗證：
```typescript
import { OAuth2PropertyValue } from '@activepieces/pieces-framework';

createCustomApiCallAction({
  baseUrl: () => 'https://api.example.com',
  auth: myAppAuth,
  authMapping: async (auth) => ({
    Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
  }),
})
```

---

## 錯誤處理

### 在 Action 中

在 `run()` 中拋出的錯誤會自動顯示給使用者。你可以添加上下文資訊：

```typescript
async run(context) {
  try {
    const response = await httpClient.sendRequest({ /* ... */ });
    return response.body;
  } catch (error) {
    throw new Error(`Failed to create record: ${(error as Error).message}`);
  }
}
```

### 在下拉選單中

回傳帶有訊息的停用 (disabled) 狀態：

```typescript
options: async ({ auth }) => {
  if (!auth) {
    return { disabled: true, options: [], placeholder: 'Connect your account first' };
  }
  try {
    const response = await httpClient.sendRequest({ /* ... */ });
    return { disabled: false, options: [...] };
  } catch (error) {
    return { disabled: true, options: [], placeholder: 'Failed to load options. Check connection.' };
  }
}
```