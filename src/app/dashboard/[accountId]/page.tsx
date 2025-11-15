"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { TransactionsGetResponse } from "plaid";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { CategorySpending } from "@/lib/types";

export default function TransactionsPage() {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState<TransactionsGetResponse>();
  const [summary, setSummary] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `/api/plaid/transactions?accountId=${accountId}`
        );
        console.log("Transactions response:", res.data);
        setTransactions(res.data);
      } catch (err: unknown) {
        setError("Failed to load transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactionSummary = async () => {
      try {
        const res = await axios.get(
          `/api/plaid/spending-summary?accountId=${accountId}`
        );
        console.log("Summary response", res.data);
        setSummary(res.data);
      } catch (err: unknown) {
        setError("Failed to load summary");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    fetchTransactionSummary();
  }, [accountId]);

  const chartData = Object.entries(summary).map(([category, value]) => ({
    name: category,
    value: value,
  }));

  if (loading)
    return <p className="p-8 text-gray-500">Loading transactions...</p>;

  if (error) return <p className="p-8 text-red-600 font-medium">{error}</p>;

  if (transactions?.transactions.length === 0)
    return <p className="p-8 text-gray-500">No transactions found.</p>;

  return (
    <div className="p-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Spending Summary (Last 30 Days)
        </h2>
        {chartData.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <PieChart width={350} height={350}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  fill="#8884d8"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={`hsl(${(index * 40) % 360}, 70%, 60%)`}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
            <div className="md:w-1/2 w-full">
              <ul className="space-y-2">
                {chartData.map(({ name, value }) => (
                  <li key={name} className="flex justify-between border-b pb-1">
                    <span>{name}</span>
                    <span className="font-medium">${value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No spending data available.</p>
        )}
      </section>

      {/* Transction List */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Transactions</h2>
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.transactions.map((tx, i) => (
                <tr
                  key={i}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-600">{tx.date}</td>
                  <td className="px-4 py-3">{tx.merchant_name || tx.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {tx.personal_finance_category?.primary}
                  </td>
                  <td
                    className={`px-4 py-3 text-right ${
                      tx.amount > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {tx.iso_currency_code} {(tx.amount * -1).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
