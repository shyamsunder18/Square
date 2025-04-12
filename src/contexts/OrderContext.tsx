
import React, { createContext, useContext, ReactNode } from "react";
import { useOrderActions } from "@/hooks/useOrderActions";
import { OrderContextType } from "@/types/order.types";

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    orders, 
    userOrders, 
    userSales, 
    createOrder, 
    getOrderById 
  } = useOrderActions();

  return (
    <OrderContext.Provider
      value={{
        orders,
        userOrders,
        userSales,
        createOrder,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};

// Re-export the Order type
export type { Order } from "@/types/order.types";
