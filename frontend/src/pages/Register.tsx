import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { User, Mail, Lock, MapPin, Clock, Sparkles, UserPlus, Home, CheckCircle } from 'lucide-react';
import Form from '../components/ui/Form.tsx';
import Input from '../components/ui/Input.tsx';
import Button from '../components/ui/Button.tsx';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  availability: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  location?: string;
  availability?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    availability: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location || undefined,
        availability: formData.availability || undefined
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = {
    hasLength: formData.password.length >= 6,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(135deg, #d946ef 0%, #0ea5e9 100%)',
            'linear-gradient(225deg, #0ea5e9 0%, #d946ef 100%)',
            'linear-gradient(135deg, #d946ef 0%, #0ea5e9 100%)'
          ]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 glass rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-8, 8, -8],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i,
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
              Join SkillSwap
            </motion.h1>
            <motion.p
              className="text-secondary-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Create your account and start your learning journey
            </motion.p>
          </motion.div>

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                name="name"
                type="text"
                icon={User}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />
              
              <Input
                name="email"
                type="email"
                icon={Mail}
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />
              
              <div className="space-y-2">
                <Input
                  name="password"
                  type="password"
                  icon={Lock}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                />
                
                {/* Password strength indicator */}
                {formData.password && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            i < passwordScore
                              ? passwordScore <= 2
                                ? 'bg-error-500'
                                : passwordScore === 3
                                ? 'bg-warning-500'
                                : 'bg-success-500'
                              : 'bg-secondary-200'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: i < passwordScore ? 1 : 0 }}
                          transition={{ delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`flex items-center gap-1 ${
                        passwordStrength.hasLength ? 'text-success-600' : 'text-secondary-500'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                        At least 6 characters
                      </div>
                      <div className="flex gap-4">
                        <div className={`flex items-center gap-1 ${
                          passwordStrength.hasUpper ? 'text-success-600' : 'text-secondary-500'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          Uppercase
                        </div>
                        <div className={`flex items-center gap-1 ${
                          passwordStrength.hasLower ? 'text-success-600' : 'text-secondary-500'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          Lowercase
                        </div>
                        <div className={`flex items-center gap-1 ${
                          passwordStrength.hasNumber ? 'text-success-600' : 'text-secondary-500'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          Number
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <Input
                name="confirmPassword"
                type="password"
                icon={Lock}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="location"
                  type="text"
                  icon={MapPin}
                  placeholder="Your location (optional)"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                  helperText="Help others find local skill swaps"
                />
                
                <Input
                  name="availability"
                  type="text"
                  icon={Clock}
                  placeholder="Your availability (optional)"
                  value={formData.availability}
                  onChange={handleChange}
                  error={errors.availability}
                  helperText="e.g., Weekends, Evenings"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={loading}
              icon={UserPlus}
              iconPosition="right"
            >
              Create Your Account
            </Button>
            
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-secondary-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign in here
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

export default Register; 