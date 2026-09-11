"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts"

const COLORS = ["#0066cc", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9", "#737373"]

export interface AnalyticsData {
  summary: {
    requestsByStatus: Array<{ key: string; count: number }>
    quotationsByStatus: Array<{ key: string; count: number }>
    usersByStatus: Array<{ key: string; count: number }>
  }
}

export default function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const requestsByStatus = data.summary.requestsByStatus.map((d) => ({
    name: d.key.replace("_", " "),
    count: d.count,
  }))

  const quotationsByStatus = data.summary.quotationsByStatus.map((d) => ({
    name: d.key.replace("_", " "),
    count: d.count,
  }))

  const usersByStatus = data.summary.usersByStatus.map((d) => ({
    name: d.key.replace("_", " "),
    count: d.count,
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-border p-5">
        <h3 className="mb-4 font-semibold">Procurement Requests by Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={requestsByStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} />
            <YAxis allowDecimals={false} stroke="#737373" fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#0066cc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h3 className="mb-4 font-semibold">Quotations by Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={quotationsByStatus}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {quotationsByStatus.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length] ?? "#737373"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-border p-5">
        <h3 className="mb-4 font-semibold">Users by Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={usersByStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis dataKey="name" stroke="#737373" fontSize={12} />
            <YAxis allowDecimals={false} stroke="#737373" fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}