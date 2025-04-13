
import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaymentFormProps {
  useWalletBalance: boolean;
  handleWalletToggle: () => void;
  balance: number;
  totalPrice: number;
  remainingAmount: number;
  needsRecharge: boolean;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardExpiry: string;
  setCardExpiry: (value: string) => void;
  cardCvv: string;
  setCardCvv: (value: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  useWalletBalance,
  handleWalletToggle,
  balance,
  totalPrice,
  remainingAmount,
  needsRecharge,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv
}) => {
  const navigate = useNavigate();

  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-semibold mb-2">Payment</h2>
      
      {balance > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border mb-4">
            <Checkbox
              id="useWallet"
              checked={useWalletBalance}
              onCheckedChange={() => handleWalletToggle()}
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
  );
};

export default PaymentForm;
