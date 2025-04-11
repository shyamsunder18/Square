
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Bell, User, Menu, X, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center mr-2">
            <ShoppingCart size={20} />
          </div>
          <span className="text-xl font-bold">E-Commerce</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <Link to="/add-product">
                <Button variant="default" className="flex items-center">
                  <PlusCircle className="mr-2" size={18} />
                  Add
                </Button>
              </Link>
              
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
              
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart size={20} />
                  {getTotalItems() > 0 && (
                    <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer" 
                    onClick={logout}
                  >
                    <LogOut className="mr-2" size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t mt-2">
          <div className="flex flex-col p-4 space-y-3">
            {isAuthenticated && (
              <>
                <Link to="/add-product" className="flex items-center p-2" onClick={toggleMobileMenu}>
                  <PlusCircle className="mr-2" size={18} />
                  <span>Add Product</span>
                </Link>
                <Link to="/notifications" className="flex items-center p-2" onClick={toggleMobileMenu}>
                  <Bell className="mr-2" size={18} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                  )}
                </Link>
                <Link to="/cart" className="flex items-center p-2" onClick={toggleMobileMenu}>
                  <ShoppingCart className="mr-2" size={18} />
                  <span>Cart</span>
                  {getTotalItems() > 0 && (
                    <Badge variant="default" className="ml-2">{getTotalItems()}</Badge>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center p-2" onClick={toggleMobileMenu}>
                  <User className="mr-2" size={18} />
                  <span>Profile</span>
                </Link>
                <Button 
                  variant="ghost" 
                  className="flex items-center justify-start p-2"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                >
                  <LogOut className="mr-2" size={18} />
                  <span>Logout</span>
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={toggleMobileMenu}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={toggleMobileMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notifications Dialog for mobile */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
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
    </nav>
  );
};

export default Navbar;
