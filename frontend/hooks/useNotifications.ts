"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/notificationService";
import { Notification, WebSocketEvent } from "@/types/notification";
import { useOrderWebSocket } from "./useOrderWebSocket";
import { useAuth } from "./useAuth";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayedNotificationIdRef = useRef<number | null>(null);

  // Play subtle chime using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: 880 Hz (A5) slightly after
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.08, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch {
      // Audio playback blocked or unsupported, fail silently
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const [list, countRes] = await Promise.all([
        notificationService.getNotifications(false),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(countRes.unread_count);
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notification handler via WebSocket
  const handleWebSocketEvent = useCallback(
    (event: WebSocketEvent) => {
      if (event.type === "notification" || event.title) {
        const notifId = event.id || Date.now();
        const newNotification: Notification = {
          id: notifId,
          user_id: event.user_id || 0,
          order_id: event.order_id || null,
          title: event.title || "Notification",
          message: event.message || "",
          type: event.notification_type || "GENERAL",
          is_read: false,
          created_at: event.created_at || new Date().toISOString(),
        };

        setNotifications((prev) => [
          newNotification,
          ...prev.filter((n) => n.id !== notifId),
        ]);
        setUnreadCount((prev) => prev + 1);

        if (
          event.sound !== false &&
          lastPlayedNotificationIdRef.current !== notifId
        ) {
          lastPlayedNotificationIdRef.current = notifId;
          playNotificationSound();
        }
      }
    },
    [playNotificationSound]
  );

  useOrderWebSocket(handleWebSocketEvent);

  const markAsRead = async (id: number) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return updated;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    playNotificationSound,
  };
}
