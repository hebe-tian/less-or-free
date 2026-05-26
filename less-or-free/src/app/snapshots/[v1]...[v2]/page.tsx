"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SnapshotDiff } from "@/components/snapshot-diff"
import type { DiffResult } from "@/lib/diff"

export default function SnapshotDiffPage() {
  const params = useParams()
  const rawParam = params["v1...v2"] as string

  const parts = rawParam?.split("...") ?? []
  const v1 = parts[0] ?? ""
  const v2 = parts[1] ?? ""

  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!v1 || !v2) {
      setError("缺少版本参数")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/snapshots/diff?v1=${encodeURIComponent(v1)}&v2=${encodeURIComponent(v2)}`)
      .then((res) => {
        if (!res.ok) throw new Error("获取差异数据失败")
        return res.json()
      })
      .then((json: unknown) => {
        const data = (json as { data?: DiffResult })?.data ?? null
        setDiff(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message ?? "获取差异数据失败")
        setLoading(false)
      })
  }, [v1, v2])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/snapshots"
            className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-text-primary">
            版本对比
          </h1>
        </div>
        <p className="text-text-secondary text-sm font-body ml-8">
          v{v1} → v{v2}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-text-secondary">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx={12}
                  cy={12}
                  r={10}
                  stroke="currentColor"
                  strokeWidth={4}
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="font-heading text-sm">加载中...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <svg
              width={48}
              height={48}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 text-danger opacity-60"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
            <p className="font-heading text-sm text-danger">{error}</p>
          </div>
        )}

        {diff && <SnapshotDiff diff={diff} />}
      </div>
    </div>
  )
}
