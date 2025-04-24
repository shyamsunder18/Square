
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  ListOrdered,
  ShoppingCart, 
  Bell,
  Inbox
} from "lucide-react";
import PendingRechargesTab from "@/components/admin/PendingRechargesTab";
import RechargeHistoryTab from "@/components/admin/RechargeHistoryTab";
import ListingsTab from "@/components/admin/ListingsTab";
import SalesTab from "@/components/admin/SalesTab";
import NotificationsTab from "@/components/admin/NotificationsTab";
import UPISettingsTab from "@/components/admin/UPISettingsTab";

type PendingRecharge = {
  rechargeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bonusPoints: number;
  utrId: string;
  date: string;
};

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

const Admin = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const { products } = useProducts();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingRecharges, setPendingRecharges] = useState<PendingRecharge[]>([]);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeHistory[]>([]);
  const [upiImage, setUpiImage] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingRecharge, setProcessingRecharge] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recharges");
  const [listingsType, setListingsType] = useState("products");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      fetchPendingRecharges();
      fetchRechargeHistory();
      fetchUPIInfo();
    };

    checkAdmin();
  }, [isAdmin, isAuthenticated, navigate, toast]);

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
        image: localStorage.getItem('upiImage') || 'https://via.placeholder.com/300x300?text=UPI+QR+Code',
        upiId: localStorage.getItem('upiId') || 'example@upi'
      };
      
      setUpiImage(upiInfo.image);
      setUpiId(upiInfo.upiId);
    } catch (error) {
      console.error("Failed to fetch UPI info:", error);
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
      
      const pointsToAdd = recharge.amount + recharge.bonusPoints;
      user.balance = (user.balance || 0) + pointsToAdd;
      
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      if (user && user.id === userId) {
        const updatedUserData = { ...user };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      }
      
      toast({
        title: "Recharge approved",
        description: `Added ${recharge.amount} points + ${recharge.bonusPoints} bonus points`,
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

  const handleUpdateUPI = async () => {
    try {
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

  const adminNotifications = notifications.filter(n => n.receiverId === "admin");

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="recharges">
              <Wallet className="w-4 h-4 mr-2" />
              Pending Recharges
              {pendingRecharges.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingRecharges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rechargeHistory">
              <Inbox className="w-4 h-4 mr-2" />
              Recharge History
            </TabsTrigger>
            <TabsTrigger value="listings">
              <ListOrdered className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {adminNotifications.filter(n => !n.read).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {adminNotifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upi">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recharges" className="bg-white p-6 rounded-lg shadow-sm">
            <PendingRechargesTab
              pendingRecharges={pendingRecharges}
              loading={loading}
              processingRecharge={processingRecharge}
              onApprove={handleApproveRecharge}
              onReject={handleRejectRecharge}
            />
          </TabsContent>

          <TabsContent value="rechargeHistory" className="bg-white p-6 rounded-lg shadow-sm">
            <RechargeHistoryTab
              rechargeHistory={rechargeHistory}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="listings" className="bg-white p-6 rounded-lg shadow-sm">
            <ListingsTab
              products={products}
              listingsType={listingsType}
              onTypeChange={setListingsType}
            />
          </TabsContent>

          <TabsContent value="sales" className="bg-white p-6 rounded-lg shadow-sm">
            <SalesTab orders={orders} />
          </TabsContent>

          <TabsContent value="notifications" className="bg-white p-6 rounded-lg shadow-sm">
            <NotificationsTab
              notifications={adminNotifications}
              onMarkAsRead={markAsRead}
            />
          </TabsContent>

          <TabsContent value="upi" className="bg-white p-6 rounded-lg shadow-sm">
            <UPISettingsTab
              upiImage={upiImage}
              upiId={upiId}
              onUpiImageChange={setUpiImage}
              onUpiIdChange={setUpiId}
              onUpdateUPI={handleUpdateUPI}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
