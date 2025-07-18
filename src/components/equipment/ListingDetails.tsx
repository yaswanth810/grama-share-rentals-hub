
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, Calendar, Shield, ArrowLeft, MessageCircle, Phone, CalendarCheck } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

interface ListingDetailsProps {
  listing: Listing;
  onBack: () => void;
  onContact: (listing: Listing) => void;
  onBooking?: (listing: Listing) => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onBack, onContact, onBooking }) => {
  const { t } = useLanguage();

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get the first image or fallback to category icon
  const displayImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t('addListing.backToListings')}</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="h-64 md:h-80 bg-gray-100 flex items-center justify-center rounded-t-lg overflow-hidden">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={listing.title}
                    className="w-full h-full object-cover"
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
                  <span className="text-6xl mb-2">
                    {listing.categories?.icon || '📦'}
                  </span>
                  <span className="text-sm text-center px-2">
                    {listing.categories?.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{listing.title}</span>
                <Badge className={getConditionColor(listing.condition || 'fair')}>
                  {listing.condition}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span>{listing.categories?.icon}</span>
                  <span>{listing.categories?.name}</span>
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{listing.location_village}, {listing.location_district}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rental Terms */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addListing.rentalTerms')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('addListing.minRentalDays')}</p>
                  <p className="text-lg">{listing.min_rental_days} {t('equipmentCard.day')}{listing.min_rental_days !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('addListing.maxRentalDays')}</p>
                  <p className="text-lg">{listing.max_rental_days} {t('equipmentCard.day')}{listing.max_rental_days !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {listing.security_deposit && listing.security_deposit > 0 && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {t('addListing.securityDeposit')}: {formatCurrency(listing.security_deposit)}
                  </span>
                </div>
              )}

              {listing.pickup_delivery_options && listing.pickup_delivery_options.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t('addListing.pickupOptions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {listing.pickup_delivery_options.map((option, index) => (
                      <Badge key={index} variant="secondary">{option}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addListing.pricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(listing.daily_rate)}
                </p>
                <p className="text-sm text-gray-600">{t('equipmentCard.day')}</p>
              </div>
              
              {listing.weekly_rate && (
                <>
                  <Separator />
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(listing.weekly_rate)}
                    </p>
                    <p className="text-sm text-gray-600">{t('equipmentCard.week')}</p>
                  </div>
                </>
              )}
              
              {listing.monthly_rate && (
                <>
                  <Separator />
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800">
                      {formatCurrency(listing.monthly_rate)}
                    </p>
                    <p className="text-sm text-gray-600">per month</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-700">
                    {listing.profiles?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{listing.profiles?.full_name}</p>
                  <p className="text-sm text-gray-600">@{listing.profiles?.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">
                  {listing.profiles?.rating ? listing.profiles.rating.toFixed(1) : t('equipmentCard.new')}
                </span>
                {listing.profiles?.total_ratings && listing.profiles.total_ratings > 0 && (
                  <span className="text-sm text-gray-600">
                    ({listing.profiles.total_ratings} review{listing.profiles.total_ratings !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{listing.profiles?.village}, {listing.profiles?.district}</span>
              </div>
              
              {listing.profiles?.bio && (
                <p className="text-sm text-gray-700 italic">{listing.profiles.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {onBooking && (
                <Button 
                  onClick={() => onBooking(listing)} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              )}
              
              <Button 
                onClick={() => onContact(listing)} 
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('equipmentCard.contact')} Owner
              </Button>
              
              {listing.profiles?.phone && (
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Owner
                </Button>
              )}
              
              <div className="flex items-center space-x-1 text-xs text-gray-500 justify-center">
                <Calendar className="h-3 w-3" />
                <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
