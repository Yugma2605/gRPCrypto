## Project Description
A full-stack web application that streams real-time cryptocurrency prices from https://tradingview.com. The application will consist of a Node.js backend and a Next.js frontend.

A demonstration of the expected functionality is available in the video file `demo.gif` file in this repository.

## Tech Stack
You are required to use the following technologies:
*   TypeScript
*   Next.js
*   Node.js
    *   `tsx` for TypeScript execution
*   `pnpm` for package management (do not use `npm`)
*   ConnectRPC for communication between the frontend and backend
*   Playwright to stream price data from TradingView via the Node.js server


#### Data Streaming
*   Stream live cryptocurrency prices directly from TradingView using Playwright.
*   Target URLs follow the format: `https://www.tradingview.com/symbols/{ticker}/?exchange=BINANCE`.
    *   The `{ticker}` variable represents a valid cryptocurrency symbol (e.g., BTCUSD, ETHUSD, SOLUSD). A complete list of tickers is available at https://www.tradingview.com/markets/cryptocurrencies/prices-all/
    *   For implementation simplicity, the `exchange` is standardized to BINANCE.


#### General
*   **Visibility:** Run Playwright in headed mode (not headless) so we can observe the browser automation in action.
*   **Logging:** Use `console.*` on both the backend and frontend to log key events. This helps us understand the application's behavior.
*   **UI:** The list of tickers displayed on the user interface must be sorted alphabetically.

*   **Functionality**
    *   Correct implementation of adding and removing tickers.
    *   Accurate, real-time price updates streamed from TradingView.
*   **Code Quality**
    *   Clean, simple, and maintainable code.
    *   Graceful handling of corner cases and network errors.
*   **Scalability & Efficiency:**
    *   The server architecture must be scalable to support many concurrent clients, primarily through the efficient reuse and sharing of Playwright resources.
    *   While micro-optimizations are not required, the solution should avoid significant performance bottlenecks.
*   **Low-Latency Price Streaming**
    *   Price updates from the TradingView page should be reflected on the client with minimal delay.
    *   We prefer a push-based architecture over polling, which can introduce unnecessary delays.

1.  Run `pnpm install --recursive` to install all dependencies.
2.  Run `./run.sh` to launch the application.
    *   This single script should handle all necessary steps, including code generation (e.g., `buf generate`) and starting both the frontend and backend servers.
3.  Open `http://localhost:3000` in a web browser.
4.  Test the functionality by adding and removing various tickers.
