
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { Star } from "lucide-react";

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const { getSellerRating } = useProducts();
  
  const sellerRating = user ? getSellerRating(user.id) : { average: 0, count: 0 };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <p className="text-gray-600">{user?.name} • {user?.email}</p>
        
        {sellerRating.count > 0 && (
          <div className="flex items-center mt-2 md:mt-0">
            <p className="mr-2 text-sm text-gray-600">Seller Rating:</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= sellerRating.average ? "gold" : "transparent"}
                  color={star <= sellerRating.average ? "gold" : "gray"}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                ({sellerRating.average.toFixed(1)}) from {sellerRating.count} reviews
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
