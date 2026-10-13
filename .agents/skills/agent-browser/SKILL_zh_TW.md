---
name: agent-browser
description: 用於 AI 代理的瀏覽器自動化 CLI。當用戶需要與網站互動時使用，包括網頁導航、填寫表單、點擊按鈕、螢幕截圖、提取數據、測試 Web 應用程式或自動化任何瀏覽器任務。觸發場景包括請求「開啟網站」、「填寫表單」、「點擊按鈕」、「截取螢幕截圖」、「從頁面抓取數據」、「測試此 Web 應用程式」、「登錄網站」、「自動化瀏覽器操作」或任何需要程序化 Web 互動的任務。
allowed-tools: Bash(npx agent-browser:*), Bash(agent-browser:*)
---

# 使用 agent-browser 進行瀏覽器自動化

## 核心工作流程

每一次瀏覽器自動化都遵循以下模式：

1. **導航**: `agent-browser open <url>`
2. **快照**: `agent-browser snapshot -i` (獲取元素引用，如 `@e1`, `@e2`)
3. **互動**: 使用引用 (refs) 進行點擊、填寫、選擇
4. **重新獲取快照**: 在導航或 DOM 更改後，獲取最新的引用

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# 輸出: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # 檢查結果
```

## 命令鏈 (Command Chaining)

命令可以在單次 Shell 調用中使用 `&&` 連結。瀏覽器會通過後台守護程序在命令之間保持運行，因此鏈接是安全的，且比分別調用更有效率。

```bash
# 在一次調用中鏈接 open + wait + snapshot
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser snapshot -i

# 鏈接多個交互
agent-browser fill @e1 "user@example.com" && agent-browser fill @e2 "password123" && agent-browser click @e3

# 導航並擷取
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser screenshot page.png
```

**何時使用鏈接：** 當你不需要在執行下一個命令前讀取中間命令的輸出時（例如：open + wait + screenshot），請使用 `&&`。當你需要先解析輸出時（例如：快照以發現 refs，然後使用這些 refs 進行交互），請分別運行命令。

## 必備命令

```bash
# 導航
agent-browser open <url>              # 導航 (別名: goto, navigate)
agent-browser close                   # 關閉瀏覽器

# 快照
agent-browser snapshot -i             # 帶有 refs 的交互元素 (推薦)
agent-browser snapshot -i -C          # 包含游標交互元素 (帶有 onclick、cursor:pointer 的 div)
agent-browser snapshot -s "#selector" # 範圍縮小到 CSS 選擇器

# 交互 (使用來自快照的 @refs)
agent-browser click @e1               # 點擊元素
agent-browser click @e1 --new-tab     # 點擊並在新標籤頁中打開
agent-browser fill @e2 "text"         # 清除並輸入文字
agent-browser type @e2 "text"         # 輸入但不清除
agent-browser select @e1 "option"     # 選擇下拉選單選項
agent-browser check @e1               # 勾選複選框
agent-browser press Enter             # 按下按鍵
agent-browser keyboard type "text"    # 在目前焦點處輸入 (不需要選擇器)
agent-browser keyboard inserttext "text"  # 直接插入文字，不觸發按鍵事件
agent-browser scroll down 500         # 捲動頁面
agent-browser scroll down 500 --selector "div.content"  # 在特定容器內捲動

# 獲取資訊
agent-browser get text @e1            # 獲取元素文字
agent-browser get url                 # 獲取目前 URL
agent-browser get title               # 獲取頁面標題

# 等待
agent-browser wait @e1                # 等待元素
agent-browser wait --load networkidle # 等待網路空閒
agent-browser wait --url "**/page"    # 等待 URL 模式
agent-browser wait 2000               # 等待毫秒

# 下載
agent-browser download @e1 ./file.pdf          # 點擊元素以觸發下載
agent-browser wait --download ./output.zip     # 等待任何下載完成
agent-browser --download-path ./downloads open <url>  # 設置預設下載目錄

