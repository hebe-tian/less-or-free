"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PendingTool {
  id: string
  name: string
  status: string
  updated_at: string
  last_snapshot_version: number | null
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
  draft: "bg-warning/15 text-warning border-warning/30",
  unpublished: "bg-danger/15 text-danger border-danger/30",
}

const STATUS_LABELS: Record<string, string> = {
  published: "已发布",
  draft: "草稿",
  unpublished: "已下架",
}

export default function PublishPage() {
  const router = useRouter()
  const [pendingTools, setPendingTools] = useState<PendingTool[]>([])
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    fetch("/api/admin/publish/pending", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return null
        }
        return res.json() as Promise<{ code: number; data?: PendingTool[] }>
      })
      .then((json) => {
        if (json?.code === 200 && json.data) {
          setPendingTools(json.data)
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handlePublish = async () => {
    setPublishing(true)
    setSuccessMsg("")
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: description || undefined }),
      })

      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }

      const json = await res.json() as { code: number; data?: { version: number; toolCount: number } }
      if ((json.code === 200 || json.code === 201) && json.data) {
        setSuccessMsg(`发布成功！版本 v${json.data.version}，包含 ${json.data.toolCount} 个工具`)
        setDescription("")
        setPendingTools([])
      }
    } catch {
      setSuccessMsg("")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-text-primary">发布管理</h2>

      {successMsg && (
        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg px-4 py-3 flex items-center gap-3">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent-primary shrink-0">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
          <p className="text-accent-primary text-sm font-heading">{successMsg}</p>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-heading font-semibold text-text-primary">
            待发布变更
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            自上次快照以来有变更的工具
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          </div>
        ) : pendingTools.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-secondary text-sm font-heading">
            暂无待发布变更
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">名称</th>
                  <th className="text-center px-5 py-3 text-text-secondary font-heading font-medium">状态</th>
                  <th className="text-center px-5 py-3 text-text-secondary font-heading font-medium">变更类型</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {pendingTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-primary font-heading">{tool.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 text-xs font-heading rounded border",
                          STATUS_STYLES[tool.status] || "bg-surface-elevated text-text-secondary border-border"
                        )}
                      >
                        {STATUS_LABELS[tool.status] || tool.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-heading text-accent-secondary">
                        {tool.last_snapshot_version === null ? "新增" : "更新"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary font-mono text-xs">
                      {new Date(tool.updated_at).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pendingTools.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-heading font-semibold text-text-primary mb-3">
            发布新快照
          </h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="版本描述（可选）..."
            rows={3}
            className={cn(
              "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary",
              "transition-all duration-200 resize-y",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
              "hover:border-text-secondary/50",
              "font-body mb-4"
            )}
          />
          <div className="flex items-center justify-between">
            <p className="text-text-secondary text-xs font-heading">
              将发布 {pendingTools.length} 个工具的快照
            </p>
            <Button loading={publishing} onClick={handlePublish}>
              一键发布
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
