
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Header from '@/components/layout/Header';
import Index from '@/pages/Index';
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import BookingRequests from '@/components/booking/BookingRequests';
import MyBookings from '@/components/booking/MyBookings';
import UserProfile from '@/components/profile/UserProfile';
import MessagingSystem from '@/components/messaging/MessagingSystem';
import AddListing from '@/components/equipment/AddListing';
import MyListings from '@/components/equipment/MyListings';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <MessageProvider>
            <NotificationProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                  <Header />
                  <main className="min-h-[calc(100vh-4rem)]">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/dashboard" element={
                        <div className="container mx-auto px-4 py-8">
                          <Dashboard />
                        </div>
                      } />
                      <Route path="/booking-requests" element={
                        <div className="container mx-auto px-4 py-8">
                          <BookingRequests />
                        </div>
                      } />
                      <Route path="/my-bookings" element={
                        <div className="container mx-auto px-4 py-8">
                          <MyBookings />
                        </div>
                      } />
                      <Route path="/my-listings" element={
                        <div className="container mx-auto px-4 py-8">
                          <MyListings onEditListing={() => {}} onViewListing={() => {}} />
                        </div>
                      } />
                      <Route path="/add-listing" element={
                        <div className="container mx-auto px-4 py-8">
                          <AddListing onBack={() => window.history.back()} />
                        </div>
                      } />
                      <Route path="/profile" element={
                        <div className="container mx-auto px-4 py-8">
                          <UserProfile />
                        </div>
                      } />
                      <Route path="/messages" element={
                        <div className="container mx-auto px-4 py-8">
                          <MessagingSystem />
                        </div>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
                <Toaster />
              </Router>
            </NotificationProvider>
          </MessageProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
