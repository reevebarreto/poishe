"use client";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import axios from "axios";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AccountBase, AccountSubtype } from "plaid";
import Link from "next/link";
import NetWorthCard from "@/components/NetWorthCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreditCard, PiggyBank, TrendingUp, Wallet } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountBase[] | null>(null);

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
    initUser();
  }, []);

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

  const getAccountIcon = (type: string) => {
    switch (type) {
      case AccountSubtype.Checking:
        return <Wallet className="w-5 h-5" />;
      case AccountSubtype.Savings:
        return <PiggyBank className="w-5 h-5" />;
      case AccountSubtype.CreditCard:
        return <CreditCard className="w-5 h-5" />;
      case AccountSubtype.MutualFund:
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

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
    </div>
  );
}
