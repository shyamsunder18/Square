
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquare } from "lucide-react";

interface SuperChargeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  showMessageOption?: boolean;
}

const RECHARGE_OPTIONS = [
  { value: 100, label: "₹100 = 100 points" },
  { value: 500, label: "₹500 = 500 points" },
  { value: 1000, label: "₹1000 = 1000 points" },
  { value: 2000, label: "₹2000 = 2000 points" },
  { value: 3000, label: "₹3000 = 3000 points" },
  { value: 4000, label: "₹4000 = 4000 points" },
];

const SuperChargeDialog: React.FC<SuperChargeDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  showMessageOption = false
}) => {
  const [amount, setAmount] = useState<string>("500");
  const [utrId, setUtrId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // Check if the user has any rejected recharges
  const [hasRejectedRecharges, setHasRejectedRecharges] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkForRejectedRecharges();
    }
  }, [user, isOpen]);
  
  const checkForRejectedRecharges = () => {
    if (!user) return;
    
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (currentUser && currentUser.rechargeHistory) {
        const hasRejected = currentUser.rechargeHistory.some(
          (r: any) => r.status === 'rejected'
        );
        setHasRejectedRecharges(hasRejected);
      }
    } catch (error) {
      console.error("Error checking rejected recharges:", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      if (!utrId.trim()) {
        throw new Error("UTR ID is required");
      }
      
      // Get current users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Create a recharge entry with pending status and 0 bonus points (admin will calculate)
      const rechargeEntry = {
        id: `recharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: parseInt(amount),
        pointsAdded: parseInt(amount),
        bonusPoints: 0, // Bonus will be calculated by admin based on first-time recharge logic
        utrId: utrId.trim(),
        status: 'pending', // Set to pending until admin approves
        createdAt: new Date().toISOString()
      };
      
      // Update user's recharge history
      if (!users[userIndex].rechargeHistory) {
        users[userIndex].rechargeHistory = [];
      }
      users[userIndex].rechargeHistory.push(rechargeEntry);
      
      // Update localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Send notification to admin
      addNotification({
        title: "New Recharge Request",
        message: `User ${user.name} has requested a recharge of ₹${amount}`,
        type: "system",
        item: {
          id: rechargeEntry.id,
          title: `Recharge-${rechargeEntry.id}`
        },
        receiverId: "admin" // Special receiverId for admin notifications
      });
      
      toast({
        title: "Recharge Request Submitted",
        description: "Your recharge request has been submitted and is pending approval from admin.",
      });
      
      // Close dialog and reset form
      onOpenChange(false);
      setUtrId("");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Recharge error:", error);
      toast({
        title: "Request failed",
        description: error.message || "An error occurred while processing your request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    // Send message as notification to admin
    addNotification({
      title: "Message from User",
      message: message,
      type: "system",
      item: {
        id: `msg-${Date.now()}`,
        title: `Message-${user.name}`
      },
      receiverId: "admin" // Special receiverId for admin notifications
    });

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the admin.",
    });

    setMessage("");
    setShowMessageDialog(false);
  };

  const getUpiInfo = () => {
    const upiId = localStorage.getItem('upiId') || 'example@upi';
    const upiImage = localStorage.getItem('upiImage') || '';
    
    return { upiId, upiImage };
  };
  
  const { upiId: merchantUpiId, upiImage: merchantUpiImage } = getUpiInfo();

  return (
    <>
      <Dialog open={isOpen && !showMessageDialog} onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">SuperCharge Your Balance</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Add balance to your account for making purchases.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-3">
              <Label htmlFor="amount" className="text-base">Select Amount</Label>
              <Select
                value={amount}
                onValueChange={setAmount}
              >
                <SelectTrigger id="amount" className="h-12">
                  <SelectValue placeholder="Select amount" />
                </SelectTrigger>
                <SelectContent>
                  {RECHARGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {merchantUpiImage && (
              <div className="flex flex-col items-center space-y-4 bg-slate-50 p-6 rounded-lg">
                <p className="font-medium text-center">Scan QR code to pay</p>
                <div className="border p-2 bg-white rounded-md">
                  <img 
                    src={merchantUpiImage} 
                    alt="UPI QR Code" 
                    className="max-w-[200px] max-h-[200px] object-contain mx-auto"
                  />
                </div>
                <p className="text-sm text-center">UPI ID: {merchantUpiId}</p>
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="utr" className="text-base">UTR ID / Reference Number</Label>
              <Input
                id="utr"
                value={utrId}
                onChange={(e) => setUtrId(e.target.value)}
                placeholder="Enter payment reference number"
                className="h-12 text-base"
                required
              />
            </div>

            <div className="bg-amber-50 p-5 rounded-md border border-amber-200 text-sm text-amber-800">
              <p className="font-medium mb-2">How to recharge:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Transfer money to our UPI ID shown above</li>
                <li>Enter the UTR/Reference number from your payment app</li>
                <li>Click recharge to submit your request</li>
                <li>Admin will verify and approve your request</li>
              </ol>
              
              {parseInt(amount) >= 500 && !user?.rechargeHistory?.some((r: any) => r.status === 'approved') && (
                <p className="mt-3 text-green-700 font-medium">
                  First time recharge bonus available on this amount!
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            {(hasRejectedRecharges || showMessageOption) && (
              <Button 
                variant="outline" 
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setShowMessageDialog(true);
                }}
                className="flex items-center"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Admin
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="flex-1 sm:flex-auto h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Message Admin</DialogTitle>
            <DialogDescription>
              Send a message to the admin regarding payment or recharge issues.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                className="min-h-[150px] text-base"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowMessageDialog(false);
              onOpenChange(true);
            }}>
              Back
            </Button>
            <Button onClick={handleSendMessage} className="h-11">
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuperChargeDialog;
