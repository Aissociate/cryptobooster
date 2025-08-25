/*
# Table d'utilisateurs simplifiée

1. Nouvelle table
   - `simple_users` table avec tous les champs nécessaires
   - Structure simple sans dépendances complexes
   
2. Données par défaut
   - Compte admin avec mot de passe hashé
   - RLS activé pour la sécurité
*/

-- Créer la table d'utilisateurs simplifiée
CREATE TABLE IF NOT EXISTS simple_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  subscription text NOT NULL DEFAULT 'free',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  settings jsonb DEFAULT '{}'::jsonb
);

-- Activer RLS
ALTER TABLE simple_users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les users peuvent lire leur propre profil
CREATE POLICY "Users can read own profile" ON simple_users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Politique pour que les users peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON simple_users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Insérer le compte admin par défaut (mot de passe: admin)
-- Hash bcrypt de "admin": $2a$10$N9qo8uLOickgx2ZMRZoMye.b7ydIZDclIUBWn9Q3FKxiFFTVMd5QC
INSERT INTO simple_users (email, password_hash, name, role, subscription) 
VALUES ('admin@cryptoai.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.b7ydIZDclIUBWn9Q3FKxiFFTVMd5QC', 'Admin', 'admin', 'pro')
ON CONFLICT (email) DO NOTHING;

-- Insérer quelques comptes de test
INSERT INTO simple_users (email, password_hash, name, role, subscription) 
VALUES 
  ('member@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.b7ydIZDclIUBWn9Q3FKxiFFTVMd5QC', 'Member Test', 'member', 'basic'),
  ('premium@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.b7ydIZDclIUBWn9Q3FKxiFFTVMd5QC', 'Premium Test', 'member', 'premium')
ON CONFLICT (email) DO NOTHING;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_simple_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_simple_users_updated_at
  BEFORE UPDATE ON simple_users
  FOR EACH ROW
  EXECUTE FUNCTION update_simple_users_updated_at();