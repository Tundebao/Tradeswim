import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  BellOff, 
  Info,
  X,
  Trash2
} from "lucide-react";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  clearNotifications,
  Notification 
} from "@/services/notificationService";
import { getRelativeTime } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadNotifications = () => {
    const data = getNotifications();
    setNotifications(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    toast({
      title: "All notifications marked as read",
      description: `${notifications.filter(n => !n.read).length} notifications updated`,
    });
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      clearNotifications();
      
      setNotifications([]);
      
      toast({
        title: "Notifications cleared",
        description: "All notifications have been removed",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              System alerts, trading notifications, and important messages
            </p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" onClick={handleClearAll}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>System Notifications</CardTitle>
                <CardDescription>
                  Important alerts and system messages
                </CardDescription>
              </div>
              
              {unreadCount > 0 && (
                <Badge variant="secondary" className="flex items-center">
                  <Bell className="mr-1 h-3 w-3" />
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div key={notification.id}>
                    <div className={`p-4 rounded-md ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 p-1.5 rounded-full ${
                            notification.type === "error" 
                              ? "bg-red-100 text-red-600"
                              : notification.type === "warning"
                              ? "bg-yellow-100 text-yellow-600" 
                              : notification.type === "success"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}>
                            {notification.type === "error" ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : notification.type === "warning" ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : notification.type === "success" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Info className="h-4 w-4" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {getRelativeTime(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notification.id)}
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <BellOff className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  All Caught Up!
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  You don't have any notifications right now. Notifications about login activity, trading events, and system alerts will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
