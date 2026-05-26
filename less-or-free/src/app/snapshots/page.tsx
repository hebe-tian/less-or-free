import { SnapshotsPageClient } from "./client";

interface Snapshot {
  id: string;
  version: number;
  description: string | null;
  created_at: string;
}

export const metadata = {
  title: "版本历史 - Less or Free",
  description: "查看工具快照的版本历史记录，对比不同版本之间的差异",
};

export const dynamic = "force-dynamic";

async function getSnapshots(): Promise<Snapshot[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/snapshots`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json: { data?: Snapshot[] } = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function SnapshotsPage() {
  const snapshots = await getSnapshots();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
          版本历史
        </h1>
        <p className="text-text-secondary text-sm font-body">
          查看工具快照的版本记录，对比不同版本之间的变更
        </p>
      </div>

      <div className="mb-8">
        <SnapshotsPageClient snapshots={snapshots} />
      </div>

      {snapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <svg
            width={48}
            height={48}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-40"
          >
            <circle cx={12} cy={12} r={10} />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="font-heading text-sm">暂无快照记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="group bg-surface border border-border rounded-lg p-4 hover:border-accent-primary/30 hover:shadow-[0_0_15px_rgba(0,255,136,0.06)] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center">
                    <span className="font-heading font-bold text-accent-primary text-sm">
                      v{snapshot.version}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-text-primary text-sm group-hover:text-accent-primary transition-colors duration-200">
                      版本 {snapshot.version}
                    </h3>
                    {snapshot.description && (
                      <p className="text-text-secondary text-xs font-body mt-0.5">
                        {snapshot.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-text-secondary text-xs font-heading">
                    {new Date(snapshot.created_at).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
