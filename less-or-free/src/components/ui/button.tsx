"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-background hover:bg-accent-primary/90 active:bg-accent-primary/80 shadow-[0_0_12px_rgba(0,255,136,0.2)] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]",
  secondary:
    "border border-border text-text-primary bg-transparent hover:bg-surface-elevated hover:border-accent-primary/40 active:bg-surface",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:bg-surface",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-[0_0_12px_rgba(255,68,68,0.2)] hover:shadow-[0_0_20px_rgba(255,68,68,0.3)]",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded",
  md: "px-4 py-2 text-sm rounded-md",
  lg: "px-6 py-3 text-base rounded-lg",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-heading font-medium transition-all duration-200 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx={12}
              cy={12}
              r={10}
              stroke="currentColor"
              strokeWidth={4}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