# 擷取
agent-browser screenshot              # 螢幕截圖到臨時目錄
agent-browser screenshot --full       # 全頁截圖
agent-browser screenshot --annotate   # 帶有編號元素標籤的註解截圖
agent-browser pdf output.pdf          # 保存為 PDF

# 差異 (Diff，比較頁面狀態)
agent-browser diff snapshot                          # 比較目前與上一個快照
agent-browser diff snapshot --baseline before.txt    # 比較目前與保存的檔案
agent-browser diff screenshot --baseline before.png  # 視覺化像素差異
agent-browser diff url <url1> <url2>                 # 比較兩個頁面
agent-browser diff url <url1> <url2> --wait-until networkidle  # 自定義等待策略
agent-browser diff url <url1> <url2> --selector "#main"  # 範圍縮小到元素
```

## 常見模式

### 表單提交

```bash
agent-browser open https://example.com/signup
agent-browser snapshot -i
agent-browser fill @e1 "Jane Doe"
agent-browser fill @e2 "jane@example.com"
agent-browser select @e3 "California"
agent-browser check @e4
agent-browser click @e5
agent-browser wait --load networkidle
```

### 使用 Auth Vault 進行身份驗證 (推薦)

```bash
# 保存一次憑據 (使用 AGENT_BROWSER_ENCRYPTION_KEY 加密)
# 推薦：通過 stdin 傳入密碼以避免 Shell 歷史記錄洩露
echo "pass" | agent-browser auth save github --url https://github.com/login --username user --password-stdin

# 使用保存的配置文件登錄 (LLM 永遠看不到密碼)
agent-browser auth login github

# 列出/顯示/刪除配置文件
agent-browser auth list
agent-browser auth show github
agent-browser auth delete github
```

### 使用狀態持久化進行身份驗證

```bash
# 登錄一次並保存狀態
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "$USERNAME"
agent-browser fill @e2 "$PASSWORD"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# 在未來的會話中重用
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### 會話持久化

```bash
# 在瀏覽器重啟後自動保存/恢復 cookies 和 localStorage
agent-browser --session-name myapp open https://app.example.com/login
# ... 登錄流程 ...
agent-browser close  # 狀態自動保存到 ~/.agent-browser/sessions/

# 下次，狀態會自動加載
agent-browser --session-name myapp open https://app.example.com/dashboard

# 加密靜態狀態
export AGENT_BROWSER_ENCRYPTION_KEY=$(openssl rand -hex 32)
agent-browser --session-name secure open https://app.example.com

# 管理保存的狀態
agent-browser state list
agent-browser state show myapp-default.json
agent-browser state clear myapp
agent-browser state clean --older-than 7
```

### 數據提取

```bash
agent-browser open https://example.com/products
agent-browser snapshot -i
agent-browser get text @e5           # 獲取特定元素的文字
agent-browser get text body > page.txt  # 獲取頁面所有文字

# 用於解析的 JSON 輸出
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

### 並行會話

```bash
agent-browser --session site1 open https://site-a.com
agent-browser --session site2 open https://site-b.com

agent-browser --session site1 snapshot -i
agent-browser --session site2 snapshot -i

agent-browser session list
```

### 連接到現有的 Chrome

```bash
# 自動發現已啟動且啟用了遠端偵錯的 Chrome
agent-browser --auto-connect open https://example.com
agent-browser --auto-connect snapshot

# 或者通過明確的 CDP 端口
agent-browser --cdp 9222 snapshot
```

### 配色方案 (深色模式)

```bash
# 通過標誌設置持久的深色模式 (適用於所有頁面和新標籤頁)
agent-browser --color-scheme dark open https://example.com

# 或者通過環境變量
AGENT_BROWSER_COLOR_SCHEME=dark agent-browser open https://example.com

