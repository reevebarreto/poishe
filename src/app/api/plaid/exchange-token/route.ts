import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const { data: { user } , error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Exchange the public token for an access token
    const { public_token } = await req.json();
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;
    const item_id = response.data.item_id;

    await supabase.from('bank_items').insert({
      user_id: user.id,
      access_token,
      item_id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
