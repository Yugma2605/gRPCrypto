// src/server.ts
import { chromium } from "playwright";
import { PriceServiceServer } from "./gen/price_connect";
import { StreamPriceResponse, StreamPriceRequest } from "./gen/price_pb";

const server = new PriceServiceServer();

server.register(async function* (request: StreamPriceRequest) {
  // Launch Playwright
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const ticker = request.ticker.toUpperCase();
  const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  while (true) {
    try {
      // Get the parent span (outer part of price)
      const element = await page.$("span.js-symbol-last");

      if (element) {
        // Outer text: first child (integer part with commas)
        const outerText = await element.evaluate(
          (el) => el.childNodes[0].textContent?.trim() ?? ""
        );

        // Inner text: nested <span> (decimal part)
        const innerText = await element.evaluate(
          (el) => el.querySelector("span")?.textContent?.trim() ?? ""
        );

        // Merge them into a full price string
        const priceStr = `${outerText}${innerText}`; // e.g. "112,2" + "91.69" = "112,291.69"
        const price = Number(priceStr.replace(/,/g, "")); // -> 112291.69

        yield { ticker, price } as StreamPriceResponse;
      } else {
        console.warn("Price element not found on page");
      }

      await new Promise((res) => setTimeout(res, 2000));
    } catch (err) {
      console.error("Error scraping price:", err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
});

// Example usage
const request: StreamPriceRequest = { ticker: "BTCUSD" };
server.StreamPrice(request, (resp) => {
  console.log("Price update:", resp);
});
