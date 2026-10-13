# 代理支援 (Proxy Support)

用於地理位置測試、避免頻率限制以及企業環境的代理配置。

**相關**: [commands_zh_TW.md](commands_zh_TW.md) 了解全局選項，[SKILL_zh_TW.md](../SKILL_zh_TW.md) 快速入門。

## 目錄

- [基本代理配置](#基本代理配置)
- [需要身份驗證的代理](#需要身份驗證的代理)
- [SOCKS 代理](#socks-代理)
- [代理繞過](#代理繞過)
- [常見用例](#常見用例)
- [驗證代理連接](#驗證代理連接)
- [故障排除](#故障排除)
- [最佳實踐](#最佳實踐)

## 基本代理配置

使用 `--proxy` 標誌或通過環境變量設置代理：

```bash
# 通過 CLI 標誌
agent-browser --proxy "http://proxy.example.com:8080" open https://example.com

# 通過環境變量
export HTTP_PROXY="http://proxy.example.com:8080"
agent-browser open https://example.com

# HTTPS 代理
export HTTPS_PROXY="https://proxy.example.com:8080"
agent-browser open https://example.com

# 同時設置兩者
export HTTP_PROXY="http://proxy.example.com:8080"
export HTTPS_PROXY="http://proxy.example.com:8080"
agent-browser open https://example.com
```

## 需要身份驗證的代理

對於需要身份驗證的代理：

```bash
# 在 URL 中包含憑據
export HTTP_PROXY="http://username:password@proxy.example.com:8080"
agent-browser open https://example.com
```

## SOCKS 代理

```bash
# SOCKS5 代理
export ALL_PROXY="socks5://proxy.example.com:1080"
agent-browser open https://example.com

# 帶身份驗證的 SOCKS5
export ALL_PROXY="socks5://user:pass@proxy.example.com:1080"
agent-browser open https://example.com
```

## 代理繞過

使用 `--proxy-bypass` 或 `NO_PROXY` 對特定域名跳過代理：

```bash
# 通過 CLI 標誌
agent-browser --proxy "http://proxy.example.com:8080" --proxy-bypass "localhost,*.internal.com" open https://example.com

# 通過環境變量
export NO_PROXY="localhost,127.0.0.1,.internal.company.com"
agent-browser open https://internal.company.com  # 直接連接
agent-browser open https://external.com          # 通過代理
```

## 常見用例

### 地理位置測試

```bash
#!/bin/bash
# 使用不同地區的代理測試網站

PROXIES=(
    "http://us-proxy.example.com:8080"
    "http://eu-proxy.example.com:8080"
    "http://asia-proxy.example.com:8080"
)

for proxy in "${PROXIES[@]}"; do
    export HTTP_PROXY="$proxy"
    export HTTPS_PROXY="$proxy"

    region=$(echo "$proxy" | grep -oP '^\w+-\w+')
    echo "正在測試地區: $region"

    agent-browser --session "$region" open https://example.com
    agent-browser --session "$region" screenshot "./screenshots/$region.png"
    agent-browser --session "$region" close
done
```

### 用於爬蟲的輪換代理

```bash
#!/bin/bash
# 輪換使用代理列表以避免頻率限制

PROXY_LIST=(
    "http://proxy1.example.com:8080"
    "http://proxy2.example.com:8080"
    "http://proxy3.example.com:8080"
)

URLS=(
    "https://site.com/page1"
    "https://site.com/page2"
    "https://site.com/page3"
)

for i in "${!URLS[@]}"; do
    proxy_index=$((i % ${#PROXY_LIST[@]}))
    export HTTP_PROXY="${PROXY_LIST[$proxy_index]}"
    export HTTPS_PROXY="${PROXY_LIST[$proxy_index]}"

    agent-browser open "${URLS[$i]}"
    agent-browser get text body > "output-$i.txt"
    agent-browser close

    sleep 1  # 禮貌延遲
done
```

### 企業網路存取

```bash
#!/bin/bash
# 通過企業代理訪問內部網站

export HTTP_PROXY="http://corpproxy.company.com:8080"
export HTTPS_PROXY="http://corpproxy.company.com:8080"
export NO_PROXY="localhost,127.0.0.1,.company.com"

# 外部網站通過代理訪問
agent-browser open https://external-vendor.com

# 內部網站繞過代理
agent-browser open https://intranet.company.com
```

## 驗證代理連接

```bash
# 檢查你的對外 IP
agent-browser open https://httpbin.org/ip
agent-browser get text body
# 應該顯示代理的 IP，而不是你的真實 IP
```

## 故障排除

### 代理連接失敗

```bash
# 先測試代理連通性
curl -x http://proxy.example.com:8080 https://httpbin.org/ip

# 檢查代理是否需要身份驗證
export HTTP_PROXY="http://user:pass@proxy.example.com:8080"
```

### 通過代理時發生 SSL/TLS 錯誤

某些代理會執行 SSL 檢測。如果你遇到證書錯誤：

```bash
# 僅用於測試 - 不建議在生產環境使用
agent-browser open https://example.com --ignore-https-errors
```

### 性能緩慢

```bash
# 僅在必要時使用代理
export NO_PROXY="*.cdn.com,*.static.com"  # 直接訪問 CDN
```

## 最佳實踐

1. **使用環境變量** - 不要硬編碼代理憑據
2. **適當設置 NO_PROXY** - 避免將本地流量路由通過代理
3. **在自動化之前測試代理** - 通過簡單的請求驗證連通性
4. **優雅地處理代理失敗** - 為不穩定的代理實現重試邏輯
5. **在大規模爬蟲任務中輪換代理** - 分散負載並避免被封禁
