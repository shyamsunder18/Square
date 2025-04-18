
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { Order, UserSale } from "@/types/order.types";
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
      // Transform the API response to match our Order type
      const formattedOrders = response.data.map((order: any) => ({
        id: order._id || order.id,
        items: order.items,
        buyerId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }));
      setOrders(formattedOrders || []);
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
  const getUserSales = async (): Promise<UserSale[]> => {
    if (!user) return [];
    
    try {
      const response = await orderAPI.getSales();
      // Transform the API response to match our UserSale type
      return (response.data || []).map((sale: any) => ({
        order: {
          id: sale.orderId,
          items: sale.items,
          buyerId: sale.userId || "unknown",
          totalAmount: sale.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
          status: sale.status,
          createdAt: sale.orderDate
        },
        items: sale.items
      }));
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
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const response = await orderAPI.getOrderById(id);
      if (!response.data) return null;
      
      // Transform the API response to match our Order type
      return {
        id: response.data._id || response.data.id,
        items: response.data.items,
        buyerId: response.data.userId,
        totalAmount: response.data.totalAmount,
        status: response.data.status,
        createdAt: response.data.createdAt
      };
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return null;
    }
  };

  return {
    orders,
    userOrders: orders,
    userSales: [], // This will be fetched when needed using getUserSales()
    createOrder,
    getOrderById,
    isLoading,
    fetchOrders,
    getUserSales,
  };
};
