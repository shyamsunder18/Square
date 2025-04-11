
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";
import { CartButton } from "./CartButton";
import { AddProductButton } from "./AddProductButton";

export const DesktopNavigation: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isAuthenticated && (
        <>
          <AddProductButton />
          <NotificationsDropdown />
          <CartButton />
          <UserDropdown />
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
  );
};
