
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp } from "lucide-react";
import SuperChargeDialog from "./SuperChargeDialog";

interface BalanceHistoryProps {
  balance: number;
}

const BalanceHistory: React.FC<BalanceHistoryProps> = ({ balance }) => {
  const [rechargeHistory, setRechargeHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [superChargeOpen, setSuperChargeOpen] = useState(false);
  const [showRejectedMessage, setShowRejectedMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRechargeHistory();
    }
  }, [user]);

  const loadRechargeHistory = () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find current user
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (currentUser && currentUser.rechargeHistory) {
        // Sort by date, newest first
        const sortedHistory = [...currentUser.rechargeHistory].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRechargeHistory(sortedHistory);
        
        // Check if there are any rejected recharges
        const hasRejected = sortedHistory.some((recharge: any) => recharge.status === "rejected");
        setShowRejectedMessage(hasRejected);
      }
    } catch (error) {
      console.error("Failed to load recharge history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Current Balance</CardTitle>
            <CardDescription>Your available funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-gray-400" />
              <span className="text-3xl font-bold">₹{balance.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button onClick={() => setSuperChargeOpen(true)} className="w-full">
              <TrendingUp className="mr-2 h-4 w-4" />
              SuperCharge Wallet
            </Button>
          </CardFooter>
        </Card>
        
        {showRejectedMessage && (
          <Card className="bg-red-50 border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-red-800">Recharge Rejected</CardTitle>
              <CardDescription className="text-red-700">One or more of your recharge requests were rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">Please check your transaction details or contact admin for more information.</p>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => setSuperChargeOpen(true)}
              >
                Contact Admin / Try Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      <h3 className="text-lg font-medium mt-8">Recharge History</h3>
      
      {isLoading ? (
        <p>Loading history...</p>
      ) : rechargeHistory.length === 0 ? (
        <p className="text-muted-foreground">No recharge history found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>UTR/Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bonus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rechargeHistory.map((recharge) => (
              <TableRow key={recharge.id}>
                <TableCell>
                  {format(new Date(recharge.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    ₹{recharge.amount?.toFixed(2) || "0.00"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{recharge.utrId}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(recharge.status)}`}>
                    {recharge.status}
                  </span>
                </TableCell>
                <TableCell>
                  {recharge.bonusPoints ? (
                    <span className="text-green-600">+{recharge.bonusPoints}</span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SuperChargeDialog
        open={superChargeOpen}
        onOpenChange={setSuperChargeOpen}
        onSuccess={loadRechargeHistory}
        showMessageOption={showRejectedMessage}
      />
    </div>
  );
};

export default BalanceHistory;
