"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-border rounded-lg p-4 transition-all duration-300",
          "hover:border-accent-primary/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.08)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
