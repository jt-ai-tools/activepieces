# 影片錄製 (Video Recording)

擷取瀏覽器自動化過程並保存為影片，用於偵錯、撰寫文檔或驗證。

**相關**: [commands_zh_TW.md](commands_zh_TW.md) 了解完整命令參考，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [基本錄製](#基本錄製)
- [錄製命令](#錄製命令)
- [用例](#用例)
- [最佳實踐](#最佳實踐)
- [輸出格式](#輸出格式)
- [限制](#限制)

## 基本錄製

```bash
# 開始錄製
agent-browser record start ./demo.webm

# 執行操作
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "測試輸入"

# 停止並保存
agent-browser record stop
```

## 錄製命令

```bash
# 開始錄製到檔案
agent-browser record start ./output.webm

# 停止目前錄製
agent-browser record stop

# 重新開始並保存到新檔案（停止目前錄製 + 開始新錄製）
agent-browser record restart ./take2.webm
```

## 用例

### 偵錯失敗的自動化

```bash
#!/bin/bash
# 錄製自動化過程以便偵錯

agent-browser record start ./debug-$(date +%Y%m%d-%H%M%S).webm

# 執行自動化
agent-browser open https://app.example.com
agent-browser snapshot -i
agent-browser click @e1 || {
    echo "點擊失敗 - 請檢查錄製影片"
    agent-browser record stop
    exit 1
}

agent-browser record stop
```

### 生成文檔

```bash
#!/bin/bash
# 錄製工作流程以生成文檔

agent-browser record start ./docs/how-to-login.webm

agent-browser open https://app.example.com/login
agent-browser wait 1000  # 暫停以便觀察

agent-browser snapshot -i
agent-browser fill @e1 "demo@example.com"
agent-browser wait 500

agent-browser fill @e2 "password"
agent-browser wait 500

agent-browser click @e3
agent-browser wait --load networkidle
agent-browser wait 1000  # 顯示結果

agent-browser record stop
```

### CI/CD 測試證據

```bash
#!/bin/bash
# 錄製 CI 構件的 E2E 測試運行

TEST_NAME="${1:-e2e-test}"
RECORDING_DIR="./test-recordings"
mkdir -p "$RECORDING_DIR"

agent-browser record start "$RECORDING_DIR/$TEST_NAME-$(date +%s).webm"

# 執行測試
if run_e2e_test; then
    echo "測試通過"
else
    echo "測試失敗 - 已保存錄製影片"
fi

agent-browser record stop
```

## 最佳實踐

### 1. 為了清晰起見添加暫停

```bash
# 減慢速度以便人工查看
agent-browser click @e1
agent-browser wait 500  # 讓查看者看到結果
```

### 2. 使用具描述性的檔案名稱

```bash
# 在檔案名稱中包含上下文
agent-browser record start ./recordings/login-flow-2024-01-15.webm
agent-browser record start ./recordings/checkout-test-run-42.webm
```

### 3. 處理錯誤情況下的錄製

```bash
#!/bin/bash
set -e

cleanup() {
    agent-browser record stop 2>/dev/null || true
    agent-browser close 2>/dev/null || true
}
trap cleanup EXIT

agent-browser record start ./automation.webm
# ... 自動化步驟 ...
```

### 4. 結合螢幕截圖

```bash
# 錄製影片並捕捉關鍵幀
agent-browser record start ./flow.webm

agent-browser open https://example.com
agent-browser screenshot ./screenshots/step1-homepage.png

agent-browser click @e1
agent-browser screenshot ./screenshots/step2-after-click.png

agent-browser record stop
```

## 輸出格式

- 預設格式: WebM (VP8/VP9 編碼)
- 相容於所有現代瀏覽器和影片播放器
- 壓縮率高且品質優良

## 限制

- 錄影會對自動化過程產生輕微的額外開銷
- 大型錄影檔案可能會佔用大量磁碟空間
- 某些無頭 (headless) 環境可能存在編碼器限制
