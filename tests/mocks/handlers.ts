import { http, HttpResponse } from "msw";

// mock database for tests
const mockBankItems = [
  {
    user_id: "user_123",
    access_token: "test-access-token-1",
    item_id: "item-1",
  },
  {
    user_id: "user_123",
    access_token: "test-access-token-2",
    item_id: "item-2",
  },
];

export const handlers = [
  //
  // 🔐 AUTH MOCK
  //
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: { id: "user_123", email: "test@example.com" },
    });
  }),

  //
  // 🏦 /api/plaid/balance
  //
  http.get("/api/plaid/balance", () => {
    return HttpResponse.json([
      {
        account_id: "acc-1",
        name: "Primary Checking",
        balances: { current: 1500 },
        type: "depository",
        subtype: "checking",
      },
      {
        account_id: "acc-2",
        name: "Savings",
        balances: { current: 3000 },
        type: "depository",
        subtype: "savings",
      },
    ]);
  }),

  //
  // 🔗 /api/plaid/create-link-token
  //
  http.post("/api/plaid/create-link-token", async () => {
    return HttpResponse.json({
      link_token: "mock-link-token-123",
    });
  }),

  //
  // 🔄 /api/plaid/exchange-token
  //
  http.post("/api/plaid/exchange-token", async ({ request }) => {
    const body = (await request.json()) as { public_token?: string };

    if (!body?.public_token) {
      return HttpResponse.json(
        { error: "Missing public_token" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
    });
  }),

  //
  // 📊 /api/plaid/net-worth
  //
  http.get("/api/plaid/net-worth", () => {
    return HttpResponse.json({
      assets: 4500,
      liabilities: 0,
      netWorth: 4500,
    });
  }),

  //
  // 🍕 /api/plaid/spending-summary
  //
  http.get("/api/plaid/spending-summary", ({ request }) => {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return HttpResponse.json(
        { error: "No accountIds provided" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      FOOD_AND_DRINK: 85.25,
      TRANSPORTATION: 47.8,
      GENERAL_MERCHANDISE: 150.0,
    });
  }),

  //
  // 🧾 /api/plaid/transactions
  //
  http.get("/api/plaid/transactions", ({ request }) => {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");

    if (!accountId) {
      return HttpResponse.json(
        { error: "No accountIds provided" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      total_transactions: 3,
      transactions: [
        {
          account_id: accountId,
          name: "McDonald's",
          amount: 12.5,
          date: "2025-02-20",
          personal_finance_category: { primary: "FOOD_AND_DRINK" },
        },
        {
          account_id: accountId,
          name: "Luas Ticket",
          amount: 3.2,
          date: "2025-02-19",
          personal_finance_category: { primary: "TRANSPORTATION" },
        },
        {
          account_id: accountId,
          name: "Tesco",
          amount: 25.0,
          date: "2025-02-18",
          personal_finance_category: { primary: "GENERAL_MERCHANDISE" },
        },
      ],
    });
  }),

  //
  // 🔌 /api/plaid/status
  //
  http.get("/api/plaid/status", () => {
    return HttpResponse.json({ connected: true });
  }),
];
