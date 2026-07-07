"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SubjectBarChartProps = {
  data: Record<string, number>;
  color?: string;
  label: string;
};

export function SubjectBarChart({
  data,
  color = "var(--chart-2)",
  label,
}: SubjectBarChartProps) {
  const chartData = Object.entries(data)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="subject"
          width={92}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [value as number, label]}
          contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