# 或者在會話期間設置 (對後續命令持久有效)
agent-browser set media dark
```

### 視覺化瀏覽器 (偵錯用)

```bash
agent-browser --headed open https://example.com
agent-browser highlight @e1          # 高亮元素
agent-browser record start demo.webm # 錄製會話
agent-browser profiler start         # 開始 Chrome DevTools 效能剖析
agent-browser profiler stop trace.json # 停止並保存剖析結果 (路徑可選)
```

使用 `AGENT_BROWSER_HEADED=1` 通過環境變量啟用有頭 (headed) 模式。瀏覽器擴充功能在有頭和無頭模式下均可運作。

### 本地檔案 (PDF, HTML)

```bash
# 使用 file:// URL 打開本地檔案
agent-browser --allow-file-access open file:///path/to/document.pdf
agent-browser --allow-file-access open file:///path/to/page.html
agent-browser screenshot output.png
```

### iOS 模擬器 (Mobile Safari)

```bash
# 列出可用的 iOS 模擬器
agent-browser device list

# 在特定設備上啟動 Safari
agent-browser -p ios --device "iPhone 16 Pro" open https://example.com

# 與桌面端相同的工作流程 - 快照、交互、重新獲取快照
agent-browser -p ios snapshot -i
agent-browser -p ios tap @e1          # 點擊 (click 的別名)
agent-browser -p ios fill @e2 "text"
agent-browser -p ios swipe up         # 行動端特定手勢

# 螢幕截圖
agent-browser -p ios screenshot mobile.png

# 關閉會話 (關閉模擬器)
agent-browser -p ios close
```

**要求:** 安裝了 Xcode 的 macOS, Appium (`npm install -g appium && appium driver install xcuitest`)

**真實設備:** 如果預先配置好，可以與物理 iOS 設備配合使用。使用 `--device "<UDID>"`，UDID 來自 `xcrun xctrace list devices`。

## 安全性

所有安全功能都是可選開啟的。預設情況下，agent-browser 對導航、操作或輸出不加限制。

### 內容邊界 (內容標記，推薦給 AI 代理)

啟用 `--content-boundaries` 以將頁面來源的輸出封裝在標記中，幫助 LLM 區分工具輸出與不可信的頁面內容：

```bash
export AGENT_BROWSER_CONTENT_BOUNDARIES=1
agent-browser snapshot
# 輸出:
# --- AGENT_BROWSER_PAGE_CONTENT nonce=<hex> origin=https://example.com ---
# [accessibility tree]
# --- END_AGENT_BROWSER_PAGE_CONTENT nonce=<hex> ---
```

### 域名白名單

限制導航至受信任的域名。通配符如 `*.example.com` 也匹配裸域名 `example.com`。指向非允許域名的子資源請求、WebSocket 和 EventSource 連接也會被阻止。請包含目標頁面所依賴的 CDN 域名：

```bash
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"
agent-browser open https://example.com        # 成功
agent-browser open https://malicious.com       # 被阻止
```

### 操作策略

使用策略檔案來管控破壞性操作：

```bash
export AGENT_BROWSER_ACTION_POLICY=./policy.json
```

`policy.json` 示例：
```json
{"default": "deny", "allow": ["navigate", "snapshot", "click", "scroll", "wait", "get"]}
```

Auth vault 操作 (`auth login` 等) 繞過操作策略，但域名白名單仍然適用。

### 輸出限制

防止來自大型頁面的內容淹沒上下文：

```bash
export AGENT_BROWSER_MAX_OUTPUT=50000
```

## 差異比對 (驗證變更)

在執行操作後使用 `diff snapshot` 以驗證其是否產生了預期的效果。這會將目前的無障礙樹與會話中上一次擷取的快照進行比較。

```bash
# 典型工作流程: 快照 -> 操作 -> 差異
agent-browser snapshot -i          # 獲取基準快照
agent-browser click @e2            # 執行操作
agent-browser diff snapshot        # 查看變更 (自動與上一個快照比較)
```

用於視覺回歸測試或監控：

```bash
# 保存基準截圖，稍後進行比較
agent-browser screenshot baseline.png
# ... 經過一段時間或進行了更改 ...
agent-browser diff screenshot --baseline baseline.png

