
-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  village TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  weekly_rate DECIMAL(10,2),
  monthly_rate DECIMAL(10,2),
  security_deposit DECIMAL(10,2) DEFAULT 0,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair')),
  availability_status TEXT CHECK (availability_status IN ('available', 'rented', 'maintenance')) DEFAULT 'available',
  location_village TEXT NOT NULL,
  location_district TEXT NOT NULL,
  location_state TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  min_rental_days INTEGER DEFAULT 1,
  max_rental_days INTEGER DEFAULT 30,
  pickup_delivery_options TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  pickup_method TEXT CHECK (pickup_method IN ('pickup', 'delivery')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('renter_to_owner', 'owner_to_renter')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for direct communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon) VALUES
('Agricultural Tools', 'Farming equipment, tractors, ploughs, harvesters', '🚜'),
('Vehicles', 'Cars, bikes, trucks for transportation', '🚗'),
('Construction Equipment', 'Drilling machines, cement mixers, scaffolding', '🔨'),
('Household Items', 'Generators, water pumps, cleaning equipment', '🏠'),
('Electronics', 'Cameras, sound systems, lighting equipment', '📱'),
('Garden & Outdoor', 'Lawn mowers, chainsaws, outdoor furniture', '🌱');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (public read access)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- RLS Policies for listings
CREATE POLICY "Anyone can view available listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can create their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Owners and renters can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, village, district, state)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data ->> 'village', 'Unknown'),
    COALESCE(new.raw_user_meta_data ->> 'district', 'Unknown'),
    COALESCE(new.raw_user_meta_data ->> 'state', 'Unknown')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update user ratings
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating = (
      SELECT AVG(rating::decimal)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    updated_at = now()
  WHERE id = NEW.reviewed_user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update ratings when new review is added
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_rating();
