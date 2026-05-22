"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  tool_count: number
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newSortOrder, setNewSortOrder] = useState(0)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editSortOrder, setEditSortOrder] = useState(0)
  const [editError, setEditError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" })
      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }
      const json = await res.json() as { code: number; data?: Category[]; message?: string }
      if (json.code === 200) {
        setCategories(json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    if (!newName.trim() || !newSlug.trim()) {
      setCreateError("名称和Slug不能为空")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, slug: newSlug, sort_order: newSortOrder }),
      })

      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }

      const json = await res.json() as { code: number; message?: string }
      if (json.code === 201 || json.code === 200) {
        setNewName("")
        setNewSlug("")
        setNewSortOrder(0)
        fetchCategories()
      } else {
        setCreateError(json.message || "创建失败")
      }
    } catch {
      setCreateError("网络错误")
    } finally {
      setCreating(false)
    }
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditSortOrder(cat.sort_order)
    setEditError("")
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setEditError("")
    if (!editName.trim() || !editSlug.trim()) {
      setEditError("名称和Slug不能为空")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/categories/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName, slug: editSlug, sort_order: editSortOrder }),
      })

      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }

      const json = await res.json() as { code: number; message?: string }
      if (json.code === 200) {
        setEditTarget(null)
        fetchCategories()
      } else {
        setEditError(json.message || "更新失败")
      }
    } catch {
      setEditError("网络错误")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }

      setDeleteTarget(null)
      fetchCategories()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-text-primary">分类管理</h2>

      <Card className="p-5">
        <h3 className="text-sm font-heading font-semibold text-text-primary mb-3">新增分类</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="分类名称"
            />
          </div>
          <div className="flex-1">
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="Slug（如：dev-tools）"
            />
          </div>
          <div className="w-24">
            <Input
              type="number"
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(parseInt(e.target.value) || 0)}
              placeholder="排序"
            />
          </div>
          <Button type="submit" loading={creating} size="sm">
            添加
          </Button>
        </form>
        {createError && (
          <p className="text-danger text-xs font-heading mt-2">{createError}</p>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-secondary text-sm font-heading">
            暂无分类
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">名称</th>
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">Slug</th>
                  <th className="text-center px-5 py-3 text-text-secondary font-heading font-medium">排序</th>
                  <th className="text-center px-5 py-3 text-text-secondary font-heading font-medium">工具数</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-text-primary font-heading">{cat.name}</td>
                    <td className="px-5 py-3 text-text-secondary font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 text-center text-text-secondary font-mono">{cat.sort_order}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-accent-secondary/10 text-accent-secondary text-xs font-heading rounded border border-accent-secondary/20">
                        {cat.tool_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="text-accent-primary hover:text-accent-primary/80 text-xs font-heading transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
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

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="编辑分类"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">名称</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="分类名称"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">Slug</label>
            <Input
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
              placeholder="Slug"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">排序</label>
            <Input
              type="number"
              value={editSortOrder}
              onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 0)}
              placeholder="排序权重"
            />
          </div>
          {editError && (
            <p className="text-danger text-xs font-heading">{editError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>
              取消
            </Button>
            <Button size="sm" loading={saving} onClick={handleEdit}>
              保存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
      >
        <p className="text-text-secondary text-sm font-heading mb-1">
          确定要删除分类「{deleteTarget?.name}」吗？
        </p>
        {deleteTarget && deleteTarget.tool_count > 0 && (
          <p className="text-warning text-xs font-heading mb-4">
            该分类下有 {deleteTarget.tool_count} 个工具，删除后关联将解除。
          </p>
        )}
        {(!deleteTarget || deleteTarget.tool_count === 0) && <div className="mb-4" />}
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
