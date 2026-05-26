"use client"

import { StarButton } from "@/components/star-button"
import { OpposeButton } from "@/components/oppose-button"
import { CommentSection } from "@/components/comment-section"

interface Comment {
  id: string
  content: string
  created_at: string
}

interface ToolDetailClientProps {
  toolId: string
  starCount: number
  opposeCount: number
  isUnpublished: boolean
  comments: Comment[]
  commentTotal: number
  commentCurrentPage: number
  commentTotalPages: number
}

export function ToolDetailClient({
  toolId,
  starCount,
  opposeCount,
  isUnpublished,
  comments,
  commentTotal,
  commentCurrentPage,
  commentTotalPages,
}: ToolDetailClientProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-8 pt-4 border-t border-border">
        <StarButton toolId={toolId} count={starCount} starred={false} />
        <OpposeButton
          toolId={toolId}
          count={opposeCount}
          opposed={false}
          unpublished={isUnpublished}
        />
      </div>

      <CommentSection
        toolId={toolId}
        comments={comments}
        totalCount={commentTotal}
        currentPage={commentCurrentPage}
        totalPages={commentTotalPages}
      />
    </>
  )
}
