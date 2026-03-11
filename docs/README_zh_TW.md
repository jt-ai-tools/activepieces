# Mintlify 入門套件

使用此入門套件來部署您的文件並進行自定義。

點擊此存儲庫頂部的綠色 **Use this template** 按鈕以複製 Mintlify 入門套件。此入門套件包含以下示例：

- 指南頁面
- 導覽
- 自定義
- API 參考頁面
- 熱門組件的使用

**[閱讀完整的快速入門指南](https://starter.mintlify.com/quickstart)**

## 開發

安裝 [Mintlify CLI](https://www.npmjs.com/package/mint) 以在本地預覽文件更改。使用以下命令進行安裝：

```
npm i -g mint
```

在文件根目錄（即 `docs.json` 所在的目錄）執行以下命令：

```
mint dev
```

在 `http://localhost:3000` 查看本地預覽。

## 發佈更改

從您的 [儀表板](https://dashboard.mintlify.com/settings/organization/github-app) 安裝我們的 GitHub 應用程式，將更改從存儲庫同步到部署環境。推送到預設分支後，更改將自動部署到生產環境。

## 需要幫助？

### 故障排除

- 如果開發環境無法執行：執行 `mint update` 以確保您使用的是最新版本的 CLI。
- 如果頁面載入為 404：請確保您在包含有效 `docs.json` 的文件夾中執行。

### 資源
- [Mintlify 文件](https://mintlify.com/docs)