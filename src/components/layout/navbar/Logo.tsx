
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center mr-2">
        <ShoppingCart size={20} />
      </div>
      <span className="text-xl font-bold">E-Commerce</span>
    </Link>
  );
};
