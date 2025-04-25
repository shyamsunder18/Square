
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PendingRecharge, RechargeHistory } from "@/types/admin.types";

export const useAdminActions = () => {
  const [pendingRecharges, setPendingRecharges] = useState<PendingRecharge[]>([]);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeHistory[]>([]);
  const [upiImage, setUpiImage] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingRecharge, setProcessingRecharge] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingRecharges = () => {
    try {
      setLoading(true);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const pending: PendingRecharge[] = [];
      
      users.forEach((user: any) => {
        if (user.rechargeHistory && Array.isArray(user.rechargeHistory)) {
          const userPendingRecharges = user.rechargeHistory
            .filter((recharge: any) => recharge.status === 'pending')
            .map((recharge: any) => ({
              rechargeId: recharge.id,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              amount: recharge.amount,
              bonusPoints: recharge.bonusPoints,
              utrId: recharge.utrId,
              date: recharge.createdAt
            }));
          pending.push(...userPendingRecharges);
        }
      });
      
      setPendingRecharges(pending);
    } catch (error) {
      console.error("Failed to fetch pending recharges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending recharge requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRechargeHistory = () => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const history: RechargeHistory[] = [];
      
      users.forEach((user: any) => {
        if (user.rechargeHistory && Array.isArray(user.rechargeHistory)) {
          const userCompletedRecharges = user.rechargeHistory
            .filter((recharge: any) => recharge.status === 'approved' || recharge.status === 'rejected')
            .map((recharge: any) => ({
              id: recharge.id,
              userId: user.id,
              userName: user.name,
              amount: recharge.amount,
              pointsAdded: recharge.pointsAdded,
              bonusPoints: recharge.bonusPoints,
              status: recharge.status,
              utrId: recharge.utrId,
              createdAt: recharge.createdAt
            }));
          history.push(...userCompletedRecharges);
        }
      });
      
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRechargeHistory(history);
    } catch (error) {
      console.error("Failed to fetch recharge history:", error);
    }
  };

  const fetchUPIInfo = () => {
    try {
      const upiInfo = {
        image: localStorage.getItem('upiImage') || '',
        upiId: localStorage.getItem('upiId') || 'example@upi'
      };
      
      setUpiImage(upiInfo.image);
      setUpiId(upiInfo.upiId);
    } catch (error) {
      console.error("Failed to fetch UPI info:", error);
    }
  };

  const calculateBonusPoints = (amount: number, userId: string): number => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        return 0;
      }
      
      const user = users[userIndex];
      
      // Check if user has any approved recharges before (to give first-time bonus)
      const hasApprovedRecharges = user.rechargeHistory && 
        user.rechargeHistory.some((r: any) => r.status === 'approved');
      
      if (!hasApprovedRecharges) {
        // First time recharge bonus logic
        if (amount < 500) {
          return 0;
        } else if (amount >= 500 && amount < 1000) {
          return 50;
        } else if (amount >= 1000 && amount < 2000) {
          return 100;
        } else if (amount >= 2000 && amount < 3000) {
          return 150;
        } else if (amount >= 3000 && amount < 4000) {
          return 200;
        } else {
          return 250;
        }
      }
      
      // No bonus for subsequent recharges
      return 0;
    } catch (error) {
      console.error("Error calculating bonus points:", error);
      return 0;
    }
  };

  const handleApproveRecharge = (userId: string, rechargeId: string) => {
    try {
      setProcessingRecharge(rechargeId);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      const user = users[userIndex];
      const rechargeIndex = user.rechargeHistory.findIndex(
        (r: any) => r.id === rechargeId
      );
      
      if (rechargeIndex === -1) {
        throw new Error("Recharge request not found");
      }
      
      const recharge = user.rechargeHistory[rechargeIndex];
      
      if (recharge.status !== 'pending') {
        throw new Error("This request has already been processed");
      }
      
      recharge.status = 'approved';
      
      // Calculate bonus points based on the new logic
      const bonusPoints = calculateBonusPoints(recharge.amount, userId);
      recharge.bonusPoints = bonusPoints;
      
      const pointsToAdd = recharge.amount + bonusPoints;
      user.balance = (user.balance || 0) + pointsToAdd;
      
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: "Recharge approved",
        description: `Added ${recharge.amount} points + ${bonusPoints} bonus points`,
      });
      
      setPendingRecharges(prev => 
        prev.filter(r => !(r.userId === userId && r.rechargeId === rechargeId))
      );
      fetchRechargeHistory();
    } catch (error: any) {
      console.error("Failed to approve recharge:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve the recharge request",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  const handleRejectRecharge = (userId: string, rechargeId: string) => {
    try {
      setProcessingRecharge(rechargeId);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      const user = users[userIndex];
      const rechargeIndex = user.rechargeHistory.findIndex(
        (r: any) => r.id === rechargeId
      );
      
      if (rechargeIndex === -1) {
        throw new Error("Recharge request not found");
      }
      
      const recharge = user.rechargeHistory[rechargeIndex];
      
      if (recharge.status !== 'pending') {
        throw new Error("This request has already been processed");
      }
      
      recharge.status = 'rejected';
      
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: "Recharge rejected",
        description: "The recharge request has been rejected",
      });
      
      setPendingRecharges(prev => 
        prev.filter(r => !(r.userId === userId && r.rechargeId === rechargeId))
      );
      fetchRechargeHistory();
    } catch (error: any) {
      console.error("Failed to reject recharge:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject the recharge request",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  const handleUpdateUPI = () => {
    try {
      // Store the UPI QR code image in localStorage
      localStorage.setItem('upiImage', upiImage);
      localStorage.setItem('upiId', upiId);
      
      toast({
        title: "UPI info updated",
        description: "The UPI information has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to update UPI info:", error);
      toast({
        title: "Error",
        description: "Failed to update UPI information",
        variant: "destructive",
      });
    }
  };

  return {
    pendingRecharges,
    rechargeHistory,
    upiImage,
    upiId,
    loading,
    processingRecharge,
    setUpiImage,
    setUpiId,
    fetchPendingRecharges,
    fetchRechargeHistory,
    fetchUPIInfo,
    handleApproveRecharge,
    handleRejectRecharge,
    handleUpdateUPI,
  };
};
