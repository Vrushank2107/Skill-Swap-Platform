import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp, Filter, Sparkles } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

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
  message?: string;
  is_incoming: boolean;
}

interface SwapManagementProps {
  swaps: Swap[];
  onAccept: (swapId: string) => void;
  onReject: (swapId: string) => void;
  onCancel: (swapId: string) => void;
  loading?: boolean;
}

const SwapManagement: React.FC<SwapManagementProps> = ({
  swaps,
  onAccept,
  onReject,
  onCancel,
  loading = false
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [direction, setDirection] = useState<'all' | 'incoming' | 'outgoing'>('all');

  const filteredSwaps = swaps.filter(swap => {
    const statusMatch = filter === 'all' || swap.status === filter;
    const directionMatch = direction === 'all' || 
      (direction === 'incoming' && swap.is_incoming) ||
      (direction === 'outgoing' && !swap.is_incoming);
    return statusMatch && directionMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-yellow-500 to-orange-500';
      case 'accepted':
        return 'from-green-500 to-emerald-500';
      case 'rejected':
        return 'from-red-500 to-pink-500';
      case 'cancelled':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (swaps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card variant="glass" className="p-12 max-w-md mx-auto">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRightLeft className="w-16 h-16 text-secondary-400 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-2xl font-bold text-secondary-900 mb-4">No Swap Requests</h3>
          <p className="text-secondary-600 mb-8 leading-relaxed">
            You don't have any swap requests yet. Start by exploring users and their skills to initiate exchanges.
          </p>
          <Button variant="gradient" size="lg">
            Browse Skills
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-glow"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Filter className="w-4 h-4 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-secondary-900">Filter Swaps</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Direction Filter */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 mb-3">Direction</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Swaps', icon: ArrowRightLeft },
                { key: 'incoming', label: 'Incoming', icon: Users },
                { key: 'outgoing', label: 'Outgoing', icon: TrendingUp }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => setDirection(item.key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      direction === item.key
                        ? 'bg-gradient-brand text-white shadow-glow'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'accepted', label: 'Accepted' },
                { key: 'rejected', label: 'Rejected' }
              ].map((status) => (
                <motion.button
                  key={status.key}
                  onClick={() => setFilter(status.key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === status.key
                      ? 'bg-gradient-brand text-white shadow-glow'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Swap Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredSwaps.map((swap, index) => (
            <motion.div
              key={swap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="p-6 hover:shadow-glow-lg transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <motion.div
                        className={`w-8 h-8 bg-gradient-to-r ${getStatusColor(swap.status)} rounded-xl flex items-center justify-center shadow-glow`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {getStatusIcon(swap.status)}
                      </motion.div>
                      <div>
                        <h4 className="text-lg font-semibold text-secondary-900">
                          {swap.is_incoming ? 'Incoming Request' : 'Outgoing Request'}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {swap.is_incoming ? `From ${swap.requester_name}` : `To ${swap.responder_name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          swap.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          swap.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          swap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Swap Details */}
                    <div className="flex items-center justify-center space-x-4 mb-4 p-4 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-2xl">
                      <div className="text-center">
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium mb-1">
                          {swap.offered_skill}
                        </div>
                        <p className="text-xs text-secondary-600">
                          {swap.is_incoming ? 'You learn' : 'You teach'}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRightLeft className="w-6 h-6 text-secondary-400" />
                      </motion.div>
                      <div className="text-center">
                        <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium mb-1">
                          {swap.wanted_skill}
                        </div>
                        <p className="text-xs text-secondary-600">
                          {swap.is_incoming ? 'You teach' : 'You learn'}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    {swap.message && (
                      <div className="p-3 bg-secondary-50 rounded-xl mb-4">
                        <p className="text-sm text-secondary-700 italic">"{swap.message}"</p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-secondary-500">
                      Created {new Date(swap.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {swap.status === 'pending' && (
                    <div className="ml-6 flex flex-col space-y-3 min-w-[140px]">
                      {swap.is_incoming ? (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => onAccept(swap.id)}
                              variant="gradient"
                              size="md"
                              icon={CheckCircle}
                              disabled={loading}
                              className="w-full justify-center font-semibold shadow-glow hover:shadow-glow-lg"
                            >
                              Accept
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to decline this swap request?')) {
                                  onReject(swap.id);
                                }
                              }}
                              variant="outline"
                              size="md"
                              icon={XCircle}
                              disabled={loading}
                              className="w-full justify-center font-semibold border-2 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400"
                            >
                              Decline
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this swap request?')) {
                                onCancel(swap.id);
                              }
                            }}
                            variant="outline"
                            size="md"
                            icon={XCircle}
                            disabled={loading}
                            className="w-full justify-center font-semibold border-2 border-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSwaps.length === 0 && swaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Card variant="glass" className="p-8">
            <Sparkles className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">No matches found</h3>
            <p className="text-secondary-600">Try adjusting your filters to see more swap requests.</p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SwapManagement;
