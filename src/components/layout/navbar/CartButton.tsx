
import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

export const CartButton: React.FC = () => {
  const { getTotalItems } = useCart();

  return (
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
  );
};
