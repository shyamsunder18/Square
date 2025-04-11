
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will be redirected to login
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-16">What are you looking for today?</h1>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Products Card */}
            <Link to="/products" className="block">
              <div className="bg-white rounded-lg shadow-md p-8 transition-all hover:shadow-lg flex flex-col items-center">
                <div className="w-24 h-24 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Products</h2>
                <p className="text-gray-600 text-center">Browse physical products from our marketplace</p>
              </div>
            </Link>
            
            {/* Services Card */}
            <Link to="/services" className="block">
              <div className="bg-white rounded-lg shadow-md p-8 transition-all hover:shadow-lg flex flex-col items-center">
                <div className="w-24 h-24 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                  <Briefcase className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Services</h2>
                <p className="text-gray-600 text-center">Find professional services and expertise</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
