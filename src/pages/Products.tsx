
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Star } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";

const Products: React.FC = () => {
  const { getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  
  const allProducts = getProductsByCategory("goods");
  
  const filteredProducts = allProducts.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Products Available</h1>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <div>
                  <p className="text-gray-500 mb-6">No products match your search.</p>
                  <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-6">No products available yet.</p>
                  <Link to="/add-product">
                    <Button>Add Your First Product</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="relative">
                    <img 
                      src={product.image || "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=800&auto=format&fit=crop"} 
                      alt={product.title}
                      className={`product-image ${product.count === 0 ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1586952518485-11b180e92764?w=800&auto=format&fit=crop";
                      }}
                    />
                    {product.count === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg py-1.5 px-3 bg-opacity-90">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                      <Badge variant="secondary" className="category-badge">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* Display product rating */}
                    <div className="flex items-center mb-2">
                      {product.averageRating && product.averageRating > 0 ? (
                        <>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={star <= Math.round(product.averageRating || 0) ? "gold" : "transparent"}
                                color={star <= Math.round(product.averageRating || 0) ? "gold" : "gray"}
                                className="mr-0.5"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-1">
                            {product.averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews yet</span>
                      )}
                    </div>
                    
                    {product.count !== undefined && product.count > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        Available: <span className="font-semibold">{product.count}</span>
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold">₹{product.price.toFixed(2)}</span>
                      
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
                        {product.count === 0 ? "Out of Stock" : "Add to Cart"}
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
