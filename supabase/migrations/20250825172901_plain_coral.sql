@@ .. @@
   convergence_signaux text DEFAULT '',
   support_principal numeric DEFAULT 0,
   resistance_principale numeric DEFAULT 0,
+  support_secondaire numeric DEFAULT 0,
+  resistance_secondaire numeric DEFAULT 0,
   created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
   created_at timestamptz DEFAULT now(),