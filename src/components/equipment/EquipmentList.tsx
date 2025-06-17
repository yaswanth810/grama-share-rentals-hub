
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import EquipmentCard from './EquipmentCard';
import EquipmentFilters from './EquipmentFilters';
import { toast } from '@/hooks/use-toast';
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
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const locations = Array.from(
    new Set(listings.map(listing => `${listing.location_village}, ${listing.location_district}`))
  );

  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles(*),
        categories(*)
      `)
      .eq('availability_status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch listings",
        variant: "destructive"
      });
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || listing.category_id === selectedCategory;
    
    const listingLocation = `${listing.location_village}, ${listing.location_district}`;
    const matchesLocation = selectedLocation === 'all' || listingLocation === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EquipmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        categories={categories}
        locations={locations}
        onClearFilters={clearFilters}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredListings.map((listing) => (
          <EquipmentCard
            key={listing.id}
            listing={listing}
            onViewDetails={onViewDetails}
            onContact={onContact}
          />
        ))}
      </div>
      
      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No equipment found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
