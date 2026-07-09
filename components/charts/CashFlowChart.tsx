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
              <stop offset="0%" stopColor="#35C79A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#35C79A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5677A" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#E5677A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262B37" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#9BA3B4", fontSize: 12 }}
            axisLine={{ stroke: "#262B37" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9BA3B4", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => `₪${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#171B24",
              border: "1px solid #262B37",
              borderRadius: 10,
              fontSize: 12.5,
              direction: "rtl",
            }}
            labelStyle={{ color: "#F0F2F6", fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => [
              `₪${Number(value).toLocaleString()}`,
              name === "income" ? "הכנסות" : "הוצאות",
            ]}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#35C79A"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#E5677A"
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
