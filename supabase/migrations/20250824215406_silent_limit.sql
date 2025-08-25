/*
  # Signaux de trading et positions

  1. Nouvelles tables
    - `trading_positions` - Positions de trading des utilisateurs
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence utilisateur)
      - `crypto_id` (text, identifiant CoinGecko)
      - `crypto_data` (jsonb, infos crypto)
      - `trading_signal` (jsonb, signal complet)
      - `ai_analysis_data` (jsonb, analyse IA liée)
      - `status` (enum: pending, active, closed, cancelled)
      - `target_hit` (enum: none, tp1, tp2, sl)
      - `notes` (text, notes utilisateur)
      - `created_at`, `updated_at`

    - `signal_updates` - Historique des mises à jour
      - Traçabilité complète des modifications

  2. Sécurité
    - RLS strict par utilisateur
    - Audit trail des modifications
*/

-- Enums pour les signaux
CREATE TYPE position_status AS ENUM ('pending', 'active', 'closed', 'cancelled');
CREATE TYPE target_hit AS ENUM ('none', 'tp1', 'tp2', 'sl');

-- Table principale des positions de trading
CREATE TABLE IF NOT EXISTS trading_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crypto_id text NOT NULL,
  crypto_symbol text NOT NULL,
  crypto_name text NOT NULL,
  crypto_image text,
  
  -- Signal de trading (structure JSON complète)
  trading_signal jsonb NOT NULL, -- direction, entryPrice, stopLoss, takeProfit1, takeProfit2, confidence, riskRewardRatio
  
  -- Analyse IA complète liée
  ai_analysis_data jsonb, -- rawAIResponse, marketContext, technicalAnalysis, etc.
  pattern_analysis jsonb, -- Analyse des patterns chartistes
  
  -- État de la position
  status position_status DEFAULT 'pending',
  target_hit target_hit DEFAULT 'none',
  notes text,
  
  -- Métadonnées
  is_manually_edited boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Historique des modifications
CREATE TABLE IF NOT EXISTS signal_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL REFERENCES trading_positions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_type text NOT NULL, -- 'status_change', 'notes_update', 'signal_edit', etc.
  old_data jsonb, -- Anciennes valeurs
  new_data jsonb, -- Nouvelles valeurs
  created_at timestamptz DEFAULT now()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_trading_positions_user_id ON trading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_positions_crypto_id ON trading_positions(crypto_id);
CREATE INDEX IF NOT EXISTS idx_trading_positions_status ON trading_positions(status);
CREATE INDEX IF NOT EXISTS idx_trading_positions_created_at ON trading_positions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_updates_position_id ON signal_updates(position_id);
CREATE INDEX IF NOT EXISTS idx_signal_updates_user_id ON signal_updates(user_id);

-- RLS
ALTER TABLE trading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_updates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour trading_positions
CREATE POLICY "Users can manage own positions"
  ON trading_positions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all positions"
  ON trading_positions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour signal_updates
CREATE POLICY "Users can manage own signal updates"
  ON signal_updates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all signal updates"
  ON signal_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_trading_positions_updated_at
    BEFORE UPDATE ON trading_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement les updates
CREATE OR REPLACE FUNCTION create_signal_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un enregistrement d'audit pour les modifications importantes
  IF TG_OP = 'UPDATE' AND (
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.target_hit IS DISTINCT FROM NEW.target_hit OR
    OLD.notes IS DISTINCT FROM NEW.notes OR
    OLD.trading_signal IS DISTINCT FROM NEW.trading_signal
  ) THEN
    INSERT INTO signal_updates (
      position_id,
      user_id,
      update_type,
      old_data,
      new_data
    ) VALUES (
      NEW.id,
      NEW.user_id,
      CASE 
        WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_change'
        WHEN OLD.target_hit IS DISTINCT FROM NEW.target_hit THEN 'target_hit'
        WHEN OLD.notes IS DISTINCT FROM NEW.notes THEN 'notes_update'
        WHEN OLD.trading_signal IS DISTINCT FROM NEW.trading_signal THEN 'signal_edit'
        ELSE 'general_update'
      END,
      jsonb_build_object(
        'status', OLD.status,
        'target_hit', OLD.target_hit,
        'notes', OLD.notes,
        'trading_signal', OLD.trading_signal
      ),
      jsonb_build_object(
        'status', NEW.status,
        'target_hit', NEW.target_hit,
        'notes', NEW.notes,
        'trading_signal', NEW.trading_signal
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trading_positions_audit_trigger
    AFTER UPDATE ON trading_positions
    FOR EACH ROW
    EXECUTE FUNCTION create_signal_update();