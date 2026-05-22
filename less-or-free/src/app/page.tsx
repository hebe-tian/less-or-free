import Link from "next/link";
import { ToolList } from "@/components/tool-list";

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  tool_count: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon_url: string | null;
  status: string;
  badge_payment: string;
  badge_china_access: string;
  badge_open_source: string;
  badge_maintenance: string;
  star_count: number;
  oppose_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  requirements: "📋",
  design: "🎨",
  development: "💻",
  testing: "🧪",
  deployment: "🚀",
  operations: "🔧",
  "project-management": "📊",
  general: "🛠️",
};

export const metadata = {
  title: "Less or Free - 发现免费与开源的优质工具",
  description: "发现免费与开源的优质工具，涵盖需求分析、设计、开发、测试、部署、运维等全生命周期",
};

export const dynamic = "force-dynamic";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json: { data?: Category[] } = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getLatestTools(): Promise<Tool[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tools?pageSize=8&sort=latest`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json: { data?: { tools?: Tool[] } } = await res.json();
    return json.data?.tools ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, latestTools] = await Promise.all([
    getCategories(),
    getLatestTools(),
  ]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4 tracking-tight">
              发现免费与开源的
              <span className="text-accent-primary shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                优质工具
              </span>
            </h1>
            <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto font-body leading-relaxed">
              精心筛选全生命周期工具，帮你找到真正免费、开源、可直连的优质选择
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-accent-primary/40 to-transparent" />
          <h2 className="font-heading font-semibold text-lg text-text-primary tracking-wider uppercase">
            工具分类
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-accent-primary/40 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative bg-surface border border-border rounded-lg p-5 hover:border-accent-primary/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.08)] transition-all duration-300"
            >
              <div className="text-3xl mb-3">{CATEGORY_ICONS[cat.slug] ?? "📦"}</div>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-1 group-hover:text-accent-primary transition-colors duration-200">
                {cat.name}
              </h3>
              <p className="text-text-secondary text-xs font-heading">
                {cat.tool_count} 个工具
              </p>
              <div className="absolute inset-0 rounded-lg pointer-events-none border border-accent-primary/0 group-hover:border-accent-primary/20 transition-colors duration-300" />
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-accent-secondary/40" />
            <h2 className="font-heading font-semibold text-lg text-text-primary tracking-wider uppercase">
              最新工具
            </h2>
          </div>
          <Link
            href="/tools"
            className="text-sm font-heading text-accent-secondary hover:text-accent-primary transition-colors duration-200 flex items-center gap-1"
          >
            查看全部
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
        <ToolList tools={latestTools} />
      </section>
    </div>
  );
}
