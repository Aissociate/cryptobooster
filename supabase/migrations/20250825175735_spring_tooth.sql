/*
  # Update user profiles with settings column

  1. Changes
    - Ensure settings column exists in user_profiles
    - Add default value for settings if not present
*/

-- Ensure settings column exists and has proper default
DO $$
BEGIN
  -- Check if settings column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'settings'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  -- Update existing rows that have null settings
  UPDATE user_profiles 
  SET settings = '{}'::jsonb 
  WHERE settings IS NULL;
END $$;