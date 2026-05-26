# Cloudflare 部署指南

本项目使用 Cloudflare Pages 部署完整应用（前端页面 + API 路由均运行在 Pages 的 Edge Functions 上），同时依赖 Cloudflare D1 数据库和 KV 缓存。

> 本项目不需要单独部署 Cloudflare Workers。Next.js 通过 `@cloudflare/next-on-pages` 适配后，API 路由自动作为 Pages 的 Edge Functions 运行，等效于 Workers。

---

## 前置条件

- Cloudflare 账号
- GitHub 账号，且项目代码已推送到 GitHub 仓库
- 本地已安装 Node.js 18+

---

## 第一步：创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **Workers & Pages** > **D1 SQL Database**
3. 点击 **Create**
4. 输入数据库名称：`less-or-free-db`
5. 点击 **Create**，创建完成后记录下 **Database ID**（后续绑定需要）

### 初始化数据库表

在本地终端执行（需先安装 wrangler：`npm install -g wrangler`）：

```bash
# 登录 Cloudflare
wrangler login

# 执行建表语句
wrangler d1 execute less-or-free-db --remote --file=schema.sql

# 插入分类种子数据
wrangler d1 execute less-or-free-db --remote --file=seed.sql
```

如果无法使用本地 wrangler，也可以在 Cloudflare Dashboard 的 D1 控制台中，点击 **Console** 选项卡，手动粘贴 `schema.sql` 和 `seed.sql` 中的 SQL 语句执行。

---

## 第二步：创建 KV 命名空间

1. 在 Cloudflare Dashboard 左侧菜单选择 **Workers & Pages** > **KV**
2. 点击 **Create a namespace**
3. 输入名称：`less-or-free-kv`
4. 点击 **Add**
5. 创建完成后记录下 **Namespace ID**

---

## 第三步：通过 Cloudflare Pages 连接 GitHub 仓库部署

### 3.1 创建 Pages 项目

1. 在 Cloudflare Dashboard 左侧菜单选择 **Workers & Pages**
2. 点击 **Create**，选择 **Pages** 选项卡
3. 选择 **Connect to Git**

### 3.2 连接 GitHub 仓库

1. 如果首次使用，点击 **Connect GitHub**，授权 Cloudflare 访问你的 GitHub 账号
2. 在仓库列表中找到并选择 `less-or-free` 所在的仓库
3. 点击 **Begin setup**

### 3.3 填写构建设置

在构建配置页面，按以下内容填写：

| 字段 | 填写内容 |
|------|----------|
| **Project name** | `less-or-free` |
| **Framework preset** | `Next.js (Static HTML Export)` 或选择 `Next.js` |
| **Build command** | `npx @cloudflare/next-on-pages` |
| **Build output directory** | `.vercel/output/static` |

如果项目不在仓库根目录（例如在 `less-or-free/` 子目录下）：

| 字段 | 填写内容 |
|------|----------|
| **Root directory (advanced) - Path** | `less-or-free` |

### 3.4 配置环境变量

在 **Environment variables (advanced)** 区域，添加以下变量：

| Variable name | Variable value | 说明 |
|---------------|----------------|------|
| `ADMIN_PASSWORD` | 你的管理员密码 | 用于后台登录，请设置强密码 |

### 3.5 开始部署

点击 **Save and Deploy**，Cloudflare 会自动拉取代码、执行构建、部署。

首次部署会失败，因为还没有绑定 D1 和 KV。这是正常的，继续下一步。

---

## 第四步：绑定 D1 和 KV

### 4.1 绑定 D1 数据库

1. 进入 Pages 项目 `less-or-free` 的详情页
2. 点击 **Settings** 选项卡
3. 左侧选择 **Bindings**
4. 点击 **Add**
5. 选择 **D1 Database**
6. 填写：
   - **Variable name**: `DB`
   - **D1 Database**: 选择 `less-or-free-db`
7. 点击 **Save**

### 4.2 绑定 KV 命名空间

