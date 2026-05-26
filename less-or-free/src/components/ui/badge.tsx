"use client"

import { useState } from "react"

type BadgeType = "payment" | "china_access" | "open_source" | "maintenance"
type BadgeLevel = "good" | "medium" | "bad"

const SYMBOLS: Record<BadgeType, string> = {
  payment: "¥",
  china_access: "🌐",
  open_source: "</>",
  maintenance: "⚙",
}

const COLORS: Record<BadgeLevel, string> = {
  good: "#22c55e",
  medium: "#eab308",
  bad: "#ef4444",
}

const LABELS: Record<BadgeType, Record<BadgeLevel, string>> = {
  payment: { good: "免费", medium: "增值服务", bad: "付费" },
  china_access: { good: "直连", medium: "不稳定", bad: "需VPN" },
  open_source: { good: "开源", medium: "部分开源", bad: "闭源" },
  maintenance: { good: "活跃", medium: "维护中", bad: "已弃用" },
}

interface BadgeProps {
  type: BadgeType
  level: BadgeLevel
}

export function Badge({ type, level }: BadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const color = COLORS[level]
  const symbol = SYMBOLS[type]
  const label = LABELS[type][level]

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={32}
        height={32}
        viewBox="0 0 32 32"
        className="cursor-pointer select-none"
        onClick={() => setShowTooltip((v) => !v)}
        aria-label={label}
        role="img"
      >
        <circle cx={16} cy={16} r={14} fill="none" stroke={color} strokeWidth={1.5} />
        <circle cx={16} cy={16} r={14} fill={color} opacity={0.12} />
        <text
          x={16}
          y={16}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={type === "open_source" ? 7 : 11}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={600}
        >
          {symbol}
        </text>
      </svg>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-elevated text-xs text-text-primary rounded border border-border whitespace-nowrap z-50 shadow-lg shadow-black/50 font-heading">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </div>
      )}
    </div>
  )
}

export type { BadgeType, BadgeLevel }
