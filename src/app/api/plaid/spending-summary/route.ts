import { NextRequest, NextResponse } from "next/server";
import { fetchTransactions } from "@/lib/plaid/fetchTransactions";

export async function GET(req: NextRequest) {
  try {
    // Get account IDs from query parameters
    const { accountId } = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    );

    // If no accountIds provided, throw an error
    if (!accountId) {
      return NextResponse.json(
        { error: "No accountIds provided" },
        { status: 400 }
      );
    }

    // Fetch transactions from Plaid
    const response = await fetchTransactions(accountId, 365, 0);

    // Aggregate by top-level category
    const summary: Record<string, number> = {};
    for (const tx of response.data.transactions) {
      if (tx.amount <= 0) continue; // skip income/refunds
      const category = tx.personal_finance_category?.primary ?? "Uncategorized";
      summary[category] = (summary[category] ?? 0) + tx.amount;
    }

    return NextResponse.json(summary);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
