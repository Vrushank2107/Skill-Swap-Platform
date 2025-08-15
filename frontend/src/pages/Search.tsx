import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Search as SearchIcon, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import SearchFilters from '../components/SearchFilters.tsx';
import UserCard from '../components/UserCard.tsx';
import SwapRequestModal from '../components/SwapRequestModal.tsx';
import { Card } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

interface User {
  id: string;
  name: string;
  location?: string;
  photo?: string;
  availability?: string;
  offeredSkills: string[];
  wantedSkills: string[];
}

interface SearchResults {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Search: React.FC = () => {
  const { user } = useAuth();
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [skillType, setSkillType] = useState<'all' | 'offered' | 'wanted'>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Swap functionality
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [currentUserSkills, setCurrentUserSkills] = useState<string[]>([]);

  const searchUsers = useCallback(async (page = 1, isNewSearch = false) => {
    if (isNewSearch) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (skill.trim()) params.append('skill', skill.trim());
      if (location.trim()) params.append('location', location.trim());
      if (skillType !== 'all') params.append('skillType', skillType);

      const response = await axios.get(`/api/users/search?${params}`);
      setResults(response.data);
      setHasSearched(true);
    } catch (error: any) {
      toast.error('Failed to search users. Please try again.');
      console.error('Search error:', error);
    } finally {
      if (isNewSearch) {
        setSearching(false);
      } else {
        setLoading(false);
      }
    }
  }, [skill, location, skillType]);

  const handleSearch = () => {
    searchUsers(1, true); // This is a new search
  };

  const handlePageChange = (page: number) => {
    searchUsers(page, false); // This is pagination, not a new search
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSkill('');
    setLocation('');
    setSkillType('all');
    setResults(null);
    setHasSearched(false);
  };

