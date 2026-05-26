"use client"

import { useState, useTransition } from "react"
import { cn, escapeHtml, timeAgo } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"

interface Comment {
  id: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  toolId: string
  comments: Comment[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export function CommentSection({
  toolId,
  comments,
  totalCount,
  currentPage,
  totalPages,
}: CommentSectionProps) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const charCount = content.length
  const isValid = charCount >= 1 && charCount <= 500

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isPending) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/tools/${toolId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
        if (res.ok) {
          setContent("")
        }
      } catch {}
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-text-primary text-sm uppercase tracking-wider">
        评论 <span className="text-text-secondary font-normal">({totalCount})</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            maxLength={500}
            rows={3}
            className={cn(
              "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary",
              "transition-all duration-200 resize-none font-body",
              "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
              "hover:border-text-secondary/50"
            )}
          />
          <span
            className={cn(
              "absolute bottom-2 right-2 text-xs font-heading",
              charCount > 500 ? "text-danger" : "text-text-secondary"
            )}
          >
            {charCount}/500
          </span>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!isValid || isPending} loading={isPending}>
            提交评论
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-surface border border-border rounded-md"
          >
            <div
              className="text-sm text-text-primary font-body break-words"
              dangerouslySetInnerHTML={{ __html: escapeHtml(comment.content) }}
            />
            <div className="mt-2 text-xs text-text-secondary font-heading">
              {timeAgo(comment.created_at)}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-text-secondary text-sm py-8 font-heading">
            暂无评论
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              const url = new URL(window.location.href)
              url.searchParams.set("comment_page", String(page))
              window.location.href = url.toString()
            }}
          />
        </div>
      )}
    </div>
  )
}
