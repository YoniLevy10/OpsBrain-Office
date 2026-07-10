"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ClientRevenueRow } from "@/lib/analytics";

const CHART = {
  revenue: "#0D9B73",
  grid: "var(--chart-grid, #E2E7EF)",
  tick: "var(--chart-tick, #5A6578)",
  tooltipBg: "var(--chart-tooltip-bg, #FFFFFF)",
  tooltipBorder: "var(--chart-tooltip-border, #E2E7EF)",
};

export function ClientRevenueChart({ data }: { data: ClientRevenueRow[] }) {
  if (data.length === 0) {
    return (
      <p className="text-[13px] text-text-tertiary py-10 text-center">אין נתוני לקוחות</p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name,
  }));

  return (
    <div className="h-64 w-full -ms-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: CHART.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₪${Number(v) >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={88}
            tick={{ fill: CHART.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: CHART.tooltipBg,
              border: `1px solid ${CHART.tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12.5,
              direction: "rtl",
            }}
            formatter={(value) => [`₪${Number(value).toLocaleString()}`, "הכנסה"]}
            labelFormatter={(_label, payload) => payload?.[0]?.payload?.name ?? ""}
          />
          <Bar dataKey="revenue" fill={CHART.revenue} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
