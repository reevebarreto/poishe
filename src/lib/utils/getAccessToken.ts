import { createClient } from "@/lib/supabase/server";

/**
 * Fetch the Plaid access token for the current authenticated user.
 * Throws an error if the user is not authenticated or no linked account exists.
 */
export async function getAccessToken() {
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
  const { data, error } = await supabase
    .from("bank_items")
    .select("access_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Supabase error fetching access token:", error);
    throw new Error("Database error");
  }

  if (!data) {
    throw new Error("No linked Plaid account found");
  }

  return data.access_token as string;
}
