
// Notification service

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

let notifications: Notification[] = [];

// Add a notification
export const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    read: false
  };
  
  notifications = [newNotification, ...notifications];
  
  // Display a toast notification (this will be visible immediately)
  showToast(newNotification);
  
  return newNotification;
};

// Get all notifications
export const getNotifications = (): Notification[] => {
  return [...notifications];
};

// Mark a notification as read
export const markNotificationAsRead = (id: string): void => {
  notifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (): void => {
  notifications = notifications.map(notification => ({ ...notification, read: true }));
};

// Delete a notification
export const deleteNotification = (id: string): void => {
  notifications = notifications.filter(notification => notification.id !== id);
};

// Clear all notifications
export const clearNotifications = (): void => {
  notifications = [];
};

// Helper to show toast notifications
import { toast } from "sonner";

const showToast = (notification: Notification) => {
  switch (notification.type) {
    case "success":
      toast.success(notification.title, {
        description: notification.message,
        duration: 5000
      });
      break;
    case "error":
      toast.error(notification.title, {
        description: notification.message,
        duration: 10000
      });
      break;
    case "warning":
      toast.warning(notification.title, {
        description: notification.message,
        duration: 7000
      });
      break;
    case "info":
    default:
      toast.info(notification.title, {
        description: notification.message,
        duration: 5000
      });
      break;
  }
};

// Utility functions for common notifications
export const notifyLogin = (username: string) => {
  return addNotification({
    type: "info",
    title: "User Login",
    message: `User ${username} logged in successfully at ${new Date().toLocaleTimeString()}`
  });
};

export const notifyChange = (action: string, details: string) => {
  return addNotification({
    type: "success",
    title: "Configuration Changed",
    message: `${action}: ${details}`
  });
};

export const notifyError = (error: string, details?: string) => {
  return addNotification({
    type: "error",
    title: "Error Occurred",
    message: details ? `${error}: ${details}` : error
  });
};

export const notifyBrokerConnection = (status: boolean, broker: string) => {
  if (status) {
    return addNotification({
      type: "success",
      title: "Broker Connected",
      message: `Successfully connected to ${broker}`
    });
  } else {
    return addNotification({
      type: "error",
      title: "Broker Disconnected",
      message: `Connection to ${broker} lost or failed`
    });
  }
};

export const notifyTrade = (status: boolean, symbol: string, action: "buy" | "sell", quantity: number) => {
  if (status) {
    return addNotification({
      type: "success",
      title: "Trade Executed",
      message: `Successfully ${action === "buy" ? "bought" : "sold"} ${quantity} ${symbol}`
    });
  } else {
    return addNotification({
      type: "error",
      title: "Trade Failed",
      message: `Failed to ${action} ${quantity} ${symbol}`
    });
  }
};

// For risk control notifications
export const notifyRiskAlert = (alert: string, details: string) => {
  return addNotification({
    type: "warning",
    title: `Risk Alert: ${alert}`,
    message: details
  });
};
