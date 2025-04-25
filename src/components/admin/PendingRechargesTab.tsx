
import React from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PendingRecharge = {
  id: string;
  rechargeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  hasReceivedFirstTimeBonus: boolean;
  utrId: string;
  date?: string;
  createdAt: string;
};

interface PendingRechargesTabProps {
  pendingRecharges: PendingRecharge[];
  loading: boolean;
  processingRecharge: string | null;
  onApprove: (userId: string, rechargeId: string, amount: number, isFirstTimeRecharge: boolean) => void;
  onReject: (userId: string, rechargeId: string) => void;
}

const PendingRechargesTab: React.FC<PendingRechargesTabProps> = ({
  pendingRecharges,
  loading,
  processingRecharge,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return <p>Loading requests...</p>;
  }

  if (pendingRecharges.length === 0) {
    return <p className="text-muted-foreground">No pending recharge requests found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>UTR ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingRecharges.map((recharge) => (
            <TableRow key={recharge.id || recharge.rechargeId}>
              <TableCell>
                <div>
                  <p className="font-medium">{recharge.userName}</p>
                  <p className="text-sm text-muted-foreground">{recharge.userEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  ₹{recharge.amount.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{recharge.utrId}</TableCell>
              <TableCell>
                {recharge.createdAt ? format(new Date(recharge.createdAt), 'MMM d, yyyy HH:mm') : 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApprove(recharge.userId, recharge.id || recharge.rechargeId, recharge.amount, !recharge.hasReceivedFirstTimeBonus)}
                    disabled={processingRecharge === (recharge.id || recharge.rechargeId)}
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(recharge.userId, recharge.id || recharge.rechargeId)}
                    disabled={processingRecharge === (recharge.id || recharge.rechargeId)}
                  >
                    <X size={16} className="mr-1" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingRechargesTab;
