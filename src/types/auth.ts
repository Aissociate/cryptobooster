export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  subscription?: SubscriptionType;
}

export type UserRole = 'visitor' | 'member' | 'admin';

export type SubscriptionType = 'free' | 'basic' | 'premium' | 'pro';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

export interface SubscriptionLimits {
  dailySignals: number;
  visibleSignals: number;
  hasUnlimitedAccess: boolean;
  price?: string;
  cooldownHours: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionType, SubscriptionLimits> = {
  free: {
    dailySignals: 1,
    visibleSignals: 1,
    hasUnlimitedAccess: false,
    cooldownHours: 24
  },
  basic: {
    dailySignals: 5,
    visibleSignals: 5,
    hasUnlimitedAccess: false,
    price: '19.90€',
    cooldownHours: 0
  },
  premium: {
    dailySignals: -1, // illimité
    visibleSignals: -1, // illimité
    hasUnlimitedAccess: true,
    price: '99.90€',
    cooldownHours: 0
  },
  pro: {
    dailySignals: -1, // illimité
    visibleSignals: -1, // illimité
    hasUnlimitedAccess: true,
    cooldownHours: 0
  }
} as const;
export const ROLE_PERMISSIONS = {
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