
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User, LogOut, Plus, MessageCircle, Menu, X } from 'lucide-react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, signOut } = useAuth();
  const { hasUnreadMessages } = useMessages();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('header.browse') },
    { id: 'my-listings', label: t('header.myListings') },
    { id: 'bookings', label: t('header.myBookings') },
  ];

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-lg md:text-xl font-bold text-green-800 cursor-pointer"
              onClick={() => onViewChange('home')}
            >
              {t('header.title')}
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentView === item.id 
                    ? 'text-green-600' 
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              onClick={() => onViewChange('add-listing')}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('header.addListing')}
            </Button>
            
            <Button
              onClick={() => onViewChange('messages')}
              variant="outline"
              size="sm"
              className="relative"
            >
              <MessageCircle className="h-4 w-4" />
              {hasUnreadMessages && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Button>

            <NotificationDropdown />
            
            <LanguageSwitcher />
            
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
                  {t('header.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              onClick={() => onViewChange('messages')}
              variant="outline"
              size="sm"
              className="relative"
            >
              <MessageCircle className="h-4 w-4" />
              {hasUnreadMessages && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </Button>

            <NotificationDropdown />

            <LanguageSwitcher />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{t('header.menu')}</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Profile Section */}
                  <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentView === item.id
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handleNavClick('profile')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentView === 'profile'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="inline mr-2 h-4 w-4" />
                      {t('header.profile')}
                    </button>
                  </nav>

                  {/* Actions */}
                  <div className="space-y-3 pt-6 border-t">
                    <Button
                      onClick={() => handleNavClick('add-listing')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('header.addListing')}
                    </Button>
                    
                    <Button
                      onClick={signOut}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('header.signOut')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
