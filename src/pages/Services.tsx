
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";

const Services: React.FC = () => {
  const { getProductsByCategory } = useProducts();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  
  const allServices = getProductsByCategory("services");
  
  const filteredServices = allServices.filter((service) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      service.title.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">Services Available</h1>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <div>
                  <p className="text-gray-500 mb-6">No services match your search.</p>
                  <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-6">No services available yet.</p>
                  <Link to="/add-product">
                    <Button>Add Your First Service</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="product-card">
                  <img 
                    src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop"} 
                    alt={service.title}
                    className="product-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop";
                    }}
                  />
                  
                  <div className="product-info">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{service.title}</h3>
                      <Badge variant="secondary" className="category-badge">
                        {service.category}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold">₹{service.price.toFixed(2)}</span>
                      
                      <Button 
                        variant="default"
                        size="sm"
                        className="flex items-center"
                        onClick={() => addToCart({
                          id: service.id,
                          title: service.title,
                          price: service.price,
                          image: service.image,
                          category: service.category
                        })}
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

export default Services;
