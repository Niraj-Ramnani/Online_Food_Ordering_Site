import { getAccessToken } from "@/utils/auth";
import { WebSocketEvent } from "@/types/notification";

type WebSocketListener = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Set<WebSocketListener> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isExplicitlyClosed = false;

  public connect(): void {
    if (typeof window === "undefined") return;

    const token = getAccessToken();
    if (!token) {
      this.disconnect();
      return;
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isExplicitlyClosed = false;

    // Use WS URL from env or build relative to current host
    const wsBase =
      process.env.NEXT_PUBLIC_WS_URL ||
      (window.location.protocol === "https:" ? "wss:" : "ws:") +
        `//${window.location.hostname}:8000/ws/orders`;

    const wsUrl = `${wsBase}?token=${encodeURIComponent(token)}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        // Start ping interval
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("ping");
          }
        }, 30000);
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "pong") return;
          this.notifyListeners(parsed);
        } catch {
          // Non-JSON or malformed message
        }
      };

      this.socket.onclose = () => {
        this.cleanupTimers();
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  public subscribe(listener: WebSocketListener): () => void {
    this.listeners.add(listener);
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(event: WebSocketEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in WebSocket listener:", err);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || this.isExplicitlyClosed) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000);
  }

  private cleanupTimers(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.cleanupTimers();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
