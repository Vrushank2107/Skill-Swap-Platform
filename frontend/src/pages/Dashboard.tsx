import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../contexts/AuthContext.tsx';
import axios from 'axios';
import { 
  User, 
  MapPin, 
  Clock, 
  Plus, 
  Search, 
  MessageSquare, 
  Settings,
  TrendingUp,
  Users as UsersIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalSwaps: 0,
    skillsOffered: 0,
    pendingRequests: 0,
    pendingIncoming: 0,
    pendingOutgoing: 0,
    acceptedSwaps: 0,
    loading: true
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        console.log('No user found, skipping dashboard data fetch');
        return;
      }
      
      console.log('Fetching dashboard data for user:', user.id);
      
      try {
        // Fetch swap statistics
        console.log('Fetching swaps from /api/swaps...');
        const swapsResponse = await axios.get('/api/swaps');
        console.log('Swaps response:', swapsResponse.data);
        
        const swaps = [...(swapsResponse.data.incoming || []), ...(swapsResponse.data.outgoing || [])];
        console.log('Total swaps found:', swaps.length);
        
        // Fetch user profile data for skills count
        let skillsOffered = 0;
        try {
          console.log('Fetching profile from /api/users/profile/' + user.id);
          const profileResponse = await axios.get(`/api/users/profile/${user.id}`);
          console.log('Profile response:', profileResponse.data);
          skillsOffered = profileResponse.data.user?.offeredSkills?.length || 0;
        } catch (profileError) {
          console.log('Profile fetch failed, trying /api/users/profile without ID');
          try {
            const profileResponse = await axios.get('/api/users/profile');
            console.log('Profile response from /api/users/profile:', profileResponse.data);
            skillsOffered = profileResponse.data.user?.offeredSkills?.length || 0;
          } catch (altProfileError) {
            console.log('Both profile endpoints failed:', altProfileError);
            // Try to get skills from auth context if available
            skillsOffered = user.offeredSkills?.length || 0;
          }
        }
        
        // Calculate statistics with more detail
        const totalSwaps = swaps.length;
        const incomingSwaps = swapsResponse.data.incoming || [];
        const outgoingSwaps = swapsResponse.data.outgoing || [];
        
        // Calculate different types of pending requests
        const pendingIncoming = incomingSwaps.filter(swap => swap.status === 'pending').length;
        const pendingOutgoing = outgoingSwaps.filter(swap => swap.status === 'pending').length;
        const totalPending = pendingIncoming + pendingOutgoing;
        
        // Count accepted swaps
        const acceptedSwaps = swaps.filter(swap => swap.status === 'accepted').length;
        
        console.log('Dashboard stats calculated:', {
          totalSwaps,
          skillsOffered,
          pendingIncoming,
          pendingOutgoing,
          totalPending,
          acceptedSwaps,
          incomingCount: incomingSwaps.length,
          outgoingCount: outgoingSwaps.length
        });
        
        setDashboardStats({
          totalSwaps,
          skillsOffered,
          pendingRequests: totalPending,
          pendingIncoming,
          pendingOutgoing,
          acceptedSwaps,
          loading: false
        });
        
        // Set recent activity (latest 5 swaps)
        const sortedSwaps = swaps
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        console.log('Recent activity swaps:', sortedSwaps);
        setRecentActivity(sortedSwaps);
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [user]);

  const quickActions = [
    {
      title: 'Add Skills',
      description: 'List skills you can offer or want to learn',
      icon: Plus,
      link: '/profile',
      color: 'bg-primary-500'
    },
    {
      title: 'Find People',
      description: 'Search for users with skills you need',
      icon: Search,
      link: '/search',
      color: 'bg-success-500'
    },
    {
      title: 'Manage Swaps',
      description: 'View and manage your swap requests',
      icon: MessageSquare,
      link: '/swaps',
      color: 'bg-warning-500'
    },
    {
      title: 'Edit Profile',
      description: 'Update your profile information',
      icon: Settings,
      link: '/profile',
      color: 'bg-secondary-500'
    }
  ];

  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });
  const [actionsRef, actionsInView] = useInView({ threshold: 0.2 });

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 opacity-20"
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
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-24 h-24 glass rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                x: [-8, 8, -8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={heroRef}>
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div 
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={heroInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1, delay: 0.3, type: 'spring', bounce: 0.3 }}
            >
              <div className="relative">
                {user?.photo ? (
                  <motion.img
                    src={user.photo}
                    alt={user.name}
                    className="w-20 h-20 rounded-3xl object-cover shadow-glow-lg border-4 border-white/50"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <motion.div 
                    className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-glow-lg"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-white font-bold text-2xl">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-secondary-900">Welcome back,</span>{' '}
              <span className="text-gradient animate-gradient-x">{user?.name}!</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Ready to swap some skills today? Explore new opportunities and connect with amazing people.
            </motion.p>
            
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your <span className="text-gradient">Progress</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-secondary-600"
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Track your skill swapping journey
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Swaps', value: dashboardStats.loading ? '...' : dashboardStats.totalSwaps.toString(), icon: TrendingUp, color: 'text-primary-600', gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Skills Offered', value: dashboardStats.loading ? '...' : dashboardStats.skillsOffered.toString(), icon: UsersIcon, color: 'text-success-600', gradient: 'from-green-500 to-emerald-500' },
              { label: 'Pending Requests', value: dashboardStats.loading ? '...' : dashboardStats.pendingRequests.toString(), icon: MessageSquare, color: 'text-warning-600', gradient: 'from-yellow-500 to-orange-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.6, type: 'spring', bounce: 0.4 }}
                >
                  <Card variant="glass" className="p-8 group hover:scale-105 transition-all duration-300">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div 
                      className="text-4xl md:text-5xl font-bold text-secondary-900 mb-2"
                      initial={{ scale: 0 }}
                      animate={statsInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.8, type: 'spring', bounce: 0.6 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-secondary-600 font-medium">
                      {stat.label}
                    </div>
                    
                    {/* Show breakdown for pending requests */}
                    {index === 2 && !dashboardStats.loading && dashboardStats.pendingRequests > 0 && (
                      <motion.div 
                        className="mt-4 pt-4 border-t border-secondary-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="flex justify-between text-xs text-secondary-600">
                          <span>Incoming: {dashboardStats.pendingIncoming}</span>
                          <span>Outgoing: {dashboardStats.pendingOutgoing}</span>
                        </div>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 to-primary-50" ref={actionsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={actionsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={actionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Quick <span className="text-gradient">Actions</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-secondary-600"
              initial={{ opacity: 0, y: 20 }}
              animate={actionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Jump right into your skill swapping journey
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Add Skills', description: 'List skills you can offer or want to learn', icon: Plus, link: '/profile', gradient: 'from-blue-500 to-cyan-500' },
              { title: 'Find People', description: 'Search for users with skills you need', icon: Search, link: '/search', gradient: 'from-purple-500 to-pink-500' },
              { title: 'Manage Swaps', description: 'View and manage your swap requests', icon: MessageSquare, link: '/swaps', gradient: 'from-green-500 to-emerald-500' },
              { title: 'Edit Profile', description: 'Update your profile information', icon: Settings, link: '/profile', gradient: 'from-yellow-500 to-orange-500' }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={actionsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                >
                  <Link to={action.link}>
                    <Card variant="glass" className="text-center p-8 h-full group hover:scale-105 transition-all duration-300">
                      <motion.div 
                        className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-secondary-900 mb-4 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-secondary-600 leading-relaxed">
                        {action.description}
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Profile & Activity Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Summary */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8">
                <div className="flex items-center mb-6">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-secondary-900">Profile Summary</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-600 font-medium">Name:</span>
                    <span className="font-bold text-secondary-900">{user?.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-600 font-medium">Location:</span>
                    <span className="font-bold text-secondary-900">
                      {user?.location || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-600 font-medium">Availability:</span>
                    <span className="font-bold text-secondary-900">
                      {user?.availability || 'Not specified'}
                    </span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/profile">
                    <Button variant="gradient" icon={Settings} className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8 h-full">
                <div className="flex items-center mb-6">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-glow mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MessageSquare className="w-6 h-6 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-secondary-900">Recent Activity</h2>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((swap, index) => (
                      <motion.div
                        key={swap.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-secondary-50 rounded-xl border-l-4 border-primary-500"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-secondary-900 text-sm">
                              {swap.responder_id === user?.id ? 'Incoming' : 'Outgoing'} Swap
                            </p>
                            <p className="text-xs text-secondary-600">
                              {swap.offered_skill} ↔ {swap.wanted_skill}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            swap.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            swap.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            swap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <div className="mt-4">
                      <Link to="/swaps">
                        <Button variant="glass" icon={ArrowRight} iconPosition="right" className="w-full">
                          View All Swaps
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">No recent activity</h3>
                    <p className="text-secondary-600 mb-6">Start by adding skills or searching for people to swap with!</p>
                    <Link to="/search">
                      <Button variant="glass" icon={ArrowRight} iconPosition="right">
                        Explore Skills
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 