
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/contexts/OrderContext";

interface PurchasesTabProps {
  userOrders: Order[];
}

const PurchasesTab: React.FC<PurchasesTabProps> = ({ userOrders }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Purchases</h2>
      
      {userOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">You haven't made any purchases yet.</p>
          <div className="flex justify-center gap-4">
            <Link to="/products">
              <Button variant="default">Browse Products</Button>
            </Link>
            <Link to="/services">
              <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Order #{order.id}</h3>
                <div className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
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
                <span>Total:</span>
                <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasesTab;
