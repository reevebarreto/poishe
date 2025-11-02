import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { getAccessToken } from '@/lib/utils/getAccessToken';

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const plaidResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(plaidResponse.data);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
