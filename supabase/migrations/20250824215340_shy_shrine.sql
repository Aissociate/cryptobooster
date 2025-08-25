/*
  # Système d'authentification et profils utilisateurs

  1. Nouvelles tables
    - `user_profiles` - Profils utilisateurs étendus
      - `id` (uuid, référence auth.users)
      - `name` (text)
      - `avatar_url` (text, optionnel)
      - `subscription` (enum: free, basic, premium, pro)
      - `role` (enum: visitor, member, admin)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
      - `settings` (jsonb pour préférences)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour accès utilisateur authentifié
*/

-- Enums pour types de données
CREATE TYPE subscription_type AS ENUM ('free', 'basic', 'premium', 'pro');
CREATE TYPE user_role AS ENUM ('visitor', 'member', 'admin');

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  subscription subscription_type DEFAULT 'free',
  role user_role DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger pour mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();