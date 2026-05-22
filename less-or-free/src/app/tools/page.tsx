import { Suspense } from "react";
import { ToolFilter } from "@/components/tool-filter";
import { ToolList } from "@/components/tool-list";
import { ToolsPageClient } from "./client";

interface Category {
  id: string;
  name: string;
  slug: string;
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

export const metadata = {
  title: "工具大全 - Less or Free",
  description: "浏览所有免费与开源的优质工具，支持按分类、付费、国内访问、开源状态等筛选",
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

async function getTools(searchParams: {
  category?: string;
  payment?: string;
  china_access?: string;
  open_source?: string;
  maintenance?: string;
  sort?: string;
  search?: string;
  page?: string;
}): Promise<{ tools: Tool[]; total: number; page: number; pageSize: number }> {
  try {
    const params = new URLSearchParams();
    params.set("status", "all");
    params.set("pageSize", "20");
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.payment) params.set("badge_payment", searchParams.payment);
    if (searchParams.china_access) params.set("badge_china_access", searchParams.china_access);
    if (searchParams.open_source) params.set("badge_open_source", searchParams.open_source);
    if (searchParams.maintenance) params.set("badge_maintenance", searchParams.maintenance);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.page) params.set("page", searchParams.page);

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

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [categories, toolsData] = await Promise.all([
    getCategories(),
    getTools({
      category: params.category,
      payment: params.payment,
      china_access: params.china_access,
      open_source: params.open_source,
      maintenance: params.maintenance,
      sort: params.sort,
      search: params.search,
      page: params.page,
    }),
  ]);

  const totalPages = Math.ceil(toolsData.total / toolsData.pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">工具大全</h1>
        <p className="text-text-secondary text-sm font-body">
          浏览所有工具，支持多维度筛选
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <ToolFilter categories={categories} />
        </Suspense>
      </div>

      <div className="mb-6">
        <ToolList tools={toolsData.tools} />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Suspense>
            <ToolsPageClient totalPages={totalPages} currentPage={toolsData.page} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
