import { NextRequest, NextResponse } from "next/server";
import { fetchTransactions } from "@/lib/plaid/fetchTransactions";
import { getAllAccessTokens } from "@/lib/utils/getAllAccessTokens";

export async function GET(req: NextRequest) {
  try {
    // Get account IDs from query parameters
    const { accountId } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // If user wants summary for a specific account
    if (accountId) {
      // Fetch transactions from Plaid
      const response = await fetchTransactions(accountId, 365, 0);

      // Aggregate by top-level category
      const summary: Record<string, number> = {};
      for (const tx of response.data.transactions) {
        if (tx.amount <= 0) continue; // skip income/refunds
        const category =
          tx.personal_finance_category?.primary ?? "Uncategorized";
        summary[category] = (summary[category] ?? 0) + tx.amount;
      }

      const summaryArray = Object.entries(summary).map(
        ([category, amount]) => ({
          // convert category to capitalized form and also remove underscores
          category: category
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          amount,
        })
      );

      return NextResponse.json(summaryArray);
    }

    // otherwise fetch summary for all accounts

    const accessTokens = await getAllAccessTokens();

    const combinedSummary: Record<string, number> = {};

    for (const token of accessTokens) {
      // Get accounts for that Plaid item
      const txResponse = await fetchTransactions(null, 365, 0, token);

      for (const tx of txResponse.data.transactions) {
        if (tx.amount <= 0) continue;
        const category =
          tx.personal_finance_category?.primary ?? "Uncategorized";
        combinedSummary[category] =
          (combinedSummary[category] ?? 0) + tx.amount;
      }
    }

    const summaryArray = Object.entries(combinedSummary).map(
      ([category, amount]) => ({
        // convert category to capitalized form and also remove underscores
        category: category
          .toLowerCase()
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        amount,
      })
    );

    return NextResponse.json(summaryArray);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
