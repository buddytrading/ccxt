export default class WebsocketClient {
  connected: boolean;
  dataAvailable: number;
  connect(url: string, protocols?: string): Promise<any>;
  send(data: any): void;
  receive(): Promise<any>;
  disconnect(code?: number, reason?: string): Promise<CloseEvent>;
}
