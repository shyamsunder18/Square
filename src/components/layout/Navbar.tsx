
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Logo } from "./navbar/Logo";
import { DesktopNavigation } from "./navbar/DesktopNavigation";
import { MobileNavigation } from "./navbar/MobileNavigation";
import { NotificationsMobileDialog } from "./navbar/NotificationsMobileDialog";

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <DesktopNavigation />

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Notifications Dialog for mobile */}
      <NotificationsMobileDialog 
        isOpen={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </nav>
  );
};

export default Navbar;
