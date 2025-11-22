"use client";

import { getCategoryColorClass } from "@/components/ui/account";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionWithAccountName } from "@/lib/types";
import { formatDate } from "@/lib/utils/formatDate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { ArrowDownRight, ArrowUpRight, Calendar, Filter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Transactions() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId");

  const [transactions, setTransactions] = useState<
    TransactionWithAccountName[]
  >([]);

  const categories = Array.from(
    new Set(transactions.map((tx) => tx.category || "Uncategorized"))
  );

  const filteredTransactions = useMemo(() => {
    let filtered = accountId
      ? transactions.filter((tx) => tx.account_id === accountId)
      : transactions;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((tx) => tx.category === categoryFilter);
    }

    const daysAgo = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    filtered = filtered.filter((tx) => new Date(tx.date) >= cutoffDate);

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, accountId, categoryFilter, dateRange]);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const url = accountId
          ? `/api/plaid/transactions?accountId=${accountId}`
          : `/api/plaid/transactions`;

        const res = await axios.get(url);
        setTransactions(res.data.transactions || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTx();
  }, [accountId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">
          {accountId ? `${accountId} Transactions` : "All Transactions"}
        </h2>
        <p className="text-slate-600">
          View and filter your transaction history
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-slate-900">
                Filter Transactions
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No transactions found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    {!accountId && <TableHead>Account</TableHead>}
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    return (
                      <TableRow
                        key={transaction.transaction_id}
                        className="hover:bg-slate-50"
                      >
                        <TableCell className="text-slate-600">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                transaction.amount >= 0
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.amount >= 0 ? (
                                <ArrowDownRight className="w-4 h-4" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-slate-900">
                              {transaction.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getCategoryColorClass(
                              transaction.category || "Uncategorized"
                            )}
                          >
                            {transaction.category || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {transaction.account_name}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`${
                              transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount >= 0 ? "+" : "-"}€
                            {Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
