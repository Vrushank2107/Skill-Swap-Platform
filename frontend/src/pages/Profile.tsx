import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  MapPin, 
  Clock, 
  Mail, 
  Calendar, 
  Camera, 
  Edit3, 
  Plus, 
  X,
  Save,
  MessageCircle,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Card } from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  location?: string;
  photo?: string;
  availability?: string;
  is_public: boolean;
  created_at: string;
  offeredSkills: Array<{
    id: string;
    skill_name: string;
    description?: string;
    approved: boolean;
  }>;
  wantedSkills: Array<{
    id: string;
    skill_name: string;
    description?: string;
    approved: boolean;
  }>;
}

interface SkillFormData {
  skillName: string;
  type: 'offered' | 'wanted';
  description: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState<SkillFormData>({
    skillName: '',
    type: 'offered',
    description: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    availability: '',
    isPublic: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = userId || currentUser?.id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/profile/${targetUserId}`);
      setProfile(response.data.user);
      
      if (isOwnProfile) {
        setProfileForm({
          name: response.data.user.name || '',
          location: response.data.user.location || '',
          availability: response.data.user.availability || '',
          isPublic: response.data.user.is_public
        });
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('This profile is private');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to load profile');
      }
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, isOwnProfile]);

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId, fetchProfile]);

  const handleProfileUpdate = async () => {
    try {
      await axios.put('/api/users/profile', profileForm);
      toast.success('Profile updated successfully');
      setEditingProfile(false);
      fetchProfile();
      
      // Update auth context
      updateUser({
        name: profileForm.name,
        location: profileForm.location,
      });
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post('/api/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Photo uploaded successfully');
      fetchProfile();
      updateUser({ photo: response.data.photo });
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error('Photo upload error:', error);
    }
  };

  const handleSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.skillName.trim()) return;

    try {
      await axios.post('/api/skills', {
        skillName: skillForm.skillName.trim(),
        type: skillForm.type,
        description: skillForm.description.trim() || undefined
      });
      
      toast.success('Skill added successfully');
      setSkillForm({ skillName: '', type: 'offered', description: '' });
      setShowSkillForm(false);
      fetchProfile();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add skill';
      toast.error(message);
    }
  };

  const handleSkillDelete = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      await axios.delete(`/api/skills/${skillId}`);
      toast.success('Skill deleted successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const handleCreateSwap = async (offeredSkillId: string, wantedSkillId: string) => {
    try {
      await axios.post('/api/swaps', {
        responderId: profile?.id,
        offeredSkillId,
        wantedSkillId
      });
      toast.success('Swap request sent successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create swap request';
      toast.error(message);
    }
  };

  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [skillsRef, skillsInView] = useInView({ threshold: 0.2 });

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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card variant="glass" className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Profile Not Found</h2>
          <p className="text-secondary-600">The requested profile could not be found or is private.</p>
        </Card>
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
            {/* Profile Header */}
            <Card variant="glass" className="p-8 mx-auto max-w-4xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                {/* Profile Photo */}
                <motion.div 
                  className="relative"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={heroInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ duration: 1, delay: 0.3, type: 'spring', bounce: 0.3 }}
                >
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-brand flex items-center justify-center shadow-glow-lg border-4 border-white/50">
                    {profile.photo ? (
                      <motion.img 
                        src={profile.photo} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {isOwnProfile && (
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-gradient-brand text-white p-3 rounded-full shadow-glow hover:scale-110 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Camera className="w-5 h-5" />
                    </motion.button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </motion.div>

                {/* Profile Info */}
                <motion.div 
                  className="flex-1 text-left"
                  initial={{ opacity: 0, x: 30 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {editingProfile && isOwnProfile ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-3xl font-bold bg-transparent border-b-2 border-primary-300 focus:border-primary-600 focus:outline-none w-full text-secondary-900 placeholder-secondary-400"
                        placeholder="Your name"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-primary-500" />
                          <input
                            type="text"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                            className="border-b border-secondary-300 focus:border-primary-600 focus:outline-none flex-1 text-secondary-700 placeholder-secondary-400"
                            placeholder="Location"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-accent-500" />
                          <input
                            type="text"
                            value={profileForm.availability}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                            className="border-b border-secondary-300 focus:border-primary-600 focus:outline-none flex-1 text-secondary-700 placeholder-secondary-400"
                            placeholder="Availability"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={profileForm.isPublic}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="isPublic" className="text-secondary-700 font-medium">
                          Make profile public
                        </label>
                        {profileForm.isPublic ? (
                          <Eye className="w-5 h-5 text-success-600" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-secondary-400" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <motion.h1 
                        className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.7 }}
                      >
                        <span className="text-secondary-900">{isOwnProfile ? 'Your' : profile.name + "'s"}</span>{' '}
                        <span className="text-gradient animate-gradient-x">Profile</span>
                      </motion.h1>
                      <motion.div 
                        className="space-y-3 text-secondary-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={heroInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.9 }}
                      >
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-primary-500" />
                          <span className="font-medium">{profile.name}</span>
                        </div>
                        {profile.location && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-accent-500" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        {profile.availability && (
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-success-500" />
                            <span>{profile.availability}</span>
                          </div>
                        )}
                        {isOwnProfile && profile.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-warning-500" />
                            <span>{profile.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-secondary-500" />
                          <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 1.1 }}
                >
                  {isOwnProfile ? (
                    <>
                      {editingProfile ? (
                        <>
                          <Button
                            onClick={handleProfileUpdate}
                            variant="gradient"
                            icon={Save}
                            size="lg"
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={() => setEditingProfile(false)}
                            variant="ghost"
                            size="lg"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setEditingProfile(true)}
                          variant="gradient"
                          icon={Edit3}
                          size="lg"
                        >
                          Edit Profile
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="gradient"
                      icon={MessageCircle}
                      size="lg"
                    >
                      Send Message
                    </Button>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16" ref={skillsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={skillsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Skills <span className="text-gradient">Portfolio</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-secondary-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={skillsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {isOwnProfile ? 'Manage your skills and expertise' : `Discover ${profile.name}'s skills and expertise`}
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Offered Skills */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={skillsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card variant="glass" className="p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-glow mr-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Award className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-secondary-900">Skills Offered</h3>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={() => {
                        setSkillForm(prev => ({ ...prev, type: 'offered' }));
                        setShowSkillForm(true);
                      }}
                      variant="glass"
                      icon={Plus}
                      size="sm"
                    >
                      Add Skill
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {profile.offeredSkills.map((skill, index) => (
                    <motion.div 
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                      className="group"
                    >
                      <Card variant="soft" className="p-4 bg-green-50/50 border-green-200/50 hover:bg-green-100/50 transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="w-4 h-4 text-green-600" />
                              <h4 className="font-bold text-green-800">{skill.skill_name}</h4>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-green-700 leading-relaxed mb-2">{skill.description}</p>
                            )}
                            {!skill.approved && (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!isOwnProfile && skill.approved && currentUser && profile.wantedSkills.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleCreateSwap(e.target.value, skill.id);
                                    e.target.value = '';
                                  }
                                }}
                                className="text-xs px-3 py-2 border border-primary-300 rounded-full text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                              >
                                <option value="">Request Swap</option>
                                {currentUser && profile.wantedSkills
                                  .filter(ws => ws.approved)
                                  .map(wantedSkill => (
                                    <option key={wantedSkill.id} value={wantedSkill.id}>
                                      For: {wantedSkill.skill_name}
                                    </option>
                                  ))
                                }
                              </select>
                            )}
                            {isOwnProfile && (
                              <motion.button
                                onClick={() => handleSkillDelete(skill.id)}
                                className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {profile.offeredSkills.length === 0 && (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={skillsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <Sparkles className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-600">
                        {isOwnProfile ? 'You haven\'t added any skills you can offer yet.' : 'No skills offered yet.'}
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Wanted Skills */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={skillsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card variant="glass" className="p-8 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow mr-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Star className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-secondary-900">Skills Wanted</h3>
                  </div>
                  {isOwnProfile && (
                    <Button
                      onClick={() => {
                        setSkillForm(prev => ({ ...prev, type: 'wanted' }));
                        setShowSkillForm(true);
                      }}
                      variant="glass"
                      icon={Plus}
                      size="sm"
                    >
                      Add Skill
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {profile.wantedSkills.map((skill, index) => (
                    <motion.div 
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.8 }}
                      className="group"
                    >
                      <Card variant="soft" className="p-4 bg-blue-50/50 border-blue-200/50 hover:bg-blue-100/50 transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <h4 className="font-bold text-blue-800">{skill.skill_name}</h4>
                            </div>
                            {skill.description && (
                              <p className="text-sm text-blue-700 leading-relaxed mb-2">{skill.description}</p>
                            )}
                            {!skill.approved && (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          {isOwnProfile && (
                            <motion.button
                              onClick={() => handleSkillDelete(skill.id)}
                              className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {profile.wantedSkills.length === 0 && (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={skillsInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <Sparkles className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-600">
                        {isOwnProfile ? 'You haven\'t added any skills you want to learn yet.' : 'No skills wanted yet.'}
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skill Form Modal */}
      {showSkillForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add {skillForm.type === 'offered' ? 'Skill You Offer' : 'Skill You Want'}
            </h3>
            
            <form onSubmit={handleSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, skillName: e.target.value }))}
                  placeholder="e.g. React Development, Guitar, Cooking..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={skillForm.description}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your skill level, experience, or what you're looking for..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Skill
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSkillForm(false);
                    setSkillForm({ skillName: '', type: 'offered', description: '' });
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
