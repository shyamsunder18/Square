
import React from "react";
import { Input } from "@/components/ui/input";

interface ShippingFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  address: string;
  setAddress: (address: string) => void;
  city: string;
  setCity: (city: string) => void;
  state: string;
  setState: (state: string) => void;
  zip: string;
  setZip: (zip: string) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  zip,
  setZip,
}) => {
  return (
    <div className="form-group">
      <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="name" className="block text-gray-700 mb-1">Full Name*</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="block text-gray-700 mb-1">Email*</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>
        <div className="form-group md:col-span-2">
          <label htmlFor="address" className="block text-gray-700 mb-1">Address*</label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city" className="block text-gray-700 mb-1">City*</label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mumbai"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state" className="block text-gray-700 mb-1">State*</label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Maharashtra"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="zip" className="block text-gray-700 mb-1">PIN Code*</label>
          <Input
            id="zip"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="400001"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
