
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_request';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      // Listen for booking status changes
      const bookingChannel = supabase
        .channel('booking-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `renter_id=eq.${user.id}`
          },
          (payload) => {
            const booking = payload.new;
            if (booking.status === 'approved') {
              const notification: Notification = {
                id: `booking-approved-${booking.id}`,
                type: 'booking_approved',
                title: 'Booking Approved!',
                message: 'Your booking request has been approved.',
                read: false,
                created_at: new Date().toISOString()
              };
              setNotifications(prev => [notification, ...prev]);
              toast({
                title: "Booking Approved!",
                description: "Your booking request has been approved.",
              });
            } else if (booking.status === 'rejected') {
              const notification: Notification = {
                id: `booking-rejected-${booking.id}`,
                type: 'booking_rejected',
                title: 'Booking Rejected',
                message: 'Your booking request has been rejected.',
                read: false,
                created_at: new Date().toISOString()
              };
              setNotifications(prev => [notification, ...prev]);
              toast({
                title: "Booking Rejected",
                description: "Your booking request has been rejected.",
                variant: "destructive"
              });
            }
          }
        )
        .subscribe();

      // Listen for new booking requests (for owners)
      const requestChannel = supabase
        .channel('booking-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
            filter: `owner_id=eq.${user.id}`
          },
          (payload) => {
            const booking = payload.new;
            const notification: Notification = {
              id: `booking-request-${booking.id}`,
              type: 'booking_request',
              title: 'New Booking Request',
              message: 'You have received a new booking request.',
              read: false,
              created_at: new Date().toISOString()
            };
            setNotifications(prev => [notification, ...prev]);
            toast({
              title: "New Booking Request",
              description: "You have received a new booking request.",
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bookingChannel);
        supabase.removeChannel(requestChannel);
      };
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
