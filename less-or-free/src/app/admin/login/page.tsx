"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      })

      const json = await res.json() as { code: number; message?: string }

      if (json.code === 200) {
        router.push("/admin/dashboard")
      } else {
        setError(json.message || "登录失败")
      }
    } catch {
      setError("网络错误，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 shadow-[0_0_40px_rgba(0,255,136,0.08)] border-accent-primary/20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-accent-primary tracking-wider">
            Less or Free
          </h1>
          <p className="text-text-secondary text-sm mt-2 font-heading">管理后台</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">
              密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入管理密码"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-danger text-sm font-heading bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!password}
            className="w-full"
            size="lg"
          >
            登录
          </Button>
        </form>
      </Card>
    </div>
  )
}
