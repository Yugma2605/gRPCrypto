// connect.ts
import { createConnectRouter } from "@connectrpc/connect";
import { PriceService } from "./gen/price_pb"; // adjust path if needed
import { TradingViewScraper } from "./scrapers/tradingViewScraper";

const routes = (router: ReturnType<typeof createConnectRouter>) =>
  router.service(PriceService, {
    async *streamPrice(req, ctx) {
      console.log("Received request for ticker:", req.ticker);
      const scraper = new TradingViewScraper();

      try {
        await scraper.init(req.ticker);

        // Keep streaming until client disconnects
        while (!ctx.signal.aborted) {
          const price = await scraper.getPrice(req.ticker);
          if (price !== null) {
            yield { ticker: req.ticker, price };
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (err: any) {
        // 🔹 If scraper throws invalid ticker error
        yield { ticker: req.ticker, price: -1 };
        console.error("Scraper error:", err.message);
      } finally {
        await scraper.close();
      }
    },
  });

export default routes;
