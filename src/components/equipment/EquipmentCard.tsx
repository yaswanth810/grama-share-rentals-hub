
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

interface EquipmentCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  onContact: (listing: Listing) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ listing, onViewDetails, onContact }) => {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center">
          <span className="text-4xl">{listing.categories?.icon || '📦'}</span>
        </div>
        <Badge className="absolute top-2 right-2 bg-white text-gray-800">
          {listing.categories?.name}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{listing.location_village}, {listing.location_district}</span>
          </div>
          <Badge className={getConditionColor(listing.condition || 'fair')}>
            {listing.condition}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              {listing.profiles?.rating ? `${listing.profiles.rating} (${listing.profiles.total_ratings})` : 'New'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{listing.min_rental_days}-{listing.max_rental_days} days</span>
          </div>
        </div>
        
        <div className="text-xl font-bold text-green-600 mb-3">
          ₹{listing.daily_rate}/day
          {listing.weekly_rate && (
            <span className="text-sm text-gray-600 ml-2">
              ₹{listing.weekly_rate}/week
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-x-2">
        <Button variant="outline" onClick={() => onViewDetails(listing)} className="flex-1">
          View Details
        </Button>
        <Button onClick={() => onContact(listing)} className="flex-1 bg-green-600 hover:bg-green-700">
          Contact Owner
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
