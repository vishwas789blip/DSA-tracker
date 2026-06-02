"use client";

import { type WeeklyAnalyticsData } from "@/lib/weeklyAnalytics";

interface Props {
  data: WeeklyAnalyticsData;
}

export default function WeeklyAnalytics({ data }: Props) {
  const maxSolved =
    data.days.length > 0
      ? Math.max(...data.days.map((d) => d.solved), 1)
      : 1;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h2 className="text-xl font-bold text-white mb-6">Weekly Analytics</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Total Solved</p>
          <p className="text-3xl font-bold text-white">{data.totalSolved}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Average / Day</p>
          <p className="text-3xl font-bold text-white">{data.averageSolved}</p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Best Day</p>
          {data.bestDay === "-" ? (
            <p className="text-sm text-slate-500 mt-1">No data yet</p>
          ) : (
            <p className="text-3xl font-bold text-white">{data.bestDay}</p>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      {data.days.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No activity recorded this week.
        </p>
      ) : (
        <div className="space-y-3">
          {data.days.map((item) => (
            <div key={item.day} className="flex items-center gap-4">
              <div className="w-10 text-sm font-medium text-slate-300">
                {item.day}
              </div>

              <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${(item.solved / maxSolved) * 100}%`,
                  }}
                />
              </div>

              <div className="w-6 text-right text-sm font-semibold text-slate-300">
                {item.solved}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}