import React from "react";
import { Link } from "react-router-dom";
import { SquareSquare } from 'lucide-react';
export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center mr-2">
        <SquareSquare size={20} />
      </div>
      <span className="text-xl font-bold">Square</span>
    </Link>
  );
};
