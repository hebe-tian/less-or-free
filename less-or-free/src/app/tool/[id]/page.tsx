import Image from "next/image";
import Link from "next/link";
import { Badge, type BadgeLevel } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ToolDetailClient } from "./client";

interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
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
  categories: ToolCategory[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

const BADGE_LEVEL_MAP: Record<string, Record<string, BadgeLevel>> = {
  payment: { free: "good", freemium: "medium", paid: "bad" },
  china_access: { direct: "good", unstable: "medium", vpn_required: "bad" },
  open_source: { open: "good", partial: "medium", closed: "bad" },
  maintenance: { active: "good", maintained: "medium", deprecated: "bad" },
};

export const dynamic = "force-dynamic";

async function getTool(id: string): Promise<Tool | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tools/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const json: { data?: Tool } = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function getComments(
  toolId: string,
  page: string | undefined
): Promise<{
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
}> {
  try {
    const params = new URLSearchParams();
    params.set("page", page || "1");
    params.set("pageSize", "20");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tools/${toolId}/comments?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { comments: [], total: 0, page: 1, pageSize: 20 };
    const json: { data?: { comments: Comment[]; total: number; page: number; pageSize: number } } = await res.json();
    return json.data ?? { comments: [], total: 0, page: 1, pageSize: 20 };
  } catch {
    return { comments: [], total: 0, page: 1, pageSize: 20 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tool = await getTool(id);

  return {
    title: tool ? `${tool.name} - Less or Free` : "工具详情 - Less or Free",
    description: tool?.description ?? "查看工具详情",
  };
}

export default async function ToolDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [tool, commentsData] = await Promise.all([
    getTool(id),
    getComments(id, sp.comment_page),
  ]);

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-4">
          工具未找到
        </h1>
        <p className="text-text-secondary font-body mb-6">
          该工具不存在或已被删除
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/40 text-accent-primary rounded-md font-heading text-sm hover:bg-accent-primary/20 transition-colors duration-200"
        >
          返回工具大全
        </Link>
      </div>
    );
  }

  const isUnpublished = tool.status === "unpublished";
  const commentTotalPages = Math.ceil(commentsData.total / commentsData.pageSize);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: tool.badge_payment === "free" ? "0" : undefined,
      priceCurrency: "CNY",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isUnpublished && (
          <div className="mb-6 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2">
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-danger flex-shrink-0"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
            <span className="text-danger text-sm font-heading font-medium">
              该工具已下架，信息仅供参考
            </span>
          </div>
        )}

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-surface-elevated border border-border flex items-center justify-center overflow-hidden">
              {tool.icon_url ? (
                <Image
                  src={tool.icon_url}
                  alt={tool.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <span className="text-accent-primary font-heading font-bold text-2xl">
                  {tool.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-bold text-xl text-text-primary mb-1">
                {tool.name}
              </h1>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-secondary text-sm font-heading hover:text-accent-primary transition-colors duration-200 inline-flex items-center gap-1"
              >
                {tool.url}
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1={10} y1={14} x2={21} y2={3} />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge type="payment" level={BADGE_LEVEL_MAP.payment[tool.badge_payment] ?? "good"} />
            <Badge type="china_access" level={BADGE_LEVEL_MAP.china_access[tool.badge_china_access] ?? "good"} />
            <Badge type="open_source" level={BADGE_LEVEL_MAP.open_source[tool.badge_open_source] ?? "good"} />
            <Badge type="maintenance" level={BADGE_LEVEL_MAP.maintenance[tool.badge_maintenance] ?? "good"} />
          </div>

          <p className="text-text-primary font-body text-sm leading-relaxed mb-6">
            {tool.description}
          </p>

          {tool.categories && tool.categories.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-text-secondary text-xs font-heading">分类：</span>
              {tool.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-2 py-0.5 bg-surface-elevated border border-border rounded text-xs font-heading text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-colors duration-200"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <ToolDetailClient
            toolId={tool.id}
            starCount={tool.star_count}
            opposeCount={tool.oppose_count}
            isUnpublished={isUnpublished}
            comments={commentsData.comments}
            commentTotal={commentsData.total}
            commentCurrentPage={commentsData.page}
            commentTotalPages={commentTotalPages}
          />
        </Card>
      </div>
    </>
  );
}
