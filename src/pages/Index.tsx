
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/layout/Header';
import EquipmentList from '@/components/equipment/EquipmentList';
import ListingDetails from '@/components/equipment/ListingDetails';
import ContactOwner from '@/components/equipment/ContactOwner';
import AddListing from '@/components/equipment/AddListing';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('listing-details');
  };

  const handleContact = (listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('contact-owner');
  };

  const handleBackToHome = () => {
    setSelectedListing(null);
    setCurrentView('home');
  };

  const handleBackToDetails = () => {
    setCurrentView('listing-details');
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
        
      case 'add-listing':
        return <AddListing onBack={handleBackToHome} />;
        
      case 'my-listings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Listings</h2>
            <p className="text-gray-600">Coming soon! You'll be able to manage your equipment listings here.</p>
          </div>
        );
        
      case 'bookings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
            <p className="text-gray-600">Coming soon! You'll be able to view your rental bookings here.</p>
          </div>
        );
        
      case 'messages':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
            <p className="text-gray-600">Coming soon! You'll be able to chat with other community members here.</p>
          </div>
        );
        
      case 'profile':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile</h2>
            <p className="text-gray-600">Coming soon! You'll be able to manage your profile here.</p>
          </div>
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
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
