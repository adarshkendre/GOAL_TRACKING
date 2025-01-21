/*
  # Goals Management System Schema

  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `priority` (enum: low, medium, high)
      - `status` (enum: not_started, in_progress, completed)
      - `progress` (integer, 0-100)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `goals` table
    - Add policies for CRUD operations
    - Users can only access their own goals
*/

-- Create enum types
CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  priority goal_priority DEFAULT 'medium',
  status goal_status DEFAULT 'not_started',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX goals_user_id_idx ON goals(user_id);
CREATE INDEX goals_due_date_idx ON goals(due_date);