
import React from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface NotificationsMobileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsMobileDialog: React.FC<NotificationsMobileDialogProps> = ({ 
  isOpen,
  onOpenChange
}) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {notifications.length > 0 ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAllAsRead()}
                className="mt-2"
              >
                Mark all as read
              </Button>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border rounded-lg ${!notification.read ? 'bg-accent' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
