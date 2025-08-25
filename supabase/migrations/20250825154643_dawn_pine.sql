/*
  # Création de la table crypto_analyses

  1. Nouvelle table
    - `crypto_analyses`
      - `id` (uuid, primary key)
      - `crypto_symbol` (text, symbole de la crypto)
      - `crypto_name` (text, nom de la crypto)
      - `analysis_data` (jsonb, données complètes d'analyse IA)
      - `score` (numeric, score global)
      - `confidence` (integer, pourcentage de confiance)
      - `direction` (text, LONG/SHORT)
      - `entry_price` (numeric, prix d'entrée)
      - `stop_loss` (numeric, stop loss)
      - `take_profit_1` (numeric, premier take profit)
      - `take_profit_2` (numeric, second take profit)
      - `signal_global` (text, signal global)
      - `score_bullish` (numeric, score haussier)
      - `score_bearish` (numeric, score baissier)
      - `pattern_plus_fort` (text, pattern le plus fort)
      - `convergence_signaux` (text, convergence des signaux)
      - `support_principal` (numeric, support principal)
      - `resistance_principale` (numeric, résistance principale)
      - `created_by` (uuid, utilisateur créateur)
      - `created_at` (timestamptz, date de création)
      - `updated_at` (timestamptz, date de mise à jour)

  2. Sécurité
    - Enable RLS sur la table `crypto_analyses`
    - Politique pour que les utilisateurs puissent gérer leurs propres analyses
    - Politique pour que les admins puissent tout voir

  3. Index
    - Index sur crypto_symbol pour les recherches rapides
    - Index sur created_by pour les requêtes par utilisateur
    - Index sur created_at pour l'ordre chronologique
*/

-- Création de la table crypto_analyses
CREATE TABLE IF NOT EXISTS crypto_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_symbol text NOT NULL,
  crypto_name text DEFAULT '',
  analysis_data jsonb NOT NULL,
  score numeric DEFAULT 0,
  confidence integer DEFAULT 0,
  direction text DEFAULT '',
  entry_price numeric DEFAULT 0,
  stop_loss numeric DEFAULT 0,
  take_profit_1 numeric DEFAULT 0,
  take_profit_2 numeric DEFAULT 0,
  signal_global text DEFAULT '',
  score_bullish numeric DEFAULT 0,
  score_bearish numeric DEFAULT 0,
  pattern_plus_fort text DEFAULT '',
  convergence_signaux text DEFAULT '',
  support_principal numeric DEFAULT 0,
  resistance_principale numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE crypto_analyses ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs authentifiés puissent gérer leurs propres analyses
CREATE POLICY "Users can manage own analyses"
  ON crypto_analyses
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Politique pour que les admins puissent voir toutes les analyses
CREATE POLICY "Admins can read all analyses"
  ON crypto_analyses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_crypto_analyses_symbol ON crypto_analyses (crypto_symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_analyses_created_by ON crypto_analyses (created_by);
CREATE INDEX IF NOT EXISTS idx_crypto_analyses_created_at ON crypto_analyses (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_analyses_score ON crypto_analyses (score DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_analyses_direction ON crypto_analyses (direction);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_crypto_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_analyses_updated_at
  BEFORE UPDATE ON crypto_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_analyses_updated_at();