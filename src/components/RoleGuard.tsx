import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  role?: UserRole;
  permission?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  role,
  permission,
  fallback,
  showFallback = true
}) => {
  const { hasRole, hasPermission, isAuthenticated, user } = useAuth();

  // Vérifier les autorisations
  const hasAccess = () => {
    if (role && !hasRole(role)) return false;
    if (permission && !hasPermission(permission)) return false;
    return true;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showFallback) {
    return null;
  }

  // Fallback par défaut
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-center"
    >
      <div className="flex justify-center mb-4">
        {!isAuthenticated ? (
          <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
        ) : role === 'admin' ? (
          <div className="p-3 bg-red-500/20 rounded-full border border-red-500/30">
            <Crown className="w-8 h-8 text-red-400" />
          </div>
        ) : (
          <div className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30">
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-2">
        {!isAuthenticated ? 'Connexion requise' :
         role === 'admin' ? 'Accès administrateur requis' :
         'Accès premium requis'}
      </h3>
      
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        {!isAuthenticated ? 'Vous devez être connecté pour accéder à cette fonctionnalité.' :
         role === 'admin' ? 'Cette fonctionnalité est réservée aux administrateurs.' :
         permission === 'view_ai_analysis' ? 'L\'analyse IA est réservée aux membres premium.' :
         'Cette fonctionnalité nécessite un compte premium.'}
      </p>
      
      {!isAuthenticated && (
        <motion.div
          className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-blue-400 text-sm">
            💡 Connectez-vous pour débloquer l'analyse IA premium
          </p>
        </motion.div>
      )}
      
      {isAuthenticated && user?.role === 'member' && role === 'admin' && (
        <motion.div
          className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-amber-400 text-sm">
            ⚡ Vous êtes membre, mais cette zone est réservée aux administrateurs
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};