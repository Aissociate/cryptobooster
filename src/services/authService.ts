import { User, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { Logger } from './logService';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  subscription: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  settings: any;
}

export class AuthService {
  // Comptes en dur pour développement/test
  private static HARDCODED_ACCOUNTS = [
    {
      email: 'admin@cryptoai.com',
      password: 'admin',
      name: 'Administrateur',
      role: 'admin' as UserRole,
      subscription: 'pro'
    },
    {
      email: 'member@test.com', 
      password: 'member123',
      name: 'Member Test',
      role: 'member' as UserRole,
      subscription: 'basic'
    },
    {
      email: 'premium@test.com',
      password: 'premium123', 
      name: 'Premium User',
      role: 'member' as UserRole,
      subscription: 'premium'
    }
  ];

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (!userJson) {
        return null;
      }

      const userData = JSON.parse(userJson);
      Logger.info('SYSTEM', `Session restaurée pour ${userData.name}`);
      return userData;
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur restauration session', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    Logger.info('SYSTEM', `Tentative de connexion pour ${credentials.email}`);
    
    try {
      // 1. Vérifier d'abord les comptes en dur
      const hardcodedAccount = this.HARDCODED_ACCOUNTS.find(
        account => account.email === credentials.email && account.password === credentials.password
      );

      if (hardcodedAccount) {
        Logger.success('SYSTEM', `Connexion réussie avec compte en dur: ${hardcodedAccount.name}`);
        const user: User = {
          id: `hardcoded_${hardcodedAccount.email}`,
          name: hardcodedAccount.name,
          email: hardcodedAccount.email,
          role: hardcodedAccount.role,
          subscription: hardcodedAccount.subscription as any,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        // Sauvegarder la session
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }

      // 2. Sinon, vérifier dans Supabase
      const { data: dbUser, error } = await supabase
        .from('simple_users')
        .select('*')
        .eq('email', credentials.email)
        .maybeSingle();

      if (error) {
        Logger.error('SYSTEM', 'Erreur requête base de données', error);
        throw new Error('Erreur de connexion à la base de données');
      }

      if (!dbUser) {
        Logger.warning('SYSTEM', `Utilisateur non trouvé: ${credentials.email}`);
        throw new Error('Email ou mot de passe incorrect');
      }

      // 3. Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(credentials.password, dbUser.password_hash);
      if (!isPasswordValid) {
        Logger.warning('SYSTEM', `Mot de passe incorrect pour: ${credentials.email}`);
        throw new Error('Email ou mot de passe incorrect');
      }

      // 4. Créer l'objet User
      const user: User = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role as UserRole,
        subscription: dbUser.subscription as any,
        avatar: dbUser.avatar_url,
        createdAt: new Date(dbUser.created_at),
        lastLogin: new Date()
      };

      // 5. Mettre à jour last_login
      try {
        await supabase
          .from('simple_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', dbUser.id);
      } catch (updateError) {
        Logger.warning('SYSTEM', 'Impossible de mettre à jour last_login', updateError);
      }

      // 6. Sauvegarder la session
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      Logger.success('SYSTEM', `Connexion réussie pour ${user.name}`);
      return user;

    } catch (error) {
      Logger.error('SYSTEM', 'Erreur complète de connexion', error);
      throw error;
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
      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('simple_users')
        .select('id')
        .eq('email', credentials.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Un compte avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(credentials.password, saltRounds);

      // Créer l'utilisateur
      const { data: newUser, error } = await supabase
        .from('simple_users')
        .insert({
          email: credentials.email.toLowerCase(),
          password_hash: passwordHash,
          name: credentials.name,
          role: 'member',
          subscription: 'free'
        })
        .select()
        .single();

      if (error) {
        Logger.error('SYSTEM', 'Erreur création utilisateur', error);
        throw new Error('Erreur lors de la création du compte');
      }

      const user: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        subscription: newUser.subscription as any,
        createdAt: new Date(newUser.created_at)
      };

      // Sauvegarder la session
      localStorage.setItem('currentUser', JSON.stringify(user));

      Logger.success('SYSTEM', `Inscription réussie pour ${user.name}`);
      return user;

    } catch (error) {
      Logger.error('SYSTEM', 'Erreur inscription', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    Logger.info('SYSTEM', 'Déconnexion utilisateur');
    localStorage.removeItem('currentUser');
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
    return this.HARDCODED_ACCOUNTS.map(account => ({
      email: account.email,
      password: account.password,
      role: account.role
    }));
  }

  // Gestion du cooldown pour les membres gratuits
  static async canRequestSignal(user: User | null): Promise<{ canRequest: boolean; remainingTime?: number }> {
    if (!user || user.subscription !== 'free') {
      return { canRequest: true };
    }

    try {
      const { data, error } = await supabase
        .from('simple_users')
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
      await supabase
        .from('simple_users')
        .update({ 
          settings: { 
            lastSignalRequest: new Date().toISOString() 
          } 
        })
        .eq('id', user.id);
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur enregistrement demande signal', error);
    }
  }
}