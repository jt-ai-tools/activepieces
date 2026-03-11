# 命令參考 (Command Reference)

所有 agent-browser 命令的完整參考。關於快速入門和常見模式，請參閱 SKILL_zh_TW.md。

## 導航 (Navigation)

```bash
agent-browser open <url>      # 導航到 URL (別名: goto, navigate)
                              # 支援: https://, http://, file://, about:, data://
                              # 如果未給出協議，自動添加 https://
agent-browser back            # 後退
agent-browser forward         # 前進
agent-browser reload          # 重新整理頁面
agent-browser close           # 關閉瀏覽器 (別名: quit, exit)
agent-browser connect 9222    # 通過 CDP 端口連接到瀏覽器
```

## 快照 (Snapshot，頁面分析)

```bash
agent-browser snapshot            # 完整的無障礙樹 (accessibility tree)
agent-browser snapshot -i         # 僅限交互元素 (推薦)
agent-browser snapshot -c         # 緊湊輸出
agent-browser snapshot -d 3       # 限制深度為 3
agent-browser snapshot -s "#main" # 範圍縮小到 CSS 選擇器
```

## 交互 (Interactions，使用來自快照的 @refs)

```bash
agent-browser click @e1           # 點擊
agent-browser click @e1 --new-tab # 點擊並在新標籤頁中打開
agent-browser dblclick @e1        # 雙擊
agent-browser focus @e1           # 聚焦元素
agent-browser fill @e2 "text"     # 清除並輸入
agent-browser type @e2 "text"     # 輸入但不清除
agent-browser press Enter         # 按鍵 (別名: key)
agent-browser press Control+a     # 組合鍵
agent-browser keydown Shift       # 按住按鍵
agent-browser keyup Shift         # 釋放按鍵
agent-browser hover @e1           # 懸停
agent-browser check @e1           # 勾選複選框
agent-browser uncheck @e1         # 取消勾選複選框
agent-browser select @e1 "value"  # 選擇下拉選單選項
agent-browser select @e1 "a" "b"  # 選擇多個選項
agent-browser scroll down 500     # 捲動頁面 (預設: 向下 300px)
agent-browser scrollintoview @e1  # 將元素捲動到視線內 (別名: scrollinto)
agent-browser drag @e1 @e2        # 拖放
agent-browser upload @e1 file.pdf # 上傳檔案
```

## 獲取資訊 (Get Information)

```bash
agent-browser get text @e1        # 獲取元素文字
agent-browser get html @e1        # 獲取 innerHTML
agent-browser get value @e1       # 獲取輸入值
agent-browser get attr @e1 href   # 獲取屬性
agent-browser get title           # 獲取頁面標題
agent-browser get url             # 獲取目前 URL
agent-browser get count ".item"   # 計算匹配的元素數量
agent-browser get box @e1         # 獲取邊界框 (bounding box)
agent-browser get styles @e1      # 獲取計算後的樣式 (字體、顏色、背景等)
```

## 檢查狀態 (Check State)

```bash
agent-browser is visible @e1      # 檢查是否可見
agent-browser is enabled @e1      # 檢查是否啟用
agent-browser is checked @e1      # 檢查是否已勾選
```

## 螢幕截圖與 PDF

```bash
agent-browser screenshot          # 保存到臨時目錄
agent-browser screenshot path.png # 保存到特定路徑
agent-browser screenshot --full   # 全頁截圖
agent-browser pdf output.pdf      # 保存為 PDF
```

## 影片錄製 (Video Recording)

```bash
agent-browser record start ./demo.webm    # 開始錄製
agent-browser click @e1                   # 執行操作
agent-browser record stop                 # 停止並保存影片
agent-browser record restart ./take2.webm # 停止目前錄製 + 開始新錄製
```

## 等待 (Wait)

```bash
agent-browser wait @e1                     # 等待元素
agent-browser wait 2000                    # 等待毫秒
agent-browser wait --text "Success"        # 等待文字 (或 -t)
agent-browser wait --url "**/dashboard"    # 等待 URL 模式 (或 -u)
agent-browser wait --load networkidle      # 等待網路空閒 (或 -l)
agent-browser wait --fn "window.ready"     # 等待 JS 條件 (或 -f)
```

## 滑鼠控制 (Mouse Control)

```bash
agent-browser mouse move 100 200      # 移動滑鼠
agent-browser mouse down left         # 按下滑鼠鍵
agent-browser mouse up left           # 釋放滑鼠鍵
agent-browser mouse wheel 100         # 滑鼠滾輪
```

## 語義定位器 (Semantic Locators，refs 的替代方案)

```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find text "Sign In" click --exact      # 僅精確匹配
agent-browser find label "Email" fill "user@test.com"
agent-browser find placeholder "Search" type "query"
agent-browser find alt "Logo" click
agent-browser find title "Close" click
agent-browser find testid "submit-btn" click
agent-browser find first ".item" click
agent-browser find last ".item" click
agent-browser find nth 2 "a" hover
```

## 瀏覽器設置 (Browser Settings)

```bash
agent-browser set viewport 1920 1080          # 設置視口大小
agent-browser set device "iPhone 14"          # 模擬設備
agent-browser set geo 37.7749 -122.4194       # 設置地理位置 (別名: geolocation)
agent-browser set offline on                  # 切換離線模式
agent-browser set headers '{"X-Key":"v"}'     # 額外的 HTTP 標頭
agent-browser set credentials user pass       # HTTP 基本認證 (別名: auth)
agent-browser set media dark                  # 模擬配色方案 (深色)
agent-browser set media light reduced-motion  # 淺色模式 + 減少動態
```

