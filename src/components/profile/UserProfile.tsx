
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Star, User, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    bio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } else {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        phone: data.phone || '',
        village: data.village || '',
        district: data.district || '',
        state: data.state || '',
        bio: data.bio || ''
      });
    }
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        username: formData.username,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        bio: formData.bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setEditing(false);
      fetchProfile();
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        phone: profile.phone || '',
        village: profile.village || '',
        district: profile.district || '',
        state: profile.state || '',
        bio: profile.bio || ''
      });
    }
    setEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>My Profile</span>
            </CardTitle>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={saveProfile} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button onClick={cancelEdit} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {formData.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">
                  {profile.rating ? profile.rating.toFixed(1) : 'New User'}
                </span>
                {profile.total_ratings && profile.total_ratings > 0 && (
                  <span className="text-sm text-gray-600">
                    ({profile.total_ratings} review{profile.total_ratings !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                {editing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{profile.full_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                {editing ? (
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mt-1">@{profile.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-700">{user?.email}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                {editing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-700">{profile.phone || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="village">Village</Label>
                {editing ? (
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{profile.village}</p>
                )}
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                {editing ? (
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{profile.district}</p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                {editing ? (
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{profile.state}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-700">
                  {profile.village}, {profile.district}, {profile.state}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">About Me</Label>
            {editing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell others about yourself..."
                className="mt-1"
              />
            ) : (
              <p className="text-sm text-gray-700 mt-1">
                {profile.bio || 'No bio provided yet.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
