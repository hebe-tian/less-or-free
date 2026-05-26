"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
}

interface ToolFilterProps {
  categories: Category[]
}

const PAYMENT_OPTIONS = [
  { value: "", label: "全部" },
  { value: "free", label: "免费" },
  { value: "freemium", label: "增值服务" },
  { value: "paid", label: "付费" },
]

const CHINA_ACCESS_OPTIONS = [
  { value: "", label: "全部" },
  { value: "direct", label: "直连" },
  { value: "unstable", label: "不稳定" },
  { value: "vpn_required", label: "需VPN" },
]

const OPEN_SOURCE_OPTIONS = [
  { value: "", label: "全部" },
  { value: "open", label: "开源" },
  { value: "partial", label: "部分开源" },
  { value: "closed", label: "闭源" },
]

const MAINTENANCE_OPTIONS = [
  { value: "", label: "全部" },
  { value: "active", label: "活跃" },
  { value: "maintained", label: "维护中" },
  { value: "deprecated", label: "已弃用" },
]

const SORT_OPTIONS = [
  { value: "latest", label: "最新" },
  { value: "stars", label: "最多收藏" },
  { value: "name", label: "名称" },
]

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-heading text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
          "hover:border-text-secondary/50 transition-all duration-200 font-body appearance-none cursor-pointer",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat pr-7"
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ToolFilter({ categories }: ToolFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const categoryOptions = [
    { value: "", label: "全部分类" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ]

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-surface border border-border rounded-lg">
      <FilterSelect
        label="分类"
        value={searchParams.get("category") ?? ""}
        options={categoryOptions}
        onChange={(v) => updateParam("category", v)}
      />
      <FilterSelect
        label="付费"
        value={searchParams.get("payment") ?? ""}
        options={PAYMENT_OPTIONS}
        onChange={(v) => updateParam("payment", v)}
      />
      <FilterSelect
        label="国内访问"
        value={searchParams.get("china_access") ?? ""}
        options={CHINA_ACCESS_OPTIONS}
        onChange={(v) => updateParam("china_access", v)}
      />
      <FilterSelect
        label="开源"
        value={searchParams.get("open_source") ?? ""}
        options={OPEN_SOURCE_OPTIONS}
        onChange={(v) => updateParam("open_source", v)}
      />
      <FilterSelect
        label="维护"
        value={searchParams.get("maintenance") ?? ""}
        options={MAINTENANCE_OPTIONS}
        onChange={(v) => updateParam("maintenance", v)}
      />
      <FilterSelect
        label="排序"
        value={searchParams.get("sort") ?? "latest"}
        options={SORT_OPTIONS}
        onChange={(v) => updateParam("sort", v)}
      />
    </div>
  )
}
