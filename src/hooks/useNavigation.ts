
import { useState, useCallback } from 'react';
import { Tables } from '@/integrations/supabase/types';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

export const useNavigation = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const navigateToView = useCallback((view: string, listing?: Listing) => {
    setCurrentView(view);
    if (listing) {
      setSelectedListing(listing);
    }
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedListing(null);
  }, []);

  const navigateToListingDetails = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('listing-details');
  }, []);

  const navigateToContact = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('contact-owner');
  }, []);

  const navigateToBooking = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('booking');
  }, []);

  const navigateToEdit = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setCurrentView('edit-listing');
  }, []);

  const navigateBack = useCallback((targetView: string) => {
    setCurrentView(targetView);
  }, []);

  return {
    currentView,
    selectedListing,
    navigateToView,
    navigateToHome,
    navigateToListingDetails,
    navigateToContact,
    navigateToBooking,
    navigateToEdit,
    navigateBack,
  };
};
