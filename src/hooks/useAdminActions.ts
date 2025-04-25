
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useAdminActions = () => {
  const [pendingRecharges, setPendingRecharges] = useState<any[]>([]);
  const [rechargeHistory, setRechargeHistory] = useState<any[]>([]);
  const [upiImage, setUpiImage] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [processingRecharge, setProcessingRecharge] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();
  
  // Get all users with pending recharge requests
  const fetchPendingRecharges = useCallback(() => {
    try {
      setLoading(true);
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const pendingRequests: any[] = [];
      
      users.forEach((user: any) => {
        if (user.rechargeHistory && Array.isArray(user.rechargeHistory)) {
          const userPendingRecharges = user.rechargeHistory
            .filter((recharge: any) => recharge.status === 'pending')
            .map((recharge: any) => ({
              id: recharge.id,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              amount: recharge.amount,
              utrId: recharge.utrId,
              status: recharge.status,
              createdAt: recharge.createdAt,
              hasReceivedFirstTimeBonus: user.hasReceivedFirstTimeBonus || false
            }));
            
          pendingRequests.push(...userPendingRecharges);
        }
      });
      
      // Sort by newest first
      pendingRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingRecharges(pendingRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending recharges:', error);
      toast({
        title: "Failed to load pending recharges",
        description: "There was an error loading the pending recharge requests.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  // Get recharge history
  const fetchRechargeHistory = useCallback(() => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const allHistory: any[] = [];
      
      users.forEach((user: any) => {
        if (user.rechargeHistory && Array.isArray(user.rechargeHistory)) {
          const userRecharges = user.rechargeHistory
            .filter((recharge: any) => recharge.status !== 'pending')
            .map((recharge: any) => ({
              id: recharge.id,
              userId: user.id,
              userName: user.name,
              amount: recharge.amount,
              pointsAdded: recharge.pointsAdded || 0,
              bonusPoints: recharge.bonusPoints || 0,
              status: recharge.status,
              utrId: recharge.utrId,
              createdAt: recharge.createdAt
            }));
            
          allHistory.push(...userRecharges);
        }
      });
      
      // Sort by newest first
      allHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRechargeHistory(allHistory);
    } catch (error) {
      console.error('Error fetching recharge history:', error);
      toast({
        title: "Failed to load recharge history",
        description: "There was an error loading the recharge history.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Get UPI info from localStorage
  const fetchUPIInfo = useCallback(() => {
    try {
      const storedUPIInfo = localStorage.getItem('upiInfo');
      if (storedUPIInfo) {
        const upiInfo = JSON.parse(storedUPIInfo);
        setUpiImage(upiInfo.image || "");
        setUpiId(upiInfo.upiId || "");
      }
    } catch (error) {
      console.error('Error fetching UPI info:', error);
    }
  }, []);

  // Calculate bonus points based on amount and first-time recharge status
  const calculateBonusPoints = (amount: number, isFirstTime: boolean) => {
    // Only apply bonus for first-time recharges
    if (!isFirstTime) return 0;
    
    if (amount < 500) return 0;
    else if (amount >= 500 && amount < 1000) return 50;
    else if (amount >= 1000 && amount < 2000) return 100;
    else if (amount >= 2000 && amount < 3000) return 150;
    else if (amount >= 3000 && amount < 4000) return 200;
    else return 250; // for amount >= 4000
  };

  // Handle approve recharge
  const handleApproveRecharge = async (userId: string, rechargeId: string, amount: number, isFirstTimeRecharge: boolean) => {
    try {
      setProcessingRecharge(rechargeId);
      
      // Get users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Find recharge in user's history
      const user = users[userIndex];
      const rechargeIndex = user.rechargeHistory.findIndex((r: any) => r.id === rechargeId);
      
      if (rechargeIndex === -1) {
        throw new Error('Recharge request not found');
      }
      
      // Calculate bonus points if this is user's first recharge
      const bonusPoints = calculateBonusPoints(amount, !user.hasReceivedFirstTimeBonus);
      
      // Update recharge status
      user.rechargeHistory[rechargeIndex] = {
        ...user.rechargeHistory[rechargeIndex],
        status: 'approved',
        pointsAdded: amount,
        bonusPoints: bonusPoints,
        approvedAt: new Date().toISOString()
      };
      
      // Update user balance
      user.balance = (user.balance || 0) + amount + bonusPoints;
      
      // Mark that user has received first-time bonus
      if (!user.hasReceivedFirstTimeBonus) {
        user.hasReceivedFirstTimeBonus = true;
      }
      
      // Update users array in localStorage
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Refresh lists
      fetchPendingRecharges();
      fetchRechargeHistory();
      
      // Create notification for the user
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: `notification-${Date.now()}`,
        receiverId: userId,
        type: 'recharge-approved',
        title: 'Recharge Approved',
        message: `Your recharge of ₹${amount} has been approved${bonusPoints > 0 ? ` with a bonus of ₹${bonusPoints}!` : '!'}`,
        read: false,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      toast({
        title: "Recharge approved",
        description: `Successfully approved recharge for ${user.name}.`,
      });
      
      // Update current user data if admin is handling their own recharge
      if (user.id === user?.id) {
        await refreshUserData();
      }
      
    } catch (error) {
      console.error('Error approving recharge:', error);
      toast({
        title: "Failed to approve recharge",
        description: "There was an error approving this recharge request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  // Handle reject recharge
  const handleRejectRecharge = async (userId: string, rechargeId: string) => {
    try {
      setProcessingRecharge(rechargeId);
      
      // Get users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Find recharge in user's history
      const user = users[userIndex];
      const rechargeIndex = user.rechargeHistory.findIndex((r: any) => r.id === rechargeId);
      
      if (rechargeIndex === -1) {
        throw new Error('Recharge request not found');
      }
      
      // Update recharge status
      user.rechargeHistory[rechargeIndex] = {
        ...user.rechargeHistory[rechargeIndex],
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      };
      
      // Update users array in localStorage
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Refresh lists
      fetchPendingRecharges();
      fetchRechargeHistory();
      
      // Create notification for the user
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        id: `notification-${Date.now()}`,
        receiverId: userId,
        type: 'recharge-rejected',
        title: 'Recharge Rejected',
        message: 'Your recharge request has been rejected. Please contact admin for details.',
        read: false,
        createdAt: new Date().toISOString()
      });
      
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      toast({
        title: "Recharge rejected",
        description: `Rejected recharge request for ${user.name}.`,
      });
      
    } catch (error) {
      console.error('Error rejecting recharge:', error);
      toast({
        title: "Failed to reject recharge",
        description: "There was an error rejecting this recharge request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  // Update UPI info
  const handleUpdateUPI = () => {
    try {
      // Save UPI info to localStorage
      const upiInfo = { image: upiImage, upiId };
      localStorage.setItem('upiInfo', JSON.stringify(upiInfo));
      
      toast({
        title: "UPI info updated",
        description: "UPI information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating UPI info:', error);
      toast({
        title: "Failed to update UPI info",
        description: "There was an error updating UPI information.",
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
