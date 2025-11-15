"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Networth } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function NetWorthCard() {
  const [data, setData] = useState<Networth | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/plaid/net-worth");
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Card className="gradient-blue text-white stat-card">
      <CardHeader>
        <CardTitle className="text-white">Total Net Worth</CardTitle>
        <CardDescription className="text-blue-100">
          Your financial overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl">
          €
          {data.netWorth.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400/30">
          <div>
            <div className="text-blue-100 text-sm mb-1">Total Assets</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-xl">
                €
                {data.assets.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div>
            <div className="text-blue-100 text-sm mb-1">Total Liabilities</div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-300" />
              <span className="text-xl">
                €
                {data.liabilities.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
