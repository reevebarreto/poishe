import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { CountryCode, Products } from 'plaid';

export async function POST(req: NextRequest) {
  try {
    const { client_user_id } = await req.json();
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id},
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
