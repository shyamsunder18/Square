import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Wallet, MessageSquare } from "lucide-react";
import SuperChargeDialog from "./SuperChargeDialog";
import { useAuth } from "@/contexts/AuthContext";

type RechargeHistory = {
  id: string;
  amount: number;
  pointsAdded: number;
  bonusPoints: number;
  status: 'pending' | 'approved' | 'rejected';
  utrId: string;
  createdAt: string;
};

type BalanceHistoryProps = {
  balance: number;
};

const BalanceHistory: React.FC<BalanceHistoryProps> = ({ balance }) => {
  const [rechargeHistory, setRechargeHistory] = useState<RechargeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [superChargeDialogOpen, setSuperChargeDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchRechargeHistory();
    
    // Check if we should open SuperCharge dialog from navigation state
    if (location.state?.openSuperCharge) {
      setSuperChargeDialogOpen(true);
    }
  }, [user, location.state]);

  const fetchRechargeHistory = async () => {
    try {
      setLoading(true);
      
      // Get recharge history from localStorage
      if (user) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find((u: any) => u.id === user.id);
        
        // Initialize recharge history if it doesn't exist
        const history = currentUser?.rechargeHistory || [];
        
        // Convert to the expected format
        const formattedHistory = history.map((entry: any) => ({
          id: entry.id || `recharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount: entry.amount,
          pointsAdded: entry.pointsAdded,
          bonusPoints: entry.bonusPoints || 0,
          status: entry.status,
          utrId: entry.utrId,
          createdAt: entry.createdAt
        }));
        
        setRechargeHistory(formattedHistory);
      } else {
        // No user logged in
        setRechargeHistory([]);
      }
    } catch (error) {
      console.error("Failed to fetch recharge history:", error);
      toast({
        title: "Error",
        description: "Failed to load your balance history",
        variant: "destructive",
      });
      // Initialize with empty array on error
      setRechargeHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasRejectedRecharges = rechargeHistory.some(r => r.status === 'rejected');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Your Balance</h2>
          <div className="flex items-center mt-2">
            <Wallet className="mr-2 text-primary" />
            <span className="text-2xl font-bold">{balance} points</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => setSuperChargeDialogOpen(true)}
          >
            SuperCharge
          </Button>
          
          {hasRejectedRecharges && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSuperChargeDialogOpen(true)}
              className="flex items-center text-xs"
            >
              <MessageSquare className="mr-1 h-3 w-3" />
              Message Admin
            </Button>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4 mt-8">Recharge History</h3>
      
      {loading ? (
        <p>Loading history...</p>
      ) : rechargeHistory.length === 0 ? (
        <p className="text-muted-foreground">No recharge history found. SuperCharge your account to get started!</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>UTR ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rechargeHistory.map((recharge) => (
                <TableRow key={recharge.id}>
                  <TableCell>
                    {format(new Date(recharge.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>₹{recharge.amount}</TableCell>
                  <TableCell>
                    {recharge.status === 'approved' ? `+${recharge.pointsAdded}` : '-'}
                  </TableCell>
                  <TableCell>
                    {recharge.status === 'approved' && recharge.bonusPoints > 0 
                      ? `+${recharge.bonusPoints}` 
                      : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{recharge.utrId}</TableCell>
                  <TableCell>{getStatusBadge(recharge.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SuperChargeDialog 
        open={superChargeDialogOpen} 
        onOpenChange={setSuperChargeDialogOpen} 
        onSuccess={fetchRechargeHistory}
        showMessageOption={hasRejectedRecharges}
      />
    </div>
  );
};

export default BalanceHistory;
