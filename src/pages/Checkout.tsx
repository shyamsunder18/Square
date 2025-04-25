import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";

const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user, balance, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(true); // Default to true since it's the only option now
  const [remainingAmount, setRemainingAmount] = useState(getTotalPrice());
  
  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate, user]);

  useEffect(() => {
    if (useWalletBalance) {
      const newRemaining = Math.max(0, totalPrice - balance);
      setRemainingAmount(newRemaining);
    } else {
      setRemainingAmount(totalPrice);
    }
  }, [useWalletBalance, balance, totalPrice]);

  const handleWalletToggle = () => {
    // Since we only have wallet payment now, always keep it enabled
    setUseWalletBalance(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !address || !city || !state || !zip) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough balance
    if (balance < totalPrice) {
      toast({
        title: "Insufficient balance",
        description: "Your wallet balance is not enough for this purchase. Please add more funds.",
        variant: "destructive",
      });
      
      // Navigate to profile with SuperCharge dialog open
      navigate('/profile', { state: { openSuperCharge: true } });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Process the order using wallet payment
      const orderId = `order-${Date.now()}`;
      
      // Create order entry
      const orderData = {
        id: orderId,
        userId: user?.id,
        items: cartItems,
        total: totalPrice,
        shippingAddress: { name, email, address, city, state, zip },
        paymentMethod: "wallet",
        status: "completed",
        createdAt: new Date().toISOString()
      };
      
      // Get existing orders or initialize
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Update user balance
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user?.id);
      
      if (userIndex !== -1) {
        users[userIndex].balance -= totalPrice;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Update current user session
      await refreshUserData();
      
      // Clear cart
      clearCart();
      
      // Navigate to success page
      navigate(`/order-success/${orderId}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const needsRecharge = useWalletBalance && balance < totalPrice;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ShippingForm 
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    address={address}
                    setAddress={setAddress}
                    city={city}
                    setCity={setCity}
                    state={state}
                    setState={setState}
                    zip={zip}
                    setZip={setZip}
                  />
                  
                  <PaymentForm 
                    useWalletBalance={useWalletBalance}
                    handleWalletToggle={handleWalletToggle}
                    balance={balance}
                    totalPrice={totalPrice}
                    remainingAmount={remainingAmount}
                    needsRecharge={needsRecharge}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6"
                    disabled={isProcessing || needsRecharge}
                  >
                    {isProcessing ? "Processing..." : (
                      needsRecharge ? 
                        "Add More Balance to Continue" : 
                        `Pay ₹${totalPrice.toFixed(2)} from Wallet`
                    )}
                  </Button>
                </form>
              </div>
            </div>
            
            <div>
              <OrderSummary 
                cartItems={cartItems}
                getTotalPrice={getTotalPrice}
                useWalletBalance={useWalletBalance}
                balance={balance}
                totalPrice={totalPrice}
                remainingAmount={remainingAmount}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
