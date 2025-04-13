
import React from "react";
import { CartItem } from "@/contexts/CartContext";

interface OrderSummaryProps {
  cartItems: CartItem[];
  getTotalPrice: () => number;
  useWalletBalance: boolean;
  balance: number;
  totalPrice: number;
  remainingAmount: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  getTotalPrice,
  useWalletBalance,
  balance,
  totalPrice,
  remainingAmount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center">
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
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t mt-4 pt-4">
        <div className="flex justify-between mb-1">
          <span>Subtotal</span>
          <span>₹{getTotalPrice().toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Shipping</span>
          <span>₹0.00</span>
        </div>
        
        {useWalletBalance && (
          <div className="flex justify-between mb-1 text-green-600">
            <span>Wallet Credit</span>
            <span>-₹{Math.min(balance, totalPrice).toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-semibold text-lg mt-2">
          <span>Total</span>
          <span>₹{remainingAmount.toFixed(2)}</span>
        </div>
        
        {balance > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Your wallet balance: ₹{balance.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
