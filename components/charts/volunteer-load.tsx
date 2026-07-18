"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type VolunteerLoadRow = {
  name: string;
  assigned: number;
  open: number;
};

export function VolunteerLoadChart({ data }: { data: VolunteerLoadRow[] }) {
  const height = Math.max(220, data.length * 30 + 60);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          horizontal={false}
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value, name) => [value as number, name as string]}
          contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar
          dataKey="assigned"
          name="Assigned students"
          stackId="load"
          fill="var(--chart-1)"
          barSize={16}
        />
        <Bar
          dataKey="open"
          name="Open capacity"
          stackId="load"
          fill="var(--muted)"
          radius={[0, 4, 4, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
