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

    // Fetch transactions for the specified account IDs
    const response = await fetchTransactions(accountId, 365, 0);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
