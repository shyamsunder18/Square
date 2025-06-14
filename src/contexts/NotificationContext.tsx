
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export type NotificationType = "product" | "service" | "review" | "order" | "system";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  item: {
    id: string;
    title: string;
  };
  read: boolean;
  createdAt: string;
  rating?: number;
  receiverId?: string; // ID of the user who should receive this notification
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  useEffect(() => {
    // Update localStorage when notifications change
    localStorage.setItem("notifications", JSON.stringify(notifications));
    
    // Update unread count - only count notifications for the current user or admin notifications if user is admin
    const count = notifications.filter(n => 
      !n.read && 
      ((!n.receiverId && user?.id === n.receiverId) || 
       (n.receiverId === "admin" && user?.isAdmin) ||
       (!n.receiverId || n.receiverId === user?.id))
    ).length;
    setUnreadCount(count);
  }, [notifications, user]);

  const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    // For admin notifications, always add them regardless of current user
    const isAdminNotification = notification.receiverId === "admin";
    
    // For regular user notifications, only add if user matches
    if (!isAdminNotification && notification.receiverId && user?.id !== notification.receiverId) {
      return;
    }
    
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Show toast notification for current user notifications or admin notifications if user is admin
    if ((!newNotification.receiverId || newNotification.receiverId === user?.id) || 
        (newNotification.receiverId === "admin" && user?.isAdmin)) {
      toast(notification.title, {
        description: notification.message,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: notifications.filter(n => 
          // Regular user sees their notifications
          (!n.receiverId || n.receiverId === user?.id) ||
          // Admin sees admin notifications
          (n.receiverId === "admin" && user?.isAdmin)
        ),
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
