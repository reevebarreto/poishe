import { createClient } from "@/lib/supabase/server";

export async function getAllAccessTokens() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bank_items")
    .select("access_token")
    .eq("user_id", user.id);

  if (error) throw error;

  return data.map((row) => row.access_token);
}
