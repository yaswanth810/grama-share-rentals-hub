
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, MapPin, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'> & {
  listings: Tables<'listings'>;
  profiles: Tables<'profiles'>;
};

const BookingRequests: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookingRequests();
    }
  }, [user]);

  const fetchBookingRequests = async () => {
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
            location_district
          ),
          profiles!bookings_renter_id_fkey (
            id,
            full_name,
            phone,
            village,
            district
          )
        `)
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch booking requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    setProcessingId(bookingId);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });

      fetchBookingRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status === 'approved' ? 'approve' : 'reject'} booking`,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
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
      pending: { variant: 'secondary' as const, label: 'Pending Review' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      completed: { variant: 'default' as const, label: 'Completed' }
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
        <h1 className="text-2xl font-bold text-gray-800">Booking Requests</h1>
        <Badge variant="outline" className="text-sm">
          {bookings.filter(b => b.status === 'pending').length} Pending
        </Badge>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Requests</h3>
            <p className="text-gray-600">
              You haven't received any booking requests yet. Keep your equipment listings active to attract renters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.listings.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{booking.profiles?.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.profiles?.village}, {booking.profiles?.district}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(booking.status || 'pending')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rental Details */}
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

                {/* Customer Notes */}
                {booking.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Customer Notes</span>
                    </label>
                    <p className="text-sm bg-gray-50 p-3 rounded mt-1">{booking.notes}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Customer Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-700">Name:</span> {booking.profiles?.full_name}
                    </div>
                    {booking.profiles?.phone && (
                      <div>
                        <span className="text-blue-700">Phone:</span> {booking.profiles.phone}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                {booking.status === 'pending' && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => updateBookingStatus(booking.id, 'approved')}
                      disabled={processingId === booking.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingId === booking.id ? 'Processing...' : 'Approve Booking'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                      disabled={processingId === booking.id}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processingId === booking.id ? 'Processing...' : 'Reject Booking'}
                    </Button>
                  </div>
                )}

                {booking.status === 'approved' && (
                  <div className="text-center py-2">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Booking approved. Customer has been notified.
                    </p>
                  </div>
                )}

                {booking.status === 'rejected' && (
                  <div className="text-center py-2">
                    <p className="text-sm text-red-600 font-medium">
                      ✗ Booking rejected. Customer has been notified.
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

export default BookingRequests;
