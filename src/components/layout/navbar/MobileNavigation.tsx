
import React from "react";
import { Link } from "react-router-dom";
import { Bell, ShoppingCart, User, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Badge } from "@/components/ui/badge";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { unreadCount } = useNotifications();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="md:hidden bg-white border-t mt-2">
      <div className="flex flex-col p-4 space-y-3">
        {isAuthenticated && (
          <>
            <Link to="/add-product" className="flex items-center p-2" onClick={onClose}>
              <PlusCircle className="mr-2" size={18} />
              <span>Add Product</span>
            </Link>
            <Link to="/notifications" className="flex items-center p-2" onClick={onClose}>
              <Bell className="mr-2" size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </Link>
            <Link to="/cart" className="flex items-center p-2" onClick={onClose}>
              <ShoppingCart className="mr-2" size={18} />
              <span>Cart</span>
              {getTotalItems() > 0 && (
                <Badge variant="default" className="ml-2">{getTotalItems()}</Badge>
              )}
            </Link>
            <Link to="/profile" className="flex items-center p-2" onClick={onClose}>
              <User className="mr-2" size={18} />
              <span>Profile</span>
            </Link>
            <Button 
              variant="ghost" 
              className="flex items-center justify-start p-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={18} />
              <span>Logout</span>
            </Button>
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Link to="/login" onClick={onClose}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link to="/register" onClick={onClose}>
              <Button className="w-full">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
