import { CreditCard, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { AccountSubtype } from "plaid";

export const getAccountIcon = (type: string) => {
  switch (type) {
    case AccountSubtype.Checking:
      return <Wallet className="w-5 h-5" />;
    case AccountSubtype.Savings:
      return <PiggyBank className="w-5 h-5" />;
    case AccountSubtype.CreditCard:
      return <CreditCard className="w-5 h-5" />;
    case AccountSubtype.MutualFund:
      return <TrendingUp className="w-5 h-5" />;
    default:
      return <Wallet className="w-5 h-5" />;
  }
};

export const getAccountColorClass = (type: string | null) => {
  switch (type) {
    case "checking":
      return "gradient-blue";
    case "savings":
      return "gradient-green";
    case "credit":
      return "gradient-orange";
    case "investment":
      return "gradient-purple";
    default:
      return "bg-gradient-to-br from-slate-500 to-slate-600";
  }
};
