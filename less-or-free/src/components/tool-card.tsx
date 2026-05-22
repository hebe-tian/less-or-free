"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge, type BadgeLevel } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Tool {
  id: string
  name: string
  description: string
  url: string
  icon_url: string | null
  status: string
  badge_payment: string
  badge_china_access: string
  badge_open_source: string
  badge_maintenance: string
  star_count: number
  oppose_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

const BADGE_LEVEL_MAP: Record<string, Record<string, BadgeLevel>> = {
  payment: { free: "good", freemium: "medium", paid: "bad" },
  china_access: { direct: "good", unstable: "medium", vpn_required: "bad" },
  open_source: { open: "good", partial: "medium", closed: "bad" },
  maintenance: { active: "good", maintained: "medium", deprecated: "bad" },
}

interface ToolCardProps {
  tool: Tool
  starred?: boolean
}

export function ToolCard({ tool, starred }: ToolCardProps) {
  const isUnpublished = tool.status === "unpublished"

  return (
    <Link href={`/tool/${tool.id}`} className="block group">
      <Card className="relative overflow-hidden h-full">
        {isUnpublished && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-danger/20 text-danger text-xs font-heading font-medium rounded border border-danger/30">
            已下架
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center overflow-hidden">
            {tool.icon_url ? (
              <Image
                src={tool.icon_url}
                alt={tool.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <span className="text-accent-primary font-heading font-bold text-lg">
                {tool.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors duration-200">
              {tool.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Badge type="payment" level={BADGE_LEVEL_MAP.payment[tool.badge_payment] ?? "good"} />
          <Badge type="china_access" level={BADGE_LEVEL_MAP.china_access[tool.badge_china_access] ?? "good"} />
          <Badge type="open_source" level={BADGE_LEVEL_MAP.open_source[tool.badge_open_source] ?? "good"} />
          <Badge type="maintenance" level={BADGE_LEVEL_MAP.maintenance[tool.badge_maintenance] ?? "good"} />
        </div>

        <div className="flex items-center gap-3 text-text-secondary text-xs font-heading">
          <span className="inline-flex items-center gap-1">
            <svg width={12} height={12} viewBox="0 0 24 24" fill={starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={starred ? "text-warning" : ""}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {tool.star_count}
          </span>
        </div>

        <div className="absolute inset-0 rounded-lg pointer-events-none border border-accent-primary/0 group-hover:border-accent-primary/20 transition-colors duration-300" />
      </Card>
    </Link>
  )
}

export type { Tool }
