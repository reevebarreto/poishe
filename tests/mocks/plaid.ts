export const mockTransactions = [
  {
    account_id: "acc-1",
    name: "Tesco",
    amount: 20,
    date: "2025-02-10",
    personal_finance_category: { primary: "GENERAL_MERCHANDISE" },
  },
  {
    account_id: "acc-1",
    name: "Starbucks",
    amount: 5.5,
    date: "2025-02-11",
    personal_finance_category: { primary: "FOOD_AND_DRINK" },
  },
];

export const plaidClient = {
  transactionsGet: jest.fn().mockResolvedValue({
    data: {
      transactions: mockTransactions,
      total_transactions: mockTransactions.length,
    },
  }),
  accountsBalanceGet: jest.fn().mockResolvedValue({
    data: {
      accounts: [
        {
          account_id: "acc-1",
          name: "Checking",
          balances: { current: 1000 },
          type: "depository",
        },
      ],
    },
  }),
};
