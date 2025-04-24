
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { Order } from "@/types/order.types";

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchOrderDetails = () => {
      if (orderId) {
        try {
          const fetchedOrder = getOrderById(orderId);
          setOrder(fetchedOrder);
        } catch (error) {
          console.error("Failed to fetch order:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId, getOrderById]);
  
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : order ? (
              <div className="mb-8">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{order.id}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <p className="text-amber-600">Order details not found. Please check your order history.</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/">
                <Button variant="default" className="flex items-center">
                  <Home className="mr-2" size={18} />
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/profile">
                <Button variant="outline" className="flex items-center">
                  <ShoppingBag className="mr-2" size={18} />
                  View My Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
