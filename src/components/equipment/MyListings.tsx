
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Edit, Trash2, Eye, MapPin, Calendar } from 'lucide-react';

type Listing = Tables<'listings'> & {
  categories: Tables<'categories'>;
};

interface MyListingsProps {
  onEditListing: (listing: Listing) => void;
  onViewListing: (listing: Listing) => void;
}

const MyListings: React.FC<MyListingsProps> = ({ onEditListing, onViewListing }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const fetchMyListings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories(*)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your listings",
        variant: "destructive"
      });
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const deleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
      fetchMyListings();
    }
  };

  const toggleAvailability = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    
    const { error } = await supabase
      .from('listings')
      .update({ availability_status: newStatus })
      .eq('id', listingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Listing marked as ${newStatus}`
      });
      fetchMyListings();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('header.myListings')}</h2>
        <p className="text-gray-600">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 text-lg">You haven't created any listings yet.</p>
            <p className="text-gray-400 text-sm mt-2">Start sharing your equipment with the community!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing) => {
            // Get the first image or fallback to category icon
            const displayImage = listing.images && listing.images.length > 0 
              ? listing.images[0] 
              : null;

            return (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    <Badge className={getStatusColor(listing.availability_status || 'available')}>
                      {listing.availability_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-40 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
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
                      <span className="text-4xl mb-2">
                        {listing.categories?.icon || '📦'}
                      </span>
                      <span className="text-sm text-center px-2">
                        {listing.categories?.name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <span>{listing.categories?.icon}</span>
                      <span>{listing.categories?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.location_village}, {listing.location_district}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(listing.daily_rate)}
                    </p>
                    <p className="text-sm text-gray-600">{t('equipmentCard.day')}</p>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewListing(listing)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditListing(listing)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(listing.id, listing.availability_status || 'available')}
                      className="flex-1"
                    >
                      {listing.availability_status === 'available' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteListing(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;
