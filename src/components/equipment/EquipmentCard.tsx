
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Eye, MessageCircle, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type SimpleListing = {
  id: string;
  title: string;
  description: string;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  security_deposit: number | null;
  min_rental_days: number | null;
  max_rental_days: number | null;
  condition: string | null;
  images: string[] | null;
  location_village: string;
  location_district: string;
  location_state: string;
  category_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  availability_status: string | null;
  pickup_delivery_options: string[] | null;
  profiles: {
    id: string;
    full_name: string;
    rating: number | null;
    avatar_url: string | null;
    username: string;
  };
  categories: {
    id: string;
    name: string;
    icon: string | null;
  };
};

interface EquipmentCardProps {
  listing: SimpleListing;
  onViewDetails: (listing: SimpleListing) => void;
  onContact: (listing: SimpleListing) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  listing, 
  onViewDetails, 
  onContact 
}) => {
  const { t } = useLanguage();
  
  // Get the first image or fallback to category icon
  const displayImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image Section */}
      <div className="aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={listing.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback to category icon if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.parentElement?.querySelector('.fallback-content');
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div 
          className={`flex flex-col items-center justify-center text-gray-400 ${displayImage ? 'hidden' : ''} fallback-content`}
          style={{ display: displayImage ? 'none' : 'flex' }}
        >
          <span className="text-4xl md:text-6xl mb-2">
            {listing.categories?.icon || '📦'}
          </span>
          <span className="text-xs md:text-sm text-center px-2">
            {listing.categories?.name}
          </span>
        </div>
      </div>

      <CardContent className="p-3 md:p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
              {listing.title}
            </h3>
            <div className="flex items-center text-xs md:text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {listing.location_village}, {listing.location_district}
              </span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center ml-2 flex-shrink-0">
            <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
            <span className="text-xs md:text-sm text-gray-600 ml-1">
              {listing.profiles?.rating?.toFixed(1) || t('equipmentCard.new')}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
          {listing.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="secondary" className="text-xs">
            {listing.condition}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {listing.categories?.name}
          </Badge>
        </div>

        {/* Pricing */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg md:text-xl font-bold text-green-600">
              ₹{listing.daily_rate}
            </span>
            <span className="text-xs md:text-sm text-gray-500">{t('equipmentCard.day')}</span>
          </div>
          {listing.weekly_rate && (
            <div className="text-xs text-gray-500">
              ₹{listing.weekly_rate}{t('equipmentCard.week')}
            </div>
          )}
        </div>

        {/* Rental Terms */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {listing.min_rental_days}-{listing.max_rental_days} {t('equipmentCard.days')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetails(listing)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs md:text-sm"
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            {t('equipmentCard.viewDetails')}
          </Button>
          <Button
            onClick={() => onContact(listing)}
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
          >
            <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            {t('equipmentCard.contact')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
