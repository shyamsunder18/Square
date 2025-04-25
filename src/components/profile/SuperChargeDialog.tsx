import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, MessageSquare } from "lucide-react";

interface SuperChargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => Promise<void> | void;
  showMessageOption?: boolean;
}

const SuperChargeDialog: React.FC<SuperChargeDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  showMessageOption = false,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [utrId, setUtrId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [upiInfo, setUpiInfo] = useState<{ image: string; upiId: string }>({
    image: "",
    upiId: "",
  });
  const [hasRejectedRecharge, setHasRejectedRecharge] = useState<boolean>(false);
  const [showBonusMessage, setShowBonusMessage] = useState<boolean>(false);
  const [potentialBonus, setPotentialBonus] = useState<number>(0);
  
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const amountToRecharge = location.state?.amountToRecharge;

  useEffect(() => {
    if (open) {
      loadUPIInfo();
      checkRejectedRecharges();
      checkFirstTimeBonus();
      
      if (amountToRecharge) {
        setAmount(amountToRecharge.toString());
        updatePotentialBonus(amountToRecharge);
      }
    }
  }, [open, amountToRecharge]);
  
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      updatePotentialBonus(numAmount);
    }
  }, [amount]);
  
  const checkFirstTimeBonus = () => {
    if (!user) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find((u: any) => u.id === user.id);
    
    if (currentUser && !currentUser.hasReceivedFirstTimeBonus) {
      setShowBonusMessage(true);
    } else {
      setShowBonusMessage(false);
    }
  };
  
  const updatePotentialBonus = (amount: number) => {
    if (!showBonusMessage) {
      setPotentialBonus(0);
      return;
    }
    
    if (amount < 500) setPotentialBonus(0);
    else if (amount >= 500 && amount < 1000) setPotentialBonus(50);
    else if (amount >= 1000 && amount < 2000) setPotentialBonus(100);
    else if (amount >= 2000 && amount < 3000) setPotentialBonus(150);
    else if (amount >= 3000 && amount < 4000) setPotentialBonus(200);
    else setPotentialBonus(250); // for amount >= 4000
  };

  const loadUPIInfo = () => {
    try {
      const storedUPIInfo = localStorage.getItem("upiInfo");
      if (storedUPIInfo) {
        setUpiInfo(JSON.parse(storedUPIInfo));
      }
    } catch (error) {
      console.error("Error loading UPI info:", error);
    }
  };
  
  const checkRejectedRecharges = () => {
    if (!user) return;
    
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (currentUser && currentUser.rechargeHistory) {
        const hasRejected = currentUser.rechargeHistory.some(
          (recharge: any) => recharge.status === "rejected"
        );
        setHasRejectedRecharge(hasRejected);
      }
    } catch (error) {
      console.error("Error checking rejected recharges:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to recharge",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    if (!utrId.trim()) {
      toast({
        title: "UTR ID required",
        description: "Please enter the UTR ID of your transaction",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: any) => u.id === user.id);

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const rechargeRequest = {
        id: `recharge-${Date.now()}`,
        amount: amountValue,
        utrId: utrId.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      if (!users[userIndex].rechargeHistory) {
        users[userIndex].rechargeHistory = [];
      }
      
      users[userIndex].rechargeHistory.push(rechargeRequest);

      localStorage.setItem("users", JSON.stringify(users));

      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      
      notifications.push({
        id: `notification-${Date.now()}`,
        receiverId: "admin",
        type: "recharge-request",
        title: "New Recharge Request",
        message: `${user.name} has requested a recharge of ₹${amountValue}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      localStorage.setItem("notifications", JSON.stringify(notifications));

      await refreshUserData();

      onOpenChange(false);
      
      toast({
        title: "Recharge request submitted",
        description:
          "Your recharge request has been submitted and is pending approval",
      });
      
      navigate("/profile", { replace: true });
      
    } catch (error) {
      console.error("Error submitting recharge request:", error);
      toast({
        title: "Error",
        description:
          "There was an error submitting your recharge request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageAdmin = () => {
    if (!user) return;
    
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    
    notifications.push({
      id: `notification-${Date.now()}`,
      receiverId: "admin",
      type: "support",
      title: "Support Request",
      message: `${user.name} has requested support regarding a rejected recharge`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    localStorage.setItem("notifications", JSON.stringify(notifications));
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the admin",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {showMessageOption ? (
          <>
            <DialogHeader>
              <DialogTitle>Contact Admin</DialogTitle>
              <DialogDescription>
                Send a message to the admin regarding your rejected recharge request.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <Alert className="bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Contact Admin</AlertTitle>
                <AlertDescription>
                  Your recharge request was rejected. Please contact the admin for
                  more information.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleMessageAdmin}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Admin
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>SuperCharge Your Wallet</DialogTitle>
              <DialogDescription className="pt-2">
                Add funds to your wallet by making a UPI payment and entering the details below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {upiInfo.image || upiInfo.upiId ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center px-4 py-5 border rounded-lg bg-gray-50">
                    {upiInfo.image && (
                      <div className="mb-4">
                        <img
                          src={upiInfo.image}
                          alt="UPI QR Code"
                          className="max-h-[200px] object-contain rounded-md"
                        />
                      </div>
                    )}
                    {upiInfo.upiId && (
                      <div className="text-center">
                        <p className="mb-1 text-sm text-gray-500">UPI ID:</p>
                        <p className="font-mono font-medium select-all">{upiInfo.upiId}</p>
                      </div>
                    )}
                  </div>
                  
                  {showBonusMessage && (
                    <Alert className="bg-blue-50 border-blue-100">
                      <AlertTitle className="text-blue-700">First-time Recharge Bonus!</AlertTitle>
                      <AlertDescription className="text-blue-600">
                        <p>Get bonus points on your first recharge:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>₹500 - ₹999: Get 50 bonus points</li>
                          <li>₹1000 - ₹1999: Get 100 bonus points</li>
                          <li>₹2000 - ₹2999: Get 150 bonus points</li>
                          <li>₹3000 - ₹3999: Get 200 bonus points</li>
                          <li>₹4000+: Get 250 bonus points</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No payment information</AlertTitle>
                  <AlertDescription>
                    UPI payment details have not been set up. Please contact admin.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                    required
                  />
                  {showBonusMessage && potentialBonus > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      + {potentialBonus} bonus points on approval!
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="utr">UTR ID / Reference Number</Label>
                  <Input
                    id="utr"
                    placeholder="Enter UTR ID from your payment"
                    value={utrId}
                    onChange={(e) => setUtrId(e.target.value)}
                    className="font-mono"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    You can find this in your UPI app after making the payment
                  </p>
                </div>

                {hasRejectedRecharge && (
                  <div className="mt-4">
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        onOpenChange(false);
                        setTimeout(() => {
                          onOpenChange(true);
                        }, 100);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Admin about rejected recharge
                    </Button>
                  </div>
                )}

                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !upiInfo.upiId}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuperChargeDialog;
