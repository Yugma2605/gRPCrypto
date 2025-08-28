"use client";

import { useEffect, useState } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { PriceService } from "../gen/price_pb"; // adjust path if needed

type PriceUpdate = {
  ticker: string;
  price: number;
};

export default function Home() {
  const [tickerInput, setTickerInput] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [client, setClient] = useState<any>(null);

  // Initialize Connect client
  useEffect(() => {
    const transport = createConnectTransport({
      baseUrl: "http://localhost:8085", // your backend
    });
    const c = createClient(PriceService, transport);
    setClient(c);
  }, []);

  const [controllers, setControllers] = useState<Record<string, AbortController>>({});

  const addTicker = async (ticker: string) => {
    if (!client || !ticker) return;
    if (prices[ticker]) return;

    const controller = new AbortController();
    setControllers((prev) => ({ ...prev, [ticker]: controller }));
    setPrices((prev) => ({ ...prev, [ticker]: 0 }));

    try {
      for await (const res of client.streamPrice({ ticker }, { signal: controller.signal })) {
        setPrices((prev) => ({
          ...prev,
          [ticker]: res.price,
        }));
      }
    } catch (err: any) {
      // Ignore abort/cancel errors
      if (err.code === "aborted" || err.message?.includes("canceled") || err.message?.includes("aborted")) {
        console.log(`Stream for ${ticker} canceled`);
      } else {
        console.error("Stream error:", err);
      }
    }
  };

  const removeTicker = (ticker: string) => {
    // Abort backend stream
    controllers[ticker]?.abort();

    // Clean up state
    setControllers((prev) => {
      const copy = { ...prev };
      delete copy[ticker];
      return copy;
    });
    setPrices((prev) => {
      const copy = { ...prev };
      delete copy[ticker];
      return copy;
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      addTicker(tickerInput.trim().toUpperCase());
      setTickerInput("");
    }
  };

  const sortedTickers = Object.keys(prices).sort();

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-4">📈 Live Stock Prices</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={tickerInput}
          onChange={(e) => setTickerInput(e.target.value)}
          placeholder="Enter ticker (e.g. AAPL)"
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>

      <ul className="w-full max-w-md">
        {sortedTickers.map((ticker) => {
          const price = prices[ticker];
          return (
            <li
              key={ticker}
              className="flex justify-between items-center border-b py-2"
            >
              <span>
                <strong>{ticker}</strong>:{" "}
                {price === -1 ? (
                  <span className="text-red-500">Ticker does not exist</span>
                ) : (
                  `$${price.toFixed(2)}`
                )}
              </span>
              <button
                onClick={() => removeTicker(ticker)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>

    </main>
  );
}
