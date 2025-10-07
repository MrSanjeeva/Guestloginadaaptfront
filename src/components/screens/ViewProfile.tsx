// ViewProfile.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle, FiShield, FiBriefcase, FiMail, FiCalendar, FiUser, FiStar, FiClock, FiGlobe } from 'react-icons/fi';

// Define the structure of the user profile data
interface UserProfile {
  email: string;
  full_name: string;
  organization: string | null;
  department: string | null;
  role: string | null;
  is_active: boolean;
  is_verified: boolean;
  id: string;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  allowed_domains: string[]; // Added the new field
}

interface ViewProfileModalProps {
  user: UserProfile;
  onClose: () => void;
}

// A simple utility to format date strings
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  // Using toLocaleDateString for better internationalization support
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProfileDetail: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode;}> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white transition-colors duration-200">
        <div className="text-slate-400 mt-1">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-800">{value}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ active: boolean; text: string; icon: React.ReactNode }> = ({ active, text, icon }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${
        active
        ? 'bg-green-100 text-green-800'
        : 'bg-yellow-100 text-yellow-800'
    }`}>
        {icon}
        {text}
    </span>
);


const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ user, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <FiUser /> User Profile
            </h2>
            <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/70 transition-colors"
                aria-label="Close profile"
            >
                <FiX size={20} />
            </button>
        </div>

        {/* Modal Body - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5">
            {/* Left Column (Wider): Avatar and Basic Info */}
            <div className="md:col-span-3 flex flex-col items-center text-center p-8">
                 <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D&auto=format&fit=crop&w=120&q=80"
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-200/60 shadow-lg mb-4"
                />
                <h3 className="text-2xl font-extrabold text-slate-900">{user.full_name}</h3>
                <p className="text-sm text-slate-500 break-all w-full px-2">{user.email}</p>
                
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                    <StatusBadge 
                        active={user.is_active} 
                        text={user.is_active ? 'Active' : 'Inactive'}
                        icon={user.is_active ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                    />
                    <StatusBadge 
                        active={user.is_verified} 
                        text={user.is_verified ? 'Verified' : 'Not Verified'}
                        icon={user.is_verified ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                    />
                    {user.is_superuser && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">
                           <FiStar size={14} /> Superuser
                        </span>
                    )}
                </div>

                {/* Allowed Domains Section */}
                <div className="w-full mt-8 pt-6 border-t border-slate-200">
                    <h5 className="text-sm font-bold text-slate-600 mb-4 flex items-center justify-center gap-2">
                        <FiGlobe size={14} /> Allowed Domains
                    </h5>
                    <div className="flex flex-wrap justify-center gap-2">
                        {user.allowed_domains && user.allowed_domains.length > 0 ? (
                            user.allowed_domains.map((domain, index) => (
                                <span key={index} className="px-3 py-1 text-xs font-medium text-sky-800 bg-sky-100 rounded-full">
                                    {domain}
                                </span>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 italic">No domains specified.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column (Narrower): Detailed Information */}
            <div className="md:col-span-2 p-8 bg-slate-50/70 md:border-l border-slate-200">
                 <h4 className="text-base font-bold text-slate-700 mb-4">Account Details</h4>
                <div className="space-y-2">
                    <ProfileDetail icon={<FiBriefcase size={18}/>} label="Organization" value={user.organization || 'Not Specified'} />
                    <ProfileDetail icon={<FiShield size={18}/>} label="Department" value={user.department || 'Not Specified'} />
                    <ProfileDetail icon={<FiMail size={18}/>} label="Role" value={user.role || 'Not Specified'} />
                    <ProfileDetail icon={<FiCalendar size={18}/>} label="Member Since" value={formatDate(user.created_at)} />
                    <ProfileDetail icon={<FiClock size={18}/>} label="Last Login" value={formatDate(user.last_login)} />
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewProfileModal;