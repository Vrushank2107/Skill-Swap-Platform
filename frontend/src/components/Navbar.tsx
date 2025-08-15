import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSocket } from '../contexts/SocketContext.tsx';
import { 
  Home, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Shield,
  MessageSquare,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '../utils/cn.ts';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    ...(user ? [
      { path: '/dashboard', label: 'Dashboard', icon: Settings },
      { path: '/swaps', label: 'Swaps', icon: MessageSquare },
      { path: '/profile', label: 'Profile', icon: User },
      ...(user.isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : [])
    ] : [])
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-xl border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-glow"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Sparkles className="w-5 h-5 text-white" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-brand rounded-xl opacity-0 group-hover:opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <span className="text-2xl font-bold text-gradient">SkillSwap</span>
                <motion.div 
                  className="h-0.5 bg-gradient-brand rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Link
                    to={link.path}
                    className={cn(
                      'relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group',
                      active
                        ? 'text-primary-600 glass shadow-glow'
                        : 'text-secondary-700 hover:text-primary-600 hover:glass hover:shadow-soft'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 transition-transform', active && 'scale-110')} />
                    <span>{link.label}</span>
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-primary-50/20 rounded-xl"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            {user && (
              <motion.div 
                className="hidden md:flex items-center space-x-2 glass px-3 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className={cn('w-2 h-2 rounded-full', connected ? 'bg-success-500' : 'bg-error-500')}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-secondary-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </motion.div>
            )}

            {/* User menu */}
            {user ? (
              <motion.div 
                className="hidden md:flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="flex items-center space-x-3 glass px-4 py-2 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div className="relative">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center shadow-glow">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <motion.div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <span className="text-sm font-semibold text-secondary-900">{user.name}</span>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-secondary-600 hover:text-error-500 glass hover:shadow-glow rounded-full transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Logout</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="hidden md:flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-secondary-700 hover:text-primary-600 px-4 py-2 text-sm font-medium glass hover:shadow-soft rounded-full transition-all duration-300"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="bg-gradient-brand text-white px-6 py-2 rounded-full text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 glass rounded-full text-secondary-700 hover:text-primary-600 hover:shadow-glow transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden glass border-t border-white/20 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.div 
              className="px-4 pt-4 pb-6 space-y-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300',
                        active
                          ? 'text-primary-600 glass shadow-glow'
                          : 'text-secondary-700 hover:text-primary-600 hover:glass hover:shadow-soft'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', active && 'scale-110')} />
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="border-t border-white/20 pt-4 mt-4">
                  <motion.div 
                    className="flex items-center space-x-3 px-4 py-3 glass rounded-xl mb-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center shadow-glow">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-secondary-900">{user.name}</div>
                      <div className="text-xs text-secondary-600">{connected ? 'Online' : 'Offline'}</div>
                    </div>
                  </motion.div>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-secondary-600 hover:text-error-500 glass hover:shadow-glow rounded-xl transition-all duration-300 w-full group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Logout</span>
                </motion.button>
              </motion.div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 