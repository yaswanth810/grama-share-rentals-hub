import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

type Listing = Tables<'listings'> & {
  profiles?: Tables<'profiles'>;
  categories?: Tables<'categories'>;
};

interface AddListingProps {
  onBack: () => void;
  listing?: Listing;
}

const AddListing: React.FC<AddListingProps> = ({ onBack, listing }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!listing;
  
  // Form state
  const [formData, setFormData] = useState({
    title: listing?.title || '',
    description: listing?.description || '',
    category_id: listing?.category_id || '',
    daily_rate: listing?.daily_rate?.toString() || '',
    weekly_rate: listing?.weekly_rate?.toString() || '',
    monthly_rate: listing?.monthly_rate?.toString() || '',
    security_deposit: listing?.security_deposit?.toString() || '',
    condition: listing?.condition || '',
    location_village: listing?.location_village || '',
    location_district: listing?.location_district || '',
    location_state: listing?.location_state || '',
    min_rental_days: listing?.min_rental_days?.toString() || '1',
    max_rental_days: listing?.max_rental_days?.toString() || '30',
  });

  const [pickupOptions, setPickupOptions] = useState<string[]>(
    listing?.pickup_delivery_options || []
  );

  const [images, setImages] = useState<string[]>(listing?.images || []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePickupOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      setPickupOptions(prev => [...prev, option]);
    } else {
      setPickupOptions(prev => prev.filter(o => o !== option));
    }
  };

  const validateForm = () => {
    const required = ['title', 'description', 'category_id', 'daily_rate', 'condition', 'location_village', 'location_district', 'location_state'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    if (parseFloat(formData.daily_rate) <= 0) {
      toast({
        title: "Invalid rate",
        description: "Daily rate must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const listingData = {
        owner_id: user!.id,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        daily_rate: parseFloat(formData.daily_rate),
        weekly_rate: formData.weekly_rate ? parseFloat(formData.weekly_rate) : null,
        monthly_rate: formData.monthly_rate ? parseFloat(formData.monthly_rate) : null,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : 0,
        condition: formData.condition,
        location_village: formData.location_village,
        location_district: formData.location_district,
        location_state: formData.location_state,
        min_rental_days: parseInt(formData.min_rental_days),
        max_rental_days: parseInt(formData.max_rental_days),
        pickup_delivery_options: pickupOptions,
        images: images
      };

      if (isEditing && listing) {
        const { error } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', listing.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your equipment listing has been updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('listings')
          .insert(listingData);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Your equipment has been listed successfully."
        });
      }

      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: isEditing ? "Failed to update listing. Please try again." : "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            <span>{isEditing ? 'Edit Equipment Listing' : 'Add New Equipment Listing'}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isEditing 
              ? 'Update your equipment details and pricing.'
              : 'List your equipment for rent and start earning from your unused items.'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Equipment Title *</Label>
              <Input
                id="title"
                placeholder="e.g., John Deere Tractor, Cement Mixer, Generator"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your equipment, its features, and any special instructions..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Equipment Images</h3>
            <ImageUpload 
              images={images}
              onImagesChange={setImages}
              maxImages={3}
              maxSizePerImage={2}
            />
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-medium">Pricing</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Daily Rate (₹) *</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  placeholder="500"
                  value={formData.daily_rate}
                  onChange={(e) => handleInputChange('daily_rate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                <Input
                  id="security_deposit"
                  type="number"
                  placeholder="1000"
                  value={formData.security_deposit}
                  onChange={(e) => handleInputChange('security_deposit', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekly_rate">Weekly Rate (₹)</Label>
                <Input
                  id="weekly_rate"
                  type="number"
                  placeholder="3000"
                  value={formData.weekly_rate}
                  onChange={(e) => handleInputChange('weekly_rate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_rate">Monthly Rate (₹)</Label>
                <Input
                  id="monthly_rate"
                  type="number"
                  placeholder="10000"
                  value={formData.monthly_rate}
                  onChange={(e) => handleInputChange('monthly_rate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium">Location</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="village">Village *</Label>
                <Input
                  id="village"
                  placeholder="Village name"
                  value={formData.location_village}
                  onChange={(e) => handleInputChange('location_village', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="District name"
                  value={formData.location_district}
                  onChange={(e) => handleInputChange('location_district', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State name"
                  value={formData.location_state}
                  onChange={(e) => handleInputChange('location_state', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rental Terms */}
          <div className="space-y-4">
            <h3 className="font-medium">Rental Terms</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_days">Minimum Rental Days</Label>
                <Input
                  id="min_days"
                  type="number"
                  min="1"
                  value={formData.min_rental_days}
                  onChange={(e) => handleInputChange('min_rental_days', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_days">Maximum Rental Days</Label>
                <Input
                  id="max_days"
                  type="number"
                  min="1"
                  value={formData.max_rental_days}
                  onChange={(e) => handleInputChange('max_rental_days', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Pickup/Delivery Options</Label>
              <div className="space-y-2">
                {['Self Pickup', 'Home Delivery', 'Meet at Location'].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={pickupOptions.includes(option)}
                      onCheckedChange={(checked) => handlePickupOptionChange(option, checked as boolean)}
                    />
                    <Label htmlFor={option} className="text-sm">{option}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading 
              ? (isEditing ? "Updating Listing..." : "Creating Listing...") 
              : (isEditing ? "Update Listing" : "Create Listing")
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddListing;
