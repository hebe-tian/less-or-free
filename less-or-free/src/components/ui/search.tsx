"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface SearchProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function Search({
  value: controlledValue,
  onChange,
  placeholder = "搜索工具...",
  debounceMs = 300,
  className,
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isControlled = controlledValue !== undefined
  const displayValue = isControlled ? controlledValue : internalValue

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!isControlled) setInternalValue(val)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => onChange(val), debounceMs)
    },
    [onChange, debounceMs, isControlled]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={11} cy={11} r={8} />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full bg-surface border border-border rounded-md pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-secondary",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary/60",
          "hover:border-text-secondary/50",
          "font-body"
        )}
      />
    </div>
  )
}
