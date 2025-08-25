import { User, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { Logger } from './logService';

// Simulation d'une base de données utilisateurs
const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@cryptoai.com': {
    id: '1',
    name: 'Administrator',
    email: 'admin@cryptoai.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    subscription: 'premium'
  },
  'member@test.com': {
    id: '2',
    name: 'Premium Member',
    email: 'member@test.com',
    password: 'member123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date(),
    subscription: 'basic'
  },
  'premium@test.com': {
    id: '3',
    name: 'Premium User',
    email: 'premium@test.com',
    password: 'premium123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date(),
    subscription: 'premium'
  }
};

export class AuthService {
  private static readonly STORAGE_KEY = 'cryptoai_auth_user';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  static getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const { user, timestamp } = JSON.parse(stored);
      
      // Vérifier si la session n'a pas expiré
      if (Date.now() - timestamp > this.SESSION_DURATION) {
        this.logout();
        return null;
      }

      return {
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      };
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur lecture utilisateur courant', error);
      return null;
    }
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    Logger.info('SYSTEM', `Tentative de connexion pour ${credentials.email}`);
    
    // Simulation d'un délai API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = MOCK_USERS[credentials.email.toLowerCase()];
    
    if (!mockUser) {
      Logger.warning('SYSTEM', `Utilisateur non trouvé: ${credentials.email}`);
      throw new Error('Email ou mot de passe incorrect');
    }

    if (mockUser.password !== credentials.password) {
      Logger.warning('SYSTEM', `Mot de passe incorrect pour ${credentials.email}`);
      throw new Error('Email ou mot de passe incorrect');
    }

    const user: User = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      avatar: mockUser.avatar,
      createdAt: mockUser.createdAt,
      lastLogin: new Date(),
      subscription: mockUser.subscription
    };

    // Stocker l'utilisateur avec timestamp
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      user,
      timestamp: Date.now()
    }));

    Logger.success('SYSTEM', `Connexion réussie pour ${user.name} (${user.role})`);
    return user;
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

    // Vérifier si l'email existe déjà
    if (MOCK_USERS[credentials.email.toLowerCase()]) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Simulation d'un délai API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser: User = {
      id: Date.now().toString(),
      name: credentials.name,
      email: credentials.email.toLowerCase(),
      role: 'member', // Nouveau utilisateur = membre par défaut
      createdAt: new Date(),
      lastLogin: new Date(),
      subscription: 'free'
    };

    // Ajouter à la "base de données" mock
    MOCK_USERS[credentials.email.toLowerCase()] = {
      ...newUser,
      password: credentials.password
    };

    // Stocker l'utilisateur
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      user: newUser,
      timestamp: Date.now()
    }));

    Logger.success('SYSTEM', `Inscription réussie pour ${newUser.name} - Compte FREE créé`);
    return newUser;
  }

  static logout(): void {
    Logger.info('SYSTEM', 'Déconnexion utilisateur');
    localStorage.removeItem(this.STORAGE_KEY);
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
  private static readonly COOLDOWN_KEY = 'cryptoai_last_signal_request';

  static canRequestSignal(user: User | null): { canRequest: boolean; remainingTime?: number } {
    if (!user || user.subscription !== 'free') {
      return { canRequest: true };
    }

    const lastRequest = localStorage.getItem(this.COOLDOWN_KEY);
    if (!lastRequest) {
      return { canRequest: true };
    }

    const lastRequestTime = parseInt(lastRequest);
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
  }

  static recordSignalRequest(): void {
    localStorage.setItem(this.COOLDOWN_KEY, Date.now().toString());
  }
}