"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ArAgingBucket } from "@/lib/analytics";

const CHART = {
  grid: "var(--chart-grid, #E2E7EF)",
  tick: "var(--chart-tick, #5A6578)",
  tooltipBg: "var(--chart-tooltip-bg, #FFFFFF)",
  tooltipBorder: "var(--chart-tooltip-border, #E2E7EF)",
};

export function ArAgingChart({ data }: { data: ArAgingBucket[] }) {
  const hasData = data.some((d) => d.amount > 0);

  if (!hasData) {
    return (
      <p className="text-[13px] text-text-tertiary py-10 text-center">
        אין חובות פתוחים — מצוין!
      </p>
    );
  }

  return (
    <div className="h-56 w-full -ms-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART.tick, fontSize: 11 }}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => `₪${Number(v) >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
          />
          <Tooltip
            contentStyle={{
              background: CHART.tooltipBg,
              border: `1px solid ${CHART.tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12.5,
              direction: "rtl",
            }}
            formatter={(value, _name, props) => {
              const count = (props.payload as ArAgingBucket)?.count ?? 0;
              return [`₪${Number(value).toLocaleString()} (${count} חשבוניות)`, "סכום"];
            }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
