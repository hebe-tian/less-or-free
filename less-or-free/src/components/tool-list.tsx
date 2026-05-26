"use client"

import { ToolCard, type Tool } from "@/components/tool-card"

interface ToolListProps {
  tools: Tool[]
  starredMap?: Record<string, boolean>
}

export function ToolList({ tools, starredMap }: ToolListProps) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
          <circle cx={11} cy={11} r={8} />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <p className="font-heading text-sm">没有找到匹配的工具</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          starred={starredMap?.[tool.id]}
        />
      ))}
    </div>
  )
}
