
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";

const Products: React.FC = () => {
  const { getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  
  const products = getProductsByCategory("goods");

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Products Available</h1>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No products available yet.</p>
              <Link to="/add-product">
                <Button>Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.image || "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=800&auto=format&fit=crop"} 
                    alt={product.title}
                    className="product-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=800&auto=format&fit=crop";
                    }}
                  />
                  
                  <div className="product-info">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      <Badge variant="secondary" className="category-badge">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    {product.count !== undefined && (
                      <p className="text-sm text-gray-600 mb-2">
                        Available: <span className="font-semibold">{product.count}</span>
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      
                      <Button 
                        variant="default"
                        size="sm"
                        className="flex items-center"
                        onClick={() => addToCart({
                          id: product.id,
                          title: product.title,
                          price: product.price,
                          image: product.image,
                          category: product.category,
                          count: product.count
                        })}
                        disabled={product.count === 0}
                      >
                        <ShoppingCart className="mr-1" size={16} />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
