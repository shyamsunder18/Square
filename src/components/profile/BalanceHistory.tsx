
import React, { useState, useEffect } from "react";
import { rechargeAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
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
import { Wallet } from "lucide-react";
import SuperChargeDialog from "./SuperChargeDialog";

type RechargeHistory = {
  _id: string;
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

  useEffect(() => {
    fetchRechargeHistory();
  }, []);

  const fetchRechargeHistory = async () => {
    try {
      setLoading(true);
      const response = await rechargeAPI.getRechargeHistory();
      setRechargeHistory(response.data.rechargeHistory);
    } catch (error) {
      console.error("Failed to fetch recharge history:", error);
      toast({
        title: "Error",
        description: "Failed to load your balance history",
        variant: "destructive",
      });
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
        
        <Button 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          onClick={() => setSuperChargeDialogOpen(true)}
        >
          SuperCharge
        </Button>
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
                <TableRow key={recharge._id}>
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
        isOpen={superChargeDialogOpen} 
        onOpenChange={setSuperChargeDialogOpen} 
      />
    </div>
  );
};

export default BalanceHistory;
