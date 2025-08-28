import { chromium, Browser, Page } from "playwright";

export class TradingViewScraper {
  private browser?: Browser;
  private page?: Page;

  async init(ticker: string) {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();

    const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async getPrice(ticker: string): Promise<number | null> {
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
    await this.browser?.close();
  }
}
