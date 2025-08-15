import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRightLeft, CheckCircle, XCircle, AlertCircle, Sparkles, Calendar, MessageCircle } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface SwapCardProps {
  swap: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at: string;
    requester_name: string;
    responder_name: string;
    offered_skill: string;
    wanted_skill: string;
    requester_id?: string;
    responder_id?: string;
  };
  currentUserId: string;
  onAccept?: (swapId: string) => void;
  onReject?: (swapId: string) => void;
  onCancel?: (swapId: string) => void;
}

const SwapCard: React.FC<SwapCardProps> = ({ 
  swap, 
  currentUserId, 
  onAccept, 
  onReject, 
  onCancel 
}) => {
  const isIncoming = swap.responder_id === currentUserId;
  const isOutgoing = swap.requester_id === currentUserId;
  const canAcceptReject = isIncoming && swap.status === 'pending';
  const canCancel = isOutgoing && swap.status === 'pending';

  const getStatusIcon = () => {
    switch (swap.status) {
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

  const getStatusColor = () => {
    switch (swap.status) {
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

  const getStatusBadgeColor = () => {
    switch (swap.status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass-light" className="p-6 hover:shadow-glow-lg transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  className={`w-10 h-10 bg-gradient-to-r ${getStatusColor()} rounded-2xl flex items-center justify-center shadow-glow`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {getStatusIcon()}
                </motion.div>
                <div>
                  <h4 className="text-lg font-semibold text-secondary-900">
                    {isIncoming ? 'Incoming Request' : 'Outgoing Request'}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-secondary-500" />
                    <span className="text-sm text-secondary-600">
                      {isIncoming ? `From ${swap.requester_name}` : `To ${swap.responder_name}`}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor()}`}>
                {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
              </span>
            </div>

            {/* Skills Exchange Visual */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-2xl border border-secondary-200">
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Sparkles className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-secondary-600 font-medium">
                      {isIncoming ? 'You teach' : 'You offer'}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium text-sm">
                    {swap.offered_skill}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRightLeft className="w-6 h-6 text-secondary-400" />
                </motion.div>
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-secondary-600 font-medium">
                      {isIncoming ? 'You learn' : 'You want'}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium text-sm">
                    {swap.wanted_skill}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamp and Details */}
            <div className="flex items-center justify-between text-xs text-secondary-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(swap.created_at)}</span>
              </div>
              {swap.status !== 'pending' && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDate(swap.updated_at || swap.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canAcceptReject || canCancel) && (
          <motion.div 
            className="mt-8 pt-6 border-t border-secondary-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {canAcceptReject && (
              <div className="space-y-3">
                {/* Accept Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => onAccept?.(swap.id)}
                    variant="gradient"
                    size="lg"
                    icon={CheckCircle}
                    className="w-full justify-center font-bold text-base py-4 shadow-glow-lg hover:shadow-glow-xl transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Accept Skill Swap</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-green-200"
                      >
                        ✨
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
                
                {/* Decline Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to decline this swap request? This action cannot be undone.')) {
                        onReject?.(swap.id);
                      }
                    }}
                    variant="outline"
                    size="lg"
                    icon={XCircle}
                    className="w-full justify-center font-semibold text-base py-4 border-2 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 focus:ring-red-500 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5" />
                      <span>Decline Request</span>
                    </span>
                  </Button>
                </motion.div>
              </div>
            )}
            
            {canCancel && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this swap request?')) {
                      onCancel?.(swap.id);
                    }
                  }}
                  variant="outline"
                  size="lg"
                  icon={XCircle}
                  className="w-full justify-center font-semibold text-base py-4 border-2 border-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500 transition-all duration-300"
                >
                  <span className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5" />
                    <span>Cancel Request</span>
                  </span>
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Additional message if swap is not pending */}
        {swap.status !== 'pending' && (
          <motion.div 
            className="mt-4 p-3 rounded-xl border-l-4 bg-secondary-50"
            style={{
              borderLeftColor: 
                swap.status === 'accepted' ? '#10b981' :
                swap.status === 'rejected' ? '#ef4444' : '#6b7280'
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-secondary-500" />
              <span className="text-sm text-secondary-700 font-medium">
                {swap.status === 'accepted' && 'This swap has been accepted! 🎉'}
                {swap.status === 'rejected' && 'This swap was declined.'}
                {swap.status === 'cancelled' && 'This swap was cancelled.'}
              </span>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default SwapCard;
