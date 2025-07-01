
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/hooks/useNavigation';
import AuthPage from '@/components/auth/AuthPage';
import EquipmentList from '@/components/equipment/EquipmentList';
import ListingDetails from '@/components/equipment/ListingDetails';
import ContactOwner from '@/components/equipment/ContactOwner';
import AddListing from '@/components/equipment/AddListing';
import MyListings from '@/components/equipment/MyListings';
import BookingCalendar from '@/components/booking/BookingCalendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

const Index = () => {
  const { user, loading } = useAuth();
  const { 
    currentView, 
    selectedListing, 
    navigateToView,
    navigateToListingDetails,
    navigateToContact,
    navigateToBooking,
    navigateToEdit,
    navigateToHome
  } = useNavigation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50">
        <div className="text-center p-8">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your experience...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we set things up</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        <AuthPage />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <EquipmentList
                onViewDetails={(listing) => navigateToListingDetails(listing)}
                onContact={(listing) => navigateToContact(listing)}
              />
            </div>
          </div>
        );
        
      case 'listing-details':
        return selectedListing ? (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ListingDetails
                listing={selectedListing}
                onBack={() => navigateToHome()}
                onContact={(listing) => navigateToContact(listing)}
                onBooking={(listing) => navigateToBooking(listing)}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
            <ErrorMessage message="Listing not found" />
          </div>
        );
        
      case 'contact-owner':
        return selectedListing ? (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <ContactOwner
                listing={selectedListing}
                onBack={() => navigateToView('listing-details')}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
            <ErrorMessage message="Listing not found" />
          </div>
        );

      case 'booking':
        return selectedListing ? (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <BookingCalendar
                listing={selectedListing}
                onBookingComplete={() => navigateToHome()}
                onCancel={() => navigateToView('listing-details')}
              />
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
            <ErrorMessage message="Listing not found" />
          </div>
        );
        
      case 'add-listing':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <AddListing onBack={() => navigateToHome()} />
            </div>
          </div>
        );

      case 'edit-listing':
        return selectedListing ? (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <AddListing 
                listing={selectedListing} 
                onBack={() => navigateToView('my-listings')} 
              />
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
            <ErrorMessage message="Listing not found" />
          </div>
        );
        
      case 'my-listings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <MyListings
                onEditListing={(listing) => navigateToEdit(listing)}
                onViewListing={(listing) => navigateToListingDetails(listing)}
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <EquipmentList
                onViewDetails={(listing) => navigateToListingDetails(listing)}
                onContact={(listing) => navigateToContact(listing)}
              />
            </div>
          </div>
        );
    }
  };

  return renderCurrentView();
};

export default Index;
