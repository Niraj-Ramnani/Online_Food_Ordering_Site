"use client";

import { useEffect, useState } from "react";
import { websocketService } from "@/services/websocketService";
import { WebSocketEvent } from "@/types/notification";
import { useAuth } from "./useAuth";

export function useOrderWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      websocketService.disconnect();
      setIsConnected(false);
      return;
    }

    const unsubscribe = websocketService.subscribe((event: WebSocketEvent) => {
      setLastEvent(event);
      setIsConnected(true);
      if (onEvent) {
        onEvent(event);
      }
    });

    setIsConnected(websocketService.isConnected());

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, onEvent]);

  return {
    isConnected,
    lastEvent,
  };
}
