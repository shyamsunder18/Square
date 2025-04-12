
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem, useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { Order } from "@/types/order.types";

export const useOrderActions = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { products, updateProduct } = useProducts();

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    // Update localStorage when orders change
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Get orders for the current user
  const getUserOrders = (): Order[] => {
    return user ? orders.filter((order) => order.buyerId === user.id) : [];
  };

  // Get sales for the current user (seller)
  const getUserSales = () => {
    if (!user) return [];
    
    return orders.reduce((sales, order) => {
      const sellerItems = order.items.filter((item) => {
        const product = products.find((p) => p.id === item.id);
        return product && product.sellerId === user.id;
      });
      
      if (sellerItems.length > 0) {
        sales.push({
          order,
          items: sellerItems,
        });
      }
      
      return sales;
    }, [] as { order: Order; items: CartItem[] }[]);
  };

  // Create a new order
  const createOrder = async (): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return null;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return null;
    }

    // Check if product quantities are available
    for (const item of cartItems) {
      if (item.category === "goods") {
        const product = products.find((p) => p.id === item.id);
        if (product && product.count !== undefined) {
          if (product.count < item.quantity) {
            toast({
              title: "Insufficient stock",
              description: `Only ${product.count} units of "${product.title}" are available.`,
              variant: "destructive",
            });
            return null;
          }
        }
      }
    }

    try {
      // Create new order
      const newOrder: Order = {
        id: Date.now().toString(),
        items: [...cartItems],
        buyerId: user.id,
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        status: "completed",
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [...prev, newOrder]);

      // Update product quantities
      cartItems.forEach((item) => {
        if (item.category === "goods") {
          const product = products.find((p) => p.id === item.id);
          if (product && product.count !== undefined) {
            updateProduct(product.id, {
              count: product.count - item.quantity,
            });
          }
        }
      });

      // Send notifications to sellers
      const sellerIds = new Set(
        cartItems.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return product ? product.sellerId : null;
        }).filter(Boolean)
      );

      sellerIds.forEach((sellerId) => {
        if (sellerId) {
          addNotification({
            title: "New Order!",
            message: `Someone has purchased your ${cartItems.length > 1 ? 'items' : 'item'}.`,
            type: "order",
            item: {
              id: newOrder.id,
              title: "Order",
            },
          });
        }
      });

      // Clear the cart
      clearCart();

      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });

      return newOrder.id;
    } catch (error) {
      toast({
        title: "Failed to place order",
        description: "An error occurred while processing your order.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get order by ID
  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  return {
    orders,
    userOrders: getUserOrders(),
    userSales: getUserSales(),
    createOrder,
    getOrderById,
    setOrders,
  };
};
