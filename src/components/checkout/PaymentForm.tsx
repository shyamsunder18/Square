
import React from "react";
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
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  useWalletBalance,
  handleWalletToggle,
  balance,
  totalPrice,
  remainingAmount,
  needsRecharge
}) => {
  const navigate = useNavigate();

  const handleSuperChargeClick = () => {
    // Direct link to SuperCharge dialog
    navigate('/profile', { state: { openSuperCharge: true } });
  };

  return (
    <div className="border-t pt-6">
      <h2 className="text-xl font-semibold mb-2">Payment</h2>
      
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
                <p className="text-amber-600 mb-3">
                  Your wallet balance will cover ₹{balance.toFixed(2)} of your purchase.
                </p>
                <p className="mb-3">
                  You need <strong>₹{(totalPrice - balance).toFixed(2)}</strong> more in your wallet.
                </p>
                <div className="mt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleSuperChargeClick}
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    SuperCharge your wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
