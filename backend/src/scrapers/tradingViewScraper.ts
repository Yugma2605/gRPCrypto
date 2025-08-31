import { chromium, Browser, Page } from "playwright";

interface PageEntry {
  page: Page;
  subscribers: number;
}

export class TradingViewScraper {
  private static browser?: Browser;
  private static pages: Map<string, PageEntry> = new Map();

  private ticker?: string;

  private static async getBrowser(): Promise<Browser> {
    if (!TradingViewScraper.browser) {
      TradingViewScraper.browser = await chromium.launch({ headless: false });
    }
    return TradingViewScraper.browser;
  }

  async init(ticker: string) {
    this.ticker = ticker;
    const browser = await TradingViewScraper.getBrowser();

    if (TradingViewScraper.pages.has(ticker)) {
      // already exists → just increase subscription count
      TradingViewScraper.pages.get(ticker)!.subscribers++;
      return;
    }

    // create new page
    const page = await browser.newPage();
    TradingViewScraper.pages.set(ticker, { page, subscribers: 1 });

    const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const errorElement = await page.$("h1.tv-http-error-page__title");
    if (errorElement) {
      const errorText = await errorElement.textContent();
      await page.close();
      TradingViewScraper.pages.delete(ticker);
      throw new Error(errorText?.trim() || "Invalid ticker");
    }
  }

  async getPrice(): Promise<number | null> {
    if (!this.ticker) return null;
    const entry = TradingViewScraper.pages.get(this.ticker);
    if (!entry) return null;

    const element = await entry.page.$("span.js-symbol-last");
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
    if (!this.ticker) return;
    const entry = TradingViewScraper.pages.get(this.ticker);
    if (!entry) return;

    entry.subscribers--;
    if (entry.subscribers <= 0) {
      // last subscriber gone → really close the page
      await entry.page.close();
      TradingViewScraper.pages.delete(this.ticker);
    }
  }

  static async shutdown() {
    for (const entry of TradingViewScraper.pages.values()) {
      await entry.page.close();
    }
    TradingViewScraper.pages.clear();

    if (TradingViewScraper.browser) {
      await TradingViewScraper.browser.close();
      TradingViewScraper.browser = undefined;
    }
  }
}
