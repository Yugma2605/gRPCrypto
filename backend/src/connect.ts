// connect.ts
import { createConnectRouter } from "@connectrpc/connect";
import { PriceService } from "./gen/price_pb"; // adjust path if needed
import { TradingViewScraper } from "./scrapers/tradingViewScraper";

const routes = (router: ReturnType<typeof createConnectRouter>) =>
  router.service(PriceService, {
    async *streamPrice(req, ctx) {
      console.log("Received request for ticker:", req.ticker);
      const scraper = new TradingViewScraper();
      await scraper.init(req.ticker);

      try {
        // Keep streaming until client disconnects
        while (!ctx.signal.aborted) {
          const price = await scraper.getPrice(req.ticker);
          if (price) {
            yield { ticker: req.ticker, price };
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      } finally {
        await scraper.close();
      }
    },
  });

export default routes;
