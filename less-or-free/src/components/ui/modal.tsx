"use client"

import { useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback(() => {
    if (!contentRef.current) return []
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
  }, [])

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => {
        const focusable = getFocusableElements()
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      })
    } else {
      document.body.style.overflow = ""
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, getFocusableElements])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }

      if (e.key === "Tab") {
        const focusable = getFocusableElements()
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose, getFocusableElements])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={contentRef}
        className={cn(
          "w-full max-w-md bg-surface border border-border rounded-lg shadow-2xl shadow-black/50",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {title && (
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className={cn(
              "ml-auto inline-flex items-center justify-center w-8 h-8 rounded",
              "text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors duration-200"
            )}
            aria-label="关闭"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
