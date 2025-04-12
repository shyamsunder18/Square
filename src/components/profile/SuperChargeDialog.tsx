
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { rechargeAPI } from "@/services/api";

type SuperChargeDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const SuperChargeDialog: React.FC<SuperChargeDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [upiInfo, setUpiInfo] = useState({
    image: '',
    upiId: '',
    instructions: '',
  });
  const [amount, setAmount] = useState("");
  const [utrId, setUtrId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchUPIInfo();
    }
  }, [isOpen]);

  const fetchUPIInfo = async () => {
    try {
      setIsLoading(true);
      const response = await rechargeAPI.getUPIInfo();
      setUpiInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch UPI info:", error);
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !utrId) {
      toast({
        title: "Missing information",
        description: "Please fill in all the fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await rechargeAPI.submitRechargeRequest({
        amount: parseFloat(amount),
        utrId,
      });
      
      toast({
        title: "Request submitted",
        description: "Your recharge request has been submitted for approval",
      });
      
      // Reset form and close dialog
      setAmount("");
      setUtrId("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit recharge request:", error);
      toast({
        title: "Error",
        description: "Failed to submit recharge request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>SuperCharge Your Account</DialogTitle>
          <DialogDescription>
            Add points to your account to purchase products and services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="text-center py-8">Loading payment details...</div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 max-w-xs">
                  <img 
                    src={upiInfo.image} 
                    alt="UPI QR Code" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium">UPI ID: {upiInfo.upiId}</p>
                  <p className="text-sm text-muted-foreground mt-1">{upiInfo.instructions}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    First recharge ≥ ₹1000: Get 50 bonus points!<br/>
                    Other recharges: Get 4.5% bonus points!
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">UTR ID / Transaction ID</label>
                  <Input
                    value={utrId}
                    onChange={(e) => setUtrId(e.target.value)}
                    placeholder="Enter the UTR ID from your payment"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  disabled={isSubmitting} 
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperChargeDialog;
