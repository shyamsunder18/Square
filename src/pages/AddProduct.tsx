
import React, { useState } from "react";
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

const AddProduct: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<"goods" | "services">("goods");
  const [count, setCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addProduct } = useProducts();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
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
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
            
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
                <label htmlFor="price" className="block text-gray-700 mb-1">Price</label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image" className="block text-gray-700 mb-1">Image URL</label>
                <Input
                  id="image"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
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
                {isSubmitting ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProduct;
