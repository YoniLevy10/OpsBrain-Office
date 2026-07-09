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

export function CashFlowChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full -ms-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4AD4A8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4AD4A8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F07B8E" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#F07B8E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3344" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#A8B0C0", fontSize: 12 }}
            axisLine={{ stroke: "#2D3344" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#A8B0C0", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => `₪${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#1C1F2A",
              border: "1px solid #2D3344",
              borderRadius: 10,
              fontSize: 12.5,
              direction: "rtl",
            }}
            labelStyle={{ color: "#E8EAF0", fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => [
              `₪${Number(value).toLocaleString()}`,
              name === "income" ? "הכנסות" : "הוצאות",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#4AD4A8"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#F07B8E"
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
