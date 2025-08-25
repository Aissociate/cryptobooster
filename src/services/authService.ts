import { User, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { Logger } from './logService';
import { supabase } from '../lib/supabase';

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        Logger.info('SYSTEM', 'Aucun utilisateur connecté');
        return null;
      }

      // Récupérer le profil utilisateur depuis user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        Logger.error('SYSTEM', 'Erreur récupération profil utilisateur', profileError);
        return null;
      }

      // Si le profil n'existe pas, le créer
      let userProfile = profile;
      if (!profile) {
        Logger.info('SYSTEM', `Création profil manquant pour utilisateur existant ${user.email}`);
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
            subscription: 'free',
            role: 'member'
          })
          .select()
          .single();

        if (createError) {
          Logger.error('SYSTEM', 'Erreur création profil automatique', createError);
          return null;
        }
        userProfile = newProfile;
      }

      return {
        id: user.id,
        name: userProfile.name,
        email: user.email || '',
        role: userProfile.role,
        avatar: userProfile.avatar_url,
        createdAt: new Date(userProfile.created_at),
        lastLogin: userProfile.last_login ? new Date(userProfile.last_login) : undefined,
        subscription: userProfile.subscription
      };
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur getCurrentUser', error);
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    Logger.info('SYSTEM', `Tentative de connexion pour ${credentials.email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        Logger.warning('SYSTEM', `Erreur connexion Supabase: ${error.message}`);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        }
        throw new Error(error.message);
      }

      if (!data.user) {
        Logger.error('SYSTEM', 'Aucun utilisateur retourné par Supabase Auth');
        throw new Error('Erreur d\'authentification');
      }

      Logger.success('SYSTEM', `Authentification Supabase réussie pour ${data.user.email}`);

      // Récupérer le profil complet
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        Logger.error('SYSTEM', 'Erreur récupération profil', profileError);
        throw new Error('Erreur récupération profil utilisateur');
      }

      // Si le profil n'existe pas, le créer
      let userProfile = profile;
      if (!profile) {
        Logger.info('SYSTEM', `Création profil manquant pour ${data.user.email}`);
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Utilisateur',
            subscription: 'free',
            role: 'member'
          })
          .select()
          .single();

        if (createError) {
          Logger.error('SYSTEM', 'Erreur création profil', createError);
          throw new Error('Erreur création profil utilisateur');
        }
        userProfile = newProfile;
      }

      // Mettre à jour last_login
      try {
        await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      } catch (updateError) {
        Logger.warning('SYSTEM', 'Erreur mise à jour last_login', updateError);
        // Ne pas faire échouer la connexion pour ça
      }

      const user: User = {
        id: data.user.id,
        name: userProfile.name,
        email: data.user.email || '',
        role: userProfile.role,
        avatar: userProfile.avatar_url,
        createdAt: new Date(userProfile.created_at),
        lastLogin: new Date(),
        subscription: userProfile.subscription
      };

      Logger.success('SYSTEM', `Connexion réussie pour ${user.name} (${user.role})`);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      Logger.error('SYSTEM', 'Erreur login', error);
      throw new Error(message);
    }
  }

  static async register(credentials: RegisterCredentials): Promise<User> {
    Logger.info('SYSTEM', `Tentative d'inscription pour ${credentials.email}`);
    
    // Validation
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }

    if (credentials.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    try {
      // Créer le compte Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        Logger.warning('SYSTEM', `Erreur inscription: ${error.message}`);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Erreur création utilisateur');
      }

      // Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          name: credentials.name,
          subscription: 'free',
          role: 'member'
        });

      if (profileError) {
        Logger.error('SYSTEM', 'Erreur création profil', profileError);
        throw new Error('Erreur création profil utilisateur');
      }

      const newUser: User = {
        id: data.user.id,
        name: credentials.name,
        email: credentials.email.toLowerCase(),
        role: 'member',
        createdAt: new Date(),
        lastLogin: new Date(),
        subscription: 'free'
      };

      Logger.success('SYSTEM', `Inscription réussie pour ${newUser.name} - Compte FREE créé`);
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur d\'inscription';
      Logger.error('SYSTEM', 'Erreur register', error);
      throw new Error(message);
    }
  }

  static async logout(): Promise<void> {
    Logger.info('SYSTEM', 'Déconnexion utilisateur');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Logger.error('SYSTEM', 'Erreur logout', error);
      }
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur logout', error);
    }
  }

  static hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return role === 'visitor';
    
    const roleHierarchy: Record<UserRole, number> = {
      visitor: 0,
      member: 1,
      admin: 2
    };

    return roleHierarchy[user.role] >= roleHierarchy[role];
  }

  static hasPermission(user: User | null, permission: string): boolean {
    const role = user?.role || 'visitor';
    const ROLE_PERMISSIONS = {
      visitor: [
        'view_public_data',
        'view_basic_crypto_list'
      ],
      member: [
        'view_public_data',
        'view_basic_crypto_list',
        'view_ai_analysis',
        'generate_trading_signals',
        'view_charts',
        'export_data'
      ],
      admin: [
        'view_public_data',
        'view_basic_crypto_list',
        'view_ai_analysis',
        'generate_trading_signals',
        'view_charts',
        'export_data',
        'access_admin_panel',
        'manage_users',
        'view_logs',
        'configure_ai_settings',
        'manage_subscriptions'
      ]
    } as const;
    
    return ROLE_PERMISSIONS[role].includes(permission as any);
  }

  // Obtenir des utilisateurs de test pour la démo
  static getTestAccounts() {
    return [
      { email: 'admin@cryptoai.com', password: 'admin123', role: 'admin' },
      { email: 'member@test.com', password: 'member123', role: 'member' },
      { email: 'premium@test.com', password: 'premium123', role: 'member' }
    ];
  }

  // Gestion du cooldown pour les membres gratuits
  static async canRequestSignal(user: User | null): Promise<{ canRequest: boolean; remainingTime?: number }> {
    if (!user || user.subscription !== 'free') {
      return { canRequest: true };
    }

    try {
      // Vérifier la dernière demande via Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      if (error || !data?.settings?.lastSignalRequest) {
        return { canRequest: true };
      }

      const lastRequestTime = new Date(data.settings.lastSignalRequest).getTime();
      const now = Date.now();
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 heures
      const remainingTime = cooldownMs - (now - lastRequestTime);

      if (remainingTime <= 0) {
        return { canRequest: true };
      }

      return { 
        canRequest: false, 
        remainingTime: Math.ceil(remainingTime / (60 * 60 * 1000)) // en heures
      };
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur vérification cooldown', error);
      return { canRequest: true };
    }
  }

  static async recordSignalRequest(user: User): Promise<void> {
    if (user.subscription !== 'free') return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          settings: { 
            lastSignalRequest: new Date().toISOString() 
          } 
        })
        .eq('id', user.id);

      if (error) {
        Logger.error('SYSTEM', 'Erreur enregistrement demande signal', error);
      }
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur enregistrement demande signal', error);
    }
  }
}