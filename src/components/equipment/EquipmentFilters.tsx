
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface EquipmentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  categories: Tables<'categories'>[];
  locations: string[];
  onClearFilters: () => void;
}

const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLocation,
  onLocationChange,
  categories,
  locations,
  onClearFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={onClearFilters} size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EquipmentFilters;
