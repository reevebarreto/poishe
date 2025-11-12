import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid/client";
import { createClient } from "@/lib/supabase/server";
import { AccountBase } from "plaid";

export async function GET() {
  try {
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

    const accounts: AccountBase[] = [];

    for (const item of bankItems) {
      const balanceRes = await plaidClient.accountsBalanceGet({
        access_token: item.access_token,
      });

      for (const account of balanceRes.data.accounts) {
        accounts.push(account);
      }
    }

    return NextResponse.json(accounts);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
