
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Wrench } from "lucide-react";
import RecommendedProducts from "@/components/product/RecommendedProducts";

const Index = () => {
  return (
    <>
      <Navbar />

      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your One-Stop Marketplace for Products & Services
              </h1>
              <p className="text-xl mb-8">
                Discover a wide range of quality products and professional services
                all in one place. Buy, sell, and connect with our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Link to="/products">
                    <ShoppingBag className="mr-2" size={18} />
                    Explore Products
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  <Link to="/services">
                    <Wrench className="mr-2" size={18} />
                    Discover Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Personalized Recommendations */}
          <RecommendedProducts />

          {/* Categories Section */}
          <section className="my-12">
            <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Link to="/products" className="block group">
                  <div className="h-48 bg-blue-100 flex items-center justify-center">
                    <ShoppingBag size={64} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Products</h3>
                    <p className="text-gray-600 mb-4">
                      Discover electronics, fashion, home goods, and more from sellers all over India.
                    </p>
                    <Button variant="outline" className="group-hover:bg-blue-50 transition-colors">
                      View Products
                    </Button>
                  </div>
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Link to="/services" className="block group">
                  <div className="h-48 bg-green-100 flex items-center justify-center">
                    <Wrench size={64} className="text-green-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Services</h3>
                    <p className="text-gray-600 mb-4">
                      Find professional services like repairs, consultations, design work, and more.
                    </p>
                    <Button variant="outline" className="group-hover:bg-green-50 transition-colors">
                      View Services
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Index;
