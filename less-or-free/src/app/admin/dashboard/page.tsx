"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"

interface Stats {
  totalTools: number
  publishedCount: number
  draftCount: number
  unpublishedCount: number
  highOpposeTools: Array<{
    id: string
    name: string
    oppose_count: number
    star_count: number
  }>
}

const STAT_CARDS = [
  { key: "totalTools" as const, label: "总工具数", color: "text-accent-secondary" },
  { key: "publishedCount" as const, label: "已发布", color: "text-accent-primary" },
  { key: "draftCount" as const, label: "草稿", color: "text-warning" },
  { key: "unpublishedCount" as const, label: "已下架", color: "text-danger" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return null
        }
        return res.json() as Promise<{ code: number; data?: Stats }>
      })
      .then((json) => {
        if (json?.code === 200 && json.data) {
          setStats(json.data)
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-text-primary">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.key} className="p-5">
            <p className="text-text-secondary text-xs font-heading uppercase tracking-wider mb-2">
              {card.label}
            </p>
            <p className={`text-3xl font-heading font-bold ${card.color}`}>
              {stats[card.key]}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-heading font-semibold text-text-primary">
            高反对工具
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">反对数 ≥ 5 的工具</p>
        </div>

        {stats.highOpposeTools.length === 0 ? (
          <div className="px-5 py-8 text-center text-text-secondary text-sm font-heading">
            暂无高反对工具
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">名称</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">反对数</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">收藏数</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {stats.highOpposeTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-primary font-heading">{tool.name}</td>
                    <td className="px-5 py-3 text-right text-danger font-mono">{tool.oppose_count}</td>
                    <td className="px-5 py-3 text-right text-accent-secondary font-mono">{tool.star_count}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => router.push(`/admin/tools/${tool.id}/edit`)}
                        className="text-accent-primary hover:text-accent-primary/80 text-xs font-heading transition-colors"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
