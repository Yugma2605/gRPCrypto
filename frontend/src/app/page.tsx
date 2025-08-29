"use client"

import { useState } from "react";
import { useTickerPrices } from "../hooks/useTickers";
import TickerItem from "../components/TickerItem";

export default function Home() {
  const { prices, loading, addTicker, removeTicker } = useTickerPrices();
  const [tickerInput, setTickerInput] = useState("");

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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>

      <ul className="w-full max-w-md">
        {sortedTickers.map((ticker) => (
          <TickerItem
            key={ticker}
            ticker={ticker}
            price={prices[ticker]}
            isLoading={loading[ticker]}
            onRemove={() => removeTicker(ticker)}
          />
        ))}
      </ul>
    </main>
  );
}
