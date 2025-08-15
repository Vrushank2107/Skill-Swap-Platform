import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, Code, Zap } from 'lucide-react';
import { Card } from './ui/Card.tsx';
import Button from './ui/Button.tsx';

interface SearchFiltersProps {
  skill: string;
  location: string;
  skillType: 'all' | 'offered' | 'wanted';
  onSkillChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSkillTypeChange: (value: 'all' | 'offered' | 'wanted') => void;
  onClear: () => void;
  onSearch: () => void;
  searching?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  skill,
  location,
  skillType,
  onSkillChange,
  onLocationChange,
  onSkillTypeChange,
  onClear,
  onSearch,
  searching = false
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <Card variant="glass" className="p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-glow"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Filter className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-bold text-secondary-900">Search Filters</h3>
              {searching && (
                <motion.div 
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="w-3 h-3 bg-blue-500 rounded-full mr-2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Searching...
                </motion.div>
              )}
            </div>
            <p className="text-sm text-secondary-600">Find your perfect skill match</p>
          </div>
        </div>
        <motion.button
          onClick={onClear}
          className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
          <span className="font-medium">Clear All</span>
        </motion.button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Skill Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label htmlFor="skill" className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
              <Code className="w-4 h-4 text-blue-500" />
              <span>Skill</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="skill"
                value={skill}
                onChange={(e) => onSkillChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. React, Guitar, Cooking..."
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-secondary-900 placeholder-secondary-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>
          </motion.div>

          {/* Location Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <label htmlFor="location" className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. New York, Remote..."
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-secondary-900 placeholder-secondary-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>
          </motion.div>

          {/* Skill Type Select */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <label htmlFor="skillType" className="flex items-center space-x-2 text-sm font-semibold text-secondary-900 mb-3">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Skill Type</span>
            </label>
            <div className="relative">
              <select
                id="skillType"
                value={skillType}
                onChange={(e) => onSkillTypeChange(e.target.value as 'all' | 'offered' | 'wanted')}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-secondary-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-secondary-900 appearance-none cursor-pointer"
              >
                <option value="all">All Skills</option>
                <option value="offered">Skills Offered</option>
                <option value="wanted">Skills Wanted</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <motion.div
                  animate={{ rotate: skillType !== 'all' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            icon={Search}
            className="px-8 py-4 text-lg font-semibold shadow-glow-lg"
            disabled={searching}
          >
            {searching ? 'Searching...' : 'Discover Talents'}
          </Button>
        </motion.div>
      </form>
    </Card>
  );
};

export default SearchFilters;
