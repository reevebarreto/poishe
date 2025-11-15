"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Networth } from "@/lib/types";

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
    <div className="p-6 rounded-2xl w-full max-w-md">
      <h2 className="text-xl font-semibold mb-3">Net Worth Summary</h2>
      <div className="flex flex-col gap-2">
        <p>
          💰 Assets:{" "}
          <span className="font-medium text-green-600">
            €{data.assets.toFixed(2)}
          </span>
        </p>
        <p>
          💳 Liabilities:{" "}
          <span className="font-medium text-red-600">
            €{data.liabilities.toFixed(2)}
          </span>
        </p>
        <p className="text-lg mt-2">
          🧾 Net Worth:{" "}
          <span
            className={`font-bold ${
              data.netWorth >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            €{data.netWorth.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}
