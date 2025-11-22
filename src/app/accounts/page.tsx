"use client";

import { getAccountColorClass, getAccountIcon } from "@/components/ui/account";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { AccountBase } from "plaid";
import { useEffect, useState } from "react";

export default function Accounts() {
  const [accounts, setAccounts] = useState<AccountBase[] | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-2">All Accounts</h2>
          <p className="text-slate-600">
            Manage and view all your connected accounts
          </p>
        </div>
        {/* <ConnectAccountDialog /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts?.map((account) => (
          <Card
            key={account.account_id}
            className="account-card group"
            // onClick={() => onAccountClick(account.id)}
          >
            <div
              className={`h-2 bg-linear-to-r ${getAccountColorClass(
                account.subtype
              )}`}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${getAccountColorClass(
                      account.subtype
                    )} text-white`}
                  >
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 mb-1">
                      {account.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs uppercase">
                        {account.type}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        ••••{account.mask}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Current Balance
                  </div>
                  <div
                    className={`text-2xl ${
                      account.balances.current && account.balances.current >= 0
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
                <div>
                  <div className="text-sm text-slate-500 mb-1">
                    Available Balance
                  </div>
                  <div className="text-2xl text-slate-900">
                    €
                    {account.balances.available
                      ? Math.abs(account.balances.available).toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )
                      : "0.00"}
                  </div>
                </div>
              </div>

              {/* {account.type === "credit" && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Credit Utilization</span>
                    <span className="text-slate-900">
                      {(
                        (Math.abs(account.balances.current) /
                          (Math.abs(account.balances.current) +
                            account.balances.available)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div
                      className="gradient-orange progress-bar"
                      style={{
                        width: `${
                          (Math.abs(account.currentBalance) /
                            (Math.abs(account.currentBalance) +
                              account.availableBalance)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
