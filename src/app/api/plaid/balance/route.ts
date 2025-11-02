import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { getAccessToken } from '@/lib/utils/getAccessToken';

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    const plaidResponse = await plaidClient.accountsBalanceGet({ access_token: accessToken });
    return NextResponse.json(plaidResponse.data);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
