"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

interface OpposeButtonProps {
  toolId: string
  count: number
  opposed: boolean
  unpublished?: boolean
}

export function OpposeButton({ toolId, count, opposed, unpublished }: OpposeButtonProps) {
  const [isOpposed, setIsOpposed] = useState(opposed)
  const [opposeCount, setOpposeCount] = useState(count)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (unpublished) return

    if (isOpposed) {
      handleOppose(false)
      return
    }

    setShowConfirm(true)
  }

  const handleOppose = (nextOpposed: boolean) => {
    setShowConfirm(false)
    setIsOpposed(nextOpposed)
    setOpposeCount((c) => (nextOpposed ? c + 1 : c - 1))

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tools/${toolId}/oppose`, {
          method: nextOpposed ? "POST" : "DELETE",
        })
        if (!res.ok) {
          setIsOpposed(!nextOpposed)
          setOpposeCount((c) => (nextOpposed ? c - 1 : c + 1))
        }
      } catch {
        setIsOpposed(!nextOpposed)
        setOpposeCount((c) => (nextOpposed ? c - 1 : c + 1))
      }
    })
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending || unpublished}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-heading transition-all duration-200",
          "border border-border",
          unpublished
            ? "text-text-secondary/30 bg-surface/50 cursor-not-allowed border-border/50"
            : isOpposed
              ? "text-danger bg-danger/10 border-danger/30 shadow-[0_0_8px_rgba(255,68,68,0.15)] hover:border-danger/50"
              : "text-text-secondary bg-surface hover:text-text-primary hover:bg-surface-elevated hover:border-accent-primary/40",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label={isOpposed ? "取消反对" : "反对"}
        aria-pressed={isOpposed}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill={isOpposed ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-200"
        >
          <path d="M17 14V2" />
          <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
        </svg>
        <span>{opposeCount}</span>
      </button>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="确认反对">
        <p className="text-text-secondary text-sm mb-4">
          确认要反对该工具吗？反对将影响该工具的评分。
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
            取消
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleOppose(true)}>
            确认反对
          </Button>
        </div>
      </Modal>
    </>
  )
}
