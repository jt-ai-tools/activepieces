# 快照與 Refs (Snapshot and Refs)

緊湊的元素引用，可大幅減少 AI 代理的上下文 (context) 使用量。

**相關**: [commands_zh_TW.md](commands_zh_TW.md) 了解完整命令參考，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [Refs 如何運作](#refs-如何運作)
- [Snapshot 命令](#snapshot-命令)
- [使用 Refs](#使用-refs)
- [Ref 生命周期](#ref-生命周期)
- [最佳實踐](#最佳實踐)
- [Ref 標記詳情](#ref-標記詳情)
- [故障排除](#故障排除)

## Refs 如何運作

傳統方法:
```
完整 DOM/HTML → AI 解析 → CSS 選擇器 → 操作 (約需 3000-5000 tokens)
```

agent-browser 方法:
```
緊湊快照 → 分配 @refs → 直接交互 (約需 200-400 tokens)
```

## Snapshot 命令

```bash
# 基本快照 (顯示頁面結構)
agent-browser snapshot

# 交互式快照 (-i 標誌) - 推薦
agent-browser snapshot -i
```

### 快照輸出格式

```
Page: Example Site - Home
URL: https://example.com

@e1 [header]
  @e2 [nav]
    @e3 [a] "Home"
    @e4 [a] "Products"
    @e5 [a] "About"
  @e6 [button] "Sign In"

@e7 [main]
  @e8 [h1] "Welcome"
  @e9 [form]
    @e10 [input type="email"] placeholder="Email"
    @e11 [input type="password"] placeholder="Password"
    @e12 [button type="submit"] "Log In"

@e13 [footer]
  @e14 [a] "Privacy Policy"
```

## 使用 Refs

獲取 refs 後，即可直接進行交互：

```bash
# 點擊 "Sign In" 按鈕
agent-browser click @e6

# 填寫電子郵件輸入框
agent-browser fill @e10 "user@example.com"

# 填寫密碼
agent-browser fill @e11 "password123"

# 提交表單
agent-browser click @e12
```

## Ref 生命周期

**重要提示**: 當頁面發生變化時，Refs 會失效！

```bash
# 獲取初始快照
agent-browser snapshot -i
# @e1 [button] "Next"

# 點擊觸發頁面更改
agent-browser click @e1

# 必須重新獲取快照以獲得新的 refs！
agent-browser snapshot -i
# @e1 [h1] "Page 2"  ← 現在是不同的元素！
```

## 最佳實踐

### 1. 交互前務必獲取快照

```bash
# 正確
agent-browser open https://example.com
agent-browser snapshot -i          # 先獲取 refs
agent-browser click @e1            # 使用 ref

# 錯誤
agent-browser open https://example.com
agent-browser click @e1            # Ref 還不存在！
```

### 2. 導航後重新獲取快照

```bash
agent-browser click @e5            # 導航到新頁面
agent-browser snapshot -i          # 獲取新 refs
agent-browser click @e1            # 使用新 refs
```

### 3. 動態更改後重新獲取快照

```bash
agent-browser click @e1            # 打開下拉選單
agent-browser snapshot -i          # 查看下拉選單項目
agent-browser click @e7            # 選擇項目
```

### 4. 對特定區域獲取快照

對於複雜頁面，可以針對特定區域獲取快照：

```bash
# 僅針對表單獲取快照
agent-browser snapshot @e9
```

## Ref 標記詳情

```
@e1 [tag type="value"] "文字內容" placeholder="提示"
│    │   │             │               │
│    │   │             │               └─ 額外屬性
│    │   │             └─ 可見文字
│    │   └─ 顯示的關鍵屬性
│    └─ HTML 標籤名稱
└─ 唯一的 ref ID
```

### 常見模式

```
@e1 [button] "Submit"                    # 帶文字的按鈕
@e2 [input type="email"]                 # 電子郵件輸入框
@e3 [input type="password"]              # 密碼輸入框
@e4 [a href="/page"] "Link Text"         # 錨點連結
@e5 [select]                             # 下拉選單
@e6 [textarea] placeholder="Message"     # 文本區域
@e7 [div class="modal"]                  # 容器 (相關時)
@e8 [img alt="Logo"]                     # 圖片
@e9 [checkbox] checked                   # 已勾選的複選框
@e10 [radio] selected                    # 已選擇的單選按鈕
```

## 故障排除

### "Ref not found" 錯誤

```bash
# Ref 可能已更改 - 重新獲取快照
agent-browser snapshot -i
```

### 元素在快照中不可見

```bash
# 向下捲動以顯露元素
agent-browser scroll down 1000
agent-browser snapshot -i

# 或者等待動態內容
agent-browser wait 1000
agent-browser snapshot -i
```

### 元素過多

```bash
# 針對特定容器獲取快照
agent-browser snapshot @e5

# 或者使用 get text 僅提取內容
agent-browser get text @e5
```
