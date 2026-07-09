"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="h-44 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((slice, i) => (
                <Cell key={i} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#171B24",
                border: "1px solid #262B37",
                borderRadius: 10,
                fontSize: 12.5,
                direction: "rtl",
              }}
              formatter={(value, name) => [`₪${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-nums text-[17px] font-bold">₪{total.toLocaleString()}</span>
          <span className="text-[11px] text-text-tertiary">סה״כ</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-[12px] text-text-secondary truncate">{slice.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