## Cookies 與存儲 (Cookies and Storage)

```bash
agent-browser cookies                     # 獲取所有 cookies
agent-browser cookies set name value      # 設置 cookie
agent-browser cookies clear               # 清除 cookies
agent-browser storage local               # 獲取所有 localStorage
agent-browser storage local key           # 獲取特定鍵的值
agent-browser storage local set k v       # 設置值
agent-browser storage local clear         # 清除所有
```

## 網路 (Network)

```bash
agent-browser network route <url>              # 攔截請求
agent-browser network route <url> --abort      # 阻止請求
agent-browser network route <url> --body '{}'  # 模擬響應
agent-browser network unroute [url]            # 移除路由
agent-browser network requests                 # 查看追蹤的請求
agent-browser network requests --filter api    # 過濾請求
```

## 標籤頁與窗口 (Tabs and Windows)

```bash
agent-browser tab                 # 列出標籤頁
agent-browser tab new [url]       # 新標籤頁
agent-browser tab 2               # 通過索引切換標籤頁
agent-browser tab close           # 關閉目前標籤頁
agent-browser tab close 2         # 通過索引關閉標籤頁
agent-browser window new          # 新窗口
```

## 框架 (Frames)

```bash
agent-browser frame "#iframe"     # 切換到 iframe
agent-browser frame main          # 回到主框架
```

## 對話框 (Dialogs)

```bash
agent-browser dialog accept [text]  # 接受對話框
agent-browser dialog dismiss        # 取消對話框
```

## JavaScript

```bash
agent-browser eval "document.title"          # 僅限簡單表達式
agent-browser eval -b "<base64>"             # 任何 JavaScript (base64 編碼)
agent-browser eval --stdin                   # 從 stdin 讀取腳本
```

使用 `-b`/`--base64` 或 `--stdin` 以確保穩定執行。使用帶有嵌套引號和特殊字符的 Shell 轉義容易出錯。

```bash
# 對腳本進行 Base64 編碼，然後：
agent-browser eval -b "ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW3NyYyo9Il9uZXh0Il0nKQ=="

# 或將 stdin 與 heredoc 用於多行腳本：
cat <<'EOF' | agent-browser eval --stdin
const links = document.querySelectorAll('a');
Array.from(links).map(a => a.href);
EOF
```

## 狀態管理 (State Management)

```bash
agent-browser state save auth.json    # 保存 cookies、存儲、驗證狀態
agent-browser state load auth.json    # 恢復保存的狀態
```

## 全局選項 (Global Options)

```bash
agent-browser --session <name> ...    # 隔離的瀏覽器會話
agent-browser --json ...              # 用於解析的 JSON 輸出
agent-browser --headed ...            # 顯示瀏覽器窗口 (非無頭模式)
agent-browser --full ...              # 全頁截圖 (-f)
agent-browser --cdp <port> ...        # 通過 Chrome 開發者工具協議連接
agent-browser -p <provider> ...       # 雲端瀏覽器提供商 (--provider)
agent-browser --proxy <url> ...       # 使用代理伺服器
agent-browser --proxy-bypass <hosts>  # 繞過代理的主機
agent-browser --headers <json> ...    # 限定於 URL 來源的 HTTP 標頭
agent-browser --executable-path <p>   # 自定義瀏覽器執行路徑
agent-browser --extension <path> ...  # 加載瀏覽器擴充功能 (可重複)
agent-browser --ignore-https-errors   # 忽略 SSL 證書錯誤
agent-browser --help                  # 顯示幫助 (-h)
agent-browser --version               # 顯示版本 (-V)
agent-browser <command> --help        # 顯示命令的詳細幫助
```

## 偵錯 (Debugging)

```bash
agent-browser --headed open example.com   # 顯示瀏覽器窗口
agent-browser --cdp 9222 snapshot         # 通過 CDP 端口連接
agent-browser connect 9222                # 替代方案: connect 命令
agent-browser console                     # 查看控制台消息
agent-browser console --clear             # 清除控制台
agent-browser errors                      # 查看頁面錯誤
agent-browser errors --clear              # 清除錯誤
agent-browser highlight @e1               # 高亮元素
agent-browser trace start                 # 開始錄製追蹤 (trace)
agent-browser trace stop trace.zip        # 停止並保存追蹤
agent-browser profiler start              # 開始 Chrome DevTools 效能剖析
agent-browser profiler stop trace.json    # 停止並保存剖析結果
```

## 環境變量 (Environment Variables)

```bash
AGENT_BROWSER_SESSION="mysession"            # 預設會話名稱
AGENT_BROWSER_EXECUTABLE_PATH="/path/chrome" # 自定義瀏覽器路徑
AGENT_BROWSER_EXTENSIONS="/ext1,/ext2"       # 逗號分隔的擴充功能路徑
AGENT_BROWSER_PROVIDER="browserbase"         # 雲端瀏覽器提供商
AGENT_BROWSER_STREAM_PORT="9223"             # WebSocket 流傳輸端口
AGENT_BROWSER_HOME="/path/to/agent-browser"  # 自定義安裝位置
```
