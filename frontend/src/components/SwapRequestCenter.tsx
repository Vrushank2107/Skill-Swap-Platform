import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Search, Filter, Users, Sparkles, Clock, MapPin, Send } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface User {
  id: string;
  name: string;
  location?: string;
  photo?: string;
  availability?: string;
  offeredSkills: string[];
  wantedSkills: string[];
}

interface SwapRequestCenterProps {
  users: User[];
  currentUserSkills: string[];
  onSwapRequest: (user: User) => void;
  loading?: boolean;
}

const SwapRequestCenter: React.FC<SwapRequestCenterProps> = ({
  users,
  currentUserSkills,
  onSwapRequest,
  loading = false
}) => {
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'skills'>('relevance');

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const skillMatch = !skillFilter || 
        user.offeredSkills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase())) ||
        user.wantedSkills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));
      
      const locationMatch = !locationFilter || 
        user.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      return skillMatch && locationMatch && user.offeredSkills.length > 0;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'skills':
          return b.offeredSkills.length - a.offeredSkills.length;
        case 'relevance':
        default:
          // Sort by skill match relevance
          const aMatches = a.offeredSkills.filter(skill => 
            currentUserSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          ).length;
          const bMatches = b.offeredSkills.filter(skill => 
            currentUserSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          ).length;
          return bMatches - aMatches;
      }
    });

  // Get recommended skills for current user
  const recommendedSkills = Array.from(new Set(
    users.flatMap(user => user.offeredSkills)
  )).slice(0, 8);

  const clearFilters = () => {
    setSkillFilter('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
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
    <div className="space-y-8">
      {/* Quick Actions Header */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-glow"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-secondary-900">Send Swap Requests</h3>
            <p className="text-sm text-secondary-600">Find users with skills you want and send them swap requests</p>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-secondary-900 mb-2">
              Filter by Skill
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="e.g. React, Guitar..."
                className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-secondary-900 placeholder-secondary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-900 mb-2">
              Filter by Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. New York, Remote..."
                className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-secondary-900 placeholder-secondary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-900 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-secondary-900 appearance-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="skills">Most Skills</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-secondary-700">
              {filteredUsers.length} users available
            </span>
            {(skillFilter || locationFilter) && (
              <motion.button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear filters
              </motion.button>
            )}
          </div>
        </div>
      </Card>

      {/* Recommended Skills */}
      {recommendedSkills.length > 0 && !skillFilter && (
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h4 className="text-lg font-semibold text-secondary-900">Popular Skills Available</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedSkills.map((skill, index) => (
              <motion.button
                key={skill}
                onClick={() => setSkillFilter(skill)}
                className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-xl hover:shadow-sm transition-all duration-200 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {skill}
              </motion.button>
            ))}
          </div>
        </Card>
      )}

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card variant="glass" className="p-6 group hover:shadow-glow-lg transition-all duration-300">
                  {/* User Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-secondary-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 group-hover:text-gradient transition-all duration-300">
                        {user.name}
                      </h3>
                      {user.location && (
                        <div className="flex items-center text-sm text-secondary-600 mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-green-500" />
                          {user.location}
                        </div>
                      )}
                      {user.availability && (
                        <div className="flex items-center text-sm text-secondary-600 mt-1">
                          <Clock className="w-3 h-3 mr-1 text-blue-500" />
                          {user.availability}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-secondary-900">Can Teach</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.offeredSkills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs rounded-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.offeredSkills.length > 3 && (
                        <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-lg font-medium">
                          +{user.offeredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills Wanted */}
                  {user.wantedSkills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-secondary-900">Wants to Learn</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.wantedSkills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 text-xs rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.wantedSkills.length > 2 && (
                          <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-lg font-medium">
                            +{user.wantedSkills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => onSwapRequest(user)}
                    variant="gradient"
                    size="sm"
                    icon={Send}
                    className="w-full justify-center mt-4"
                  >
                    Send Swap Request
                  </Button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Card variant="glass" className="p-12 max-w-md mx-auto">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRightLeft className="w-16 h-16 text-secondary-400 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-4">No Users Found</h3>
            <p className="text-secondary-600 mb-8 leading-relaxed">
              {skillFilter || locationFilter 
                ? 'Try adjusting your filters to find more users with available skills.'
                : 'No users are currently available for skill swaps. Check back later!'
              }
            </p>
            {(skillFilter || locationFilter) && (
              <Button onClick={clearFilters} variant="gradient" size="lg">
                Clear Filters
              </Button>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SwapRequestCenter;
