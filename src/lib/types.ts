import { Transaction } from "plaid";

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

export type TransactionWithAccountName = Transaction & {
  account_name: string;
  category: string;
};

export type SpendingTrendPoint = {
  date: string; // ISO date
  amount: number;
};
