
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch listings stats
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, availability_status')
        .eq('owner_id', user!.id);

      if (listingsError) throw listingsError;

      // Fetch bookings stats
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, total_amount, created_at')
        .eq('owner_id', user!.id);

      if (bookingsError) throw bookingsError;

      // Calculate stats
      const totalListings = listings?.length || 0;
      const activeListings = listings?.filter(l => l.availability_status === 'available').length || 0;
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
      const totalEarnings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      // Calculate monthly earnings (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear &&
               (b.status === 'confirmed' || b.status === 'completed');
      }).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      setStats({
        totalListings,
        activeListings,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalEarnings,
        monthlyEarnings
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Button onClick={() => navigate('/add-listing')} className="bg-green-600 hover:bg-green-700">
          Add New Listing
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedBookings} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.pendingBookings}</p>
                <p className="text-sm text-muted-foreground">Need your review</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/booking-requests')}
                disabled={stats.pendingBookings === 0}
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Confirmed Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                <p className="text-sm text-muted-foreground">Active rentals</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/booking-requests')}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span>My Listings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
                <p className="text-sm text-muted-foreground">Available now</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/my-listings')}
              >
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Keep your listings updated</p>
                <p className="text-xs text-muted-foreground">Regular updates improve visibility</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Respond to booking requests quickly</p>
                <p className="text-xs text-muted-foreground">Fast responses increase bookings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Add clear photos to your listings</p>
                <p className="text-xs text-muted-foreground">Good photos attract more renters</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
