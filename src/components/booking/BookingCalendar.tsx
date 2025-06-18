
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { CalendarIcon, Calculator } from 'lucide-react';
import { addDays, differenceInDays } from 'date-fns';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

interface BookingCalendarProps {
  listing: Listing;
  onBookingComplete: () => void;
  onCancel: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ listing, onBookingComplete, onCancel }) => {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    
    const days = differenceInDays(endDate, startDate) + 1;
    const dailyRate = listing.daily_rate;
    const weeklyRate = listing.weekly_rate;
    const monthlyRate = listing.monthly_rate;
    
    // Calculate best rate
    if (monthlyRate && days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return (months * monthlyRate) + (remainingDays * dailyRate);
    } else if (weeklyRate && days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return (weeks * weeklyRate) + (remainingDays * dailyRate);
    } else {
      return days * dailyRate;
    }
  };

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (!date) return;
    
    if (type === 'start') {
      setStartDate(date);
      // Auto-set end date to minimum rental period
      const minEndDate = addDays(date, (listing.min_rental_days || 1) - 1);
      setEndDate(minEndDate);
    } else {
      setEndDate(date);
    }
  };

  const submitBooking = async () => {
    if (!user || !startDate || !endDate) return;
    
    const days = differenceInDays(endDate, startDate) + 1;
    
    if (days < (listing.min_rental_days || 1)) {
      toast({
        title: "Invalid Duration",
        description: `Minimum rental period is ${listing.min_rental_days} days`,
        variant: "destructive"
      });
      return;
    }
    
    if (days > (listing.max_rental_days || 30)) {
      toast({
        title: "Invalid Duration",
        description: `Maximum rental period is ${listing.max_rental_days} days`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const totalAmount = calculateTotal();
    
    const { error } = await supabase
      .from('bookings')
      .insert({
        listing_id: listing.id,
        renter_id: user.id,
        owner_id: listing.owner_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_amount: totalAmount,
        security_deposit: listing.security_deposit || 0,
        pickup_method: pickupMethod,
        notes: notes || null
      });

    if (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been sent to the owner for approval."
      });
      onBookingComplete();
    }
    
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const days = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalAmount = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Book {listing.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Select Rental Period</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Minimum: {listing.min_rental_days} days, Maximum: {listing.max_rental_days} days
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label>Start Date</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleDateSelect(date, 'start')}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  
                  {startDate && (
                    <div>
                      <Label>End Date</Label>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateSelect(date, 'end')}
                        disabled={(date) => 
                          date < addDays(startDate, (listing.min_rental_days || 1) - 1) ||
                          date > addDays(startDate, (listing.max_rental_days || 30) - 1)
                        }
                        className="rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pickup-method">Pickup Method</Label>
                <Select value={pickupMethod} onValueChange={(value: 'pickup' | 'delivery') => setPickupMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Self Pickup</SelectItem>
                    <SelectItem value="delivery">Delivery (if available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or messages for the owner..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Cost Breakdown */}
              {startDate && endDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Calculator className="h-4 w-4" />
                      <span>Cost Breakdown</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{days} day{days !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span>{formatCurrency(listing.daily_rate)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                    </div>
                    {listing.security_deposit && listing.security_deposit > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Security Deposit:</span>
                        <span>{formatCurrency(listing.security_deposit)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={submitBooking}
                  disabled={!startDate || !endDate || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
