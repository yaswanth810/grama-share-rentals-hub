
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useLanguage } from '@/contexts/LanguageContext';
import EquipmentCard from './EquipmentCard';
import EquipmentFilters from './EquipmentFilters';
import { Loader2 } from 'lucide-react';

// Simplified type definition to avoid deep instantiation
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

interface EquipmentListProps {
  onViewDetails: (listing: SimpleListing) => void;
  onContact: (listing: SimpleListing) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ onViewDetails, onContact }) => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<SimpleListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<SimpleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm, selectedCategory, selectedLocation]);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles (*),
        categories (*)
      `)
      .eq('availability_status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data as SimpleListing[] || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category_id === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(listing =>
        listing.location_village.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        listing.location_district.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        listing.location_state.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  // Get unique locations from listings
  const locations = Array.from(new Set(
    listings.map(listing => listing.location_district)
  ));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {t('equipmentList.title')}
        </h1>
        <p className="text-sm md:text-base text-gray-600 px-4">
          {t('equipmentList.subtitle')}
        </p>
      </div>

      {/* Filters - Mobile Responsive */}
      <EquipmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        categories={categories}
        locations={locations}
        onClearFilters={handleClearFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-600">
          {filteredListings.length} {filteredListings.length === 1 ? t('equipmentList.equipmentAvailable') : t('equipmentList.equipmentsAvailable')}
        </p>
      </div>

      {/* Equipment Grid - Responsive */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredListings.map((listing) => (
            <EquipmentCard
              key={listing.id}
              listing={listing}
              onViewDetails={onViewDetails}
              onContact={onContact}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl md:text-6xl mb-4">🔍</div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
            {t('equipmentList.noEquipmentFound')}
          </h3>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
            {t('equipmentList.tryAdjustingFilters')}
          </p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
