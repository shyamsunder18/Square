
import React, { useState } from "react";
import { format } from "date-fns";
import { ListCheck, ListX } from "lucide-react";
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

type RechargeHistory = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  pointsAdded: number;
  bonusPoints: number;
  status: 'approved' | 'rejected';
  utrId: string;
  createdAt: string;
};

interface RechargeHistoryTabProps {
  rechargeHistory: RechargeHistory[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RechargeHistoryTab: React.FC<RechargeHistoryTabProps> = ({
  rechargeHistory,
  activeTab,
  onTabChange,
}) => {
  const [viewType, setViewType] = useState<'approved' | 'rejected'>('approved');
  
  const handleViewTypeChange = (type: 'approved' | 'rejected') => {
    setViewType(type);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredHistory = rechargeHistory.filter(recharge => recharge.status === viewType);

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button 
          size="sm" 
          variant={viewType === "approved" ? "secondary" : "outline"}
          onClick={() => handleViewTypeChange("approved")}
          className="flex items-center"
        >
          <ListCheck size={16} className="mr-2" />
          Approved
        </Button>
        <Button 
          size="sm" 
          variant={viewType === "rejected" ? "secondary" : "outline"}
          onClick={() => handleViewTypeChange("rejected")}
          className="flex items-center"
        >
          <ListX size={16} className="mr-2" />
          Rejected
        </Button>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-muted-foreground">No {viewType} recharges found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>UTR ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((recharge) => (
                <TableRow key={recharge.id}>
                  <TableCell>{recharge.userName}</TableCell>
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
    </>
  );
};

export default RechargeHistoryTab;
