"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProfitTrendPoint } from "@/lib/analytics";

const CHART = {
  profit: "#2F6FED",
  income: "#0D9B73",
  expenses: "#DC4A62",
  grid: "var(--chart-grid, #E2E7EF)",
  tick: "var(--chart-tick, #5A6578)",
  tooltipBg: "var(--chart-tooltip-bg, #FFFFFF)",
  tooltipBorder: "var(--chart-tooltip-border, #E2E7EF)",
};

export function ProfitTrendChart({ data }: { data: ProfitTrendPoint[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <p className="text-[13px] text-text-tertiary py-10 text-center">אין מספיק נתונים לגרף</p>
    );
  }

  return (
    <div className="h-72 w-full -ms-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="month"
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
            formatter={(value, name) => [
              `₪${Number(value).toLocaleString()}`,
              name === "profit" ? "רווח" : name === "income" ? "הכנסות" : "הוצאות",
            ]}
          />
          <Legend
            formatter={(value) =>
              value === "profit" ? "רווח" : value === "income" ? "הכנסות" : "הוצאות"
            }
          />
          <Bar dataKey="income" fill={CHART.income} fillOpacity={0.35} radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="expenses" fill={CHART.expenses} fillOpacity={0.35} radius={[4, 4, 0, 0]} barSize={14} />
          <Line
            type="monotone"
            dataKey="profit"
            stroke={CHART.profit}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART.profit }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
