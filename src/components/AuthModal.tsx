import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  Shield,
  Crown,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials, RegisterCredentials } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  const { login, register, isLoading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const testAccounts = AuthService.getTestAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'login') {
        await login(loginData);
      } else {
        await register(registerData);
      }
      onClose();
      resetForms();
    } catch (error) {
      // L'erreur est déjà gérée par le contexte
    }
  };

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    clearError();
  };

  const handleClose = () => {
    onClose();
    resetForms();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
  };

  const fillTestAccount = (email: string, password: string) => {
    setLoginData({ email, password });
    clearError();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-500/20">
                    {mode === 'login' ? (
                      <LogIn className="w-5 h-5 text-blue-300" />
                    ) : (
                      <UserPlus className="w-5 h-5 text-blue-300" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {mode === 'login' ? 'Connexion' : 'Inscription'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {mode === 'login' 
                        ? 'Accédez à votre compte premium'
                        : 'Créez votre compte premium'
                      }
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Comptes de test */}
              {mode === 'login' && (
                <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Comptes de démonstration
                  </h3>
                  <div className="space-y-2">
                    {testAccounts.map((account, index) => (
                      <motion.button
                        key={index}
                        onClick={() => fillTestAccount(account.email, account.password)}
                        className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800/50 rounded-lg border border-gray-700/30 transition-colors text-left"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-gray-700/50 rounded">
                            {account.role === 'admin' ? (
                              <Crown className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Users className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {account.role === 'admin' ? 'Administrateur' : 
                               account.email === 'premium@test.com' ? 'Membre Premium (99.90€)' :
                               'Membre Basic (19.90€)'}
                            </div>
                            <div className="text-gray-400 text-xs">{account.email}</div>
                          </div>
                        </div>
                        <div className="text-gray-500 text-xs">Cliquez pour utiliser</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4"
                >
                  <p className="text-red-400 text-sm">
                    {error}
                    {error.includes('email') && (
                      <span className="block mt-1 text-xs text-red-300">
                        💡 Vérifiez que votre email est correct et confirmé.
                      </span>
                    )}
                  </p>
                </motion.div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={mode === 'login' ? loginData.email : registerData.email}
                      onChange={(e) => {
                        if (mode === 'login') {
                          setLoginData(prev => ({ ...prev, email: e.target.value }));
                        } else {
                          setRegisterData(prev => ({ ...prev, email: e.target.value }));
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={mode === 'login' ? loginData.password : registerData.password}
                      onChange={(e) => {
                        if (mode === 'login') {
                          setLoginData(prev => ({ ...prev, password: e.target.value }));
                        } else {
                          setRegisterData(prev => ({ ...prev, password: e.target.value }));
                        }
                      }}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Bouton de soumission */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      {mode === 'login' ? 'Connexion...' : 'Inscription...'}
                    </div>
                  ) : (
                    mode === 'login' ? 'Se connecter' : 'S\'inscrire'
                  )}
                </motion.button>
              </form>

              {/* Switch mode */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                </p>
                <motion.button
                  onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  className="mt-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};