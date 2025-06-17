
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Plus, MessageCircle } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-green-800 cursor-pointer"
              onClick={() => onViewChange('home')}
            >
              🌾 Grama Rental
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onViewChange('home')}
              className={`text-sm font-medium ${
                currentView === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Browse Equipment
            </button>
            <button
              onClick={() => onViewChange('my-listings')}
              className={`text-sm font-medium ${
                currentView === 'my-listings' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => onViewChange('bookings')}
              className={`text-sm font-medium ${
                currentView === 'bookings' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              My Bookings
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => onViewChange('add-listing')}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
            
            <Button
              onClick={() => onViewChange('messages')}
              variant="outline"
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewChange('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
