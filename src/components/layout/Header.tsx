
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Package,
  Calendar,
  MessageSquare,
  BarChart3,
  Plus,
  Languages,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  const navigationItems = [
    { path: '/', label: t('header.browse'), icon: Home },
    { path: '/dashboard', label: t('header.dashboard'), icon: BarChart3 },
    { path: '/my-listings', label: t('header.myListings'), icon: Package },
    { path: '/messages', label: t('header.messages'), icon: MessageSquare },
  ];

  const bookingItems = [
    { path: '/booking-requests', label: t('header.bookingRequests') },
    { path: '/my-bookings', label: t('header.myBookings') },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isBookingActive = () => bookingItems.some(item => isActive(item.path));

  return (
    <header className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">GR</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-800 leading-none">
                Grama Rental
              </span>
              <span className="text-xs text-gray-500 leading-none">Equipment for Everyone</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Booking Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isBookingActive()
                        ? 'bg-green-100 text-green-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden xl:inline">Bookings</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white border shadow-lg">
                  {bookingItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center w-full px-2 py-2 text-sm transition-colors ${
                          isActive(item.path)
                            ? 'bg-green-100 text-green-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Language Switcher - Icon Only */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center w-10 h-10 p-0"
              onClick={handleLanguageToggle}
              title="Switch Language"
            >
              <Languages className="h-4 w-4" />
            </Button>
            
            {user ? (
              <>
                {/* Add Listing Button */}
                <Button
                  size="sm"
                  onClick={() => navigate('/add-listing')}
                  className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">{t('header.addListing')}</span>
                </Button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile - Icon Only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className={`flex items-center justify-center w-10 h-10 p-0 transition-colors ${
                    isActive('/profile') 
                      ? 'bg-green-100 text-green-700' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={t('header.profile')}
                >
                  <User className="h-4 w-4" />
                </Button>

                {/* Sign Out - Icon Only */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-10 h-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title={t('header.signOut')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden w-10 h-10 p-0"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {t('header.signIn')}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && isMenuOpen && (
          <div className="lg:hidden border-t bg-white shadow-lg rounded-b-lg">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mx-2 ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Booking Items */}
              <div className="border-t pt-2 mt-2 mx-2">
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bookings
                </div>
                {bookingItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
                      isActive(item.path)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              
              <div className="border-t pt-2 mt-2 mx-2">
                <Link
                  to="/add-listing"
                  className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('header.addListing')}</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
