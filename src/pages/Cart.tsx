
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash, ShoppingBag } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b py-4">
      <div className="flex items-center mb-3 sm:mb-0">
        <img
          src={item.image || "https://via.placeholder.com/80"}
          alt={item.title}
          className="w-20 h-20 object-cover rounded-md mr-4"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/80";
          }}
        />
        
        <div>
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-gray-500 text-sm">${item.price.toFixed(2)} each</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center">
          <label htmlFor={`qty-${item.id}`} className="text-sm mr-2">Qty:</label>
          <select
            id={`qty-${item.id}`}
            value={item.quantity}
            onChange={handleQuantityChange}
            className="border rounded p-1"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        
        <div className="font-semibold">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromCart(item.id)}
          className="text-red-500"
        >
          <Trash size={18} />
        </Button>
      </div>
    </div>
  );
};

const Cart: React.FC = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-1">
                {cartItems.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
              
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal ({getTotalItems()} items):</span>
                  <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between mb-4">
                  <span>Shipping:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full mt-6 py-6" 
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
