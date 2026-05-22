"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface CategoryPageClientProps {
  slug: string
  totalPages: number
  currentPage: number
}

export function CategoryPageClient({ slug, totalPages, currentPage }: CategoryPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/category/${slug}?${params.toString()}`, { scroll: false })
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
