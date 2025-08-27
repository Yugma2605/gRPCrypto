// src/gen/price_pb.ts
export interface StreamPriceRequest {
  ticker: string;
}

export interface StreamPriceResponse {
  ticker: string;
  price: number;
}
