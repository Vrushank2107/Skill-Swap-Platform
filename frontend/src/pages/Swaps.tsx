import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Filter, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Sparkles, ArrowRight, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import SwapCard from '../components/SwapCard.tsx';
import { Card } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

interface Swap {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at?: string;
  requester_name: string;
  responder_name: string;
  offered_skill: string;
  wanted_skill: string;
  requester_id: string;
  responder_id: string;
  offered_skill_id: string;
  wanted_skill_id: string;
}

interface SwapData {
  incoming: Swap[];
  outgoing: Swap[];
}

const Swaps: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<SwapData>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSwaps = useCallback(async (isInitialLoad = false) => {
    if (!user) return;
    
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setFiltering(true);
      }
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`/api/swaps${params}`);
      setSwaps(response.data);
    } catch (error) {
      toast.error('Failed to fetch swaps');
      console.error('Fetch swaps error:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setFiltering(false);
      }
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (user) {
      fetchSwaps(true); // Initial load
    }
  }, [user]); // Remove fetchSwaps dependency to prevent re-running on status filter changes

  // Separate effect for status filter changes
  useEffect(() => {
    if (user && !loading) { // Only run if not initial loading
      fetchSwaps(false); // Filter change, not initial load
    }
  }, [statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSwaps(false);
    setRefreshing(false);
    toast.success('Swaps refreshed!');
  };

  const handleAcceptSwap = async (swapId: string) => {
    try {
      await axios.put(`/api/swaps/${swapId}/accept`);
      toast.success('Swap request accepted!');
      fetchSwaps(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to accept swap request';
      toast.error(message);
    }
  };

  const handleRejectSwap = async (swapId: string) => {
    if (!window.confirm('Are you sure you want to reject this swap request?')) return;
    
    try {
      await axios.put(`/api/swaps/${swapId}/reject`);
      toast.success('Swap request rejected');
      fetchSwaps(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reject swap request';
      toast.error(message);
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    if (!window.confirm('Are you sure you want to cancel this swap request?')) return;
    
    try {
      await axios.put(`/api/swaps/${swapId}/cancel`);
      toast.success('Swap request cancelled');
      fetchSwaps(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel swap request';
      toast.error(message);
    }
  };

  const getFilteredSwaps = () => {
    let filteredSwaps: Swap[] = [];
    
    switch (activeTab) {
      case 'incoming':
        filteredSwaps = swaps.incoming;
        break;
      case 'outgoing':
        filteredSwaps = swaps.outgoing;
        break;
      case 'all':
      default:
        filteredSwaps = [...swaps.incoming, ...swaps.outgoing];
        break;
    }

    if (statusFilter !== 'all') {
      filteredSwaps = filteredSwaps.filter(swap => swap.status === statusFilter);
    }

    return filteredSwaps.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusCount = (status: string) => {
    const allSwaps = [...swaps.incoming, ...swaps.outgoing];
    if (status === 'all') return allSwaps.length;
    return allSwaps.filter(swap => swap.status === status).length;
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'incoming':
        return swaps.incoming.length;
      case 'outgoing':
        return swaps.outgoing.length;
      case 'all':
      default:
        return swaps.incoming.length + swaps.outgoing.length;
    }
  };

  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [filtersRef, filtersInView] = useInView({ threshold: 0.2 });
  const [statsRef, statsInView] = useInView({ threshold: 0.2 });

  const filteredSwaps = getFilteredSwaps();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

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
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={heroRef}>
          <motion.div 
            className="text-center mb-12"
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
                <motion.div 
                  className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center shadow-glow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <ArrowRight className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div 
                  className="absolute -inset-4 bg-gradient-brand rounded-3xl opacity-20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="text-secondary-900">Skill</span>{' '}
              <span className="text-gradient animate-gradient-x">Swaps</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Manage your skill exchange requests and track their progress in your collaborative learning journey.
            </motion.p>
            
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="gradient"
                size="lg"
                icon={RefreshCw}
                className={refreshing ? 'animate-pulse' : ''}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Swaps'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-16" ref={filtersRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={filtersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={filtersInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Filter Your <span className="text-gradient">Swaps</span>
              {filtering && (
                <motion.div 
                  className="inline-flex items-center ml-3 px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-blue-500 rounded-full mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Filtering...
                </motion.div>
              )}
            </motion.h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={filtersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card variant="glass" className="p-8 mb-8">
              {/* Tab Navigation */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Swap Direction</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'all', label: 'All Swaps', icon: ArrowRight },
                    { key: 'incoming', label: 'Incoming', icon: Users },
                    { key: 'outgoing', label: 'Outgoing', icon: TrendingUp }
                  ].map((tab, index) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                          activeTab === tab.key
                            ? 'bg-gradient-brand text-white shadow-glow'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 hover:text-secondary-900'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={filtersInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          activeTab === tab.key
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-secondary-600'
                        }`}>
                          {getTabCount(tab.key)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-glow"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Filter className="w-4 h-4 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-secondary-900">Status Filter</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { key: 'all', label: 'All', count: getStatusCount('all'), gradient: 'from-gray-500 to-gray-600' },
                    { key: 'pending', label: 'Pending', count: getStatusCount('pending'), gradient: 'from-yellow-500 to-orange-500' },
                    { key: 'accepted', label: 'Accepted', count: getStatusCount('accepted'), gradient: 'from-green-500 to-emerald-500' },
                    { key: 'rejected', label: 'Rejected', count: getStatusCount('rejected'), gradient: 'from-red-500 to-pink-500' },
                    { key: 'cancelled', label: 'Cancelled', count: getStatusCount('cancelled'), gradient: 'from-gray-400 to-gray-500' }
                  ].map((status, index) => (
                    <motion.button
                      key={status.key}
                      onClick={() => setStatusFilter(status.key as any)}
                      className={`relative flex flex-col items-center space-y-2 p-4 rounded-2xl text-sm font-medium transition-all duration-300 group ${
                        statusFilter === status.key
                          ? 'bg-gradient-brand text-white shadow-glow transform scale-105'
                          : 'bg-white/50 text-secondary-700 hover:bg-white/80 hover:shadow-soft border border-secondary-200'
                      }`}
                      whileHover={{ scale: statusFilter === status.key ? 1.05 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={filtersInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                    >
                      {status.key !== 'all' && (
                        <motion.div
                          className={`w-8 h-8 bg-gradient-to-r ${status.gradient} rounded-xl flex items-center justify-center shadow-glow`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          {getStatusIcon(status.key)}
                        </motion.div>
                      )}
                      <span className={statusFilter === status.key ? 'text-white' : 'text-secondary-900'}>
                        {status.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusFilter === status.key
                          ? 'bg-white/20 text-white'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {status.count}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Swap Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSwaps.length > 0 ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: filtering ? 0.5 : 1 }}
              animate={{ opacity: filtering ? 0.5 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {filteredSwaps.map((swap, index) => (
                <motion.div
                  key={swap.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SwapCard
                    swap={swap}
                    currentUserId={user!.id}
                    onAccept={handleAcceptSwap}
                    onReject={handleRejectSwap}
                    onCancel={handleCancelSwap}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
          <div className="text-gray-500 mb-4">
            {activeTab === 'incoming' && (
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            )}
            {activeTab === 'outgoing' && (
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            )}
            {activeTab === 'all' && (
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter !== 'all' ? (
              `No ${statusFilter} swaps found`
            ) : (
              activeTab === 'incoming'
                ? 'No incoming swap requests'
                : activeTab === 'outgoing'
                ? 'No outgoing swap requests'
                : 'No swap requests found'
            )}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'incoming'
              ? "You haven't received any swap requests yet. Make sure your profile and skills are visible to attract potential swaps."
              : activeTab === 'outgoing'
              ? "You haven't sent any swap requests yet. Browse other users' profiles and request skill exchanges."
              : "You don't have any swap requests yet. Start by exploring users and their skills to initiate exchanges."
            }
          </p>
          {(activeTab === 'all' || activeTab === 'outgoing') && (
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/search')}
                variant="gradient"
                size="lg"
              >
                Browse Users & Skills
              </Button>
              <div>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Update Your Profile
                </button>
              </div>
            </div>
          )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      {(swaps.incoming.length > 0 || swaps.outgoing.length > 0) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="glass" className="p-6 text-center hover:shadow-glow transition-all duration-300">
                <motion.div 
                  className="text-3xl font-bold text-primary-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  {swaps.incoming.length + swaps.outgoing.length}
                </motion.div>
                <div className="text-sm text-secondary-600 font-medium">Total Swaps</div>
              </Card>
              <Card variant="glass" className="p-6 text-center hover:shadow-glow transition-all duration-300">
                <motion.div 
                  className="text-3xl font-bold text-yellow-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                >
                  {getStatusCount('pending')}
                </motion.div>
                <div className="text-sm text-secondary-600 font-medium">Pending</div>
              </Card>
              <Card variant="glass" className="p-6 text-center hover:shadow-glow transition-all duration-300">
                <motion.div 
                  className="text-3xl font-bold text-green-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                >
                  {getStatusCount('accepted')}
                </motion.div>
                <div className="text-sm text-secondary-600 font-medium">Accepted</div>
              </Card>
              <Card variant="glass" className="p-6 text-center hover:shadow-glow transition-all duration-300">
                <motion.div 
                  className="text-3xl font-bold text-blue-600 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                >
                  {swaps.incoming.filter(s => s.status === 'pending').length}
                </motion.div>
                <div className="text-sm text-secondary-600 font-medium">Need Response</div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Swaps;
