
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Check, 
  X, 
  Wallet, 
  ListCheck, 
  ListX,
  ListOrdered,
  ShoppingCart, 
  Bell, 
  MessageSquare,
  Inbox
} from "lucide-react";

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
  const { isAdmin, isAuthenticated } = useAuth();
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
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find all pending recharge requests across all users
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
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find all completed (approved or rejected) recharge requests across all users
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
      
      // Sort by date (newest first)
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
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Find the recharge entry
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
      
      // Update recharge status and calculate points
      recharge.status = 'approved';
      
      // Update user balance
      const pointsToAdd = recharge.amount + recharge.bonusPoints;
      user.balance = (user.balance || 0) + pointsToAdd;
      
      // Update the user record
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user if needed
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (currentUser && currentUser.id === userId) {
        currentUser.balance = user.balance;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      toast({
        title: "Recharge approved",
        description: `Added ${recharge.amount} points + ${recharge.bonusPoints} bonus points`,
      });
      
      // Remove from pending list and refresh history
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
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Find the recharge entry
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
      
      // Update recharge status
      recharge.status = 'rejected';
      
      // Update the user record
      users[userIndex] = user;
      localStorage.setItem('users', JSON.stringify(users));
      
      toast({
        title: "Recharge rejected",
        description: "The recharge request has been rejected",
      });
      
      // Remove from pending list and refresh history
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
      // Store UPI info in localStorage
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

          {/* Pending Recharges Tab */}
          <TabsContent value="recharges" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Pending Recharge Requests</h2>
            
            {loading ? (
              <p>Loading requests...</p>
            ) : pendingRecharges.length === 0 ? (
              <p className="text-muted-foreground">No pending recharge requests found.</p>
            ) : (
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
                      <TableRow key={recharge.rechargeId}>
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
                          {recharge.date ? format(new Date(recharge.date), 'MMM d, yyyy HH:mm') : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveRecharge(recharge.userId, recharge.rechargeId)}
                              disabled={processingRecharge === recharge.rechargeId}
                            >
                              <Check size={16} className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRecharge(recharge.userId, recharge.rechargeId)}
                              disabled={processingRecharge === recharge.rechargeId}
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
            )}
          </TabsContent>

          {/* Recharge History Tab */}
          <TabsContent value="rechargeHistory" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recharge History</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => fetchRechargeHistory()}
                  className="flex items-center"
                >
                  Refresh
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button 
                size="sm" 
                variant={activeTab === "rechargeHistory" ? "secondary" : "outline"}
                onClick={() => setActiveTab("rechargeHistory")}
                className="flex items-center"
              >
                <ListCheck size={16} className="mr-2" />
                Approved
              </Button>
              <Button 
                size="sm" 
                variant={activeTab === "rejectedRecharges" ? "secondary" : "outline"}
                onClick={() => setActiveTab("rejectedRecharges")}
                className="flex items-center"
              >
                <ListX size={16} className="mr-2" />
                Rejected
              </Button>
            </div>
            
            {rechargeHistory.length === 0 ? (
              <p className="text-muted-foreground">No recharge history found.</p>
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
                    {rechargeHistory
                      .filter(recharge => 
                        activeTab === "rechargeHistory" 
                          ? recharge.status === 'approved' 
                          : recharge.status === 'rejected'
                      )
                      .map((recharge) => (
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
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Listings</h2>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={listingsType === "products" ? "secondary" : "outline"}
                  onClick={() => setListingsType("products")}
                  className="flex items-center"
                >
                  Products
                </Button>
                <Button 
                  size="sm" 
                  variant={listingsType === "services" ? "secondary" : "outline"}
                  onClick={() => setListingsType("services")}
                  className="flex items-center"
                >
                  Services
                </Button>
              </div>
            </div>
            
            {products.length === 0 ? (
              <p className="text-muted-foreground">No listings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter(product => 
                        listingsType === "products" 
                          ? product.type === 'product' || !product.type
                          : product.type === 'service'
                      )
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.sellerName}</TableCell>
                          <TableCell>
                            <Badge className={product.available ? "bg-green-600" : "bg-red-600"}>
                              {product.available ? "Available" : "Unavailable"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">All Sales</h2>
            
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No sales found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id}</TableCell>
                        <TableCell>{order.buyerId}</TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            order.status === 'completed' ? "bg-green-600" : 
                            order.status === 'processing' ? "bg-blue-600" : 
                            "bg-amber-600"
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            
            {adminNotifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications found.</p>
            ) : (
              <div className="space-y-4">
                {adminNotifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border ${!notification.read ? 'border-primary bg-accent/20' : 'bg-white border-border'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        {notification.type === 'system' && notification.message.includes('recharge') ? (
                          <Badge className="bg-blue-100 text-blue-800 mr-2">
                            <Wallet size={14} className="mr-1" />
                            Recharge
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-100 text-purple-800 mr-2">
                            <MessageSquare size={14} className="mr-1" />
                            Message
                          </Badge>
                        )}
                        <h3 className={`font-medium ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm ml-10">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* UPI Settings Tab */}
          <TabsContent value="upi" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">UPI Settings</h2>
            
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">UPI Image URL</label>
                  <Input
                    value={upiImage}
                    onChange={(e) => setUpiImage(e.target.value)}
                    placeholder="https://example.com/upi-qr.png"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the URL for the QR code or UPI payment image
                  </p>
                </div>

                {upiImage && (
                  <div className="mt-2 border p-4 rounded-md w-fit">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img 
                      src={upiImage} 
                      alt="UPI QR Code" 
                      className="max-w-[200px] max-h-[200px] object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">UPI ID</label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                  />
                </div>

                <Button className="w-fit" onClick={handleUpdateUPI}>
                  Save UPI Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
