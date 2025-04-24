
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recommendationAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: 'goods' | 'services';
  count?: number;
  averageRating: number;
};

const RecommendedProducts: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await recommendationAPI.getRecommendations();
      // Ensure we have an array of products even if the API returns something else
      if (response.data && Array.isArray(response.data)) {
        setRecommendations(response.data);
      } else {
        console.error("Invalid recommendations data format:", response.data);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      count: product.count,
    });

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="bg-gray-200 h-40 rounded-md mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Link to={`/product/${product._id}`} className="block">
              <div className="h-40 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/300x200?text=Product";
                  }}
                />
              </div>
            </Link>
            <div className="p-4">
              <Link to={`/product/${product._id}`} className="block">
                <h3 className="font-medium mb-1 hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>
              </Link>
              <div className="flex justify-between items-center">
                <p className="font-bold">₹{product.price.toFixed(2)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingBag size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
