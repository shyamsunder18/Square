
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/contexts/OrderContext";
import ReviewModal from "./ReviewModal";
import { useProducts } from "@/contexts/ProductContext";

interface PurchasesTabProps {
  userOrders: Order[];
}

const PurchasesTab: React.FC<PurchasesTabProps> = ({ userOrders }) => {
  const [reviewItem, setReviewItem] = useState<null | {
    id: string;
    title: string;
    image?: string;
    sellerId: string;
  }>(null);
  const { products } = useProducts();
  
  const handleReviewClick = (itemId: string, itemTitle: string, itemImage?: string) => {
    const product = products.find(p => p.id === itemId);
    if (product) {
      setReviewItem({
        id: itemId,
        title: itemTitle,
        image: itemImage,
        sellerId: product.sellerId
      });
    }
  };

  const hasReviewed = (orderId: string, itemId: string): boolean => {
    const product = products.find(p => p.id === itemId);
    if (product && product.reviews) {
      return product.reviews.some(review => review.orderId === orderId);
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Purchases</h2>
      
      {userOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't made any purchases yet.</p>
          <div className="flex justify-center gap-4">
            <Link to="/products">
              <Button variant="default">Browse Products</Button>
            </Link>
            <Link to="/services">
              <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Order #{order.id}</h3>
                <div className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item) => {
                  const reviewed = hasReviewed(order.id, item.id);
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex items-center flex-1">
                        <img
                          src={item.image || "https://via.placeholder.com/40"}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded-md mr-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/40";
                          }}
                        />
                        <div>
                          <p className="text-sm">{item.title}</p>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-medium">₹{item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <Button 
                        variant={reviewed ? "outline" : "default"} 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => handleReviewClick(item.id, item.title, item.image)}
                        disabled={reviewed}
                      >
                        <Star className="mr-1" size={16} />
                        {reviewed ? "Reviewed" : "Review"}
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between border-t pt-3">
                <span>Total:</span>
                <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {reviewItem && (
        <ReviewModal 
          isOpen={!!reviewItem}
          onClose={() => setReviewItem(null)}
          productId={reviewItem.id}
          productTitle={reviewItem.title}
          productImage={reviewItem.image}
          sellerId={reviewItem.sellerId}
        />
      )}
    </div>
  );
};

export default PurchasesTab;
