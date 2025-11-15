export type Networth = {
  assets: number;
  liabilities: number;
  netWorth: number;
};

export type CategorySpending = {
  category: string;
  amount: number;
  color?: string;
};

export type SpendingSummary = Record<string, number>;
