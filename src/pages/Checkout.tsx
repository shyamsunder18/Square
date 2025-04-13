
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Indian } from "lucide-react";

const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { user, balance } = useAuth();
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
    
    // Basic validation for required fields
    if (!name || !email || !address || !city || !state || !zip) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // If using card payment and remaining amount > 0, validate card details
    if (remainingAmount > 0 && (!cardNumber || !cardExpiry || !cardCvv)) {
      toast({
        title: "Missing payment information",
        description: "Please fill out all payment fields.",
        variant: "destructive",
      });
      return;
    }
    
    // If insufficient balance and trying to use wallet
    if (useWalletBalance && balance < totalPrice && remainingAmount > 0) {
      // Proceed with partial wallet payment
    }
    
    setIsProcessing(true);
    
    try {
      const paymentMethod = useWalletBalance ? 
        (remainingAmount > 0 ? "wallet_and_card" : "wallet") : "card";
      
      const orderId = await createOrder({
        shippingAddress: { name, email, address, city, state, zip },
        paymentMethod,
        useWalletBalance
      });
      
      if (orderId) {
        // Order created successfully
        clearCart();
        navigate(`/order-success/${orderId}`);
      } else {
        throw new Error("Failed to create order.");
      }
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred during checkout.",
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
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="name" className="block text-gray-700 mb-1">Full Name*</label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email" className="block text-gray-700 mb-1">Email*</label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="form-group md:col-span-2">
                        <label htmlFor="address" className="block text-gray-700 mb-1">Address*</label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Main St"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="city" className="block text-gray-700 mb-1">City*</label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Mumbai"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="state" className="block text-gray-700 mb-1">State*</label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Maharashtra"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zip" className="block text-gray-700 mb-1">PIN Code*</label>
                        <Input
                          id="zip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          placeholder="400001"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-2">Payment</h2>
                    
                    {balance > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border mb-4">
                          <Checkbox
                            id="useWallet"
                            checked={useWalletBalance}
                            onCheckedChange={handleWalletToggle}
                          />
                          <label htmlFor="useWallet" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Use wallet balance (₹{balance.toFixed(2)})
                          </label>
                        </div>
                        
                        {useWalletBalance && (
                          <div className="mb-4">
                            {balance >= totalPrice ? (
                              <p className="text-green-600">Your wallet balance is sufficient for this purchase!</p>
                            ) : (
                              <div>
                                <p className="text-amber-600 mb-2">
                                  Your wallet balance will cover ₹{balance.toFixed(2)} of your purchase.
                                </p>
                                <p>
                                  Remaining to be paid: <strong>₹{remainingAmount.toFixed(2)}</strong>
                                </p>
                                {needsRecharge && (
                                  <div className="mt-2">
                                    <Button 
                                      type="button"
                                      variant="outline" 
                                      onClick={() => navigate('/profile')}
                                      className="text-primary border-primary hover:bg-primary/10"
                                    >
                                      SuperCharge your wallet
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {(!useWalletBalance || remainingAmount > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="form-group md:col-span-2">
                          <label htmlFor="cardNumber" className="block text-gray-700 mb-1">Card Number</label>
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            required={!useWalletBalance || remainingAmount > 0}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cardExpiry" className="block text-gray-700 mb-1">Expiration Date</label>
                          <Input
                            id="cardExpiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            required={!useWalletBalance || remainingAmount > 0}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cardCvv" className="block text-gray-700 mb-1">CVV</label>
                          <Input
                            id="cardCvv"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            required={!useWalletBalance || remainingAmount > 0}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
