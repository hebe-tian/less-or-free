# Less or Free

收录和展示全网高性价比/免费软件工程全流程工具的 Web 平台，按软件工程阶段分类，支持版本快照与 diff、徽章系统、社区互动（star / 评论 / 反对）。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS 4
- **部署**: Cloudflare Pages
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **适配器**: @cloudflare/next-on-pages
- **渲染策略**: SSG + On-Demand Revalidation（前台）、CSR（后台）、Edge Runtime（API）

## 项目结构

```
less-or-free/
├── src/
│   ├── app/                    # 页面路由
│   │   ├── page.tsx            # 首页
│   │   ├── layout.tsx          # 全局布局
│   │   ├── not-found.tsx       # 404 页面
│   │   ├── tools/              # 工具大全
│   │   ├── category/[slug]/    # 分类列表
│   │   ├── tool/[id]/          # 工具详情
│   │   ├── snapshots/          # 版本历史与对比
│   │   ├── admin/              # 后台管理
│   │   │   ├── login/          # 登录
│   │   │   ├── dashboard/      # 管理面板
│   │   │   ├── tools/          # 工具管理（列表/新增/编辑）
│   │   │   ├── categories/     # 分类管理
│   │   │   ├── publish/        # 发布管理
│   │   │   └── snapshots/      # 快照管理
│   │   └── api/                # API 路由
│   │       ├── tools/          # 前台工具接口
│   │       ├── categories/     # 前台分类接口
│   │       ├── snapshots/      # 前台快照接口
│   │       └── admin/          # 后台管理接口
│   ├── components/
│   │   ├── ui/                 # 基础 UI 组件
│   │   │   ├── badge.tsx       # 徽章 SVG（圆形 + 符号 + 颜色程度）
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── search.tsx
│   │   ├── tool-card.tsx       # 工具卡片
│   │   ├── tool-list.tsx       # 工具列表
│   │   ├── tool-filter.tsx     # 筛选栏
│   │   ├── star-button.tsx     # Star 按钮（乐观更新）
│   │   ├── oppose-button.tsx   # 反对按钮（模态确认）
│   │   ├── comment-section.tsx # 评论区
│   │   ├── snapshot-diff.tsx   # 快照 Diff 展示
│   │   └── category-nav.tsx    # 分类导航
│   ├── lib/                    # 核心库
│   │   ├── db.ts               # D1 数据库操作
│   │   ├── auth.ts             # 管理员鉴权
│   │   ├── fingerprint.ts      # 浏览器指纹
│   │   ├── diff.ts             # 快照 Diff 算法
│   │   ├── rate-limit.ts       # KV 限频
│   │   ├── revalidate.ts       # On-Demand Revalidation
│   │   └── utils.ts            # 通用工具
│   └── styles/
│       └── globals.css         # 全局样式与设计系统
├── schema.sql                  # 数据库建表语句
├── seed.sql                    # 分类种子数据
├── wrangler.toml               # Cloudflare 配置
├── next.config.ts
└── package.json
```

## 功能概览

### 前台

| 功能 | 说明 |
|------|------|
| 分类浏览 | 按 SDLC 阶段分类展示已上架工具 |
| 工具大全 | 展示所有工具（含已下架标记），支持多维筛选、搜索、排序 |
| 徽章系统 | 4 组圆形 SVG 徽章：付费类型(¥)、大陆友好(🌐)、开源状态(</>)、维护状态(⚙)，绿/黄/红三色程度 |
| 工具详情 | 图标、名称、链接、介绍、4 组徽章、分类标签、JSON-LD 结构化数据 |
| Star | 免登录，浏览器指纹去重，乐观更新 |
| 评论 | 免登录，1-500 字符，HTML 转义防 XSS，每指纹每天 10 条限频 |
| 反对 | 免登录，模态弹窗二次确认，纯展示不影响排序 |
| 版本快照 | 历史版本列表，任意两版本 diff 对比（新增/移除/变更） |

### 后台

| 功能 | 说明 |
|------|------|
| 密码登录 | HttpOnly Secure Cookie，24h 有效期 |
| 工具管理 | 新增/编辑/删除（级联删除评论和交互），草稿状态 |
| 上下架 | 上架/下架操作，触发 On-Demand Revalidation |
| 一键发布 | 查看待发布变更，发布后自动生成版本快照 |
| 分类管理 | 新增/编辑/删除分类，slug 唯一校验 |
| 评论管理 | 查看评论，删除恶意评论，comment_count 同步更新 |
| 统计面板 | 工具总数/已上架/草稿/已下架，高反对工具列表 |

## 数据模型

7 张表：`tools`、`categories`、`tool_categories`、`snapshots`、`comments`、`interactions`、`admin_sessions`

详细字段定义见 [schema.sql](./schema.sql) 和 [PRD 文档](../docs/less-or-free/prd.md)。

## API 响应格式

```typescript
type ApiResponse<T> = {
  code: number    // 200/401/403/404/409/422/429/500
  data?: T
  message?: string
}
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到 Cloudflare Pages

### 1. 配置 wrangler.toml

将 `database_id` 和 KV `id` 替换为实际值：

```toml
[[d1_databases]]
binding = "DB"
database_name = "less-or-free-db"
database_id = "your-d1-database-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

[vars]
ADMIN_PASSWORD = "your-secure-password"
```

### 2. 初始化数据库

```bash
# 创建 D1 数据库
wrangler d1 create less-or-free-db

# 执行建表语句
wrangler d1 execute less-or-free-db --file=schema.sql

# 插入种子数据
wrangler d1 execute less-or-free-db --file=seed.sql
```

### 3. 部署

```bash
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static
```

## 设计风格

工业极简 + 赛博朋克点缀：深色主题（#0a0a0f）搭配电光绿（#00ff88）和青色（#00d4ff）强调色，JetBrains Mono 标题字体，Inter 正文字体，几何网格布局，发光边框与微交互动效。

## 相关文档

- [实施计划](../.trae/documents/less-or-free-implementation-plan.md)
- [产品需求文档 PRD](../docs/less-or-free/prd.md)
- [测试用例](../docs/less-or-free/test-cases.md)
- [需求评审报告](../docs/less-or-free/requirement-review.md)
- [用例评审报告](../docs/less-or-free/test-case-review.md)

## License

Private
