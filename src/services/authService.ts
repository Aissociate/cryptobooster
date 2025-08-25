import { User, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { Logger } from './logService';
import { supabase } from '../lib/supabase';

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      // Récupérer le profil utilisateur depuis user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        Logger.error('SYSTEM', 'Erreur récupération profil utilisateur', profileError);
        return null;
      }

      return {
        id: user.id,
        name: profile.name,
        email: user.email || '',
        role: profile.role,
        avatar: profile.avatar_url,
        createdAt: new Date(profile.created_at),
        lastLogin: profile.last_login ? new Date(profile.last_login) : undefined,
        subscription: profile.subscription
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
        Logger.warning('SYSTEM', `Erreur connexion: ${error.message}`);
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!data.user) {
        throw new Error('Aucun utilisateur retourné');
      }

      // Mettre à jour last_login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Récupérer le profil complet
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Erreur récupération profil utilisateur');
      }

      const user: User = {
        id: data.user.id,
        name: profile.name,
        email: data.user.email || '',
        role: profile.role,
        avatar: profile.avatar_url,
        createdAt: new Date(profile.created_at),
        lastLogin: new Date(),
        subscription: profile.subscription
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