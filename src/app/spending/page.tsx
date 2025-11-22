"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PIE_COLORS } from "@/lib/constants";
import { CategorySpending, SpendingTrendPoint } from "@/lib/types";
import axios from "axios";
import { Calendar, EuroIcon, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Spending() {
  const [spendingSummary, setSpendingSummary] = useState<CategorySpending[]>(
    []
  );
  const [spendingTrend, setSpendingTrend] = useState<SpendingTrendPoint[]>([]);

  useEffect(() => {
    const fetchSpendingSummary = async () => {
      try {
        const res = await axios.get("/api/plaid/spending-summary");

        const data = res.data; // Record<string, number>

        // Transform into chart-ready array with colors
        const formatted = data.map((data: CategorySpending, index: number) => ({
          ...data,
          color: PIE_COLORS[index % PIE_COLORS.length],
        }));

        setSpendingSummary(formatted);
      } catch (err) {
        console.error("Error fetching spending summary:", err);
      }
    };

    const fetchSpendingTrend = async () => {
      try {
        const res = await axios.get("/api/plaid/spending-trend");
        setSpendingTrend(res.data);
      } catch (err) {
        console.error("Error fetching spending trend:", err);
      }
    };

    fetchSpendingSummary();
    fetchSpendingTrend();
  }, []);

  const totalSpending = useMemo(() => {
    return spendingSummary.reduce((sum, cat) => sum + cat.amount, 0);
  }, [spendingSummary]);

  const topCategories = useMemo(() => {
    return [...spendingSummary].sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [spendingSummary]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Spending Summary</h2>
        <p className="text-slate-600">
          Analyze your spending patterns over the last 30 days
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-red text-white stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <EuroIcon className="w-4 h-4" />
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">€{totalSpending.toFixed(2)}</div>
            <p className="text-red-100 text-sm mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="gradient-orange text-white stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">€{(totalSpending / 30).toFixed(2)}</div>
            <p className="text-orange-100 text-sm mt-1">Per day</p>
          </CardContent>
        </Card>

        <Card className="gradient-purple text-white stat-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{spendingSummary.length}</div>
            <p className="text-purple-100 text-sm mt-1">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Categories Detail */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Top 3 Spending Categories
          </CardTitle>
          <CardDescription>
            Your highest spending categories this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {topCategories.map((cat, index) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-slate-900">{cat.category}</div>
                      <div className="text-sm text-slate-500">
                        {((cat.amount / totalSpending) * 100).toFixed(1)}% of
                        total spending
                      </div>
                    </div>
                  </div>
                  <div className="text-xl text-slate-900">
                    €{cat.amount.toFixed(2)}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="progress-bar-lg"
                    style={{
                      width: `${(cat.amount / totalSpending) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Spending by Category
            </CardTitle>
            <CardDescription>Distribution of your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(2)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    nameKey="category"
                    dataKey="amount"
                  >
                    {spendingSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Category Comparison
            </CardTitle>
            <CardDescription>
              Compare spending across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingSummary} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={100}
                    stroke="#64748b"
                  />
                  <Tooltip
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                    {spendingSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend Line Chart */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Spending Trend</CardTitle>
          <CardDescription>
            Your daily spending over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value: number) => `€${value.toFixed(2)}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
