
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const AddProductButton: React.FC = () => {
  return (
    <Link to="/add-product">
      <Button variant="default" className="flex items-center">
        <PlusCircle className="mr-2" size={18} />
        Add
      </Button>
    </Link>
  );
};
