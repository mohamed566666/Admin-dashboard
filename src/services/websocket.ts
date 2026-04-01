type EventHandler = (data: any) => void;

interface WsMessage {
  event: string;
  data: any;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private managerId: number | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnect = 5;
  private readonly reconnectMs = 3000;
  private handlers: Map<string, EventHandler[]> = new Map();

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(managerId: number): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[WS] Already connected");
      return;
    }

    this.managerId = managerId;
    const url =
      (import.meta as any).env.VITE_WS_URL || "ws://localhost:8000/ws";
    console.log("[WS] Connecting to:", url, "manager:", managerId);

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[WS] ✅ Connection opened");
      this.reconnectAttempts = 0;
      // Join manager room immediately after connect
      const joinMsg = { event: "join_room", data: { manager_id: managerId } };
      console.log("[WS] Sending join_room:", joinMsg);
      this.send(joinMsg);
    };

    this.ws.onmessage = ({ data: raw }) => {
      try {
        const msg: WsMessage = JSON.parse(raw);
        console.log("[WS] 📨 Received message:", msg.event, msg.data);

        const handlers = this.handlers.get(msg.event);
        if (handlers && handlers.length > 0) {
          console.log(
            `[WS] Calling ${handlers.length} handler(s) for: ${msg.event}`,
          );
          handlers.forEach((h) => h(msg.data));
        } else {
          console.log(`[WS] No handler registered for: ${msg.event}`);
        }
      } catch (e) {
        console.error("[WS] Parse error:", e);
      }
    };

    this.ws.onclose = ({ code, reason }) => {
      console.log("[WS] ❌ Connection closed. Code:", code, "Reason:", reason);
      this._scheduleReconnect();
    };

    this.ws.onerror = (e) => {
      console.error("[WS] Error:", e);
    };
  }

  disconnect(): void {
    console.log("[WS] Disconnecting...");
    this.reconnectAttempts = this.maxReconnect; // stop auto-reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(msg: WsMessage): void {
    if (!this.isConnected) {
      console.warn(
        "[WS] Cannot send — not connected. State:",
        this.ws?.readyState,
      );
      return;
    }
    console.log("[WS] 📤 Sending message:", msg.event, msg.data);
    this.ws!.send(JSON.stringify(msg));
  }

  sendHeartbeat(sessionId: string): void {
    this.send({
      event: "heartbeat",
      data: { session_id: sessionId, status: "active" },
    });
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    console.log(
      `[WS] Registered handler for: ${event}, total: ${this.handlers.get(event)!.length}`,
    );
  }

  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event);
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx !== -1) {
      list.splice(idx, 1);
      console.log(
        `[WS] Removed handler for: ${event}, remaining: ${list.length}`,
      );
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnect || !this.managerId) {
      console.log("[WS] Max reconnects reached or no managerId, giving up");
      return;
    }
    this.reconnectAttempts++;
    console.log(
      `[WS] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnect} in ${this.reconnectMs}ms`,
    );
    setTimeout(() => {
      if (this.managerId) {
        console.log("[WS] Attempting reconnect...");
        this.connect(this.managerId);
      }
    }, this.reconnectMs);
  }
}

export const wsService = new WebSocketService();