# 比較測試環境與生產環境
agent-browser diff url https://staging.example.com https://prod.example.com --screenshot
```

`diff snapshot` 的輸出使用 `+` 表示新增，`-` 表示移除，類似於 git diff。`diff screenshot` 會產出一張標紅顯示已更改像素的差異圖像，以及不匹配百分比。

## 超時與加載緩慢的頁面

對於本地瀏覽器，預設的 Playwright 超時時間為 25 秒。這可以通過 `AGENT_BROWSER_DEFAULT_TIMEOUT` 環境變量 (值以毫秒為單位) 來覆蓋。對於加載緩慢的網站或大型頁面，請使用明確的等待，而不是依賴預設超時：

```bash
# 等待網路活動穩定 (最適合加載緩慢的頁面)
agent-browser wait --load networkidle

# 等待特定元素出現
agent-browser wait "#content"
agent-browser wait @e1

# 等待特定的 URL 模式 (在重定向後很有用)
agent-browser wait --url "**/dashboard"

# 等待 JavaScript 條件
agent-browser wait --fn "document.readyState === 'complete'"

# 作為最後手段，等待固定的時間 (毫秒)
agent-browser wait 5000
```

處理持續加載緩慢的網站時，在 `open` 之後使用 `wait --load networkidle` 以確保頁面在獲取快照前已完全加載。如果特定元素的渲染很慢，請使用 `wait <selector>` 或 `wait @ref` 直接等待它。

## 會話管理與清理

當並行運行多個代理或自動化任務時，務必使用命名會話以避免衝突：

```bash
# 每個代理都有自己的隔離會話
agent-browser --session agent1 open site-a.com
agent-browser --session agent2 open site-b.com

# 檢查活躍會話
agent-browser session list
```

完成後務必關閉瀏覽器會話，以避免洩漏進程：

```bash
agent-browser close                    # 關閉預設會話
agent-browser --session agent1 close   # 關閉特定會話
```

如果之前的會話未正確關閉，守護程序可能仍在運行。在開始新工作前，使用 `agent-browser close` 進行清理。

## Ref 生命周期 (重要)

當頁面發生變化時，Refs (`@e1`, `@e2` 等) 會失效。在以下情況後務必重新獲取快照：

- 點擊觸發導航的連結或按鈕
- 表單提交
- 動態內容加載 (下拉選單、模態框)

```bash
agent-browser click @e5              # 導航到新頁面
agent-browser snapshot -i            # 必須重新獲取快照
agent-browser click @e1              # 使用新 refs
```

## 註解截圖 (視覺模式)

使用 `--annotate` 截取帶有編號標籤覆蓋在交互元素上的螢幕截圖。每個標籤 `[N]` 對應於 ref `@eN`。這也會緩存 refs，因此你可以立即與元素交互而不需要單獨的快照。

```bash
agent-browser screenshot --annotate
# 輸出包含圖像路徑和圖例：
#   [1] @e1 button "Submit"
#   [2] @e2 link "Home"
#   [3] @e3 textbox "Email"
agent-browser click @e2              # 使用註解截圖中的 ref 進行點擊
```

在以下情況使用註解截圖：
- 頁面含有未標記的圖標按鈕或純視覺元素
- 你需要驗證視覺佈局或樣式
- 存在 Canvas 或圖表元素 (文本快照不可見)
- 你需要對元素位置進行空間推理

## 語義定位器 (Refs 的替代方案)

當 refs 不可用或不可靠時，請使用語義定位器：

```bash
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find role button click --name "Submit"
agent-browser find placeholder "Search" type "query"
agent-browser find testid "submit-btn" click
```

## JavaScript 評估 (eval)

在瀏覽器上下文中運行 JavaScript 請使用 `eval`。**Shell 引號轉義可能會損壞複雜的表達式** -- 請使用 `--stdin` 或 `-b` 來避免此問題。

```bash
# 簡單的表達式可以使用常規引號
agent-browser eval 'document.title'
agent-browser eval 'document.querySelectorAll("img").length'