1. 在同一 Bindings 页面，点击 **Add**
2. 选择 **KV Namespace**
3. 填写：
   - **Variable name**: `KV`
   - **KV Namespace**: 选择 `less-or-free-kv`
4. 点击 **Save**

### 4.3 重新部署

绑定完成后，需要触发一次重新部署才能生效：

1. 进入 **Deployments** 选项卡
2. 找到最近一次部署，点击右侧 **...** 菜单
3. 选择 **Retry deployment**

---

## 第五步：更新 wrangler.toml

将第一步和第二步中获取的 ID 填入项目根目录的 `wrangler.toml`：

```toml
name = "less-or-free"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "less-or-free-db"
database_id = "你的D1数据库ID"        # 替换为第一步记录的 Database ID

[[kv_namespaces]]
binding = "KV"
id = "你的KV命名空间ID"              # 替换为第二步记录的 Namespace ID

[vars]
ADMIN_PASSWORD = "你的管理员密码"      # 建议改为环境变量，不提交到代码仓库
```

> 注意：`wrangler.toml` 中的配置主要用于本地开发（`wrangler pages dev`）。Cloudflare Pages 线上部署以 Dashboard 中的 Bindings 配置为准，两者需要保持一致。

---

## 第六步：验证部署

部署成功后，Cloudflare 会分配一个 `*.pages.dev` 域名。访问该域名验证：

1. 首页是否正常加载
2. `/admin/login` 是否可以访问登录页
3. 登录后是否能进入管理面板
4. 在管理面板新增工具、发布、查看前台是否更新

---

## 关于 Cloudflare Workers 部署（不需要）

本项目不需要单独创建 Workers 项目。原因：

- Next.js 通过 `@cloudflare/next-on-pages` 构建后，所有 API 路由（`/api/*`）自动编译为 Pages 的 Edge Functions
- Edge Functions 本质上就是 Workers，拥有相同的运行时能力
- D1 和 KV 的绑定在 Pages 项目中完成，无需额外 Workers 配置

如果你确实需要将 API 独立部署为 Workers 项目（例如前后端分离架构），则需要：

1. 自行编写 `worker.js` 入口文件，手动处理路由分发
2. 在 Cloudflare Dashboard 创建 Workers 项目
3. 填写：
   - **Project name**: `less-or-free-api`
   - **Build command**: 留空
   - **Deploy command**: `wrangler deploy`
4. 绑定 D1 和 KV（与 Pages 相同的绑定方式）

但这会增加大量额外工作，不建议采用。

---

## 自定义域名（可选）

1. 进入 Pages 项目 **Settings** > **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `less-or-free.example.com`）
4. 按照提示在域名 DNS 中添加 CNAME 记录指向你的 Pages 域名
5. 等待 SSL 证书自动签发完成

---

## 后续更新

代码推送到 GitHub 后，Cloudflare Pages 会自动触发重新部署。如果需要手动触发：

1. 进入 Cloudflare Dashboard > Workers & Pages > less-or-free
2. 点击 **Create deployment** 手动上传构建产物
3. 或在 GitHub 上对仓库做一次空提交：`git commit --allow-empty -m "trigger deploy" && git push`

---

## 常见问题

### 构建失败：`@cloudflare/next-on-pages` 版本不兼容

`@cloudflare/next-on-pages` 对 Next.js 版本有严格要求。如果构建报版本冲突，检查 `package.json` 中的 Next.js 版本是否在适配器支持范围内。必要时使用 `--legacy-peer-deps` 安装。

### 页面访问 500 错误

通常是 D1 或 KV 绑定未生效。检查 Pages Settings > Bindings 中 `DB` 和 `KV` 是否正确绑定，绑定后需要重新部署。

### API 返回 401

确认环境变量 `ADMIN_PASSWORD` 已在 Pages Settings > Environment variables 中配置。

### 本地开发

```bash
# 使用 wrangler 本地模拟 Cloudflare 环境
npx wrangler pages dev .next --compatibility-flag=nodejs_compat --d1=DB --kv=KV

# 或直接使用 next dev（API 路由无法访问 D1/KV，仅用于前端开发）
npm run dev
```
