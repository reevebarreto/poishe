"use client";
import { useState, useEffect, useMemo } from "react";
import { usePlaidLink } from "react-plaid-link";
import axios from "axios";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AccountBase, AccountSubtype } from "plaid";
import Link from "next/link";
import NetWorthCard from "@/components/NetWorthCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategorySpending } from "@/lib/types";
import { PIE_COLORS } from "@/lib/constants";
import { getAccountIcon } from "@/components/ui/account";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountBase[] | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<CategorySpending[]>(
    []
  );

  useEffect(() => {
    const initUser = async () => {
      try {
        // Check authenticated user
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          redirect("/login");
        }
        setUser(data.user);

        // Check Plaid connection status
        const statusRes = await axios.get("/api/plaid/status");
        console.log("Plaid status response:", statusRes.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        redirect("/login");
      }
    };
    const fetchSpendingSummary = async () => {
      try {
        const res = await axios.get("/api/plaid/spending-summary");

        const data = res.data; // Record<string, number>

        // Transform into chart-ready array with colors
        const formatted = data.map((data: CategorySpending, index: number) => ({
          ...data,
          color: PIE_COLORS[index % PIE_COLORS.length],
        }));

        console.log("Formatted summary:", formatted);
        setSpendingSummary(formatted);
      } catch (err) {
        console.error("Error fetching spending summary:", err);
      }
    };
    fetchSpendingSummary();
    initUser();
  }, []);

  const topCategories = useMemo(() => {
    return [...spendingSummary].sort((a, b) => b.amount - a.amount).slice(0, 3);
  }, [spendingSummary]);

  useEffect(() => {
    if (!user) return;

    // Generate link token
    const createLinkToken = async () => {
      try {
        // hasCreatedToken.current = true; // Set before the call
        const response = await axios.post("/api/plaid/create-link-token", {
          client_user_id: user?.id || "unique_user",
        });
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error("Error generating link token:", error);
        // hasCreatedToken.current = false; // Reset on error so it can retry
      }
    };
    createLinkToken();
  }, [user]);

  const onSuccess = async (public_token: string) => {
    // Exchange public token for access token
    try {
      const response = await axios.post("/api/plaid/exchange-token", {
        public_token,
      });

      if (!response.data.success) {
        console.error("Error exchanging public token:", response.data.error);
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  // Fetch balances when connected
  useEffect(() => {
    const fetchAccountsBalance = async () => {
      const res = await axios.get("/api/plaid/balance");
      setAccounts(res.data);
    };
    try {
      fetchAccountsBalance();
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* <p>Hello {user?.email}</p>
      {linkToken && (
        <button onClick={() => open()} disabled={!ready}>
          Connect Bank
        </button>
      )} */}

      <NetWorthCard />
      {/* 
      {balances && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Accounts</h2>
          {balances.map((acc, i) => (
            <div key={i} className="border p-4 rounded-lg shadow-sm">
              <p className="font-medium">{acc.official_name || acc.name}</p>
              <p className="text-sm text-gray-500">
                •••• {acc.mask} — {acc.subtype?.toUpperCase()}
              </p>
              <p>
                Available: ${acc.balances.available ?? acc.balances.current}
              </p>
              <Link
                href={`/dashboard/${acc.account_id}`}
                className="text-blue-600 hover:underline"
              >
                View Transactions →
              </Link>
            </div>
          ))}
        </div>
      )} */}

      {/* Account Overview Cards */}
      <div>
        <h2 className="text-slate-900 mb-4">Your Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts?.map((account) => (
            <Card
              key={account.account_id}
              className="hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 bg-white"
              // Link to transactions page for this account
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg ${
                      account.subtype === AccountSubtype.Checking
                        ? "bg-blue-100 text-blue-600"
                        : account.subtype === AccountSubtype.Savings
                        ? "bg-green-100 text-green-600"
                        : account.subtype === AccountSubtype.CreditCard
                        ? "bg-orange-100 text-orange-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {getAccountIcon(account.type)}
                  </div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    {account.subtype}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-slate-900">{account.name}</div>
                  <div className="text-slate-500 text-sm">
                    ••••{account.mask}
                  </div>
                  <div
                    className={`text-2xl ${
                      account.balances.current && account.balances?.current >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    €
                    {account.balances.current
                      ? Math.abs(account.balances.current).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )
                      : "0.00"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Spending Summary */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Spending Overview - Last 30 Days
          </CardTitle>
          <CardDescription>Your top spending categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
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
                    outerRadius={80}
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
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 3 Categories */}
            <div className="space-y-4">
              <div className="text-slate-700 mb-4">Top 3 Categories</div>
              {topCategories.map((cat, index) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-slate-900">{cat.category}</div>
                        <div className="text-sm text-slate-500">
                          €{cat.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-900">
                      {(
                        (cat.amount /
                          spendingSummary.reduce(
                            (sum, c) => sum + c.amount,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          (cat.amount /
                            spendingSummary.reduce(
                              (sum, c) => sum + c.amount,
                              0
                            )) *
                          100
                        }%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
