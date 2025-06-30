
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type BookingWithDetails = Tables<'bookings'> & {
  listings: {
    id: string;
    title: string;
    daily_rate: number;
    location_village: string;
    location_district: string;
    images: string[] | null;
  };
  profiles: {
    id: string;
    full_name: string;
    phone: string | null;
    village: string;
    district: string;
  };
};

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listings!inner (
            id,
            title,
            daily_rate,
            location_village,
            location_district,
            images
          ),
          profiles!bookings_owner_id_fkey (
            id,
            full_name,
            phone,
            village,
            district
          )
        `)
        .eq('renter_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'outline' as const, label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
        <Badge variant="outline" className="text-sm">
          {bookings.length} Total
        </Badge>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600">
              You haven't made any bookings yet. Browse equipment and make your first rental!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4">
                    {/* Equipment Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {booking.listings.images && booking.listings.images.length > 0 ? (
                        <img
                          src={booking.listings.images[0]}
                          alt={booking.listings.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.listings.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{booking.profiles?.full_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.listings.location_village}, {booking.listings.location_district}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(booking.status || 'pending')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rental Period</label>
                    <p className="text-sm">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pickup Method</label>
                    <p className="text-sm capitalize">{booking.pickup_method || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(booking.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Owner Contact - Only show for confirmed bookings */}
                {booking.status === 'confirmed' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Owner Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-700">Name:</span> {booking.profiles?.full_name}
                      </div>
                      {booking.profiles?.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-green-700" />
                          <span className="text-green-700">Phone:</span> {booking.profiles.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {booking.status === 'pending' && (
                  <div className="text-center py-2">
                    <p className="text-sm text-yellow-600 font-medium">
                      ⏳ Waiting for owner approval
                    </p>
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div className="text-center py-2">
                    <p className="text-sm text-red-600 font-medium">
                      ✗ This booking was cancelled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
