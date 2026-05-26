interface CloudflareEnv {
  DB: D1Database
  KV: KVNamespace
  ADMIN_PASSWORD: string
  ASSETS: Fetcher
  WORKER_SELF_REFERENCE: Fetcher
}
