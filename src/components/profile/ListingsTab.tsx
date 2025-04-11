
import React from "react";
import { Link } from "react-router-dom";
import { Package, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/contexts/ProductContext";

interface ListingsTabProps {
  userProducts: Product[];
  onEditClick: (productId: string) => void;
  onDeleteClick: (productId: string) => void;
}

const ListingsTab: React.FC<ListingsTabProps> = ({ 
  userProducts, 
  onEditClick, 
  onDeleteClick 
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Listings</h2>
        <Link to="/add-product">
          <Button>Add Product</Button>
        </Link>
      </div>
      
      {userProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't listed any products or services yet.</p>
          <Link to="/add-product">
            <Button variant="default">Add Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden">
              <img
                src={product.image || "https://via.placeholder.com/300x150"}
                alt={product.title}
                className="w-full h-36 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/300x150";
                }}
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{product.title}</h3>
                  <Badge variant="secondary">
                    {product.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold">₹{product.price.toFixed(2)}</span>
                  
                  {product.category === "goods" && (
                    <span className="text-sm">
                      Stock: <strong>{product.count || 0}</strong>
                    </span>
                  )}
                </div>
                
                {product.reviews && product.reviews.length > 0 && (
                  <div className="mt-2 flex items-center">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= (product.averageRating || 0) ? "gold" : "transparent"}
                          color={star <= (product.averageRating || 0) ? "gold" : "gray"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({product.averageRating?.toFixed(1)}) • {product.reviews.length} reviews
                    </span>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => onEditClick(product.id)}>
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteClick(product.id)}>
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingsTab;
