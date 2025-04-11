
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import { Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddProduct: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<"goods" | "services">("goods");
  const [count, setCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct } = useProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const imageUrl = imagePreview || "";
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        image: imageUrl,
        category,
        ...(category === "goods" ? { count: count ? parseInt(count, 10) : 1 } : {}),
      };
      
      addProduct(productData);
      
      // Navigate to appropriate page based on category
      navigate(category === "goods" ? "/products" : "/services");
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-8">Add New</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="title" className="block text-gray-700 mb-1">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product or service name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="block text-gray-700 mb-1">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of your product or service"
                  rows={5}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="price" className="block text-gray-700 mb-1">Price (₹)</label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in Rupees"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="block text-gray-700 mb-1">Image Upload</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  onClick={triggerFileInput}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors text-center"
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto max-h-48 rounded-md object-contain" 
                      />
                      <p className="text-sm text-primary">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-400" size={32} />
                      <p>Click to upload an image</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="category" className="block text-gray-700 mb-1">Category</label>
                <Select value={category} onValueChange={(value: "goods" | "services") => setCategory(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {category === "goods" && (
                <div className="form-group">
                  <label htmlFor="count" className="block text-gray-700 mb-1">Count</label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    placeholder="Available quantity"
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : category === "goods" ? "Add Product" : "Add Service"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
