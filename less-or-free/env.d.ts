interface CloudflareEnv {
  DB: D1Database
  KV: KVNamespace
  ADMIN_PASSWORD: string
}

declare module "next" {
  interface NextRequest {
    cf?: {
      env: CloudflareEnv
    }
  }
}

interface Env {
  DB: D1Database
  KV: KVNamespace
  ADMIN_PASSWORD: string
}
