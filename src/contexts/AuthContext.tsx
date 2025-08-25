import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { AuthService } from '../services/authService';
import { SignalManager } from '../services/signalManager';
import { Logger } from '../services/logService';
import { supabase } from '../lib/supabase';

// Actions
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false, error: null };
    default:
      return state;
  }
};

// État initial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const loadUser = () => {
      try {
        AuthService.getCurrentUser().then(user => {
          dispatch({ type: 'SET_USER', payload: user });
          
          if (user) {
            SignalManager.setCurrentUser(user.id);
            Logger.info('SYSTEM', `Session restaurée pour ${user.name} (${user.role})`);
          }
        });
      } catch (error) {
        Logger.error('SYSTEM', 'Erreur chargement session utilisateur', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erreur de chargement de session' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();

    // Écouter les changements d'authentification Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = await AuthService.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: user });
          if (user) {
            SignalManager.setCurrentUser(user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
          SignalManager.setCurrentUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const user = await AuthService.login(credentials);
      dispatch({ type: 'SET_USER', payload: user });
      SignalManager.setCurrentUser(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const user = await AuthService.register(credentials);
      dispatch({ type: 'SET_USER', payload: user });
      SignalManager.setCurrentUser(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur d\'inscription';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
    SignalManager.setCurrentUser(null);
    Logger.info('SYSTEM', 'Utilisateur déconnecté');
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role: UserRole): boolean => {
    return AuthService.hasRole(state.user, role);
  };

  const hasPermission = (permission: string): boolean => {
    return AuthService.hasPermission(state.user, permission);
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};