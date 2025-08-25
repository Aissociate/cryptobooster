import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Star,
  Calendar,
  Mail,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfile: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getSubscriptionBadge = () => {
    switch (user.subscription) {
      case 'premium':
        return { color: 'text-purple-400 bg-purple-400/20 border-purple-400/30', icon: Crown, label: 'Premium 99.90€' };
      case 'basic':
        return { color: 'text-blue-400 bg-blue-400/20 border-blue-400/30', icon: Star, label: 'Basic 19.90€' };
      case 'pro':
        return { color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30', icon: Crown, label: 'Pro' };
      default:
        return { color: 'text-gray-400 bg-gray-400/20 border-gray-400/30', icon: User, label: 'Free' };
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return { color: 'text-red-400', label: 'Admin' };
      case 'member':
        return { color: 'text-blue-400', label: 'Member' };
      default:
        return { color: 'text-gray-400', label: 'Visitor' };
    }
  };

  const subscription = getSubscriptionBadge();
  const role = getRoleBadge();
  const SubscriptionIcon = subscription.icon;

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-xl transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=40`}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-blue-500/30"
          />
          {hasRole('admin') && (
            <div className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="hidden md:block text-left">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{user.name}</span>
            <div className={`px-2 py-0.5 rounded-full border text-xs ${subscription.color}`}>
              <SubscriptionIcon className="w-3 h-3 inline mr-1" />
              {subscription.label}
            </div>
          </div>
          <span className={`text-xs ${role.color}`}>{role.label}</span>
        </div>
        
        <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 z-50"
          >
            {/* Profile Info */}
            <div className="border-b border-gray-700/30 pb-4 mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=64`}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-500/30"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm ${role.color}`}>{role.label}</span>
                    <div className={`px-2 py-1 rounded-full border text-xs ${subscription.color}`}>
                      <SubscriptionIcon className="w-3 h-3 inline mr-1" />
                      {subscription.label}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  Member since {user.createdAt.toLocaleDateString()}
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Shield className="w-4 h-4" />
                    Last login: {user.lastLogin.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <motion.button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-xl transition-colors text-left"
                whileHover={{ x: 4 }}
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-white">Settings</span>
              </motion.button>
              
              <motion.button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl transition-colors text-left border border-transparent"
                whileHover={{ x: 4 }}
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Logout</span>
              </motion.button>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-blue-400 text-lg font-bold">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <div className="text-gray-400 text-xs">Analyses</div>
                </div>
                <div className="text-center">
                  <div className="text-emerald-400 text-lg font-bold">
                    {Math.floor(Math.random() * 100) + 50}%
                  </div>
                  <div className="text-gray-400 text-xs">Success Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};