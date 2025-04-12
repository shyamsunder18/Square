
import { CartItem } from "@/contexts/CartContext";

export type OrderStatus = "pending" | "completed" | "cancelled";

export type Order = {
  id: string;
  items: CartItem[];
  buyerId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type UserSale = {
  order: Order;
  items: CartItem[];
};

export type OrderContextType = {
  orders: Order[];
  userOrders: Order[];
  userSales: UserSale[];
  createOrder: () => Promise<string | null>;
  getOrderById: (id: string) => Order | undefined;
};
