"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Point {
  month: string;
  income: number;
  expenses: number;
}

const CHART = {
  income: "#0D9B73",
  expense: "#DC4A62",
  grid: "#E2E7EF",
  tick: "#5A6578",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E2E7EF",
  tooltipLabel: "#1A2233",
};

function formatYAxis(value: number): string {
  const n = Number(value);
  if (n === 0) return "₪0";
  if (Math.abs(n) >= 1000) return `₪${Math.round(n / 1000)}k`;
  return `₪${n.toLocaleString("he-IL")}`;
}

export function CashFlowChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full -ms-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.income} stopOpacity={0.25} />
              <stop offset="100%" stopColor={CHART.income} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.expense} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART.expense} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: CHART.tick, fontSize: 12 }}
            axisLine={{ stroke: CHART.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              background: CHART.tooltipBg,
              border: `1px solid ${CHART.tooltipBorder}`,
              borderRadius: 10,
              fontSize: 12.5,
              direction: "rtl",
              boxShadow: "0 4px 12px rgba(26,34,51,0.08)",
            }}
            labelStyle={{ color: CHART.tooltipLabel, fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => [
              `₪${Number(value).toLocaleString()}`,
              name === "income" ? "הכנסות" : "הוצאות",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={CHART.income}
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke={CHART.expense}
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
