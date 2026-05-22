"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"

interface StarButtonProps {
  toolId: string
  count: number
  starred: boolean
}

export function StarButton({ toolId, count, starred }: StarButtonProps) {
  const [isStarred, setIsStarred] = useState(starred)
  const [starCount, setStarCount] = useState(count)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    const nextStarred = !isStarred
    setIsStarred(nextStarred)
    setStarCount((c) => (nextStarred ? c + 1 : c - 1))

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tools/${toolId}/star`, {
          method: nextStarred ? "POST" : "DELETE",
        })
        if (!res.ok) {
          setIsStarred(!nextStarred)
          setStarCount((c) => (nextStarred ? c - 1 : c + 1))
        }
      } catch {
        setIsStarred(!nextStarred)
        setStarCount((c) => (nextStarred ? c - 1 : c + 1))
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-heading transition-all duration-200",
        "border border-border hover:border-accent-primary/40",
        isStarred
          ? "text-warning bg-warning/10 border-warning/30 shadow-[0_0_8px_rgba(234,179,8,0.15)]"
          : "text-text-secondary bg-surface hover:text-text-primary hover:bg-surface-elevated",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      aria-label={isStarred ? "取消收藏" : "收藏"}
      aria-pressed={isStarred}
    >
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill={isStarred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-200"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>{starCount}</span>
    </button>
  )
}
