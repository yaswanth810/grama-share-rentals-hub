
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 3, 
  maxSizePerImage = 2 
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes
    for (let file of Array.from(files)) {
      if (file.size > maxSizePerImage * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSizePerImage}MB`,
          variant: "destructive"
        });
        return;
      }
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let file of Array.from(files)) {
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      }

      onImagesChange([...images, ...newImages]);
      toast({
        title: "Images uploaded successfully",
        description: `${newImages.length} image(s) added to your listing`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      // Extract filename from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user?.id}/${fileName}`;

      await supabase.storage
        .from('listing-images')
        .remove([filePath]);

      const updatedImages = images.filter((_, i) => i !== index);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Equipment Images ({images.length}/{maxImages})</Label>
        <span className="text-xs text-gray-500">Max {maxSizePerImage}MB per image</span>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Equipment image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(imageUrl, index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <div className="animate-pulse">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-sm">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </span>
                <p className="text-gray-500">PNG, JPG up to {maxSizePerImage}MB each</p>
              </div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
