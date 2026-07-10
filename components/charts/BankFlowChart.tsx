"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { BankFlowPoint } from "@/lib/analytics";

const CHART = {
  inflow: "#0D9B73",
  outflow: "#DC4A62",
  grid: "var(--chart-grid, #E2E7EF)",
  tick: "var(--chart-tick, #5A6578)",
  tooltipBg: "var(--chart-tooltip-bg, #FFFFFF)",
  tooltipBorder: "var(--chart-tooltip-border, #E2E7EF)",
};

export function BankFlowChart({ data }: { data: BankFlowPoint[] }) {
  const hasData = data.some((d) => d.inflow > 0 || d.outflow > 0);

  if (!hasData) {
    return (
      <p className="text-[13px] text-text-tertiary py-10 text-center">
        ייבא CSV בנק בהגדרות כדי לראות תזרים בנקאי
      </p>
    );
  }

  return (
    <div className="h-64 w-full -ms-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              name === "inflow" ? "הכנסות" : "הוצאות",
            ]}
          />
          <Legend formatter={(v) => (v === "inflow" ? "הכנסות" : "הוצאות")} />
          <Bar dataKey="inflow" fill={CHART.inflow} radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="outflow" fill={CHART.outflow} radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
