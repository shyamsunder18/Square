
import React, { useState } from "react";
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
}

const RECHARGE_OPTIONS = [
  { value: 100, label: "₹100 = 100 points", bonus: 0 },
  { value: 500, label: "₹500 = 500 points + 50 bonus", bonus: 50 },
  { value: 1000, label: "₹1000 = 1000 points + 150 bonus", bonus: 150 },
  { value: 2000, label: "₹2000 = 2000 points + 400 bonus", bonus: 400 },
];

const SuperChargeDialog: React.FC<SuperChargeDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>("500");
  const [utrId, setUtrId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setSubmitting(true);
      
      // Get the selected recharge option
      const selectedOption = RECHARGE_OPTIONS.find(
        option => option.value.toString() === amount
      );
      
      if (!selectedOption) {
        throw new Error("Please select a valid amount");
      }
      
      if (!utrId.trim()) {
        throw new Error("UTR ID is required");
      }
      
      // Get current users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Create a recharge entry with pending status
      const rechargeEntry = {
        id: `recharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: selectedOption.value,
        pointsAdded: selectedOption.value,
        bonusPoints: selectedOption.bonus,
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
        message: `User ${user.name} has requested a recharge of ₹${selectedOption.value}`,
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

  return (
    <>
      <Dialog open={isOpen && !showMessageDialog} onOpenChange={(open) => {
        if (!open) {
          onOpenChange(false);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>SuperCharge Your Balance</DialogTitle>
            <DialogDescription>
              Add balance to your account for making purchases.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Select Amount</Label>
              <Select
                value={amount}
                onValueChange={setAmount}
              >
                <SelectTrigger id="amount">
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

            <div className="grid gap-2">
              <Label htmlFor="utr">UTR ID / Reference Number</Label>
              <Input
                id="utr"
                value={utrId}
                onChange={(e) => setUtrId(e.target.value)}
                placeholder="Enter payment reference number"
                required
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-xs text-amber-800">
              <p className="font-medium">How to recharge:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Transfer money to our UPI: example@upi</li>
                <li>Enter the UTR/Reference number from your payment app</li>
                <li>Click recharge to submit your request</li>
                <li>Admin will verify and approve your request</li>
              </ol>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
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
                className="flex-1 sm:flex-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Message Admin</DialogTitle>
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
                className="min-h-[120px]"
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
            <Button onClick={handleSendMessage}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuperChargeDialog;
