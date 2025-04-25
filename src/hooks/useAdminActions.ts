
import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const useAdminActions = () => {
  const [pendingRecharges, setPendingRecharges] = useState<any[]>([]);
  const [rechargeHistory, setRechargeHistory] = useState<any[]>([]);
  const [upiImage, setUpiImage] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [processingRecharge, setProcessingRecharge] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { refreshUserData } = useAuth();
  
  // Load UPI info from localStorage on initialization
  useEffect(() => {
    fetchUPIInfo();
  }, []);

  const fetchPendingRecharges = () => {
    setLoading(true);
    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Extract pending recharges from all users
      const pending: any[] = [];
      users.forEach((user: any) => {
        if (user.rechargeHistory && user.rechargeHistory.length > 0) {
          user.rechargeHistory.forEach((recharge: any) => {
            if (recharge.status === "pending") {
              pending.push({
                id: recharge.id,
                rechargeId: recharge.id,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                amount: recharge.amount,
                hasReceivedFirstTimeBonus: user.hasReceivedFirstTimeBonus || false,
                utrId: recharge.utrId,
                createdAt: recharge.createdAt
              });
            }
          });
        }
      });
      
      setPendingRecharges(pending);
    } catch (error) {
      console.error("Failed to fetch pending recharges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending recharge requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRechargeHistory = () => {
    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Extract all recharges from all users
      const history: any[] = [];
      users.forEach((user: any) => {
        if (user.rechargeHistory && user.rechargeHistory.length > 0) {
          user.rechargeHistory.forEach((recharge: any) => {
            if (recharge.status === "approved" || recharge.status === "rejected") {
              history.push({
                id: recharge.id,
                rechargeId: recharge.id,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
                amount: recharge.amount,
                utrId: recharge.utrId,
                status: recharge.status,
                pointsAdded: recharge.pointsAdded,
                bonusPoints: recharge.bonusPoints,
                createdAt: recharge.createdAt
              });
            }
          });
        }
      });
      
      // Sort by date, newest first
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setRechargeHistory(history);
    } catch (error) {
      console.error("Failed to fetch recharge history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch recharge history.",
        variant: "destructive",
      });
    }
  };

  const fetchUPIInfo = () => {
    try {
      // Get UPI info from localStorage
      const storedUpiInfo = localStorage.getItem("upiInfo");
      if (storedUpiInfo) {
        const upiInfo = JSON.parse(storedUpiInfo);
        setUpiImage(upiInfo.image || "");
        setUpiId(upiInfo.upiId || "");
      }
    } catch (error) {
      console.error("Failed to fetch UPI info:", error);
      toast({
        title: "Error",
        description: "Failed to load UPI payment information.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUPI = async () => {
    try {
      // Save UPI info to localStorage
      const upiInfo = {
        image: upiImage,
        upiId: upiId
      };
      localStorage.setItem("upiInfo", JSON.stringify(upiInfo));
      
      toast({
        title: "Success",
        description: "UPI payment information updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to update UPI info:", error);
      toast({
        title: "Error",
        description: "Failed to update UPI payment information.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleApproveRecharge = async (userId: string, rechargeId: string, amount: number, isFirstTimeRecharge: boolean) => {
    setProcessingRecharge(rechargeId);
    
    try {
      // Get all users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user with the matching ID
      const userIndex = users.findIndex((user: any) => user.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      // Calculate bonus points based on the recharge amount (only for first time)
      let bonusPoints = 0;
      if (isFirstTimeRecharge && !users[userIndex].hasReceivedFirstTimeBonus) {
        if (amount >= 4000) {
          bonusPoints = 250;
        } else if (amount >= 3000) {
          bonusPoints = 200;
        } else if (amount >= 2000) {
          bonusPoints = 150;
        } else if (amount >= 1000) {
          bonusPoints = 100;
        } else if (amount >= 500) {
          bonusPoints = 50;
        }
        
        // Mark that user has received first-time bonus
        users[userIndex].hasReceivedFirstTimeBonus = true;
      }

      // Find the recharge in the user's history
      const rechargeIndex = users[userIndex].rechargeHistory.findIndex(
        (recharge: any) => recharge.id === rechargeId
      );
      
      if (rechargeIndex === -1) {
        throw new Error("Recharge request not found");
      }
      
      // Update recharge status to approved
      users[userIndex].rechargeHistory[rechargeIndex].status = "approved";
      users[userIndex].rechargeHistory[rechargeIndex].pointsAdded = amount;
      users[userIndex].rechargeHistory[rechargeIndex].bonusPoints = bonusPoints;
      
      // Update user balance
      users[userIndex].balance += amount + bonusPoints;
      
      // Save updated users to localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      // Refresh recharge lists
      fetchPendingRecharges();
      fetchRechargeHistory();
      
      // Notify user 
      addNotification({
        title: "Recharge Approved",
        message: `Your recharge request for ₹${amount} has been approved${bonusPoints > 0 ? ` with a bonus of ₹${bonusPoints}` : ''}.`,
        type: "system",
        item: {
          id: rechargeId,
          title: `Recharge ID: ${rechargeId}`,
        },
        receiverId: userId,
      });
      
      toast({
        title: "Success",
        description: "Recharge request approved successfully.",
      });
      
      // Refresh current user data if needed
      await refreshUserData();
      
      return true;
    } catch (error) {
      console.error("Failed to approve recharge:", error);
      toast({
        title: "Error",
        description: "Failed to approve recharge request.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingRecharge(null);
    }
  };

  const handleRejectRecharge = async (userId: string, rechargeId: string) => {
    setProcessingRecharge(rechargeId);
    
    try {
      // Get all users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user with the matching ID
      const userIndex = users.findIndex((user: any) => user.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Find the recharge in the user's history
      const rechargeIndex = users[userIndex].rechargeHistory.findIndex(
        (recharge: any) => recharge.id === rechargeId
      );
      
      if (rechargeIndex === -1) {
        throw new Error("Recharge request not found");
      }
      
      // Update recharge status to rejected
      users[userIndex].rechargeHistory[rechargeIndex].status = "rejected";
      
      // Save updated users to localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      // Refresh recharge lists
      fetchPendingRecharges();
      fetchRechargeHistory();
      
      // Notify user
      addNotification({
        title: "Recharge Rejected",
        message: "Your recharge request has been rejected. Please contact admin for more details.",
        type: "system",
        item: {
          id: rechargeId,
          title: `Recharge ID: ${rechargeId}`,
        },
        receiverId: userId,
      });
      
      toast({
        title: "Success",
        description: "Recharge request rejected successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to reject recharge:", error);
      toast({
        title: "Error",
        description: "Failed to reject recharge request.",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingRecharge(null);
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
