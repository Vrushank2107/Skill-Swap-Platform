import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Mail, Lock, Sparkles, ArrowRight, Home } from 'lucide-react';
import Form from '../components/ui/Form.tsx';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
            'linear-gradient(225deg, #d946ef 0%, #0ea5e9 100%)',
            'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-24 glass rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="mx-auto w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow-lg mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-secondary-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-secondary-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to continue your skill swapping journey
            </motion.p>
          </motion.div>

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="email"
                icon={Mail}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />
              
              <Input
                type="password"
                icon={Lock}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
            
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-secondary-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Create one now
                </Link>
              </p>
              
              <Link
                to="/"
                className="inline-flex items-center gap-2 font-medium text-secondary-500 hover:text-primary-600 transition-colors group"
              >
                <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to home
              </Link>
            </motion.div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login; 