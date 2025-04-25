
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAdminActions } from "@/hooks/useAdminActions";
import { useProducts } from "@/contexts/ProductContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  LogOut,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PendingRechargesTab from "@/components/admin/PendingRechargesTab";
import RechargeHistoryTab from "@/components/admin/RechargeHistoryTab";
import SalesTab from "@/components/admin/SalesTab";
import UPISettingsTab from "@/components/admin/UPISettingsTab";
import ListingsTab from "@/components/admin/ListingsTab";

const Admin = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const { products } = useProducts();
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
    uploadUPIImage,
  } = useAdminActions();

  useEffect(() => {
    checkAdmin();
  }, [isAdmin, isAuthenticated]);

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminNotifications = notifications.filter(n => n.receiverId === "admin");

  // Fetch all orders for admin view
  const [allOrders, setAllOrders] = useState([]);
  
  useEffect(() => {
    if (isAdmin) {
      try {
        const orders = JSON.parse(localStorage.getItem("orders") || "[]");
        setAllOrders(orders);
      } catch (error) {
        console.error("Failed to fetch orders for admin:", error);
      }
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Admin Nav */}
      <div className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
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
              Recharge History
            </TabsTrigger>
            <TabsTrigger value="sales">
              All Sales
            </TabsTrigger>
            <TabsTrigger value="listings">
              <Package className="w-4 h-4 mr-2" />
              All Listings
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

          <TabsContent value="sales" className="bg-white p-6 rounded-lg shadow-sm">
            <SalesTab orders={allOrders} />
          </TabsContent>
          
          <TabsContent value="listings" className="bg-white p-6 rounded-lg shadow-sm">
            <ListingsTab
              products={products}
              listingsType={listingsType}
              onTypeChange={setListingsType}
            />
          </TabsContent>

          <TabsContent value="upi" className="bg-white p-6 rounded-lg shadow-sm">
            <UPISettingsTab
              upiImage={upiImage}
              upiId={upiId}
              onUpiImageChange={setUpiImage}
              onUpiIdChange={setUpiId}
              onUpdateUPI={handleUpdateUPI}
              onUploadImage={uploadUPIImage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
