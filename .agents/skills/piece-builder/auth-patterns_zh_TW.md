# 身分驗證模式

## API 金鑰 (SecretText)

最常用於簡單的 API。`auth` 的值是一個純字串。

```typescript
import { PieceAuth } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';

export const myAppAuth = PieceAuth.SecretText({
  displayName: 'API 金鑰',
  description: '從 https://app.example.com/settings/api 取得您的 API 金鑰',
  required: true,
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://api.example.com/v1/me',
        headers: { Authorization: `Bearer ${auth}` },
      });
      return { valid: true };
    } catch (e) {
      return { valid: false, error: '無效的 API 金鑰' };
    }
  },
});
```

**在動作 (actions) / 觸發器 (triggers) 中的存取方式：** `context.auth` 直接就是一個字串。

**實際案例：** `packages/pieces/community/stripe/src/index.ts`

---

## OAuth2

適用於像 Google、Slack、GitHub 等使用 OAuth2 授權流程的服務。

```typescript
import { PieceAuth } from '@activepieces/pieces-framework';

export const myAppAuth = PieceAuth.OAuth2({
  required: true,
  authUrl: 'https://app.example.com/oauth/authorize',
  tokenUrl: 'https://app.example.com/oauth/token',
  scope: ['read', 'write'],
  // 選填設定：
  // pkce: true,
  // pkceMethod: 'S256',
  // prompt: 'consent',
  // grantType: OAuth2GrantType.AUTHORIZATION_CODE,
  // authorizationMethod: OAuth2AuthorizationMethod.HEADER,
  // extra: { audience: 'https://api.example.com' },
});
```

**在動作/觸發器中的存取方式：** `context.auth.access_token`

對於使用 OAuth2 的自定義 API 呼叫動作：
```typescript
createCustomApiCallAction({
  baseUrl: () => 'https://api.example.com',
  auth: myAppAuth,
  authMapping: async (auth) => ({
    Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
  }),
})
```

**實際案例：** `packages/pieces/community/github/src/index.ts`

---

## 基本驗證 (Basic Auth)

適用於使用 使用者名稱/密碼 驗證的 API。

```typescript
import { PieceAuth } from '@activepieces/pieces-framework';

export const myAppAuth = PieceAuth.BasicAuth({
  displayName: '連線',
  required: true,
  username: {
    displayName: '使用者名稱',
    description: '您的帳號使用者名稱',
  },
  password: {
    displayName: '密碼',
    description: '您的帳號密碼',
  },
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://api.example.com/v1/me',
        authentication: {
          type: AuthenticationType.BASIC,
          username: auth.username,
          password: auth.password,
        },
      });
      return { valid: true };
    } catch (e) {
      return { valid: false, error: '憑證無效' };
    }
  },
});
```

**存取方式：** `context.auth.username`, `context.auth.password`

---

## 自定義驗證 (Custom Auth)

適用於需要多個欄位的 API（例如：實例網址 + API 金鑰，或是區域 + 憑證）。

```typescript
import { PieceAuth, Property } from '@activepieces/pieces-framework';

export const myAppAuth = PieceAuth.CustomAuth({
  displayName: '連線',
  required: true,
  props: {
    base_url: Property.ShortText({
      displayName: '實例網址 (Instance URL)',
      description: '例如：https://mycompany.example.com',
      required: true,
    }),
    api_key: PieceAuth.SecretText({
      displayName: 'API 金鑰',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${auth.base_url}/api/v1/me`,
        headers: { Authorization: `Bearer ${auth.api_key}` },
      });
      return { valid: true };
    } catch (e) {
      return { valid: false, error: '連線資訊無效' };
    }
  },
});
```

**存取方式：** `context.auth.base_url`, `context.auth.api_key`

**CustomAuth 中允許的屬性 (prop) 類型：** ShortText, LongText, SecretText, Number, Checkbox, StaticDropdown, StaticMultiSelectDropdown, MarkDown。

**實際案例：** `packages/pieces/community/wordpress/src/index.ts`

---

## 無須驗證 (No Auth)

適用於不需要憑證的公開 API 或工具類組件。

```typescript
// 在 createPiece() 中：
auth: PieceAuth.None(),
```

當驗證為 `None` 時：
- **不要**在 `createAction()` / `createTrigger()` 中加入 `auth:`
- **不要**在 `run` 函式中引用 `context.auth`
- 下拉選單 (Dropdowns) **不會**接收 `auth` 參數

**實際案例：** `packages/pieces/core/qrcode/src/index.ts`