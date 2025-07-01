
import { useState, useCallback } from 'react';

// Using the same SimpleListing type that's used in EquipmentList
type SimpleListing = {
  id: string;
  title: string;
  description: string;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  security_deposit: number | null;
  min_rental_days: number | null;
  max_rental_days: number | null;
  condition: string | null;
  images: string[] | null;
  location_village: string;
  location_district: string;
  location_state: string;
  category_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  availability_status: string | null;
  pickup_delivery_options: string[] | null;
  profiles: {
    id: string;
    full_name: string;
    rating: number | null;
    avatar_url: string | null;
    username: string;
  };
  categories: {
    id: string;
    name: string;
    icon: string | null;
  };
};

export const useNavigation = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedListing, setSelectedListing] = useState<SimpleListing | null>(null);

  const navigateToView = useCallback((view: string, listing?: SimpleListing) => {
    setCurrentView(view);
    if (listing) {
      setSelectedListing(listing);
    }
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentView('home');
    setSelectedListing(null);
  }, []);

  const navigateToListingDetails = useCallback((listing: SimpleListing) => {
    setSelectedListing(listing);
    setCurrentView('listing-details');
  }, []);

  const navigateToContact = useCallback((listing: SimpleListing) => {
    setSelectedListing(listing);
    setCurrentView('contact-owner');
  }, []);

  const navigateToBooking = useCallback((listing: SimpleListing) => {
    setSelectedListing(listing);
    setCurrentView('booking');
  }, []);

  const navigateToEdit = useCallback((listing: SimpleListing) => {
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
