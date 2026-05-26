"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { DiffResult } from "@/lib/diff"

const FIELD_LABELS: Record<string, string> = {
  name: "名称",
  badge_payment: "付费类型",
  badge_china_access: "国内访问",
  badge_open_source: "开源状态",
  badge_maintenance: "维护状态",
  status: "状态",
  category_ids: "分类",
}

const BADGE_VALUE_LABELS: Record<string, Record<string, string>> = {
  badge_payment: { free: "免费", freemium: "增值服务", paid: "付费" },
  badge_china_access: { direct: "直连", unstable: "不稳定", vpn_required: "需VPN" },
  badge_open_source: { open: "开源", partial: "部分开源", closed: "闭源" },
  badge_maintenance: { active: "活跃", maintained: "维护中", deprecated: "已弃用" },
  status: { draft: "草稿", published: "已发布", unpublished: "已下架" },
}

function formatFieldValue(field: string, value: unknown): string {
  if (Array.isArray(value)) return value.join(", ")
  const str = String(value)
  const labels = BADGE_VALUE_LABELS[field]
  return labels?.[str] ?? str
}

interface SnapshotDiffProps {
  diff: DiffResult
}

export function SnapshotDiff({ diff }: SnapshotDiffProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const hasContent = diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0

  if (!hasContent) {
    return (
      <div className="text-center py-8 text-text-secondary font-heading text-sm">
        无变更
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {diff.added.length > 0 && (
        <div>
          <h4 className="font-heading font-semibold text-badge-green text-sm mb-2 flex items-center gap-2">
            <span>🟢</span>
            <span>新增工具</span>
            <span className="text-text-secondary font-normal">({diff.added.length})</span>
          </h4>
          <div className="space-y-1">
            {diff.added.map((tool) => (
              <div
                key={tool.id}
                className="px-3 py-2 bg-badge-green/5 border border-badge-green/20 rounded text-sm text-text-primary font-body"
              >
                {tool.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {diff.removed.length > 0 && (
        <div>
          <h4 className="font-heading font-semibold text-badge-red text-sm mb-2 flex items-center gap-2">
            <span>🔴</span>
            <span>移除工具</span>
            <span className="text-text-secondary font-normal">({diff.removed.length})</span>
          </h4>
          <div className="space-y-1">
            {diff.removed.map((tool) => (
              <div
                key={tool.id}
                className="px-3 py-2 bg-badge-red/5 border border-badge-red/20 rounded text-sm text-text-primary font-body"
              >
                {tool.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {diff.changed.length > 0 && (
        <div>
          <h4 className="font-heading font-semibold text-badge-yellow text-sm mb-2 flex items-center gap-2">
            <span>🟡</span>
            <span>变更工具</span>
            <span className="text-text-secondary font-normal">({diff.changed.length})</span>
          </h4>
          <div className="space-y-1">
            {diff.changed.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 bg-badge-yellow/5 border border-badge-yellow/20 rounded text-sm font-body",
                    "hover:bg-badge-yellow/10 transition-colors duration-200",
                    "flex items-center justify-between"
                  )}
                >
                  <span className="text-text-primary">{item.name}</span>
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      "text-text-secondary transition-transform duration-200",
                      expandedIds.has(item.id) && "rotate-180"
                    )}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {expandedIds.has(item.id) && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-badge-yellow/20 pl-3">
                    {item.changes.map((change, i) => (
                      <div
                        key={i}
                        className="text-xs font-body text-text-secondary py-1"
                      >
                        <span className="text-text-primary font-heading">
                          {FIELD_LABELS[change.field] ?? change.field}
                        </span>
                        ：{formatFieldValue(change.field, change.oldValue)}
                        <span className="mx-1 text-accent-secondary">→</span>
                        {formatFieldValue(change.field, change.newValue)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
