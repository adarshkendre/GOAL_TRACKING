/*
  # Add Login Streak and Calendar Notes

  1. Changes
    - Add login_streak column to profiles table
    - Create calendar_notes table for storing user notes
  
  2. Security
    - Enable RLS on calendar_notes table
    - Add policies for calendar notes CRUD operations
*/

-- Add login_streak to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_streak integer DEFAULT 0;

-- Create calendar_notes table
CREATE TABLE IF NOT EXISTS calendar_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_notes
CREATE POLICY "Users can view their own notes"
  ON calendar_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON calendar_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON calendar_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON calendar_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX calendar_notes_user_id_idx ON calendar_notes(user_id);
CREATE INDEX calendar_notes_date_idx ON calendar_notes(date);
