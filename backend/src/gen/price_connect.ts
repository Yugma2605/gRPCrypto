// src/gen/price_connect.ts
import { StreamPriceRequest, StreamPriceResponse } from "./price_pb";

// This is a minimal ConnectRPC server & client stub for TypeScript

export interface PriceService {
  StreamPrice(
    request: StreamPriceRequest,
    onData: (response: StreamPriceResponse) => void
  ): void;
}

export class PriceServiceServer implements PriceService {
  private handlers: Map<string, (request: StreamPriceRequest) => AsyncIterable<StreamPriceResponse>> = new Map();

  register(handler: (request: StreamPriceRequest) => AsyncIterable<StreamPriceResponse>) {
    this.handlers.set("StreamPrice", handler);
  }

  StreamPrice(request: StreamPriceRequest, onData: (response: StreamPriceResponse) => void) {
    const handler = this.handlers.get("StreamPrice");
    if (!handler) throw new Error("Handler not registered");
    (async () => {
      for await (const resp of handler(request)) {
        onData(resp);
      }
    })();
  }
}
