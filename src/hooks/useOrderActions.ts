
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { Order } from "@/types/order.types";
import { orderAPI } from "@/services/api";

export const useOrderActions = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Fetch user orders when user changes
  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get orders for the current user - already fetched from API
  const getUserOrders = (): Order[] => orders;

  // Get sales for the current user (seller)
  const getUserSales = async () => {
    if (!user) return [];
    
    try {
      const response = await orderAPI.getSales();
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your sales data.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Create a new order using the API
  const createOrder = async (orderData: any): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await orderAPI.createOrder(orderData);
      
      // Refresh orders list and user data (for updated balance)
      fetchOrders();
      await refreshUserData();
      
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      
      return response.data._id || response.data.id;
    } catch (error: any) {
      let errorMessage = "An error occurred while processing your order.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Failed to place order",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Get order by ID
  const getOrderById = async (id: string) => {
    try {
      const response = await orderAPI.getOrderById(id);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return null;
    }
  };

  return {
    orders,
    userOrders: orders,
    userSales: [],  // This will be fetched when needed using getUserSales()
    createOrder,
    getOrderById,
    isLoading,
    fetchOrders,
    getUserSales,
  };
};
