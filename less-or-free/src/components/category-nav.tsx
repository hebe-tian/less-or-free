"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  slug: string
  toolCount: number
}

interface CategoryNavProps {
  categories: Category[]
  activeSlug?: string
}

export function CategoryNav({ categories, activeSlug }: CategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-heading text-sm transition-all duration-200",
          !activeSlug
            ? "bg-accent-primary/10 border-accent-primary/40 text-accent-primary shadow-[0_0_10px_rgba(0,255,136,0.1)]"
            : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/30 hover:bg-surface-elevated"
        )}
      >
        <span>全部</span>
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/?category=${cat.slug}`}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-heading text-sm transition-all duration-200",
            activeSlug === cat.slug
              ? "bg-accent-primary/10 border-accent-primary/40 text-accent-primary shadow-[0_0_10px_rgba(0,255,136,0.1)]"
              : "bg-surface border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/30 hover:bg-surface-elevated"
          )}
        >
          <span>{cat.name}</span>
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-xs font-heading",
              activeSlug === cat.slug
                ? "bg-accent-primary/20 text-accent-primary"
                : "bg-surface-elevated text-text-secondary"
            )}
          >
            {cat.toolCount}
          </span>
        </Link>
      ))}
    </div>
  )
}
