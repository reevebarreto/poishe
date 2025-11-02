import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const access_token = response.data.access_token;

    return NextResponse.json({ access_token });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
