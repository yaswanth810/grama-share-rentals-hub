
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Calendar } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

interface ContactOwnerProps {
  listing: Listing;
  onBack: () => void;
}

const ContactOwner: React.FC<ContactOwnerProps> = ({ listing, onBack }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sending, setSending] = useState(false);

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    if (days <= 0) return 0;
    
    // Calculate based on weekly/monthly rates if applicable
    if (listing.monthly_rate && days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return (months * listing.monthly_rate) + (remainingDays * listing.daily_rate);
    } else if (listing.weekly_rate && days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return (weeks * listing.weekly_rate) + (remainingDays * listing.daily_rate);
    } else {
      return days * listing.daily_rate;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: listing.owner_id,
          listing_id: listing.id,
          content: message
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your message has been sent to the equipment owner."
      });

      setMessage('');
      onBack();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listing</span>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Contact Equipment Owner</CardTitle>
          <p className="text-sm text-gray-600">
            Interested in renting "{listing.title}" from {listing.profiles?.full_name}?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rental Period Calculator */}
          <div className="bg-green-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Rental Period (Optional)</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {days > 0 && (
              <div className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rental Duration:</span>
                  <span>{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-green-600">
                  <span>Estimated Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {listing.security_deposit && listing.security_deposit > 0 && (
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>+ Security Deposit:</span>
                    <span>{formatCurrency(listing.security_deposit)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder={`Hi ${listing.profiles?.full_name}, I'm interested in renting your ${listing.title}. ${startDate && endDate ? `I would like to rent it from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.` : ''} Please let me know about availability and pickup details.`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be polite and include specific details about your rental needs.
            </p>
          </div>

          {/* Equipment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Equipment Details</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Item:</span> {listing.title}</p>
              <p><span className="font-medium">Daily Rate:</span> {formatCurrency(listing.daily_rate)}</p>
              <p><span className="font-medium">Location:</span> {listing.location_village}, {listing.location_district}</p>
              <p><span className="font-medium">Condition:</span> {listing.condition}</p>
            </div>
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={sending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactOwner;
