# 身份驗證模式

登錄流程、會話持久化、OAuth、2FA 和已驗證的瀏覽。

**相關**: [session-management_zh_TW.md](session-management_zh_TW.md) 了解狀態持久化詳情，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [基本登錄流程](#基本登錄流程)
- [保存身份驗證狀態](#保存身份驗證狀態)
- [恢復身份驗證](#恢復身份驗證)
- [OAuth / SSO 流程](#oauth--sso-流程)
- [雙重身份驗證 (2FA)](#雙重身份驗證-2fa)
- [HTTP 基本認證](#http-基本認證)
- [基於 Cookie 的認證](#基於-cookie-的認證)
- [令牌刷新處理](#令牌刷新處理)
- [安全性最佳實踐](#安全性最佳實踐)

## 基本登錄流程

```bash
# 導航到登錄頁面
agent-browser open https://app.example.com/login
agent-browser wait --load networkidle

# 獲取表單元素
agent-browser snapshot -i
# 輸出: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Sign In"

# 填寫憑據
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"

# 提交
agent-browser click @e3
agent-browser wait --load networkidle

# 驗證登錄是否成功
agent-browser get url  # 應該是儀表板，而不是登錄頁面
```

## 保存身份驗證狀態

登錄後，保存狀態以便重複使用：

```bash
# 先登錄（見上文）
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --url "**/dashboard"

# 保存已驗證的狀態
agent-browser state save ./auth-state.json
```

## 恢復身份驗證

通過加載保存的狀態跳過登錄：

```bash
# 加載保存的身份驗證狀態
agent-browser state load ./auth-state.json

# 直接導航到受保護的頁面
agent-browser open https://app.example.com/dashboard

# 驗證是否已驗證
agent-browser snapshot -i
```

## OAuth / SSO 流程

處理 OAuth 重定向：

```bash
# 開始 OAuth 流程
agent-browser open https://app.example.com/auth/google

# 自動處理重定向
agent-browser wait --url "**/accounts.google.com**"
agent-browser snapshot -i

# 填寫 Google 憑據
agent-browser fill @e1 "user@gmail.com"
agent-browser click @e2  # 下一步按鈕
agent-browser wait 2000
agent-browser snapshot -i
agent-browser fill @e3 "password"
agent-browser click @e4  # 登錄

# 等待重定向回原站
agent-browser wait --url "**/app.example.com**"
agent-browser state save ./oauth-state.json
```

## 雙重身份驗證 (2FA)

通過人工干預處理 2FA：

```bash
# 使用憑據登錄
agent-browser open https://app.example.com/login --headed  # 顯示瀏覽器
agent-browser snapshot -i
agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3

# 等待用戶在瀏覽器窗口手動完成 2FA
echo "在瀏覽器窗口中完成 2FA..."
agent-browser wait --url "**/dashboard" --timeout 120000

# 2FA 後保存狀態
agent-browser state save ./2fa-state.json
```

## HTTP 基本認證

對於使用 HTTP 基本認證的網站：

```bash
# 導航前設置憑據
agent-browser set credentials username password

# 導航到受保護的資源
agent-browser open https://protected.example.com/api
```

## 基於 Cookie 的認證

手動設置身份驗證 Cookie：

```bash
# 設置身份驗證 Cookie
agent-browser cookies set session_token "abc123xyz"

# 導航到受保護的頁面
agent-browser open https://app.example.com/dashboard
```

## 令牌刷新處理

對於具有過期令牌的會話：

```bash
#!/bin/bash
# 處理令牌刷新的封裝腳本

STATE_FILE="./auth-state.json"

# 嘗試加載現有狀態
if [[ -f "$STATE_FILE" ]]; then
    agent-browser state load "$STATE_FILE"
    agent-browser open https://app.example.com/dashboard

    # 檢查會話是否仍然有效
    URL=$(agent-browser get url)
    if [[ "$URL" == *"/login"* ]]; then
        echo "會話已過期，正在重新驗證..."
        # 執行新的登錄
        agent-browser snapshot -i
        agent-browser fill @e1 "$USERNAME"
        agent-browser fill @e2 "$PASSWORD"
        agent-browser click @e3
        agent-browser wait --url "**/dashboard"
        agent-browser state save "$STATE_FILE"
    fi
else
    # 第一次登錄
    agent-browser open https://app.example.com/login
    # ... 登錄流程 ...
fi
```

## 安全性最佳實踐

1. **切勿提交狀態文件** - 它們包含會話令牌
   ```bash
   echo "*.auth-state.json" >> .gitignore
   ```

2. **使用環境變量存儲憑據**
   ```bash
   agent-browser fill @e1 "$APP_USERNAME"
   agent-browser fill @e2 "$APP_PASSWORD"
   ```

3. **自動化完成後進行清理**
   ```bash
   agent-browser cookies clear
   rm -f ./auth-state.json
   ```

4. **在 CI/CD 中使用短期會話**
   ```bash
   # 在 CI 中不持久化狀態
   agent-browser open https://app.example.com/login
   # ... 登錄並執行操作 ...
   agent-browser close  # 會話結束，不持久化任何內容
   ```
