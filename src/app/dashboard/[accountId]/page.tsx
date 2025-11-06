"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { TransactionsGetResponse } from "plaid";

export default function TransactionsPage() {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState<TransactionsGetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`/api/plaid/transactions?accountId=${accountId}`);
        console.log('Transactions response:', res.data);
        setTransactions(res.data);
      } catch (err: unknown) {
        setError("Failed to load transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [accountId]);

  if (loading)
    return <p className="p-8 text-gray-500">Loading transactions...</p>;

  if (error)
    return <p className="p-8 text-red-600 font-medium">{error}</p>;

  if (transactions?.transactions.length === 0)
    return <p className="p-8 text-gray-500">No transactions found.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Transactions
      </h1>

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
    </div>
  );
}
