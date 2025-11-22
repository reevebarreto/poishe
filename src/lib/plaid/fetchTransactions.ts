import { TransactionsGetRequest } from "plaid";
import { plaidClient } from "./client";
import { getAccessToken } from "@/lib/utils/getAccessToken";

export async function fetchTransactions(
  accountId: string | null,
  timeInteval: number = 30,
  offset: number = 0,
  accessTokenOverride?: string
) {
  try {
    // Get access token for the authenticated user
    const accessToken = accessTokenOverride ?? (await getAccessToken());

    // Validate accountId
    // if (!accountId) {
    //   throw new Error("No accountId provided");
    // }

    // Calculate start date based on the time interval
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeInteval);

    // Initial request to fetch transactions
    const requestBody: TransactionsGetRequest = {
      access_token: accessToken,
      start_date: startDate.toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      options: { account_ids: accountId ? [accountId] : undefined, offset },
    };

    const response = await plaidClient.transactionsGet(requestBody);

    // Handle pagination to fetch all transactions
    let transactions = response.data.transactions;
    const totalTransaction = response.data.total_transactions;

    // Handle pagination if there are more transactions to fetch
    while (transactions.length < totalTransaction) {
      const requestBody: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate.toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        options: {
          account_ids: accountId ? [accountId] : undefined,
          offset: transactions.length,
        },
      };
      const paginatedResponse = await plaidClient.transactionsGet(requestBody);
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    // Return the complete list of transactions
    response.data.transactions = transactions;

    return response;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}
