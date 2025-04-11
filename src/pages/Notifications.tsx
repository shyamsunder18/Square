
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  
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
                    className={`p-4 rounded-lg border ${!notification.read ? 'bg-accent border-primary' : 'bg-white border-border'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!notification.read ? 'text-primary-foreground' : ''}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{notification.message}</p>
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
