import { fetchApi } from "./api";
import {
  MarkAllReadResponse,
  Notification,
  UnreadNotificationCountResponse,
} from "@/types/notification";

export const notificationService = {
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    return fetchApi<Notification[]>(`/notifications?unread_only=${unreadOnly}`);
  },

  async getUnreadCount(): Promise<UnreadNotificationCountResponse> {
    return fetchApi<UnreadNotificationCountResponse>("/notifications/unread-count");
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    return fetchApi<Notification>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  async markAllAsRead(): Promise<MarkAllReadResponse> {
    return fetchApi<MarkAllReadResponse>("/notifications/read-all", {
      method: "PATCH",
    });
  },
};
