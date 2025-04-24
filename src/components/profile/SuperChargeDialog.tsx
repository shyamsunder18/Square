
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2 } from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, updateBalance } = useAuth();

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
      
      // Create a recharge entry
      const rechargeEntry = {
        id: `recharge-${Date.now()}`,
        amount: selectedOption.value,
        pointsAdded: selectedOption.value,
        bonusPoints: selectedOption.bonus,
        utrId: utrId.trim(),
        status: 'approved', // Auto-approve in localStorage implementation
        createdAt: new Date().toISOString()
      };
      
      // Update user's recharge history
      if (!users[userIndex].rechargeHistory) {
        users[userIndex].rechargeHistory = [];
      }
      users[userIndex].rechargeHistory.push(rechargeEntry);
      
      // Update balance
      const newBalance = (users[userIndex].balance || 0) + 
                        selectedOption.value + 
                        selectedOption.bonus;
      users[userIndex].balance = newBalance;
      
      // Update localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user balance
      updateBalance(newBalance);
      
      toast({
        title: "Recharge Successful",
        description: `Your account has been credited with ${selectedOption.value + selectedOption.bonus} points.`,
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
        title: "Recharge failed",
        description: error.message || "An error occurred while processing your recharge.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              <li>Click recharge to add balance to your account</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Recharge"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuperChargeDialog;
