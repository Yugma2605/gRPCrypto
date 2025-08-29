// hooks/useTickerPrices.ts
import { useEffect, useState } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { PriceService } from "../gen/price_pb";

export function useTickerPrices() {
  const [client, setClient] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [controllers, setControllers] = useState<Record<string, AbortController>>({});

  useEffect(() => {
    const transport = createConnectTransport({ baseUrl: "http://localhost:8085" });
    setClient(createClient(PriceService, transport));
  }, []);

  const addTicker = async (ticker: string) => {
    if (!client || prices[ticker]) return;
    setLoading((prev) => ({ ...prev, [ticker]: true }));

    const controller = new AbortController();
    setControllers((prev) => ({ ...prev, [ticker]: controller }));
    setPrices((prev) => ({ ...prev, [ticker]: 0 }));

    try {
      for await (const res of client.streamPrice({ ticker }, { signal: controller.signal })) {
        setLoading((prev) => ({ ...prev, [ticker]: false }));
        setPrices((prev) => ({ ...prev, [ticker]: res.price }));
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        console.error("Stream error:", err);
      }
    }
  };

  const removeTicker = (ticker: string) => {
    controllers[ticker]?.abort();
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
    setLoading((prev) => {
      const copy = { ...prev };
      delete copy[ticker];
      return copy;
    });
  };

  return { prices, loading, addTicker, removeTicker };
}
