# 效能剖析 (Profiling)

在瀏覽器自動化期間擷取 Chrome DevTools 效能剖析 (Performance Profiles)，以進行效能分析。

**相關**: [commands_zh_TW.md](commands_zh_TW.md) 了解完整命令參考，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [基本效能剖析](#基本效能剖析)
- [效能剖析命令](#效能剖析命令)
- [類別 (Categories)](#類別-categories)
- [用例](#用例)
- [輸出格式](#輸出格式)
- [查看剖析結果](#查看剖析結果)
- [限制](#限制)

## 基本效能剖析

```bash
# 開始效能剖析
agent-browser profiler start

# 執行操作
agent-browser navigate https://example.com
agent-browser click "#button"
agent-browser wait 1000

# 停止並保存
agent-browser profiler stop ./trace.json
```

## 效能剖析命令

```bash
# 使用預設類別開始剖析
agent-browser profiler start

# 使用自定義追蹤類別開始剖析
agent-browser profiler start --categories "devtools.timeline,v8.execute,blink.user_timing"

# 停止剖析並保存到檔案
agent-browser profiler stop ./trace.json
```

## 類別 (Categories)

`--categories` 標誌接受以逗號分隔的 Chrome 追蹤類別列表。預設類別包括：

- `devtools.timeline` -- 標準 DevTools 效能追蹤
- `v8.execute` -- 執行 JavaScript 所花費的時間
- `blink` -- 渲染器事件
- `blink.user_timing` -- `performance.mark()` / `performance.measure()` 調用
- `latencyInfo` -- 輸入到延遲的追蹤
- `renderer.scheduler` -- 任務調度與執行
- `toplevel` -- 廣譜基礎事件

還包括幾個 `disabled-by-default-*` 類別，用於詳細的時程表、調用棧和 V8 CPU 剖析數據。

## 用例

### 診斷頁面加載緩慢

```bash
agent-browser profiler start
agent-browser navigate https://app.example.com
agent-browser wait --load networkidle
agent-browser profiler stop ./page-load-profile.json
```

### 剖析用戶交互

```bash
agent-browser navigate https://app.example.com
agent-browser profiler start
agent-browser click "#submit"
agent-browser wait 2000
agent-browser profiler stop ./interaction-profile.json
```

### CI 效能退化檢查

```bash
#!/bin/bash
agent-browser profiler start
agent-browser navigate https://app.example.com
agent-browser wait --load networkidle
agent-browser profiler stop "./profiles/build-${BUILD_ID}.json"
```

## 輸出格式

輸出是一個 Chrome Trace Event 格式的 JSON 檔案：

```json
{
  "traceEvents": [
    { "cat": "devtools.timeline", "name": "RunTask", "ph": "X", "ts": 12345, "dur": 100, ... },
    ...
  ],
  "metadata": {
    "clock-domain": "LINUX_CLOCK_MONOTONIC"
  }
}
```

`metadata.clock-domain` 欄位根據主機平台（Linux 或 macOS）設置。在 Windows 上會被忽略。

## 查看剖析結果

在以下任何工具中加載輸出的 JSON 檔案：

- **Chrome DevTools**: Performance 面板 > Load profile (Ctrl+Shift+I > Performance)
- **Perfetto UI**: https://ui.perfetto.dev/ -- 拖放 JSON 檔案
- **Trace Viewer**: 在任何 Chromium 瀏覽器中輸入 `chrome://tracing`

## 限制

- 僅適用於基於 Chromium 的瀏覽器 (Chrome, Edge)。不支援 Firefox 或 WebKit。
- 追蹤數據在剖析活動期間會在記憶體中累積（上限為 500 萬個事件）。請在感興趣的區域結束後立即停止剖析。
- 停止時的數據收集有 30 秒的超時限制。如果瀏覽器無響應，停止命令可能會失敗。
