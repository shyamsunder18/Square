
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  productImage?: string;
  sellerId: string;
  orderId: string;
  existingReview?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  productImage,
  sellerId,
  orderId,
  existingReview = false
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview, getProductById } = useProducts();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = () => {
    if (!user) return;
    
    // Check if this user has already reviewed this product for this order
    const product = getProductById(productId);
    if (existingReview) {
      toast({
        title: "Review already submitted",
        description: "You have already reviewed this item",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the review with the orderId
      addReview(productId, rating, comment, orderId);
      
      // Send notification ONLY to the seller
      addNotification({
        title: "New Review Received!",
        message: `${user.name} left a ${rating}-star review for "${productTitle}"`,
        type: "review",
        item: {
          id: productId,
          title: productTitle,
        },
        rating: rating,
        receiverId: sellerId // This ensures only the seller receives the notification
      });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience with {productTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <img 
              src={productImage || "https://via.placeholder.com/60"}
              alt={productTitle}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/60";
              }}
            />
            <div>
              <h4 className="font-medium">{productTitle}</h4>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Rating</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition-all"
                  fill={star <= rating ? "gold" : "transparent"}
                  color={star <= rating ? "gold" : "gray"}
                />
              ))}
              <span className="ml-2 text-sm">{rating} of 5</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Comment</p>
            <Textarea
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              disabled={isSubmitting || !comment.trim() || rating === 0} 
              onClick={handleSubmit}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
