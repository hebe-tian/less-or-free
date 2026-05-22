"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/tools", label: "工具管理", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/admin/categories", label: "分类管理", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" },
  { href: "/admin/publish", label: "发布管理", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
  { href: "/admin/snapshots", label: "快照管理", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return <AdminAppLayout>{children}</AdminAppLayout>
}

function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/admin/login")
          return
        }
        setAuthed(true)
        setChecking(false)
      })
      .catch(() => {
        router.replace("/admin/login")
      })
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" })
    } finally {
      router.replace("/admin/login")
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <h1 className="text-lg font-heading font-bold text-accent-primary tracking-wider">
            Less or Free
          </h1>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(item.href)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-heading transition-all duration-200",
                  isActive
                    ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[0_0_10px_rgba(0,255,136,0.08)]"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-text-secondary hover:text-danger"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            退出登录
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center px-4 lg:px-6 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="打开菜单"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
