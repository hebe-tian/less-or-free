"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"

interface Snapshot {
  id: string
  version: number
  description: string | null
  created_at: string
}

export default function SnapshotsPage() {
  const router = useRouter()
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [viewData, setViewData] = useState<string>("")
  const [viewVersion, setViewVersion] = useState<number | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/snapshots", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return null
        }
        return res.json() as Promise<{ code: number; data?: Snapshot[] }>
      })
      .then((json) => {
        if (json?.code === 200 && json.data) {
          setSnapshots(json.data)
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleView = async (version: number) => {
    setViewVersion(version)
    setViewLoading(true)
    setViewData("")

    try {
      const res = await fetch(`/api/admin/snapshots/${version}`, { credentials: "include" })
      if (res.status === 401) {
        router.replace("/admin/login")
        return
      }
      const json = await res.json() as { code: number; data?: { data: string } }
      if (json.code === 200 && json.data?.data) {
        try {
          const parsed = JSON.parse(json.data.data)
          setViewData(JSON.stringify(parsed, null, 2))
        } catch {
          setViewData(json.data.data)
        }
      } else {
        setViewData("无法加载快照数据")
      }
    } catch {
      setViewData("网络错误")
    } finally {
      setViewLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-text-primary">快照管理</h2>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-secondary text-sm font-heading">
            暂无快照
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">版本</th>
                  <th className="text-left px-5 py-3 text-text-secondary font-heading font-medium">描述</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">创建时间</th>
                  <th className="text-right px-5 py-3 text-text-secondary font-heading font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr
                    key={snapshot.id}
                    className="border-b border-border/50 hover:bg-surface-elevated/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-accent-primary font-mono font-semibold">v{snapshot.version}</span>
                    </td>
                    <td className="px-5 py-3 text-text-secondary font-heading">
                      {snapshot.description || (
                        <span className="text-text-secondary/50 italic">无描述</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-text-secondary font-mono text-xs">
                      {new Date(snapshot.created_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleView(snapshot.version)}
                        className="text-accent-primary hover:text-accent-primary/80 text-xs font-heading transition-colors"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={viewVersion !== null}
        onClose={() => {
          setViewVersion(null)
          setViewData("")
        }}
        title={viewVersion !== null ? `快照 v${viewVersion}` : "快照"}
      >
        {viewLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          </div>
        ) : (
          <pre className="bg-background border border-border rounded-md p-4 text-xs font-mono text-text-primary overflow-auto max-h-96 whitespace-pre-wrap break-words">
            {viewData}
          </pre>
        )}
      </Modal>
    </div>
  )
}
