"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
          "hover:border-text-secondary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "font-body",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"
