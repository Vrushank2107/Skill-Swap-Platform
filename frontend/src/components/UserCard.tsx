import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, ArrowRightLeft, Eye, Sparkles } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    location?: string;
    photo?: string;
    availability?: string;
    offeredSkills: string[];
    wantedSkills: string[];
  };
  onSwapRequest?: (user: any) => void;
  isCurrentUser?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSwapRequest, isCurrentUser = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glass" className="p-6 group hover:shadow-glow-lg transition-all duration-300">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center ring-2 ring-white/50">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-secondary-400" />
              )}
            </div>
            <motion.div 
              className="absolute -inset-1 bg-gradient-brand rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              initial={false}
            />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-secondary-900 group-hover:text-gradient transition-all duration-300">{user.name}</h3>
            {user.location && (
              <motion.div 
                className="flex items-center text-sm text-secondary-600 mt-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <MapPin className="w-4 h-4 mr-2 text-green-500" />
                {user.location}
              </motion.div>
            )}
            {user.availability && (
              <motion.div 
                className="flex items-center text-sm text-secondary-600 mt-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                {user.availability}
              </motion.div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4 mb-6">
          {user.offeredSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-semibold text-secondary-900">Skills Offered</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.offeredSkills.slice(0, 4).map((skill, index) => (
                  <motion.span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm rounded-xl font-medium border border-green-200 hover:shadow-sm transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {skill}
                  </motion.span>
                ))}
                {user.offeredSkills.length > 4 && (
                  <span className="px-3 py-1.5 bg-secondary-100 text-secondary-600 text-sm rounded-xl font-medium">
                    +{user.offeredSkills.length - 4} more
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {user.wantedSkills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-secondary-900">Skills Wanted</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.wantedSkills.slice(0, 4).map((skill, index) => (
                  <motion.span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-sm rounded-xl font-medium border border-blue-200 hover:shadow-sm transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {skill}
                  </motion.span>
                ))}
                {user.wantedSkills.length > 4 && (
                  <span className="px-3 py-1.5 bg-secondary-100 text-secondary-600 text-sm rounded-xl font-medium">
                    +{user.wantedSkills.length - 4} more
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <motion.div 
          className="pt-4 border-t border-secondary-200/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!isCurrentUser ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                as={Link}
                to={`/profile/${user.id}`}
                variant="ghost"
                size="sm"
                icon={Eye}
                className="justify-center"
              >
                View Profile
              </Button>
              {onSwapRequest && user.offeredSkills.length > 0 && (
                <Button
                  onClick={() => onSwapRequest(user)}
                  variant="gradient"
                  size="sm"
                  icon={ArrowRightLeft}
                  className="justify-center"
                >
                  Request Swap
                </Button>
              )}
            </div>
          ) : (
            <Button
              as={Link}
              to={`/profile/${user.id}`}
              variant="gradient"
              size="sm"
              icon={Eye}
              className="w-full justify-center"
            >
              View Your Profile
            </Button>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default UserCard;
