
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Bell, Star, ShoppingCart, Package } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package size={16} className="mr-2" />;
      case 'service':
        return <Package size={16} className="mr-2" />;
      case 'review':
        return <Star size={16} className="mr-2" />;
      case 'order':
        return <ShoppingCart size={16} className="mr-2" />;
      default:
        return <Bell size={16} className="mr-2" />;
    }
  };
  
  const getNotificationBadgeStyle = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'service':
        return 'bg-violet-100 text-violet-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'order':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Notifications</h1>
              
              {notifications.length > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                <p className="text-gray-500">
                  When you get notifications, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border ${!notification.read ? 'border-primary bg-accent/20' : 'bg-white border-border'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Badge className={`${getNotificationBadgeStyle(notification.type)} mr-2`}>
                          <div className="flex items-center">
                            {getNotificationIcon(notification.type)}
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </Badge>
                        <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm ml-10">{notification.message}</p>
                    
                    {notification.type === 'review' && notification.rating && (
                      <div className="mt-2 ml-10">
                        <div className="flex items-center">
                          <p className="text-sm mr-2">Rating: </p>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= notification.rating ? "gold" : "transparent"}
                              color={star <= notification.rating ? "gold" : "gray"}
                              className="mr-0.5"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
