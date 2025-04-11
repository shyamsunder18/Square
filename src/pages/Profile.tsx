
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, BadgeDollarSign, Edit, Trash2, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import { useOrders } from "@/contexts/OrderContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userProducts, updateProduct, deleteProduct, getSellerRating } = useProducts();
  const { userOrders, userSales } = useOrders();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("purchases");
  const [editingProduct, setEditingProduct] = useState<null | string>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCount, setEditCount] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<null | string>(null);

  const sellerRating = user ? getSellerRating(user.id) : { average: 0, count: 0 };
  
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold mb-2">My Profile</h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <p className="text-gray-600">{user?.name} • {user?.email}</p>
                
                {sellerRating.count > 0 && (
                  <div className="flex items-center mt-2 md:mt-0">
                    <p className="mr-2 text-sm text-gray-600">Seller Rating:</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= sellerRating.average ? "gold" : "transparent"}
                          color={star <= sellerRating.average ? "gold" : "gray"}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">
                        ({sellerRating.average.toFixed(1)}) from {sellerRating.count} reviews
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
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
                
                <TabsContent value="purchases" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Your Purchases</h2>
                  
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">You haven't made any purchases yet.</p>
                      <div className="flex justify-center gap-4">
                        <Link to="/products">
                          <Button variant="default">Browse Products</Button>
                        </Link>
                        <Link to="/services">
                          <Button variant="outline">Browse Services</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Order #{order.id}</h3>
                            <div className="text-gray-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div className="flex items-center">
                                  <img
                                    src={item.image || "https://via.placeholder.com/40"}
                                    alt={item.title}
                                    className="w-10 h-10 object-cover rounded-md mr-2"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "https://via.placeholder.com/40";
                                    }}
                                  />
                                  <div>
                                    <p className="text-sm">{item.title}</p>
                                    <Badge variant="outline">{item.category}</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₹{item.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between border-t pt-3">
                            <span>Total:</span>
                            <span className="font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="listings" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Your Listings</h2>
                    <Link to="/add-product">
                      <Button>Add Product</Button>
                    </Link>
                  </div>
                  
                  {userProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">You haven't listed any products or services yet.</p>
                      <Link to="/add-product">
                        <Button variant="default">Add Your First Listing</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg overflow-hidden">
                          <img
                            src={product.image || "https://via.placeholder.com/300x150"}
                            alt={product.title}
                            className="w-full h-36 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/300x150";
                            }}
                          />
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{product.title}</h3>
                              <Badge variant="secondary">
                                {product.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                            
                            <div className="flex justify-between items-center mt-3">
                              <span className="font-bold">₹{product.price.toFixed(2)}</span>
                              
                              {product.category === "goods" && (
                                <span className="text-sm">
                                  Stock: <strong>{product.count || 0}</strong>
                                </span>
                              )}
                            </div>
                            
                            {product.reviews && product.reviews.length > 0 && (
                              <div className="mt-2 flex items-center">
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      fill={star <= (product.averageRating || 0) ? "gold" : "transparent"}
                                      color={star <= (product.averageRating || 0) ? "gold" : "gray"}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({product.averageRating?.toFixed(1)}) • {product.reviews.length} reviews
                                </span>
                              </div>
                            )}
                            
                            <div className="flex justify-end gap-2 mt-3">
                              <Button variant="outline" size="sm" onClick={() => handleEditClick(product.id)}>
                                <Edit size={16} className="mr-1" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product.id)}>
                                <Trash2 size={16} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Your Sales</h2>
                  
                  {userSales.length === 0 ? (
                    <div className="text-center py-12">
                      <BadgeDollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">You haven't made any sales yet.</p>
                      <Link to="/add-product">
                        <Button variant="default">Add a Listing</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userSales.map(({ order, items }) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Sale from Order #{order.id}</h3>
                            <div className="text-gray-500 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <div className="flex items-center">
                                  <img
                                    src={item.image || "https://via.placeholder.com/40"}
                                    alt={item.title}
                                    className="w-10 h-10 object-cover rounded-md mr-2"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "https://via.placeholder.com/40";
                                    }}
                                  />
                                  <div>
                                    <p className="text-sm">{item.title}</p>
                                    <Badge variant="outline">{item.category}</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₹{item.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between border-t pt-3">
                            <span>Sale Amount:</span>
                            <span className="font-semibold">
                              ₹{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Make changes to your product information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price">Price (₹)</label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            
            {editingProduct && userProducts.find(p => p.id === editingProduct)?.category === "goods" && (
              <div className="space-y-2">
                <label htmlFor="count">Available Quantity</label>
                <Input
                  id="count"
                  type="number"
                  min="0"
                  value={editCount}
                  onChange={(e) => setEditCount(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product and remove it from listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Profile;
