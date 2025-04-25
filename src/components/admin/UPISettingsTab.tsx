
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface UPISettingsTabProps {
  upiImage: string;
  upiId: string;
  onUpiImageChange: (value: string) => void;
  onUpiIdChange: (value: string) => void;
  onUpdateUPI: () => void;
  onUploadImage?: (file: File) => Promise<string>;
}

const UPISettingsTab: React.FC<UPISettingsTabProps> = ({
  upiImage,
  upiId,
  onUpiImageChange,
  onUpiIdChange,
  onUpdateUPI,
  onUploadImage,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await onUploadImage(file);
      onUpiImageChange(imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">UPI Settings</h2>
      
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">UPI QR Code Image</label>
            <div className="flex items-center gap-2">
              <Input
                value={upiImage}
                onChange={(e) => onUpiImageChange(e.target.value)}
                placeholder="https://example.com/upi-qr.png"
                className="flex-1"
              />
              {onUploadImage && (
                <>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the URL for the QR code or upload an image directly
            </p>
          </div>

          {upiImage && (
            <div className="mt-2 border p-4 rounded-md w-fit">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img 
                src={upiImage} 
                alt="UPI QR Code" 
                className="max-w-[200px] max-h-[200px] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/200?text=QR+Code+Error";
                }}
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
