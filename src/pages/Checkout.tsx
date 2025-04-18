
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { orderAPI } from "@/services/api";

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
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
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
    setUseWalletBalance(!useWalletBalance);
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
    
    if (remainingAmount > 0 && (!cardNumber || !cardExpiry || !cardCvv)) {
      toast({
        title: "Missing payment information",
        description: "Please fill out all payment fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough balance when trying to use wallet
    if (useWalletBalance && balance < totalPrice && remainingAmount > 0) {
      if (balance <= 0) {
        toast({
          title: "Insufficient balance",
          description: "Your wallet has no funds. Please add balance or use card payment.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      const paymentMethod = useWalletBalance ? 
        (remainingAmount > 0 ? "wallet_and_card" : "wallet") : "card";
      
      const response = await orderAPI.createOrder({
        shippingAddress: { name, email, address, city, state, zip },
        paymentMethod,
        useWalletBalance
      });
      
      if (response.data) {
        // Update user balance after successful order
        await refreshUserData();
        clearCart();
        navigate(`/order-success/${response.data._id}`);
      } else {
        throw new Error("Failed to create order.");
      }
    } catch (error: any) {
      let errorMessage = "An error occurred during checkout.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Checkout failed",
        description: errorMessage,
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
                    cardNumber={cardNumber}
                    setCardNumber={setCardNumber}
                    cardExpiry={cardExpiry}
                    setCardExpiry={setCardExpiry}
                    cardCvv={cardCvv}
                    setCardCvv={setCardCvv}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ₹${remainingAmount.toFixed(2)}`}
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
