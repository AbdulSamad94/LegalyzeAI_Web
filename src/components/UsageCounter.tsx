import { useState, useEffect } from "react";

const UsageCounter = () => {
  const [usage, setUsage] = useState<{
    dailyUploadCount: number;
    limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/user/usage");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUsage({
              dailyUploadCount: data.dailyUploadCount,
              limit: data.limit,
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch usage stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-end mr-2 animate-pulse">
        <div className="h-2.5 w-16 bg-gray-200 rounded mb-1" />
        <div className="h-6 w-24 bg-gray-200 rounded-md border border-gray-100" />
      </div>
    );
  }

  if (!usage) return null;

  const isLimitReached = usage.dailyUploadCount >= usage.limit;

  return (
    <div className="flex flex-col items-end mr-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
        Daily Usage
      </span>
      <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              isLimitReached ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Math.min(
                (usage.dailyUploadCount / usage.limit) * 100,
                100
              )}%`,
            }}
          />
        </div>
        <span
          className={`text-xs font-bold leading-none ${
            isLimitReached ? "text-red-600" : "text-gray-700"
          }`}
        >
          {usage.dailyUploadCount}/{usage.limit}
        </span>
      </div>
    </div>
  );
};

export default UsageCounter;
