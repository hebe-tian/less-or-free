import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="font-heading font-bold text-8xl text-accent-primary/20 mb-4">404</div>
        <h1 className="font-heading font-semibold text-2xl text-text-primary mb-2">
          页面不存在
        </h1>
        <p className="text-text-secondary mb-8 font-body">
          你访问的页面可能已被移除或暂时不可用
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-heading text-sm rounded-lg hover:bg-accent-primary/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-all duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          返回首页
        </Link>
      </div>
    </div>
  )
}
