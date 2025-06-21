
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, MessageSquare, HelpCircle } from 'lucide-react';
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
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const quickQuestions = [
    "Is the equipment currently available?",
    "What are the pickup/delivery options?",
    "Can you provide more details about the condition?",
    "Are there any additional charges or requirements?",
    "What documentation is needed for rental?",
    "Do you offer any training for equipment usage?"
  ];

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
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
          content: `${subject ? `Subject: ${subject}\n\n` : ''}${message}`
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your inquiry has been sent to the equipment owner."
      });

      setMessage('');
      setSubject('');
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
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Send Inquiry</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Have questions about "{listing.title}" from {listing.profiles?.full_name}? Send them a message!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Questions */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h3 className="font-medium flex items-center space-x-2 text-blue-800">
              <HelpCircle className="h-4 w-4" />
              <span>Quick Questions</span>
            </h3>
            <p className="text-sm text-blue-700">
              Click on any question below to add it to your message:
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left p-2 bg-white hover:bg-blue-100 rounded border border-blue-200 text-sm transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              placeholder="e.g., Availability inquiry, Usage questions, etc."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder={`Hi ${listing.profiles?.full_name}, I'm interested in your ${listing.title}. I have some questions about availability and rental details. Please let me know when would be a good time to discuss.`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be specific about your questions to get a quick and helpful response.
            </p>
          </div>

          {/* Equipment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800">Equipment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Item:</span>
                <p>{listing.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Daily Rate:</span>
                <p className="text-green-600 font-semibold">{formatCurrency(listing.daily_rate)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Location:</span>
                <p>{listing.location_village}, {listing.location_district}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Condition:</span>
                <p className="capitalize">{listing.condition}</p>
              </div>
              {listing.security_deposit && listing.security_deposit > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Security Deposit:</span>
                  <p>{formatCurrency(listing.security_deposit)}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Owner:</span>
                <p>{listing.profiles?.full_name}</p>
              </div>
            </div>
          </div>

          {/* Contact Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 For Booking</h4>
            <p className="text-sm text-yellow-700">
              If you're ready to book this equipment, use the "Book Now" button on the main listing page to make a reservation with specific dates.
              This message form is for general inquiries and questions only.
            </p>
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Inquiry
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactOwner;
