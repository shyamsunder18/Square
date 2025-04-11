
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export const NotificationsDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem 
              key={notification.id}
              className="p-3 cursor-pointer"
              onClick={() => markAsRead(notification.id)}
            >
              <div className={`w-full ${!notification.read ? 'font-medium' : ''}`}>
                <div className="flex justify-between">
                  <span>{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <Link to="/notifications" className="block w-full">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
