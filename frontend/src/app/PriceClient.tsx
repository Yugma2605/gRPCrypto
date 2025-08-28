"use client";

import { useEffect, useState } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { PriceService } from "../gen/price_pb";

export default function PriceClient() {
  const [prices, setPrices] = useState<string[]>([]);

  useEffect(() => {
    const transport = createConnectTransport({
      baseUrl: "http://localhost:8085", // backend URL
    });
    const client = createClient(PriceService, transport);

    const fetchStream = async () => {
      try {
        for await (const res of client.streamPrice({ ticker: "AAPL" })) {
          setPrices((prev) => [
            ...prev,
            `${res.ticker}: $${res.price.toFixed(2)} @ ${new Date(
              Number(res)
            ).toLocaleTimeString()}`,
          ]);
        }
      } catch (err) {
        console.error("Stream error:", err);
      }
    };

    fetchStream();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold"> Live Price Updates</h2>
      <ul className="mt-2 list-disc pl-6">
        {prices.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
