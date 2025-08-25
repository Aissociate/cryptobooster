/*
  # Add missing columns to crypto_analyses table

  1. Changes
    - Add `support_secondaire` column (numeric)
    - Add `resistance_secondaire` column (numeric)
  
  2. Purpose
    - Fix database schema mismatch errors
    - Support secondary support and resistance levels in analysis
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_analyses' AND column_name = 'support_secondaire'
  ) THEN
    ALTER TABLE crypto_analyses ADD COLUMN support_secondaire numeric DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_analyses' AND column_name = 'resistance_secondaire'
  ) THEN
    ALTER TABLE crypto_analyses ADD COLUMN resistance_secondaire numeric DEFAULT 0;
  END IF;
END $$;