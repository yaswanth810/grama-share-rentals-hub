
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import EquipmentList from '@/components/equipment/EquipmentList';
import ListingDetails from '@/components/equipment/ListingDetails';
import ContactOwner from '@/components/equipment/ContactOwner';
import AddListing from '@/components/equipment/AddListing';
import MyListings from '@/components/equipment/MyListings';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Navigation handlers
  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('listing-details');
  };

  const handleContact = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('contact-owner');
  };

  const handleBooking = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('booking');
  };

  const handleEditListing = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('edit-listing');
  };

  // Back navigation handlers
  const handleBackToHome = () => {
    setSelectedListing(null);
    setCurrentView('home');
  };

  const handleBackToDetails = () => {
    setCurrentView('listing-details');
  };

  const handleBackToMyListings = () => {
    setCurrentView('my-listings');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <EquipmentList
            onViewDetails={handleViewDetails}
            onContact={handleContact}
          />
        );
        
      case 'listing-details':
        return selectedListing ? (
          <ListingDetails
            listing={selectedListing}
            onBack={handleBackToHome}
            onContact={handleContact}
            onBooking={handleBooking}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Listing not found</p>
          </div>
        );
        
      case 'contact-owner':
        return selectedListing ? (
          <ContactOwner
            listing={selectedListing}
            onBack={handleBackToDetails}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Listing not found</p>
          </div>
        );

      case 'booking':
        return selectedListing ? (
          <BookingCalendar
            listing={selectedListing}
            onBookingComplete={handleBackToHome}
            onCancel={handleBackToDetails}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Listing not found</p>
          </div>
        );
        
      case 'add-listing':
        return <AddListing onBack={handleBackToHome} />;

      case 'edit-listing':
        return selectedListing ? (
          <AddListing 
            listing={selectedListing} 
            onBack={handleBackToMyListings} 
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Listing not found</p>
          </div>
        );
        
      case 'my-listings':
        return (
          <MyListings
            onEditListing={handleEditListing}
            onViewListing={handleViewDetails}
          />
        );
        
      default:
        return (
          <EquipmentList
            onViewDetails={handleViewDetails}
            onContact={handleContact}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {renderCurrentView()}
    </div>
  );
};

export default Index;
