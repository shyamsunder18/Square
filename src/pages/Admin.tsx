
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { rechargeAPI } from "@/services/api";
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
import { Check, X } from "lucide-react";

type PendingRecharge = {
  rechargeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  utrId: string;
  date: string;
};

const Admin = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingRecharges, setPendingRecharges] = useState<PendingRecharge[]>([]);
  const [upiImage, setUpiImage] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingRecharge, setProcessingRecharge] = useState<string | null>(null);

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
      fetchUPIInfo();
    };

    checkAdmin();
  }, [isAdmin, isAuthenticated, navigate, toast]);

  const fetchPendingRecharges = async () => {
    try {
      setLoading(true);
      const response = await rechargeAPI.getPendingRequests();
      setPendingRecharges(response.data);
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

  const fetchUPIInfo = async () => {
    try {
      const response = await rechargeAPI.getUPIInfo();
      setUpiImage(response.data.image);
      setUpiId(response.data.upiId);
    } catch (error) {
      console.error("Failed to fetch UPI info:", error);
    }
  };

  const handleApproveRecharge = async (userId: string, rechargeId: string) => {
    try {
      setProcessingRecharge(rechargeId);
      const response = await rechargeAPI.approveRecharge(userId, rechargeId);
      
      toast({
        title: "Recharge approved",
        description: `Added ${response.data.pointsAdded} points + ${response.data.bonusPoints} bonus points`,
      });
      
      // Remove from pending list
      setPendingRecharges(prev => 
        prev.filter(r => !(r.userId === userId && r.rechargeId === rechargeId))
      );
    } catch (error) {
      console.error("Failed to approve recharge:", error);
      toast({
        title: "Error",
        description: "Failed to approve the recharge request",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  const handleRejectRecharge = async (userId: string, rechargeId: string) => {
    try {
      setProcessingRecharge(rechargeId);
      await rechargeAPI.rejectRecharge(userId, rechargeId);
      
      toast({
        title: "Recharge rejected",
        description: "The recharge request has been rejected",
      });
      
      // Remove from pending list
      setPendingRecharges(prev => 
        prev.filter(r => !(r.userId === userId && r.rechargeId === rechargeId))
      );
    } catch (error) {
      console.error("Failed to reject recharge:", error);
      toast({
        title: "Error",
        description: "Failed to reject the recharge request",
        variant: "destructive",
      });
    } finally {
      setProcessingRecharge(null);
    }
  };

  const handleUpdateUPI = async () => {
    try {
      await rechargeAPI.updateUPIInfo({ image: upiImage, upiId });
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="recharges">
          <TabsList className="mb-6">
            <TabsTrigger value="recharges">Pending Recharges</TabsTrigger>
            <TabsTrigger value="upi">UPI Settings</TabsTrigger>
          </TabsList>

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
