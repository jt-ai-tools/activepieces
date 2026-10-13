# Action 模式 (Action Patterns)

## Action 模板

每個 Action 都放置在 `src/lib/actions/` 下的獨立檔案中：

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, AuthenticationType } from '@activepieces/pieces-common';
import { myAppAuth } from '../../';

export const createRecordAction = createAction({
  auth: myAppAuth,
  name: 'create_record',        // 唯一的 snake_case ID -- 發佈後切勿更改
  displayName: 'Create Record',
  description: 'Creates a new record in My App',
  props: {
    name: Property.ShortText({
      displayName: 'Name',
      description: 'The name of the record',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),
  },
  async run(context) {
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: 'https://api.example.com/v1/records',
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: context.auth as string,
      },
      body: {
        name: context.propsValue.name,
        description: context.propsValue.description,
      },
    });
    return response.body;
  },
});
```

**真實示例:** `packages/pieces/community/github/src/lib/actions/create-issue.ts`

關於所有可用的屬性類型 (`Property.ShortText`, `Property.Dropdown`, `Property.Array` 等)，請閱讀 [props-patterns_zh_TW.md](props-patterns_zh_TW.md)。
