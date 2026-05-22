# Less or Free - 实施计划

## 项目概述

一个收录和展示全网高性价比/免费软件工程全流程工具的 Web 平台，按软件工程阶段分类，支持版本快照与 diff、徽章系统、社区互动（star/评论/反对）。

---

## 核心设计决策

### 用户认证
- **前台**：完全免登录，通过浏览器指纹 + IP 限频防滥用
- **后台**：单管理员，密码登录，HttpOnly Secure Cookie 鉴权，24h 有效期

### 分类体系
- SDLC 阶段分类：需求分析、设计、开发、测试、部署、运维、项目管理
- 额外"通用工具"分类
- 一个工具可属于多个分类（多标签）

### 徽章系统（4 组，圆形 SVG 图标 + 中心符号 + 颜色程度）

| 徽章组 | 中心符号 | 绿色 | 黄色 | 红色 |
|--------|----------|------|------|------|
| 付费类型 | ¥ | 完全免费 | 增值服务 | 付费 |
| 大陆友好 | 🌐 | 无需翻墙 | 单独配置 | 需要翻墙 |
| 开源类型 | </> | 开源 | 部分开源 | 闭源 |
| 维护状态 | ⚙ | 活跃维护 | 维护中 | 已停更 |

### 管理流程
- 草稿→发布流程：编辑后进入 draft 状态，确认后一键发布
- 发布时自动生成版本快照，支持任意两个版本的 diff 对比

### 已下架工具
- 工具大全中公开展示，标记"已下架"
- 分类列表中仅展示已上架工具

### 评论系统
- 扁平评论列表，不支持嵌套回复
- 反对按钮纯展示，不影响排序，后台可查看反对数量

### 技术栈
- **框架**：Next.js (App Router)
- **部署**：Cloudflare Pages
- **数据库**：Cloudflare D1 (SQLite)
- **缓存**：Cloudflare KV
- **适配器**：@cloudflare/next-on-pages
- **渲染**：SSG + ISR（前台）、CSR（后台）、Edge Runtime（API）

---

## API 统一响应格式

```typescript
type ApiResponse<T> = {
  code: number
  data?: T
  message?: string
}
```

| code | 含义 | data |
|------|------|------|
| 200 | 成功 | 响应数据 |
| 401 | 未登录 | 无 |
| 403 | 禁止访问 | 无 |
| 404 | 不存在 | 无 |
| 409 | 重复操作 | 无 |
| 429 | 限频 | 无 |
| 422 | 参数错误 | message 含具体错误 |
| 500 | 服务异常 | 无 |

---

## 数据模型

### tools（工具表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 工具名称 |
| description | TEXT | 工具介绍 |
| url | TEXT | 工具主页链接 |
| status | TEXT | draft / published / unpublished |
| badge_payment | TEXT | free / freemium / paid |
| badge_china_access | TEXT | direct / unstable / vpn_required |
| badge_open_source | TEXT | open / partial / closed |
| badge_maintenance | TEXT | active / maintained / deprecated |
| star_count | INTEGER | star 数量（反规范化） |
| oppose_count | INTEGER | 反对数量（反规范化） |
| comment_count | INTEGER | 评论数量（反规范化） |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### categories（分类表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 分类名 |
| slug | TEXT | URL 友好标识 |
| sort_order | INTEGER | 排序权重 |

### tool_categories（工具-分类关联表）
| 字段 | 类型 | 说明 |
|------|------|------|
| tool_id | TEXT | 外键→tools |
| category_id | TEXT | 外键→categories |

### snapshots（版本快照表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| version | INTEGER | 版本号（自增） |
| data | TEXT | 所有已发布工具的 JSON 快照 |
| description | TEXT | 版本描述 |
| created_at | TEXT | 创建时间 |

### comments（评论表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| tool_id | TEXT | 外键→tools |
| content | TEXT | 评论内容 |
| fingerprint | TEXT | 浏览器指纹 |
| created_at | TEXT | 创建时间 |

### interactions（交互表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| tool_id | TEXT | 外键→tools |
| fingerprint | TEXT | 浏览器指纹 |
| type | TEXT | star / oppose |
| created_at | TEXT | 创建时间 |

唯一约束：(tool_id, fingerprint, type)

### admin_sessions（管理员会话表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| token | TEXT | 会话 token |
| expires_at | TEXT | 过期时间 |

---

## 页面路由

### 前台
| 路由 | 页面 | 渲染方式 |
|------|------|----------|
| / | 首页 | SSG + ISR |
| /tools | 工具大全 | SSG + ISR |
| /category/[slug] | 分类列表 | SSG + ISR |
| /tool/[id] | 工具详情 | SSG + ISR |
| /snapshots | 版本历史 | SSG + ISR |
| /snapshots/[v1]...[v2] | 版本对比 | CSR |

### 后台
| 路由 | 页面 | 渲染方式 |
|------|------|----------|
| /admin/login | 登录 | CSR |
| /admin/dashboard | 管理面板 | CSR |
| /admin/tools | 工具管理 | CSR |
| /admin/tools/new | 新增工具 | CSR |
| /admin/tools/[id]/edit | 编辑工具 | CSR |
| /admin/publish | 发布管理 | CSR |
| /admin/snapshots | 快照管理 | CSR |

