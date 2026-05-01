"use client";

import { DataCategory, WEEKLY_LIMITS, ALL_CATEGORIES } from "@/lib/types";
import { usePrivacyBudget } from "@/lib/usePrivacyBudget";

const CATEGORY_ICONS: Record<DataCategory, string> = {
  address: "📍", health: "🩺", financial: "💳", emotional: "💭", academic: "🎓", behavioral: "🔁",
};

const CATEGORY_LABELS: Record<DataCategory, string> = {
  address: "Location", health: "Health", financial: "Financial",
  emotional: "Emotional", academic: "Academic", behavioral: "Behavioral",
};

function bar(pct: number): string {
  if (pct >= 0.9) return "bg-red-500";
  if (pct >= 0.6) return "bg-orange-400";
  if (pct >= 0.3) return "bg-yellow-400";
  return "bg-green-500";
}

export default function PrivacyBudget() {
  const { getBudgetStatus } = usePrivacyBudget();

  const anyUsed = ALL_CATEGORIES.some((c) => getBudgetStatus(c).used > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Privacy Budget
        </span>
        <span className="text-xs text-gray-600">— weekly exposure tracker</span>
      </div>

      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
        {!anyUsed && (
          <p className="text-xs text-gray-600 italic mb-3">
            No data categories exposed yet this week.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_CATEGORIES.map((cat) => {
            const { used, limit, pct } = getBudgetStatus(cat);
            const barColor = bar(pct);
            const remaining = limit - used;
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs text-gray-300 font-medium">{CATEGORY_LABELS[cat]}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${pct >= 0.9 ? "text-red-400" : pct >= 0.6 ? "text-orange-400" : "text-gray-500"}`}>
                    {used}/{limit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${Math.max(pct * 100, used > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className={`text-[10px] ${remaining <= 1 && used > 0 ? "text-red-400" : "text-gray-600"}`}>
                  {remaining === limit
                    ? "Not used this week"
                    : remaining === 0
                    ? "Budget exhausted"
                    : `${remaining} remaining`}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-700 mt-3 border-t border-[#2a2a2a] pt-3">
          Budget resets weekly · High usage = Nora tightens protection automatically
        </p>
      </div>
    </div>
  );
}
