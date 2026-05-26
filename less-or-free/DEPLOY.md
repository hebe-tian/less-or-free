# Cloudflare Workers 部署指南

本项目使用 `@opennextjs/cloudflare` 适配器将 Next.js 应用部署到 Cloudflare Workers，同时依赖 Cloudflare D1 数据库和 KV 缓存。

> 本项目不需要单独部署 Cloudflare Pages。Next.js 通过 `@opennextjs/cloudflare` 适配后，整个应用（前端页面 + API 路由）运行在 Cloudflare Workers 上，使用 Node.js Runtime（通过 `nodejs_compat` 兼容标志）。

---

## 前置条件

- Cloudflare 账号
- GitHub 账号，且项目代码已推送到 GitHub 仓库
- 本地已安装 Node.js 20.9+

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

## 第三步：配置 wrangler.toml

将第一步和第二步中获取的 ID 填入项目根目录的 `wrangler.toml`：

```toml
name = "less-or-free"
compatibility_date = "2024-12-30"
compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]

main = ".open-next/worker.js"

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "less-or-free"

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

> 注意：`wrangler.toml` 中的配置用于本地开发（`npm run preview`）和命令行部署（`npm run deploy`）。

---

## 第四步：部署到 Cloudflare Workers

### 方式一：命令行部署

```bash
# 安装依赖
npm install

# 构建并部署
npm run deploy
```

### 方式二：通过 GitHub 连接自动部署

1. 在 Cloudflare Dashboard 左侧菜单选择 **Workers & Pages**
2. 点击 **Create**，选择 **Workers** 选项卡
3. 选择 **Connect to Git**
4. 连接 GitHub 仓库，选择 `less-or-free` 所在的仓库
5. 填写构建设置：
   - **Build command**: `npm run deploy`
   - 或按照 Cloudflare 提示配置

---

## 第五步：验证部署

部署成功后，Cloudflare 会分配一个 `*.workers.dev` 域名。访问该域名验证：

1. 首页是否正常加载
2. `/admin/login` 是否可以访问登录页
3. 登录后是否能进入管理面板
4. 在管理面板新增工具、发布、查看前台是否更新

---

## 关于 @opennextjs/cloudflare

本项目使用 `@opennextjs/cloudflare` 而非 `@cloudflare/next-on-pages`，原因：

- `@cloudflare/next-on-pages` 仅支持 Next.js 13 和 14，不支持 Next.js 15 和 16
- `@opennextjs/cloudflare` 支持 Next.js 16，是 Cloudflare 官方推荐的 Next.js 16+ 部署方案
- `@opennextjs/cloudflare` 使用 Node.js Runtime（通过 `nodejs_compat`），支持更多 Node.js API
- `@cloudflare/next-on-pages` 强制使用 Edge Runtime，功能受限

---

## 自定义域名（可选）

1. 进入 Workers 项目 **Settings** > **Domains & Routes**
2. 点击 **Add** > **Custom Domain**
3. 输入你的域名（如 `less-or-free.example.com`）
4. 按照提示在域名 DNS 中添加 CNAME 记录指向你的 Workers 域名
5. 等待 SSL 证书自动签发完成

---

## 后续更新

代码推送到 GitHub 后，如果配置了自动部署，Cloudflare Workers 会自动触发重新部署。手动部署：

```bash
npm run deploy
```

---

## 常见问题

### 构建失败：依赖冲突

确保使用 `@opennextjs/cloudflare` 而非 `@cloudflare/next-on-pages`。后者不支持 Next.js 16。

### 页面访问 500 错误

通常是 D1 或 KV 绑定未生效。检查 `wrangler.toml` 中 `database_id` 和 KV `id` 是否已替换为实际值。

### API 返回 401

确认环境变量 `ADMIN_PASSWORD` 已在 `wrangler.toml` 的 `[vars]` 中配置，或通过 Cloudflare Dashboard 的 Workers Settings > Environment variables 配置。

### 本地开发

```bash
# 使用 next dev 进行前端开发（API 路由无法访问 D1/KV）
npm run dev

# 使用 Workers 运行时本地预览（完整功能）
npm run preview
```

### wrangler.toml 警告

确保 `wrangler.toml` 包含 `main = ".open-next/worker.js"` 和 `[assets]` 配置，这是 Workers 部署模式所必需的。
