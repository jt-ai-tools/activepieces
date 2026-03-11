# Assembled API 測試端點

## GET 請求 (不需請求主體)
- `/users` - 列出所有使用者
- `/teams` - 列出團隊
- `/queues` - 列出隊列
- `/time-off-requests` - 列出休假請求
- `/users/{user_id}` - 取得特定使用者
- `/users/{user_id}/schedule` - 取得使用者的排班表

## POST 請求 (需要請求主體)
- `/time-off-requests` - 建立休假請求
  ```json
  {
    "user_id": "user123",
    "start_date": "2024-01-15",
    "end_date": "2024-01-16",
    "reason": "Vacation"
  }
  ```

- `/users/{user_id}/shifts` - 新增班次
  ```json
  {
    "start_time": "2024-01-15T09:00:00Z",
    "end_time": "2024-01-15T17:00:00Z",
    "shift_type": "regular"
  }
  ```

## 測試步驟
1. 從簡單的 GET 請求開始，例如 `/users` 或 `/teams`
2. 在驗證欄位中使用您的 Assembled API 金鑰
3. 檢查回應以驗證連線性
4. 嘗試使用範例資料進行 POST 請求
