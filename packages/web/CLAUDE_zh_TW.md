# Web 套件 — 編碼規範

## Tailwind / 樣式

- **一律使用 `@/lib/utils` 中的 `cn()` 進行 className 組合。** 它使用 `clsx` + `tailwind-merge` 並能正確處理衝突和條件。絕對不要在 `className` props 中使用樣板字面值 (template literals) (`` `class-a ${someVar}` ``) 或字串串接。
- **絕對不要使用負邊距 (negative margins)** (`-mt-`, `-mb-`, `-mx-`, `-my-`, `-ml-`, `-mr-` 等)。它們會引入難以察覺的佈局錯誤，並使間距難以推敲。請改用 `gap`、`padding` 或 `space-*` 工具程式。

## 元件

- **在建立新元件之前，請先重複使用現有元件。** 在建構新元件之前，請搜尋儲存庫 (repo) 中是否已有涵蓋該使用情境的元件。為微小的差異建立近乎重複的元件會增加維護負擔並導致視覺不一致。
- **如果現有元件不完全符合需求**，請不要建立一個平行的元件。相反地，請提議以向後相容的方式擴展現有元件 (例如：新增一個選用屬性 (prop))，以確保現有的用法不受影響。在進行更改之前，請向使用者解釋其權衡。

## React 模式

### `useEffect`

`useEffect` 是一個用於與**外部系統** (瀏覽器 API、WebSockets、第三方函式庫、DOM 操作) **同步**的逃生口 (escape hatch)。請參閱 [React 文件](https://react.dev/reference/react/useEffect)。

- **不要使用 `useEffect` 從 props 或其他 state 衍生狀態。** 請改在元件主體中直接計算該值。
- **不要使用 `useEffect` 來回應使用者互動。** 請使用事件處理常式 (event handlers)。
- **當 prop 更改時，不要使用 `useEffect` 來重設元件狀態。** 相反地，請更改元件的 `key` 屬性，以便 React 掛載一個全新的實例。請參考 [reconnect-button-dialog.tsx](src/app/connections/reconnect-button-dialog_zh_TW.tsx) 中的模式：
  ```tsx
  <CreateOrEditConnectionDialog
    key={`dialog-${open}`}
    ...
  />
  ```