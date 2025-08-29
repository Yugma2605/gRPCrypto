import { chromium, Browser, Page } from "playwright";

export class TradingViewScraper {
  private static browser?: Browser; // one shared browser
  private static pages: Map<string, Page> = new Map(); // ticker -> shared Page

  private page?: Page;
  private ticker?: string;

  // Ensure the shared browser is started once
  private static async getBrowser(): Promise<Browser> {
    if (!TradingViewScraper.browser) {
      TradingViewScraper.browser = await chromium.launch({ headless: false });
    }
    return TradingViewScraper.browser;
  }

  async init(ticker: string) {
    this.ticker = ticker;
    const browser = await TradingViewScraper.getBrowser();

    // Check if a page for this ticker already exists
    if (TradingViewScraper.pages.has(ticker)) {
      this.page = TradingViewScraper.pages.get(ticker)!;
      return; // reuse
    }

    // Otherwise, create a new page
    this.page = await browser.newPage();
    TradingViewScraper.pages.set(ticker, this.page);

    const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });

    // Check if page shows "not found" error
    const errorElement = await this.page.$("h1.tv-http-error-page__title");
    if (errorElement) {
      const errorText = await errorElement.textContent();
      await this.close(); // Close only this page
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
    if (this.page && this.ticker) {
      // remove from map
      TradingViewScraper.pages.delete(this.ticker);
      await this.page.close();
      this.page = undefined;
    }
  }

  // Optional: shutdown everything when server exits
  static async shutdown() {
    for (const page of TradingViewScraper.pages.values()) {
      await page.close();
    }
    TradingViewScraper.pages.clear();

    if (TradingViewScraper.browser) {
      await TradingViewScraper.browser.close();
      TradingViewScraper.browser = undefined;
    }
  }
}
