"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface ToolsPageClientProps {
  totalPages: number
  currentPage: number
}

export function ToolsPageClient({ totalPages, currentPage }: ToolsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/tools?${params.toString()}`, { scroll: false })
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
