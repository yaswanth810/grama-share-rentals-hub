
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import EquipmentCard from './EquipmentCard';
import EquipmentFilters from './EquipmentFilters';
import { Loader2 } from 'lucide-react';

type Listing = Tables<'listings'> & {
  profiles: Tables<'profiles'>;
  categories: Tables<'categories'>;
};

interface EquipmentListProps {
  onViewDetails: (listing: Listing) => void;
  onContact: (listing: Listing) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ onViewDetails, onContact }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);

  useEffect(() => {
    fetchListings();
    fetchCategories();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles (*),
        categories (*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
      setFilteredListings(data || []);
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

  const handleFilterChange = (filters: any) => {
    let filtered = [...listings];

    if (filters.category) {
      filtered = filtered.filter(listing => listing.category_id === filters.category);
    }

    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location_village.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location_district.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location_state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(listing => 
        listing.daily_rate >= filters.priceRange[0] && 
        listing.daily_rate <= filters.priceRange[1]
      );
    }

    if (filters.condition) {
      filtered = filtered.filter(listing => listing.condition === filters.condition);
    }

    setFilteredListings(filtered);
  };

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
          🌾 Equipment Rental Marketplace
        </h1>
        <p className="text-sm md:text-base text-gray-600 px-4">
          Find and rent agricultural and construction equipment from your community
        </p>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <EquipmentFilters
          categories={categories}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-600">
          {filteredListings.length} equipment{filteredListings.length !== 1 ? 's' : ''} available
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
            No equipment found
          </h3>
          <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto px-4">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
