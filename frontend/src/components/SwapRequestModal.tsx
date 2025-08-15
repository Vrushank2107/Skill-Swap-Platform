import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, Sparkles, Send, User } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    photo?: string;
    offeredSkills: string[];
    wantedSkills: string[];
  };
  currentUserSkills: string[];
  onSubmit: (data: {
    offeredSkill: string;
    wantedSkill: string;
    message: string;
  }) => void;
  loading?: boolean;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  currentUserSkills,
  onSubmit,
  loading = false
}) => {
  const [offeredSkill, setOfferedSkill] = useState('');
  const [wantedSkill, setWantedSkill] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offeredSkill && wantedSkill) {
      onSubmit({
        offeredSkill,
        wantedSkill,
        message
      });
    }
  };

  const handleClose = () => {
    setOfferedSkill('');
    setWantedSkill('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card variant="glass-light" className="p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ArrowRightLeft className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Request Skill Swap</h2>
                    <p className="text-secondary-600">Exchange skills with {targetUser.name}</p>
                  </div>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-secondary-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-secondary-600" />
                </motion.button>
              </div>

              {/* User Info */}
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary-200 flex items-center justify-center">
                  {targetUser.photo ? (
                    <img src={targetUser.photo} alt={targetUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-secondary-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-secondary-900">{targetUser.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {targetUser.offeredSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                    {targetUser.offeredSkills.length > 3 && (
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-600 text-sm rounded-full">
                        +{targetUser.offeredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit}>
                {/* Skill Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Your Skill */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span>Your Skill to Offer</span>
                    </label>
                    <select
                      value={offeredSkill}
                      onChange={(e) => setOfferedSkill(e.target.value)}
                      required
                      disabled={currentUserSkills.length === 0}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-secondary-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {currentUserSkills.length === 0 
                          ? "Add skills to your profile first..." 
                          : "Select a skill you can teach..."
                        }
                      </option>
                      {currentUserSkills.map((skill, index) => (
                        <option key={index} value={skill}>{skill}</option>
                      ))}
                    </select>
                    {currentUserSkills.length === 0 && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Add skills to your profile to send swap requests
                      </p>
                    )}
                  </motion.div>

                  {/* Their Skill */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Skill You Want to Learn</span>
                    </label>
                    <select
                      value={wantedSkill}
                      onChange={(e) => setWantedSkill(e.target.value)}
                      required
                      disabled={targetUser.offeredSkills.length === 0}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-secondary-900 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {targetUser.offeredSkills.length === 0
                          ? "No skills available from this user..."
                          : "Select a skill to learn..."
                        }
                      </option>
                      {targetUser.offeredSkills.map((skill, index) => (
                        <option key={index} value={skill}>{skill}</option>
                      ))}
                    </select>
                    {targetUser.offeredSkills.length === 0 && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        This user hasn't listed any teachable skills yet
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Swap Preview */}
                {offeredSkill && wantedSkill && (
                  <motion.div 
                    className="p-6 bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-2xl mb-8 border border-secondary-200"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium">
                          {offeredSkill}
                        </div>
                        <p className="text-xs text-secondary-600 mt-2">You teach</p>
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRightLeft className="w-8 h-8 text-secondary-400" />
                      </motion.div>
                      <div className="text-center">
                        <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium">
                          {wantedSkill}
                        </div>
                        <p className="text-xs text-secondary-600 mt-2">You learn</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Message */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
                    <Send className="w-4 h-4 text-purple-500" />
                    <span>Personal Message (Optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and explain why you'd like to swap skills..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-secondary-900 placeholder-secondary-500 resize-none"
                  />
                </motion.div>

                {/* Actions */}
                <motion.div 
                  className="flex items-center justify-end space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    icon={ArrowRightLeft}
                    disabled={!offeredSkill || !wantedSkill || loading || currentUserSkills.length === 0 || targetUser.offeredSkills.length === 0}
                    className="px-8"
                  >
                    {loading ? 'Sending...' : 
                     currentUserSkills.length === 0 ? 'Add Skills to Profile First' :
                     targetUser.offeredSkills.length === 0 ? 'No Skills Available' :
                     'Send Swap Request'
                    }
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwapRequestModal;
