import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid/client';
import { getAccessToken } from '@/lib/utils/getAccessToken';
import { TransactionsGetRequest } from 'plaid';

export async function GET(req: NextRequest) {
  try {
    // Get access token for the authenticated user
    const accessToken = await getAccessToken();

    // Fetch transactions from Plaid
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Get account IDs from query parameters
    const { accountId } = Object.fromEntries(req.nextUrl.searchParams.entries());

    // If no accountIds provided, throw an error
    if (!accountId) {
      return NextResponse.json({ error: 'No accountIds provided' }, { status: 400 });
    }

    // Fetch transactions for the specified account IDs
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      options: {
        account_ids: [accountId],
      }
    });

    let transactions = response.data.transactions
    const totalTransaction = response.data.total_transactions

    // Handle pagination if there are more transactions to fetch
    while (transactions.length < totalTransaction) {
      const paginatedRequest: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        options: {
          account_ids: [accountId],
          offset: transactions.length,
        }
      }

      const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest)
      transactions = transactions.concat(paginatedResponse.data.transactions)
    }

    response.data.transactions = transactions

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
