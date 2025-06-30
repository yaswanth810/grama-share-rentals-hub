
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
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/booking-requests" element={<BookingRequests />} />
                      <Route path="/my-bookings" element={<MyBookings />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/messages" element={<MessagingSystem />} />
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
