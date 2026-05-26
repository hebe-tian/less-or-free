import { Suspense } from "react";
import { CategoryNav } from "@/components/category-nav";
import { ToolList } from "@/components/tool-list";
import { CategoryPageClient } from "./client";

interface CategoryRaw {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  tool_count: number;
}

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  toolCount: number;
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

export const dynamic = "force-dynamic";

async function getCategories(): Promise<CategoryRaw[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json: { data?: CategoryRaw[] } = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getToolsByCategory(
  slug: string,
  page: string | undefined
): Promise<{ tools: Tool[]; total: number; page: number; pageSize: number }> {
  try {
    const params = new URLSearchParams();
    params.set("category", slug);
    params.set("pageSize", "20");
    if (page) params.set("page", page);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tools?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { tools: [], total: 0, page: 1, pageSize: 20 };
    const json: { data?: { tools: Tool[]; total: number; page: number; pageSize: number } } = await res.json();
    return json.data ?? { tools: [], total: 0, page: 1, pageSize: 20 };
  } catch {
    return { tools: [], total: 0, page: 1, pageSize: 20 };
  }
}

function toCategoryNavItems(raw: CategoryRaw[]): CategoryNavItem[] {
  return raw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    toolCount: c.tool_count,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  return {
    title: category ? `${category.name} - Less or Free` : "分类 - Less or Free",
    description: category
      ? `浏览${category.name}分类下的免费与开源工具`
      : "浏览分类下的免费与开源工具",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const [categories, toolsData] = await Promise.all([
    getCategories(),
    getToolsByCategory(slug, sp.page),
  ]);

  const category = categories.find((c) => c.slug === slug);
  const navItems = toCategoryNavItems(categories);
  const totalPages = Math.ceil(toolsData.total / toolsData.pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
          {category?.name ?? slug}
        </h1>
        <p className="text-text-secondary text-sm font-body">
          {category ? `${category.name}分类下的工具` : "该分类下的工具"}
        </p>
      </div>

      <div className="mb-6">
        <CategoryNav categories={navItems} activeSlug={slug} />
      </div>

      <div className="mb-6">
        <ToolList tools={toolsData.tools} />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Suspense>
            <CategoryPageClient
              slug={slug}
              totalPages={totalPages}
              currentPage={toolsData.page}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
