import { chromium, Browser, Page } from "playwright";

export class TradingViewScraper {
  private static browser?: Browser; // one shared browser across all scrapers
  private page?: Page;

  // Ensure the shared browser is started once
  private static async getBrowser(): Promise<Browser> {
    if (!TradingViewScraper.browser) {
      TradingViewScraper.browser = await chromium.launch({ headless: false });
    }
    return TradingViewScraper.browser;
  }

  async init(ticker: string) {
    const browser = await TradingViewScraper.getBrowser();
    this.page = await browser.newPage();

    const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    // Check if page shows "not found" error
    const errorElement = await this.page.$("h1.tv-http-error-page__title");
    if (errorElement) {
      const errorText = await errorElement.textContent();
      await this.close(); // Close only this page, keep browser alive
      throw new Error(errorText?.trim() || "Invalid ticker");
    }
  }

  async getPrice(): Promise<number | null> {
    if (!this.page) return null;

    const element = await this.page.$("span.js-symbol-last");
    if (!element) return null;

    const outerText = await element.evaluate(
      (el) => el.childNodes[0].textContent?.trim() ?? ""
    );
    const innerText = await element.evaluate(
      (el) => el.querySelector("span")?.textContent?.trim() ?? ""
    );

    const priceStr = `${outerText}${innerText}`;
    return Number(priceStr.replace(/,/g, ""));
  }

  async close() {
    // Close only this page, keep shared browser running
    await this.page?.close();
    this.page = undefined;
  }

  // Optional: shutdown everything when server exits
  static async shutdown() {
    if (TradingViewScraper.browser) {
      await TradingViewScraper.browser.close();
      TradingViewScraper.browser = undefined;
    }
  }
}
