"use client";
import React, { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import axios from "axios";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AccountsGetResponse } from "plaid";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [balances, setBalances] = useState<AccountsGetResponse | null>(null);

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
    const fetchBalance = async () => {
      const res = await axios.get("/api/plaid/balance");
      setBalances(res.data);
    };
    try {
      fetchBalance();
    } catch (error) {
      console.log("Error fetching balance:", error);
    }
  }, []);

  return (
    <div>
      <p>Hello {user?.email}</p>
      {linkToken && (
        <button onClick={() => open()} disabled={!ready}>
          Connect Bank
        </button>
      )}

      {balances && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Accounts</h2>
          {balances.accounts.map((acc, i) => (
            <div key={i} className="border p-4 rounded-lg shadow-sm">
              <p className="font-medium">{acc.name}</p>
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
      )}
    </div>
  );
}
