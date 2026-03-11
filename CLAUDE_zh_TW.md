# Activepieces — 編碼規則

## 檔案結構

- **匯出的類型 (types) 與常數 (constants) 必須放在檔案的末尾**，位於所有邏輯（函數、hooks、組件、類等）之後。這在閱讀檔案時能讓邏輯保持在核心位置，並將公共合約分組在可預測的位置。

  ```ts
  // ✅ 正確
  function doSomething() { ... }

  export const MY_CONST = 'value';
  export type MyType = { ... };
  // ✅ 正確
  const businessService = () => { ... }

  export const MY_CONST = 'value';
  export type MyType = { ... };
  
  // ❌ 錯誤 — 類型/常數混合在邏輯之前
  export const MY_CONST = 'value';
  export type MyType = { ... };
  function doSomething() { ... }
  ```