  // Fetch user's skills for swap functionality
  const fetchUserSkills = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/users/profile/${user.id}`);
      const skills = response.data.user?.offeredSkills || [];
      // Extract skill names from the skill objects
      const skillNames = skills.map((skill: any) => skill.skill_name || skill);
      setCurrentUserSkills(skillNames);
    } catch (error) {
      console.error('Failed to fetch user skills:', error);
      toast.error('Failed to load your skills');
    }
  }, [user]);


  // Initialize data
  useEffect(() => {
    if (user) {
      fetchUserSkills();
      // Load all users initially for browsing and swap requests
      searchUsers(1, true);
    }
  }, [user, fetchUserSkills, searchUsers]);

  // Swap request handlers
  const handleSwapRequest = (targetUser: any) => {
    setSelectedUser(targetUser);
    setShowSwapModal(true);
  };

  const handleSwapSubmit = async (swapData: { offeredSkill: string; wantedSkill: string; message: string }) => {
    if (!selectedUser || !user) return;
    
    setSwapLoading(true);
    try {
      // Get current user's skills to find the offered skill ID
      const userResponse = await axios.get(`/api/users/profile/${user.id}`);
      const userSkills = userResponse.data.user?.offeredSkills || [];
      const offeredSkillObj = userSkills.find((skill: any) => skill.skill_name === swapData.offeredSkill);
      
      // Get target user's skills to find the wanted skill ID
      const targetResponse = await axios.get(`/api/users/profile/${selectedUser.id}`);
      const targetSkills = targetResponse.data.user?.offeredSkills || [];
      const wantedSkillObj = targetSkills.find((skill: any) => skill.skill_name === swapData.wantedSkill);
      
      if (!offeredSkillObj) {
        toast.error('Could not find your offered skill. Please refresh and try again.');
        return;
      }
      
      if (!wantedSkillObj) {
        toast.error('Could not find the requested skill. Please refresh and try again.');
        return;
      }
      
      await axios.post('/api/swaps', {
        responderId: selectedUser.id,
        offeredSkillId: offeredSkillObj.id,
        wantedSkillId: wantedSkillObj.id,
        message: swapData.message
      });
      
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send swap request';
      toast.error(message);
    } finally {
      setSwapLoading(false);
    }
  };

  // Remove these handlers since we're focusing on sending requests, not managing existing ones

  // Initial search removed - search only on explicit user action

  const renderPagination = () => {
    if (!results || results.pagination.totalPages <= 1) return null;

    const { page, totalPages } = results.pagination;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>
        
        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              pageNum === page
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [resultsRef, resultsInView] = useInView({ threshold: 0.2 });

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
          {[...Array(5)].map((_, i) => (
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
                  <SearchIcon className="w-10 h-10 text-white" />
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
              <span className="text-secondary-900">
                Find Skills &
              </span>{' '}
              <span className="text-gradient animate-gradient-x">
                Connect
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Discover talented people, find the skills you need to learn, and send swap requests in our vibrant community.
            </motion.p>
          </motion.div>
          
          {/* Search Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <SearchFilters
              skill={skill}
              location={location}
              skillType={skillType}
              onSkillChange={setSkill}
              onLocationChange={setLocation}
              onSkillTypeChange={setSkillType}
              onClear={clearFilters}
              onSearch={handleSearch}
              searching={searching}
            />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      {results && (
        <section className="py-16" ref={resultsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={resultsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="flex items-center justify-center space-x-4 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={resultsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-glow"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="w-4 h-4 text-white" />
                </motion.div>
                <p className="text-lg font-semibold text-secondary-900">
                  {results.pagination.total === 0
                    ? 'No users found'
                    : hasSearched
                    ? `Found ${results.pagination.total} talented ${results.pagination.total !== 1 ? 'people' : 'person'}`
                    : `Discover ${results.pagination.total} amazing ${results.pagination.total !== 1 ? 'people' : 'person'}`
                  }
                </p>
                {results.pagination.totalPages > 1 && (
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-600 text-sm rounded-full">
                    Page {results.pagination.page} of {results.pagination.totalPages}
                  </span>
                )}
              </motion.div>
            </motion.div>

            {results.users.length > 0 ? (
                <>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={resultsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {results.users.map((resultsUser, index) => (
                      <motion.div
                        key={resultsUser.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={resultsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.1 + 0.6 }}
                      >
                        <UserCard 
                          user={resultsUser} 
                          onSwapRequest={handleSwapRequest}
                          isCurrentUser={resultsUser.id === user?.id}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                
                {/* Enhanced Pagination */}
                {results.pagination.totalPages > 1 && (
                  <motion.div 
                    className="mt-16 flex justify-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={resultsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <Card variant="glass" className="p-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handlePageChange(results.pagination.page - 1)}
                          disabled={results.pagination.page === 1}
                          variant="ghost"
                          size="sm"
                          icon={ChevronLeft}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const { page, totalPages } = results.pagination;
                            const pageNumbers = [];
                            const maxVisiblePages = 5;
                            
                            let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                            
                            if (endPage - startPage < maxVisiblePages - 1) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }

                            for (let i = startPage; i <= endPage; i++) {
                              pageNumbers.push(i);
                            }

                            return pageNumbers.map(pageNum => (
                              <motion.button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                                  pageNum === page
                                    ? 'bg-gradient-brand text-white shadow-glow'
                                    : 'text-secondary-700 hover:bg-secondary-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {pageNum}
                              </motion.button>
                            ));
                          })()}
                        </div>
                        
                        <Button
                          onClick={() => handlePageChange(results.pagination.page + 1)}
                          disabled={results.pagination.page === results.pagination.totalPages}
                          variant="ghost"
                          size="sm"
                          icon={ChevronRight}
                          iconPosition="right"
                        >
                          Next
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
                </>
              ) : (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={resultsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Card variant="glass" className="p-12 max-w-md mx-auto">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <SearchIcon className="w-16 h-16 text-secondary-400 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-4">No users found</h3>
                    <p className="text-secondary-600 mb-8 leading-relaxed">
                      Try adjusting your search criteria or clearing the filters to discover more amazing people.
                    </p>
                    <Button
                      onClick={clearFilters}
                      variant="gradient"
                      size="lg"
                    >
                      Clear All Filters
                    </Button>
                  </Card>
                </motion.div>
              )}
          </div>
        </section>
      )}
      
      {/* Swap Request Modal */}
      {showSwapModal && selectedUser && (
        <SwapRequestModal
          isOpen={showSwapModal}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedUser(null);
          }}
          targetUser={selectedUser}
          currentUserSkills={currentUserSkills}
          onSubmit={handleSwapSubmit}
          loading={swapLoading}
        />
      )}
    </div>
  );
};

export default Search;
