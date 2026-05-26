"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/ui/search"
import { Pagination } from "@/components/ui/pagination"
import { Modal } from "@/components/ui/modal"
import { Badge, type BadgeType, type BadgeLevel } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Tool {
  id: string
  name: string
  status: string
  badge_payment: string
  badge_china_access: string
  badge_open_source: string
  badge_maintenance: string
  star_count: number
  oppose_count: number
}

const BADGE_VALUE_TO_LEVEL: Record<string, Record<string, BadgeLevel>> = {
  payment: { free: "good", freemium: "medium", paid: "bad" },
  china_access: { direct: "good", unstable: "medium", vpn_required: "bad" },
  open_source: { open: "good", partial: "medium", closed: "bad" },
  maintenance: { active: "good", maintained: "medium", deprecated: "bad" },
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

const STATUS_FILTERS = [
  { value: "all", label: "全部" },
  { value: "published", label: "已发布" },
  { value: "draft", label: "草稿" },
  { value: "unpublished", label: "已下架" },
]

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [initialLoading, setInitialLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Tool | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (search) params.set("search", search)

    fetch(`/api/admin/tools?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return null
        }
        return res.json() as Promise<{ code: number; data?: { tools: Tool[]; total: number } }>
      })
      .then((json) => {
        if (!json) return
        if (json.code === 200 && json.data) {
          setTools(json.data.tools)
          setTotal(json.data.total)
        }
        setInitialLoading(false)
      })
      .catch(() => {
        setInitialLoading(false)
      })
  }, [page, statusFilter, search, pageSize, router])

  const refreshList = () => {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (search) params.set("search", search)

    fetch(`/api/admin/tools?${params}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return null
        }
        return res.json() as Promise<{ code: number; data?: { tools: Tool[]; total: number } }>
      })
      .then((json) => {
        if (!json) return
        if (json.code === 200 && json.data) {
          setTools(json.data.tools)
          setTotal(json.data.total)
        }
      })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/tools/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }
      setDeleteTarget(null)
      refreshList()
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (tool: Tool) => {
    const newStatus = tool.status === "published" ? "unpublished" : "published"
    setTogglingId(tool.id)
    try {
      const res = await fetch(`/api/admin/tools/${tool.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }
      refreshList()
    } finally {
      setTogglingId(null)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-text-primary">工具管理</h2>
        <Button size="sm" onClick={() => router.push("/admin/tools/new")}>
          + 新增工具
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Search
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="搜索工具名称或描述..."
          className="flex-1"
        />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setStatusFilter(f.value)
                setPage(1)
              }}
              className={cn(
                "px-3 py-2 text-xs font-heading rounded-md border transition-all duration-200",
                statusFilter === f.value
                  ? "bg-accent-primary/10 text-accent-primary border-accent-primary/30"
                  : "text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {initialLoading && tools.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          </div>
        ) : tools.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-secondary text-sm font-heading">
            暂无工具
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="text-left px-4 py-3 text-text-secondary font-heading font-medium">名称</th>
                  <th className="text-center px-4 py-3 text-text-secondary font-heading font-medium">状态</th>
                  <th className="text-center px-4 py-3 text-text-secondary font-heading font-medium">标签</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-heading font-medium">收藏</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-heading font-medium">反对</th>
                  <th className="text-right px-4 py-3 text-text-secondary font-heading font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-text-primary font-heading">{tool.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 text-xs font-heading rounded border",
                          STATUS_STYLES[tool.status] || "bg-surface-elevated text-text-secondary border-border"
                        )}
                      >
                        {STATUS_LABELS[tool.status] || tool.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {(["payment", "china_access", "open_source", "maintenance"] as BadgeType[]).map(
                          (type) => {
                            const dbValue = tool[`badge_${type}` as keyof Tool] as string
                            const level = BADGE_VALUE_TO_LEVEL[type]?.[dbValue]
                            if (!level) return null
                            return <Badge key={type} type={type} level={level} />
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-accent-secondary font-mono">{tool.star_count}</td>
                    <td className="px-4 py-3 text-right text-danger font-mono">{tool.oppose_count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/tools/${tool.id}/edit`)}
                          className="text-accent-primary hover:text-accent-primary/80 text-xs font-heading transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tool)}
                          disabled={togglingId === tool.id}
                          className={cn(
                            "text-xs font-heading transition-colors",
                            tool.status === "published"
                              ? "text-warning hover:text-warning/80"
                              : "text-accent-primary hover:text-accent-primary/80"
                          )}
                        >
                          {togglingId === tool.id ? "..." : tool.status === "published" ? "下架" : "发布"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tool)}
                          className="text-danger hover:text-danger/80 text-xs font-heading transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
      >
        <p className="text-text-secondary text-sm font-heading mb-4">
          确定要删除工具「{deleteTarget?.name}」吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
            取消
          </Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  )
}
