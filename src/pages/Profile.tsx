
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package, BadgeDollarSign } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

// Import profile components
import ProfileHeader from "@/components/profile/ProfileHeader";
import PurchasesTab from "@/components/profile/PurchasesTab";
import ListingsTab from "@/components/profile/ListingsTab";
import SalesTab from "@/components/profile/SalesTab";
import EditProductDialog from "@/components/profile/EditProductDialog";
import DeleteProductDialog from "@/components/profile/DeleteProductDialog";
import { useToast } from "@/hooks/use-toast";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userProducts, updateProduct, deleteProduct } = useProducts();
  const { userOrders, userSales } = useOrders();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("purchases");
  const [editingProduct, setEditingProduct] = useState<null | string>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCount, setEditCount] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<null | string>(null);

  const handleEditClick = (productId: string) => {
    const product = userProducts.find(p => p.id === productId);
    if (product) {
      setEditingProduct(productId);
      setEditTitle(product.title);
      setEditDescription(product.description);
      setEditPrice(product.price.toString());
      if (product.count !== undefined) {
        setEditCount(product.count.toString());
      } else {
        setEditCount("");
      }
    }
  };
  
  const handleSaveEdit = () => {
    if (!editingProduct) return;
    
    const updates: any = {
      title: editTitle,
      description: editDescription,
      price: parseFloat(editPrice),
    };
    
    // Only add count if this is a good (not a service)
    const product = userProducts.find(p => p.id === editingProduct);
    if (product && product.category === "goods" && editCount) {
      updates.count = parseInt(editCount, 10);
    }
    
    updateProduct(editingProduct, updates);
    setEditingProduct(null);
    
    toast({
      title: "Product updated",
      description: "Your product has been updated successfully.",
    });
  };
  
  const handleDeleteClick = (productId: string) => {
    setDeleteProductId(productId);
  };
  
  const handleConfirmDelete = () => {
    if (!deleteProductId) return;
    
    deleteProduct(deleteProductId);
    setDeleteProductId(null);
    
    toast({
      title: "Product deleted",
      description: "Your product has been deleted successfully.",
    });
  };

  // Determine if the count field should be shown based on the product category
  const showCountField = editingProduct 
    ? userProducts.find(p => p.id === editingProduct)?.category === "goods" 
    : false;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* User Info */}
            <ProfileHeader />
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="purchases" className="flex items-center">
                    <ShoppingCart className="mr-2" size={18} />
                    <span>My Purchases</span>
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="flex items-center">
                    <Package className="mr-2" size={18} />
                    <span>My Listings</span>
                  </TabsTrigger>
                  <TabsTrigger value="sales" className="flex items-center">
                    <BadgeDollarSign className="mr-2" size={18} />
                    <span>My Sales</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="purchases">
                  <PurchasesTab userOrders={userOrders} />
                </TabsContent>
                
                <TabsContent value="listings">
                  <ListingsTab 
                    userProducts={userProducts} 
                    onEditClick={handleEditClick} 
                    onDeleteClick={handleDeleteClick}
                  />
                </TabsContent>
                
                <TabsContent value="sales">
                  <SalesTab userSales={userSales} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Edit Product Dialog */}
      <EditProductDialog
        isOpen={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editCount={editCount}
        setEditCount={setEditCount}
        showCountField={showCountField}
        onSave={handleSaveEdit}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        isOpen={!!deleteProductId}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Profile;
