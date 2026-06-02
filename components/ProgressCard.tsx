interface Props {
  today: number;
  week: number;
  month: number;
  bestDay: number;
}

export function ProgressCard({
  today,
  week,
  month,
  bestDay,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-cyan-500/20
        bg-cyan-500/10
        p-5
      "
    >
      <h3 className="mb-4 text-lg font-bold">
        📈 Progress Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <div className="text-2xl font-bold">
            {today}
          </div>

          <div className="text-xs text-slate-400">
            Today
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold">
            {week}
          </div>

          <div className="text-xs text-slate-400">
            This Week
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold">
            {month}
          </div>

          <div className="text-xs text-slate-400">
            This Month
          </div>
        </div>

        <div>
          <div className="text-2xl font-bold">
            {bestDay}
          </div>

          <div className="text-xs text-slate-400">
            Best Day
          </div>
        </div>

      </div>
    </div>
  );
}