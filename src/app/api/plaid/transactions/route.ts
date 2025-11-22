import { NextRequest, NextResponse } from "next/server";
import { fetchTransactions } from "@/lib/plaid/fetchTransactions";
import { createClient } from "@/lib/supabase/server";
import { Transaction } from "plaid";

export async function GET(req: NextRequest) {
  try {
    // Get account IDs from query parameters
    const { accountId } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // ===== CASE 1: Single account =====
    if (accountId) {
      // Fetch transactions for the specified account ID
      const response = await fetchTransactions(accountId, 365, 0);

      // Create lookup: account_id → name
      const accountMap = Object.fromEntries(
        response.data.accounts.map((acc) => [acc.account_id, acc.name])
      );

      // Add account_name to each transaction
      const txWithNames = response.data.transactions.map((tx) => ({
        ...tx,
        category: tx.personal_finance_category?.primary
          .toLowerCase()
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        account_name: accountMap[tx.account_id] ?? "Unknown Account",
      }));

      return NextResponse.json({
        ...response.data,
        transactions: txWithNames,
      });
    }

    // ===== CASE 2: All accounts =====
    const supabase = await createClient();
    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Retrieve access token from bank_items
    const { data: bankItems, error } = await supabase
      .from("bank_items")
      .select("access_token")
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error fetching access token:", error);
      throw new Error("Database error");
    }

    if (!bankItems?.length) {
      return NextResponse.json({ assets: 0, liabilities: 0, netWorth: 0 });
    }

    const allTx: Transaction[] = [];
    const allAccounts: Record<string, string> = {};

    // Fetch for each access token
    for (const item of bankItems) {
      const plaidRes = await fetchTransactions(null, 30, 0, item.access_token);

      // Merge accounts into lookup map
      plaidRes.data.accounts.forEach((acc) => {
        allAccounts[acc.account_id] = acc.name;
      });

      // Merge transactions
      allTx.push(...plaidRes.data.transactions);
    }

    // Map account names
    const txWithNames = allTx.map((tx) => ({
      ...tx,
      category: tx.personal_finance_category?.primary
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      account_name: allAccounts[tx.account_id] ?? "Unknown Account",
    }));

    return NextResponse.json({ transactions: txWithNames });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
