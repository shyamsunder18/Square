
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Order, UserSale } from "@/types/order.types";

export const useOrderActions = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userSales, setUserSales] = useState<UserSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchUserSales();
    } else {
      setOrders([]);
      setUserSales([]);
    }
  }, [user]);

  const fetchOrders = () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const userOrders = allOrders.filter((order: Order) => order.buyerId === user.id);
      setOrders(userOrders);
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

  const fetchUserSales = () => {
    if (!user) return;

    try {
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const userSales: UserSale[] = [];
      
      // Process each order to find items sold by this user
      allOrders.forEach((order: Order) => {
        const sellerItems = order.items.filter(item => item.sellerId === user.id);
        
        if (sellerItems.length > 0) {
          userSales.push({
            order,
            items: sellerItems
          });
        }
      });
      
      setUserSales(userSales);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your sales data.",
        variant: "destructive",
      });
    }
  };

  const getUserOrders = (): Order[] => orders;

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
      const orderId = Date.now().toString();
      const newOrder: Order = {
        id: orderId,
        items: orderData.items || [],
        buyerId: user.id,
        totalAmount: orderData.totalAmount || 0,
        status: "completed",
        createdAt: new Date().toISOString()
      };

      // Get all existing orders
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      allOrders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(allOrders));
      
      // Update user's orders in state
      setOrders(prev => [...prev, newOrder]);

      // Get all products
      const allProducts = JSON.parse(localStorage.getItem("products") || "[]");
      const updatedProducts = [...allProducts];
      
      // Get all users for updating balances
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Process each item in the order
      orderData.items.forEach((item: any) => {
        const sellerId = item.sellerId;
        if (sellerId) {
          // Update product inventory if it's a goods item
          if (item.category === "goods" && item.count !== undefined) {
            const productIndex = updatedProducts.findIndex((p: any) => p.id === item.id);
            if (productIndex !== -1) {
              updatedProducts[productIndex].count = Math.max(0, (updatedProducts[productIndex].count || 0) - item.quantity);
            }
          }
          
          // Transfer funds to seller's balance
          const sellerIndex = users.findIndex((u: any) => u.id === sellerId);
          if (sellerIndex !== -1) {
            const amountToTransfer = item.price * item.quantity;
            users[sellerIndex].balance = (users[sellerIndex].balance || 0) + amountToTransfer;
            
            // Create notification for seller
            addNotification({
              title: "New Sale!",
              message: `${user.name} purchased ${item.title} for ₹${amountToTransfer}. Funds have been added to your balance.`,
              type: "order",
              item: {
                id: orderId,
                title: item.title
              },
              receiverId: sellerId
            });
          }
        }
      });
      
      // Save updated products to localStorage
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      // Save updated users to localStorage
      localStorage.setItem("users", JSON.stringify(users));

      // Refresh current user's data
      await refreshUserData();
      
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
      
      return orderId;
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast({
        title: "Failed to place order",
        description: "An error occurred while processing your order.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getOrderById = (id: string): Order | null => {
    const order = orders.find(order => order.id === id);
    return order || null;
  };

  return {
    orders,
    userOrders: orders,
    userSales,
    createOrder,
    getOrderById,
    isLoading,
    fetchOrders,
    fetchUserSales
  };
};