---

## API 设计

### 前台 API

**工具**
- GET /api/tools — 列表，支持 ?category=&badge=&search=&sort=&status=&page=
- GET /api/tools/[id] — 详情
- GET /api/categories — 分类列表

**交互**
- POST /api/tools/[id]/star — star/取消 star
- POST /api/tools/[id]/oppose — 反对/取消反对
- GET /api/tools/[id]/interactions?fingerprint= — 查询交互状态

**评论**
- GET /api/tools/[id]/comments?page= — 评论列表
- POST /api/tools/[id]/comments — 发表评论

**快照**
- GET /api/snapshots — 快照列表
- GET /api/snapshots/[version] — 快照详情
- GET /api/snapshots/diff?v1=&v2= — diff 结果

### 后台 API（需鉴权）

**鉴权**
- POST /api/admin/login
- POST /api/admin/logout

**工具管理**
- GET /api/admin/tools
- POST /api/admin/tools
- PUT /api/admin/tools/[id]
- PUT /api/admin/tools/[id]/status

**发布**
- GET /api/admin/publish/pending
- POST /api/admin/publish

**快照**
- GET /api/admin/snapshots
- GET /api/admin/snapshots/[version]

**统计**
- GET /api/admin/stats

### 限频策略
| 端点 | 限制 | 方式 |
|------|------|------|
| star / oppose | 每指纹每工具 1 次 | 数据库唯一约束 |
| 评论 | 每指纹每天 10 条 | KV 计数器 |
| 其他 API | 每IP每分钟 60 次 | Cloudflare Rate Limiting |

---

## 项目目录结构

```
less-or-free/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tools/page.tsx
│   │   ├── category/[slug]/page.tsx
│   │   ├── tool/[id]/page.tsx
│   │   ├── snapshots/
│   │   │   ├── page.tsx
│   │   │   └── [v1]...[v2]/page.tsx
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── publish/page.tsx
│   │   │   └── snapshots/page.tsx
│   │   └── api/
│   │       ├── tools/
│   │       ├── categories/
│   │       ├── snapshots/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── search.tsx
│   │   │   └── pagination.tsx
│   │   ├── tool-card.tsx
│   │   ├── tool-list.tsx
│   │   ├── tool-filter.tsx
│   │   ├── star-button.tsx
│   │   ├── oppose-button.tsx
│   │   ├── comment-section.tsx
│   │   ├── snapshot-diff.tsx
│   │   └── category-nav.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── fingerprint.ts
│   │   ├── diff.ts
│   │   ├── rate-limit.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── public/
├── wrangler.toml
├── next.config.ts
├── package.json
└── schema.sql
```

---

## 实施步骤

### 阶段 1：项目初始化与基础设施
1. 使用 `create-next-app` 初始化 Next.js 项目（TypeScript + Tailwind CSS）
2. 安装依赖：`@cloudflare/next-on-pages`、`wrangler`、`@cloudflare/workers-types`
3. 配置 `wrangler.toml`（D1 绑定、KV 绑定、环境变量）
4. 配置 `next.config.ts`（Cloudflare 适配）
5. 编写 `schema.sql` 建表语句
6. 初始化 D1 数据库并执行 schema
7. 初始化分类数据（seed）

### 阶段 2：核心库与 API 层
8. 实现 `lib/db.ts` — D1 数据库操作封装
9. 实现 `lib/auth.ts` — 管理员鉴权（登录、token 校验中间件）
10. 实现 `lib/fingerprint.ts` — 浏览器指纹工具
11. 实现 `lib/diff.ts` — 快照 diff 算法
12. 实现 `lib/rate-limit.ts` — KV 限频工具
13. 实现 `lib/utils.ts` — 通用工具（统一响应格式等）
14. 实现前台 API Routes（工具、分类、交互、评论、快照）
15. 实现后台 API Routes（鉴权、工具管理、发布、快照、统计）

### 阶段 3：UI 组件开发
16. 使用 **frontend-design skill** 生成交互和视觉设计文档
17. 实现基础 UI 组件（badge、button、card、input、search、pagination）
18. 实现徽章 SVG 组件（圆形底 + 中心符号 + 颜色程度 + tooltip）
19. 实现 tool-card 组件
20. 实现 tool-list + tool-filter 组件（筛选、排序、搜索）
21. 实现 star-button 和 oppose-button 组件
22. 实现 comment-section 组件
23. 实现 snapshot-diff 组件
24. 实现 category-nav 组件

### 阶段 4：前台页面开发
25. 实现全局 layout（导航栏、页脚）
26. 实现首页
27. 实现工具大全页
28. 实现分类列表页
29. 实现工具详情页
30. 实现版本历史页
31. 实现版本对比页

### 阶段 5：后台页面开发
32. 实现管理员登录页
33. 实现后台 layout（鉴权守卫、侧边栏导航）
34. 实现管理面板（dashboard）
35. 实现工具管理列表页
36. 实现新增/编辑工具页
37. 实现发布管理页
38. 实现快照管理页

### 阶段 6：集成测试与部署
39. 端到端流程测试（新增工具→编辑→发布→前台展示→互动）
40. 快照与 diff 功能测试
41. 限频与异常处理测试
42. Cloudflare Pages 部署配置
43. 部署上线
