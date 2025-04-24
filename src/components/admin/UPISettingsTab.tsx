
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UPISettingsTabProps {
  upiImage: string;
  upiId: string;
  onUpiImageChange: (value: string) => void;
  onUpiIdChange: (value: string) => void;
  onUpdateUPI: () => void;
}

const UPISettingsTab: React.FC<UPISettingsTabProps> = ({
  upiImage,
  upiId,
  onUpiImageChange,
  onUpiIdChange,
  onUpdateUPI,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">UPI Settings</h2>
      
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">UPI Image URL</label>
            <Input
              value={upiImage}
              onChange={(e) => onUpiImageChange(e.target.value)}
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
              onChange={(e) => onUpiIdChange(e.target.value)}
              placeholder="yourname@upi"
            />
          </div>

          <Button className="w-fit" onClick={onUpdateUPI}>
            Save UPI Settings
          </Button>
        </div>
      </div>
    </>
  );
};

export default UPISettingsTab;
