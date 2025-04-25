import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/contexts/CartContext";
import { Order, UserSale, useOrders } from "@/contexts/OrderContext";

interface SalesTabProps {
  userSales: {
    order: Order;
    items: CartItem[];
  }[];
}

const SalesTab: React.FC<SalesTabProps> = ({ userSales }) => {
  const { fetchUserSales } = useOrders();
  
  useEffect(() => {
    // Refresh sales data when component mounts
    fetchUserSales();
  }, [fetchUserSales]);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Sales</h2>
      
      {userSales.length === 0 ? (
        <div className="text-center py-12">
          <BadgeDollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't made any sales yet.</p>
          <Link to="/add-product">
            <Button variant="default">Add a Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userSales.map(({ order, items }) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Sale from Order #{order.id.substring(0, 8)}</h3>
                <div className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
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
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between border-t pt-3">
                <span>Sale Amount:</span>
                <span className="font-semibold">
                  ₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesTab;
