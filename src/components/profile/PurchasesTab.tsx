
import React, { useState, useEffect } from "react";
import { useOrders } from "@/contexts/OrderContext";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import ReviewModal from "./ReviewModal";

const PurchasesTab: React.FC = () => {
  const { userOrders, fetchOrders } = useOrders();
  const { getProductById } = useProducts();
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    productId: string;
    productTitle: string;
    productImage?: string;
    sellerId: string;
    orderId: string;
    existingReview: boolean;
  }>({
    isOpen: false,
    productId: "",
    productTitle: "",
    productImage: "",
    sellerId: "",
    orderId: "",
    existingReview: false
  });
  
  useEffect(() => {
    // Refresh orders when the component mounts
    fetchOrders();
  }, [fetchOrders]);
  
  const hasUserReviewedProduct = (productId: string, orderId: string) => {
    const product = getProductById(productId);
    if (!product || !product.reviews) return false;
    
    return product.reviews.some(review => 
      review.orderId === orderId
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Your Purchases</h3>
      
      {userOrders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ul className="list-disc pl-4 space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.title} ({item.category}) x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, index) => {
                        const hasReviewed = hasUserReviewedProduct(item.id, order.id);
                        
                        return (
                          <Button
                            key={`${item.id}-${index}`}
                            variant={hasReviewed ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                              const product = getProductById(item.id);
                              setReviewModal({
                                isOpen: true,
                                productId: item.id,
                                productTitle: item.title,
                                productImage: item.image,
                                sellerId: item.sellerId,
                                orderId: order.id,
                                existingReview: hasReviewed
                              });
                            }}
                          >
                            {hasReviewed ? "Reviewed" : "Review"}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        productId={reviewModal.productId}
        productTitle={reviewModal.productTitle}
        productImage={reviewModal.productImage}
        sellerId={reviewModal.sellerId}
        orderId={reviewModal.orderId}
        existingReview={reviewModal.existingReview}
      />
    </div>
  );
};

export default PurchasesTab;
