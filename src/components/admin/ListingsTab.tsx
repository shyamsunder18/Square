
import React from "react";
import { Product } from "@/types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ListingsTabProps {
  products: Product[];
  listingsType: string;
  onTypeChange: (type: string) => void;
}

const ListingsTab: React.FC<ListingsTabProps> = ({
  products,
  listingsType,
  onTypeChange,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Listings</h2>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={listingsType === "products" ? "secondary" : "outline"}
            onClick={() => onTypeChange("products")}
            className="flex items-center"
          >
            Products
          </Button>
          <Button 
            size="sm" 
            variant={listingsType === "services" ? "secondary" : "outline"}
            onClick={() => onTypeChange("services")}
            className="flex items-center"
          >
            Services
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No listings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products
                .filter(product => 
                  listingsType === "products" 
                    ? product.category === "goods" 
                    : product.category === "services"
                )
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.sellerId}</TableCell>
                    <TableCell>
                      <Badge className={product.count !== 0 ? "bg-green-600" : "bg-red-600"}>
                        {product.count !== 0 ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default ListingsTab;
