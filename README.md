# Fork Lab

一个面向个人学习与项目筛选的 GitHub Fork Dashboard Demo。

这个项目会把 `jackwbinny-design` 账号下的 fork 仓库整理成一个可浏览、可筛选、可做每周行动决策的前端看板，用来回答三个问题：

- 这些 fork 到底值不值得继续投入？
- 这周优先推进哪 3 组项目？
- 哪些仓库是同一条能力路线，应该放在一起看？

## 当前功能

- React + Vite 单页 Dashboard
- 仓库总览、精选项目、本周行动组
- 关系簇（cluster）视图，帮助把相关仓库放在一起判断
- 本地决策状态持久化
- README 线索与上游项目信息富化脚本
- GitHub Pages 自动部署工作流

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://127.0.0.1:5173
```

## 构建

```bash
npm run build
```

## 数据刷新

```bash
npm run update:data
npm run enrich:details
npm run enrich:readmes
npm run refine:categories
```

一键刷新并重建：

```bash
npm run update:dashboard
```

## 部署到 GitHub Pages

仓库内已包含 GitHub Actions 工作流：

- 推送到 `main` 后自动构建
- 自动发布 `dist/` 到 GitHub Pages

首次启用时，请在 GitHub 仓库设置里确认：

1. `Settings -> Pages`
2. `Build and deployment` 选择 `GitHub Actions`

## 技术栈

- React 18
- Vite 8
- Lucide React
- Node.js 脚本做 GitHub 数据整理

## 说明

这是第一版产品 demo，重点是把“收藏了很多 fork，但不知道下一步做什么”的问题做成一个真正可操作的界面。
