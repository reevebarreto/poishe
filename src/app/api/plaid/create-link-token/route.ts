import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { CountryCode, Products } from 'plaid';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const { data: { user } , error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a link token
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id},
      client_name: 'Poishe',
      products: [
        Products.Auth,
        Products.Transactions,
      ],
      country_codes: [CountryCode.Ie],
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
