import "@/styles/globals.css";
import Link from "next/link";

export const metadata = {
  title: "Less or Free",
  description: "发现免费与开源的优质工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary font-body">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border relative">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent shadow-[0_0_8px_rgba(0,255,136,0.3)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-heading font-bold text-lg text-accent-primary tracking-tight group-hover:shadow-[0_0_12px_rgba(0,255,136,0.4)] transition-shadow duration-300">
                  Less or Free
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-sm font-heading text-text-secondary hover:text-accent-primary transition-colors duration-200 rounded-md hover:bg-surface-elevated"
                >
                  首页
                </Link>
                <Link
                  href="/tools"
                  className="px-3 py-1.5 text-sm font-heading text-text-secondary hover:text-accent-primary transition-colors duration-200 rounded-md hover:bg-surface-elevated"
                >
                  工具大全
                </Link>
                <Link
                  href="/snapshots"
                  className="px-3 py-1.5 text-sm font-heading text-text-secondary hover:text-accent-primary transition-colors duration-200 rounded-md hover:bg-surface-elevated"
                >
                  版本历史
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-surface/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-accent-primary">
                  Less or Free
                </span>
                <span className="text-text-secondary text-xs font-heading">
                  发现免费与开源的优质工具
                </span>
              </div>
              <div className="flex items-center gap-4 text-text-secondary text-xs font-heading">
                <Link href="/" className="hover:text-accent-primary transition-colors duration-200">
                  首页
                </Link>
                <Link href="/tools" className="hover:text-accent-primary transition-colors duration-200">
                  工具大全
                </Link>
                <Link href="/snapshots" className="hover:text-accent-primary transition-colors duration-200">
                  版本历史
                </Link>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-center text-text-secondary/60 text-xs font-heading">
              © {new Date().getFullYear()} Less or Free. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
