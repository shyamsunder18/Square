
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wallet, MessageSquare } from "lucide-react";
import { Notification } from "@/contexts/NotificationContext";

interface NotificationsTabProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  onMarkAsRead,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications found.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 rounded-lg border ${!notification.read ? 'border-primary bg-accent/20' : 'bg-white border-border'}`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {notification.type === 'system' && notification.message.includes('recharge') ? (
                    <Badge className="bg-blue-100 text-blue-800 mr-2">
                      <Wallet size={14} className="mr-1" />
                      Recharge
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800 mr-2">
                      <MessageSquare size={14} className="mr-1" />
                      Message
                    </Badge>
                  )}
                  <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                    {notification.title}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm ml-10">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default NotificationsTab;
