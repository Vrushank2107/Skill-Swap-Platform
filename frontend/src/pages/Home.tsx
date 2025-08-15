import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  MessageSquare, 
  Star,
  Search,
  UserPlus,
  Sparkles,
  Zap,
  Globe,
  TrendingUp,
  Heart,
  Award,
  Rocket
} from 'lucide-react';
import { Card } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2 });
  const [statsRef, statsInView] = useInView({ threshold: 0.3 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.3 });

  const features = [
    {
      icon: Search,
      title: 'Find Skills',
      description: 'Search for people with the skills you need and offer your expertise in return.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'Easy Swapping',
      description: 'Send and receive swap requests with a simple, intuitive interface.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All users are verified and the platform is monitored for quality.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Leave feedback after successful swaps to build trust in the community.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '500+', icon: Users, color: 'text-primary-600' },
    { label: 'Skills Offered', value: '1000+', icon: Sparkles, color: 'text-purple-600' },
    { label: 'Successful Swaps', value: '250+', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Happy Users', value: '98%', icon: Heart, color: 'text-pink-600' }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
              'linear-gradient(135deg, #d946ef 0%, #0ea5e9 100%)',
              'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 glass rounded-full"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={heroRef}>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={heroInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1, delay: 0.3, type: 'spring', bounce: 0.3 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-24 h-24 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-glow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -inset-4 bg-gradient-brand rounded-3xl opacity-20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-secondary-900">Swap Skills,</span>{' '}
              <span className="text-gradient animate-gradient-x">Grow Together</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-secondary-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Connect with people who have the skills you need and offer your expertise in return. 
              Build meaningful relationships while learning and teaching in our vibrant community.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {user ? (
                <Link to="/dashboard">
                  <Button 
                    variant="gradient" 
                    size="xl" 
                    icon={ArrowRight} 
                    iconPosition="right"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button 
                      variant="gradient" 
                      size="xl" 
                      icon={Rocket}
                    >
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60 px-4 sm:px-0"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 0.6 } : {}}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-secondary-600">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Verified Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-secondary-600">
                <Shield className="w-4 h-4 text-primary-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-secondary-600">
                <Globe className="w-4 h-4 text-accent-500" />
                <span>Global Community</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Why Choose{' '}
              <span className="text-gradient">SkillSwap?</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-secondary-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our platform makes it easy to connect, learn, and grow together through skill sharing.
              Experience the future of collaborative learning.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={featuresInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                >
                  <Card variant="glass" className="text-center p-8 h-full group">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-secondary-900 to-primary-900 relative overflow-hidden" ref={statsRef}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)', backgroundSize: '50px 50px' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Growing Community
            </motion.h2>
            <motion.p 
              className="text-xl text-secondary-200 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of users who are already swapping skills and building meaningful connections worldwide.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.6, type: 'spring', bounce: 0.4 }}
                >
                  <Card variant="glass" className="p-8 bg-white/10 border-white/20 backdrop-blur-lg">
                    <motion.div 
                      className="flex justify-center mb-4"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </motion.div>
                    <motion.div 
                      className="text-4xl md:text-5xl font-bold text-white mb-2"
                      initial={{ scale: 0 }}
                      animate={statsInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.8, type: 'spring', bounce: 0.6 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-secondary-200 font-medium text-sm">
                      {stat.label}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Getting started with SkillSwap is simple and straightforward. Follow these easy steps to begin your journey.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and list the skills you can offer and the skills you want to learn. Showcase your expertise with a detailed profile.',
                icon: UserPlus,
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Find Perfect Matches',
                description: 'Search for people with the skills you need and send them swap requests. Our smart algorithm helps you find the best matches.',
                icon: Search,
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Start Learning & Teaching',
                description: 'Once accepted, arrange your skill exchange and leave feedback afterward. Build lasting connections while growing your expertise.',
                icon: Award,
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Connection line */}
                  {index < 2 && (
                    <motion.div 
                      className="hidden md:block absolute top-8 left-full w-8 lg:w-16 xl:w-32 h-0.5 bg-gradient-to-r from-primary-300 to-accent-300 z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                    />
                  )}
                  
                  <Card variant="glass" className="p-8 h-full relative z-10 group hover:scale-105 transition-all duration-300">
                    {/* Step number */}
                    <motion.div 
                      className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-brand rounded-full flex items-center justify-center shadow-glow text-white font-bold text-lg"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {item.step}
                    </motion.div>
                    
                    <motion.div 
                      className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-secondary-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-secondary-600 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" ref={ctaRef}>
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-brand"
          animate={{
            background: [
              'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
              'linear-gradient(225deg, #d946ef 0%, #0ea5e9 100%)',
              'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 border border-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ready to Start Your
              <br className="hidden sm:block" />
              <span className="relative inline-block">
                Skill Journey?
                <motion.div 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-white/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={ctaInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join our vibrant community today and discover the power of collaborative learning. 
              Share your expertise, learn new skills, and build meaningful connections.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {user ? (
                <Link to="/search">
                  <Button 
                    variant="glass" 
                    size="xl" 
                    icon={Search} 
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    Find Skills to Swap
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button 
                      variant="glass" 
                      size="xl" 
                      icon={Rocket} 
                      className="bg-white text-primary-600 hover:bg-white/90 font-bold"
                    >
                      Join SkillSwap Free
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
            
            <motion.div 
              className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-white/80 text-xs sm:text-sm px-4 sm:px-0"
              initial={{ opacity: 0 }}
              animate={ctaInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>100% secure</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 