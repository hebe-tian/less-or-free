"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
}

const BADGE_OPTIONS = [
  {
    key: "badge_payment",
    label: "付费类型",
    options: [
      { value: "free", label: "免费" },
      { value: "freemium", label: "增值服务" },
      { value: "paid", label: "付费" },
    ],
  },
  {
    key: "badge_china_access",
    label: "国内访问",
    options: [
      { value: "direct", label: "直连" },
      { value: "unstable", label: "不稳定" },
      { value: "vpn_required", label: "需VPN" },
    ],
  },
  {
    key: "badge_open_source",
    label: "开源状态",
    options: [
      { value: "open", label: "开源" },
      { value: "partial", label: "部分开源" },
      { value: "closed", label: "闭源" },
    ],
  },
  {
    key: "badge_maintenance",
    label: "维护状态",
    options: [
      { value: "active", label: "活跃" },
      { value: "maintained", label: "维护中" },
      { value: "deprecated", label: "已弃用" },
    ],
  },
]

interface FormErrors {
  name?: string
  url?: string
  description?: string
  icon_url?: string
  badges?: string
}

export default function NewToolPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    icon_url: "",
    badge_payment: "free",
    badge_china_access: "direct",
    badge_open_source: "open",
    badge_maintenance: "active",
    category_ids: [] as string[],
  })

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((res) => res.json() as Promise<{ code: number; data?: Category[] }>)
      .then((json) => {
        if (json.code === 200 && json.data) {
          setCategories(json.data)
        }
      })
  }, [])

  const validate = (): boolean => {
    const errs: FormErrors = {}

    if (!form.name.trim()) {
      errs.name = "名称不能为空"
    } else if (form.name.length > 100) {
      errs.name = "名称不能超过100个字符"
    }

    if (!form.url.trim()) {
      errs.url = "URL不能为空"
    } else {
      try {
        new URL(form.url)
      } catch {
        errs.url = "请输入有效的URL"
      }
    }

    if (!form.description.trim()) {
      errs.description = "描述不能为空"
    } else if (form.description.length > 2000) {
      errs.description = "描述不能超过2000个字符"
    }

    if (form.icon_url.trim()) {
      try {
        new URL(form.icon_url)
      } catch {
        errs.icon_url = "请输入有效的URL"
      }
    }

    if (!form.badge_payment || !form.badge_china_access || !form.badge_open_source || !form.badge_maintenance) {
      errs.badges = "所有标签字段必填"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })

      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }

      const json = await res.json() as { code: number; message?: string }

      if (json.code === 200 || json.code === 201) {
        router.push("/admin/tools")
      } else {
        if (json.message) {
          setErrors({ name: json.message })
        }
      }
    } catch {
      setErrors({ name: "网络错误，请重试" })
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/tools")}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-xl font-heading font-bold text-text-primary">新增工具</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">
              名称 <span className="text-danger">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="工具名称"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.name && <span className="text-danger text-xs font-heading">{errors.name}</span>}
              <span className="text-text-secondary text-xs font-mono ml-auto">{form.name.length}/100</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">
              URL <span className="text-danger">*</span>
            </label>
            <Input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://example.com"
              type="url"
            />
            {errors.url && <span className="text-danger text-xs font-heading mt-1 block">{errors.url}</span>}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">
              描述 <span className="text-danger">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="工具描述..."
              maxLength={2000}
              rows={4}
              className={cn(
                "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary",
                "transition-all duration-200 resize-y",
                "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
                "hover:border-text-secondary/50",
                "font-body"
              )}
            />
            <div className="flex justify-between mt-1">
              {errors.description && <span className="text-danger text-xs font-heading">{errors.description}</span>}
              <span className="text-text-secondary text-xs font-mono ml-auto">{form.description.length}/2000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-heading">
              图标 URL
            </label>
            <Input
              value={form.icon_url}
              onChange={(e) => setForm((p) => ({ ...p, icon_url: e.target.value }))}
              placeholder="https://example.com/icon.png（可选）"
              type="url"
            />
            {errors.icon_url && <span className="text-danger text-xs font-heading mt-1 block">{errors.icon_url}</span>}
          </div>

          <div className="space-y-4">
            <label className="block text-sm text-text-secondary font-heading">
              标签 <span className="text-danger">*</span>
            </label>
            {errors.badges && <span className="text-danger text-xs font-heading block">{errors.badges}</span>}
            <div className="grid grid-cols-2 gap-4">
              {BADGE_OPTIONS.map((group) => (
                <div key={group.key}>
                  <p className="text-xs text-text-secondary font-heading mb-2">{group.label}</p>
                  <div className="flex gap-1.5">
                    {group.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, [group.key]: opt.value }))}
                        className={cn(
                          "px-2.5 py-1.5 text-xs font-heading rounded border transition-all duration-200",
                          form[group.key as keyof typeof form] === opt.value
                            ? "bg-accent-primary/10 text-accent-primary border-accent-primary/30"
                            : "text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-sm text-text-secondary mb-2 font-heading">
                分类
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-heading rounded border transition-all duration-200",
                      form.category_ids.includes(cat.id)
                        ? "bg-accent-secondary/10 text-accent-secondary border-accent-secondary/30"
                        : "text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/50"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => router.push("/admin/tools")}>
              取消
            </Button>
            <Button type="submit" loading={loading}>
              创建工具
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
