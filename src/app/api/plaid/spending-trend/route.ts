import { fetchTransactions } from "@/lib/plaid/fetchTransactions";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Transaction } from "plaid";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Fetch all linked bank items for the user
    const { data: bankItems, error } = await supabase
      .from("bank_items")
      .select("access_token")
      .eq("user_id", user.id);

    if (error) throw new Error("Error loading bank items");
    if (!bankItems?.length) return NextResponse.json([]);

    const allTx: Transaction[] = [];

    // Gather transactions from each item
    for (const item of bankItems) {
      const tx = await fetchTransactions(null, 30, 0, item.access_token);
      allTx.push(...tx.data.transactions);
    }

    // Build daily trend
    const trendMap: Record<string, number> = {};

    for (const tx of allTx) {
      // ignore credits
      if (tx.amount <= 0) continue;

      const date = tx.date; // ISO date
      if (!trendMap[date]) trendMap[date] = 0;
      trendMap[date] += tx.amount;
    }

    // Convert to array sorted by date
    const trend = Object.entries(trendMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(trend);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
