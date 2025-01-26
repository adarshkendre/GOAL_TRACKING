/*
  # Friend System Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `avatar_url` (text)
      - `is_online` (boolean)
      - `last_seen` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `status` (friend_request_status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Ensure users can only access appropriate data

  3. Indexes
    - Username search optimization
    - Friend request lookups
    - Online status queries
*/

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create enum for friend request status
CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status friend_request_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Prevent duplicate requests between the same users
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id),
  -- Prevent self-friend requests
  CONSTRAINT no_self_friend CHECK (sender_id != receiver_id)
);

-- Create indexes
CREATE INDEX profiles_username_idx ON profiles USING gin (username gin_trgm_ops);
CREATE INDEX friend_requests_sender_id_idx ON friend_requests(sender_id);
CREATE INDEX friend_requests_receiver_id_idx ON friend_requests(receiver_id);
CREATE INDEX profiles_is_online_idx ON profiles(is_online);
CREATE INDEX profiles_last_seen_idx ON profiles(last_seen);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Friend requests policies
CREATE POLICY "Users can view their sent or received friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update friend requests they received"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Functions for friend system
CREATE OR REPLACE FUNCTION get_friends(user_id uuid)
RETURNS TABLE (
  friend_id uuid,
  username text,
  avatar_url text,
  is_online boolean,
  last_seen timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN fr.sender_id = user_id THEN p.id
      ELSE fr.sender_id
    END AS friend_id,
    p.username,
    p.avatar_url,
    p.is_online,
    p.last_seen
  FROM friend_requests fr
  JOIN profiles p ON (
    CASE 
      WHEN fr.sender_id = user_id THEN fr.receiver_id = p.id
      ELSE fr.sender_id = p.id
    END
  )
  WHERE (fr.sender_id = user_id OR fr.receiver_id = user_id)
    AND fr.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
