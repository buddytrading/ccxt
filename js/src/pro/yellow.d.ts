import { OHLCV } from "../base/types.js";
export default class yellow {
  describe(): any;
  watchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<OHLCV[]>;
  watchOrders(symbol?: string, params?: {}): Promise<Order[]>;
  fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
  createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
  cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
  cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
  fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
  fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
  fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
  fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
  fetchBalance(params?: {}): Promise<Balances>;
  loadMarkets(): Promise<void>;
}