# 複雜的 JS：配合 heredoc 使用 --stdin (推薦)
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify(
  Array.from(document.querySelectorAll("img"))
    .filter(i => !i.alt)
    .map(i => ({ src: i.src.split("/").pop(), width: i.width }))
)
EVALEOF

# 替代方案：Base64 編碼 (避開所有 Shell 轉義問題)
agent-browser eval -b "$(echo -n 'Array.from(document.querySelectorAll("a")).map(a => a.href)' | base64)"
```

**為什麼這很重要：** 當 Shell 處理你的命令時，內層雙引號、`!` 字符 (歷史擴展)、反引號以及 `$()` 都可能在 JavaScript 到達 agent-browser 之前將其損壞。`--stdin` 和 `-b` 標誌完全繞過了 Shell 的解釋。

**準則：**
- 單行，無嵌套引號 -> 使用帶有單引號的常規 `eval 'expression'` 即可
- 嵌套引號、箭頭函式、模板字面量或多行 -> 使用 `eval --stdin <<'EVALEOF'`
- 程序化/生成的腳本 -> 使用帶有 base64 的 `eval -b`

## 配置文件

在項目根目錄創建 `agent-browser.json` 以獲取持久設置：

```json
{
  "headed": true,
  "proxy": "http://localhost:8080",
  "profile": "./browser-data"
}
```

優先級 (從低到高): `~/.agent-browser/config.json` < `./agent-browser.json` < 環境變量 < CLI 標誌。所有 CLI 選項都映射到小駝峰式 (camelCase) 鍵名 (例如: `--executable-path` -> `"executablePath"`)。布林標誌接受 `true`/`false` 值 (例如: `--headed false` 會覆蓋配置)。用戶和項目配置中的擴充功能會合併，而不是替換。

## 深入文檔

| 參考 | 何時使用 |
|-----------|-------------|
| [references/commands_zh_TW.md](references/commands_zh_TW.md) | 包含所有選項的完整命令參考 |
| [references/snapshot-refs_zh_TW.md](references/snapshot-refs_zh_TW.md) | Ref 生命周期、失效規則、故障排除 |
| [references/session-management_zh_TW.md](references/session-management_zh_TW.md) | 並行會話、狀態持久化、並行爬取 |
| [references/authentication_zh_TW.md](references/authentication_zh_TW.md) | 登錄流程、OAuth、2FA 處理、狀態重用 |
| [references/video-recording_zh_TW.md](references/video-recording_zh_TW.md) | 用於偵錯和文檔的錄製工作流程 |
| [references/profiling_zh_TW.md](references/profiling_zh_TW.md) | 用於效能分析的 Chrome DevTools 效能剖析 |
| [references/proxy-support_zh_TW.md](references/proxy-support_zh_TW.md) | 代理配置、地理位置測試、輪換代理 |

## 實驗性: 原生模式 (Native Mode)

agent-browser 具有一個實驗性的原生 Rust 守護程序，它直接通過 CDP 與 Chrome 通訊，完全繞過 Node.js 和 Playwright。它是可選開啟的，且目前尚不建議用於生產環境。

```bash
# 通過標誌啟用
agent-browser --native open example.com

# 通過環境變量啟用 (避免每次都傳遞 --native)
export AGENT_BROWSER_NATIVE=1
agent-browser open example.com
```

原生守護程序支援 Chromium 和 Safari (通過 WebDriver)。目前尚不支援 Firefox 和 WebKit。所有核心命令 (navigate, snapshot, click, fill, screenshot, cookies, storage, tabs, eval 等) 在原生模式下的運作方式完全相同。在同一會話中於原生模式與預設模式之間切換之前，請使用 `agent-browser close`。

## 即用型模板

| 模板 | 描述 |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | 帶有驗證的表單填寫 |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | 登錄一次，重用狀態 |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | 帶有截圖的內容提取 |

```bash
./templates/form-automation.sh https://example.com/form
./templates/authenticated-session.sh https://app.example.com/login
./templates/capture-workflow.sh https://example.com ./output
```
