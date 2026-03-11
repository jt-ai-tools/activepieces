# 會話管理 (Session Management)

具有狀態持久化和並行瀏覽功能的多個隔離瀏覽器會話。

**相關**: [authentication_zh_TW.md](authentication_zh_TW.md) 了解登錄模式，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [命名會話](#命名會話)
- [會話隔離特性](#會話隔離特性)
- [會話狀態持久化](#會話狀態持久化)
- [常見模式](#常見模式)
- [預設會話](#預設會話)
- [會話清理](#會話清理)
- [最佳實踐](#最佳實踐)

## 命名會話

使用 `--session` 標誌來隔離瀏覽器上下文：

```bash
# 會話 1: 身份驗證流程
agent-browser --session auth open https://app.example.com/login

# 會話 2: 公開瀏覽 (獨立的 cookies、存儲)
agent-browser --session public open https://example.com

# 命令按會話隔離
agent-browser --session auth fill @e1 "user@example.com"
agent-browser --session public get text body
```

## 會話隔離特性

每個會話都有獨立的：
- Cookies
- LocalStorage / SessionStorage
- IndexedDB
- 快取 (Cache)
- 瀏覽歷史
- 已打開的標籤頁

## 會話狀態持久化

### 保存會話狀態

```bash
# 保存 cookies、存儲和驗證狀態
agent-browser state save /path/to/auth-state.json
```

### 加載會話狀態

```bash
# 恢復保存的狀態
agent-browser state load /path/to/auth-state.json

# 繼續使用已驗證的會話
agent-browser open https://app.example.com/dashboard
```

### 狀態文件內容

```json
{
  "cookies": [...],
  "localStorage": {...},
  "sessionStorage": {...},
  "origins": [...]
}
```

## 常見模式

### 已驗證會話的重用

```bash
#!/bin/bash
# 保存一次登錄狀態，多次重用

STATE_FILE="/tmp/auth-state.json"

# 檢查是否有保存的狀態
if [[ -f "$STATE_FILE" ]]; then
    agent-browser state load "$STATE_FILE"
    agent-browser open https://app.example.com/dashboard
else
    # 執行登錄
    agent-browser open https://app.example.com/login
    agent-browser snapshot -i
    agent-browser fill @e1 "$USERNAME"
    agent-browser fill @e2 "$PASSWORD"
    agent-browser click @e3
    agent-browser wait --load networkidle

    # 保存以便將來使用
    agent-browser state save "$STATE_FILE"
fi
```

### 並行爬取

```bash
#!/bin/bash
# 同時爬取多個網站

# 啟動所有會話
agent-browser --session site1 open https://site1.com &
agent-browser --session site2 open https://site2.com &
agent-browser --session site3 open https://site3.com &
wait

# 從每個網站提取內容
agent-browser --session site1 get text body > site1.txt
agent-browser --session site2 get text body > site2.txt
agent-browser --session site3 get text body > site3.txt

# 清理
agent-browser --session site1 close
agent-browser --session site2 close
agent-browser --session site3 close
```

### A/B 測試會話

```bash
# 測試不同的用戶體驗
agent-browser --session variant-a open "https://app.com?variant=a"
agent-browser --session variant-b open "https://app.com?variant=b"

# 比較
agent-browser --session variant-a screenshot /tmp/variant-a.png
agent-browser --session variant-b screenshot /tmp/variant-b.png
```

## 預設會話

省略 `--session` 時，命令使用預設會話：

```bash
# 這些命令使用同一個預設會話
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser close  # 關閉預設會話
```

## 會話清理

```bash
# 關閉特定會話
agent-browser --session auth close

# 列出活躍會話
agent-browser session list
```

## 最佳實踐

### 1. 為會話賦予具語義的名稱

```bash
# 推薦：目的明確
agent-browser --session github-auth open https://github.com
agent-browser --session docs-scrape open https://docs.example.com

# 避免：名稱過於通用
agent-browser --session s1 open https://github.com
```

### 2. 務必進行清理

```bash
# 完成後關閉會話
agent-browser --session auth close
agent-browser --session scrape close
```

### 3. 安全處理狀態文件

```bash
# 不要提交狀態文件 (它們包含驗證令牌！)
echo "*.auth-state.json" >> .gitignore

# 使用後刪除
rm /tmp/auth-state.json
```

### 4. 設置長時間會話的超時

```bash
# 為自動化腳本設置超時
timeout 60 agent-browser --session long-task get text body
```
