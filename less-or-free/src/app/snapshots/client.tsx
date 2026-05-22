"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Snapshot {
  id: string
  version: number
  description: string | null
  created_at: string
}

interface SnapshotsPageClientProps {
  snapshots: Snapshot[]
}

export function SnapshotsPageClient({ snapshots }: SnapshotsPageClientProps) {
  const router = useRouter()
  const [v1, setV1] = useState<string>("")
  const [v2, setV2] = useState<string>("")

  const handleDiff = () => {
    if (v1 && v2) {
      router.push(`/snapshots/${v1}...${v2}`)
    }
  }

  if (snapshots.length < 2) return null

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="font-heading font-semibold text-text-primary text-sm mb-3 uppercase tracking-wider">
        版本对比
      </h3>
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-heading text-text-secondary uppercase tracking-wider">
            旧版本
          </label>
          <select
            value={v1}
            onChange={(e) => setV1(e.target.value)}
            className={cn(
              "bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-sm text-text-primary",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
              "hover:border-text-secondary/50 transition-all duration-200 font-body appearance-none cursor-pointer",
              "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat pr-7"
            )}
          >
            <option value="">选择版本</option>
            {snapshots.map((s) => (
              <option key={s.id} value={String(s.version)}>
                v{s.version}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center pb-1.5">
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-secondary"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-heading text-text-secondary uppercase tracking-wider">
            新版本
          </label>
          <select
            value={v2}
            onChange={(e) => setV2(e.target.value)}
            className={cn(
              "bg-surface-elevated border border-border rounded-md px-3 py-1.5 text-sm text-text-primary",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
              "hover:border-text-secondary/50 transition-all duration-200 font-body appearance-none cursor-pointer",
              "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat pr-7"
            )}
          >
            <option value="">选择版本</option>
            {snapshots.map((s) => (
              <option key={s.id} value={String(s.version)}>
                v{s.version}
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          onClick={handleDiff}
          disabled={!v1 || !v2}
        >
          对比
        </Button>
      </div>
    </div>
  )
}
