
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import { useAdminActions } from "@/hooks/useAdminActions";
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

const Admin = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const { products } = useProducts();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recharges");
  const [listingsType, setListingsType] = useState("products");
  
  const {
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
  } = useAdminActions();

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
