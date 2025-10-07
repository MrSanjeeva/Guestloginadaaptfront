import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from "../../api/apiClient";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';

// Interface updated to allow null for embedding_model
interface Department {
  id: string;
  display_name: string;
  name: string;
  description: string;
  is_active: boolean;
  embedding_model: string | null;
  chunk_size: number;
  chunk_overlap: number;
  allowed_roles: string[];
  created_at: string;
  updated_at: string;
}

interface User {
  email: string;
  full_name: string;
  organization: string;
  department: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  id: string;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  last_login: string;
  allowed_domains: string[];
}

interface DomainsModalProps {
  onClose: () => void;
  onDone: (selectedIds: string[]) => void;
  selectedDomains: string[];
  isDarkMode?: boolean;
}

const DomainsModal: React.FC<DomainsModalProps> = ({ onClose, onDone, selectedDomains, isDarkMode = false }) => {
  const [domains, setDomains] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [internalSelections, setInternalSelections] = useState<string[]>(selectedDomains);
  
  const [view, setView] = useState<'select' | 'add'>('select');
  const [newDepartmentInput, setNewDepartmentInput] = useState({
    display_name: '',
    description: '',
    allowed_roles: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  useEffect(() => {
    if (view === 'select') {
        const fetchData = async () => {
          setIsLoading(true);
          try {
            const userPromise = apiClient.get<User>('/auth/me');
            const domainsPromise = apiClient.get<Department[]>('/knowledge-base/domains');
            const [userResponse, domainsResponse] = await Promise.all([userPromise, domainsPromise]);
            const currentUser = userResponse.data;
            const allowedDomains = domainsResponse.data.filter(domain => currentUser.allowed_domains.includes(domain.name));
            setDomains(allowedDomains);
          } catch (error) {
            console.error("Failed to fetch data:", error);
            setMessage({ text: 'Could not load domains.', type: 'error' });
          } finally {
            setIsLoading(false);
          }
        };
        fetchData();
    }
  }, [view]);

  const handleToggleDomain = (domainId: string) => {
    setInternalSelections(prev =>
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    );
  };
  
  const areAllSelected = domains.length > 0 && internalSelections.length === domains.length;

  const handleSelectAll = () => {
    if (areAllSelected) {
      setInternalSelections([]); // Deselect all
    } else {
      setInternalSelections(domains.map(d => d.id)); // Select all
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDepartmentInput(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentInput.display_name.trim()) {
      setMessage({ text: 'Display Name is required.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);

    const requestBody = {
        name: newDepartmentInput.display_name.trim().toLowerCase().replace(/\s+/g, '-'),
        display_name: newDepartmentInput.display_name.trim(),
        description: newDepartmentInput.description.trim() || `Domain for ${newDepartmentInput.display_name.trim()}`,
        is_active: true,
        embedding_model: null,
        chunk_size: 1000,
        chunk_overlap: 200,
        allowed_roles: newDepartmentInput.allowed_roles.split(',').map(role => role.trim()).filter(Boolean),
    };

    try {
      const response = await apiClient.post<Department>('/knowledge-base/domains', requestBody);
      const newDomain = response.data;
      setDomains(prev => [...prev, newDomain]);
      setInternalSelections(prev => [...prev, newDomain.id]); // Auto-select the new domain
      setMessage({ text: `Successfully added '${newDomain.display_name}'.`, type: 'success' });
      setNewDepartmentInput({ display_name: '', description: '', allowed_roles: '' });
      setView('select');
    } catch (error: any) {
      console.error("Failed to add department:", error);
      const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}
      >
        {view === 'select' ? (
          <>
            {/* SELECTION VIEW */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Select Data Sources</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Choose domains for the AI to search.</p>
                </div>
                <button 
                  onClick={onClose} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  aria-label="Close"
                >
                  <CloseIcon fontSize="small"/>
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto px-6 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading sources...</p>
                </div>
              ) : domains.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-center">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No accessible data sources found.</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <button
                      onClick={handleSelectAll}
                      className={`text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${
                        isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {areAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {domains.map(domain => {
                      const isSelected = internalSelections.includes(domain.id);
                      return (
                        <div key={domain.id} onClick={() => handleToggleDomain(domain.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                            isSelected
                              ? isDarkMode ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-400'
                              : isDarkMode ? 'border-gray-700 hover:border-gray-500 bg-gray-900/50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-6 h-6 flex-shrink-0 rounded-lg flex items-center justify-center border-2 transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                          }`}>
                            {isSelected && <CheckIcon sx={{ color: 'white', fontSize: 18 }} />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{domain.display_name}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{domain.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className={`mt-2 flex justify-between items-center space-x-4 border-t p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
               <button
                  onClick={() => { setView('add'); setMessage(null); }}
                  className={`font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center gap-2 ${
                    isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <AddIcon fontSize='small' />
                  Add New
              </button>
              <div className="flex items-center space-x-3">
                <button onClick={onClose} className={`font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm ${isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button onClick={() => onDone(internalSelections)} className={`font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  Done {internalSelections.length > 0 && `(${internalSelections.length})`}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ADD DEPARTMENT VIEW */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">Add New Data Source</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Create a new domain for knowledge storage.</p>
                  </div>
                  <button 
                    onClick={onClose} 
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    aria-label="Close"
                  >
                    <CloseIcon fontSize="small"/>
                  </button>
              </div>
            </div>

            <form onSubmit={handleAddNewDepartment} id="add-department-form" className="flex-grow overflow-y-auto px-6 pb-4 space-y-5">
              <div>
                <label htmlFor="display_name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Display Name</label>
                <input type="text" id="display_name" name="display_name" value={newDepartmentInput.display_name} onChange={handleInputChange} required 
                  className={`w-full p-2.5 border rounded-xl transition-colors outline-none focus-visible:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/50' : 'bg-white border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/30'}`} placeholder="e.g., Human Resources"/>
              </div>
              <div>
                <label htmlFor="description" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea id="description" name="description" value={newDepartmentInput.description} onChange={handleInputChange} rows={3} 
                  className={`w-full p-2.5 border rounded-xl transition-colors outline-none focus-visible:ring-2 resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/50' : 'bg-white border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/30'}`} placeholder="A brief description of the data source."/>
              </div>
               <div>
                <label htmlFor="allowed_roles" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allowed Roles (Optional)</label>
                <input type="text" id="allowed_roles" name="allowed_roles" value={newDepartmentInput.allowed_roles} onChange={handleInputChange} 
                  className={`w-full p-2.5 border rounded-xl transition-colors outline-none focus-visible:ring-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/50' : 'bg-white border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/30'}`} placeholder="e.g., admin, manager, hr_specialist"/>
                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter roles separated by commas. Leave blank to allow all.</p>
              </div>
            </form>

            {message && (
              <div className="px-6 pb-4">
                  <div className={`p-3 rounded-xl flex items-center gap-3 text-sm ${
                    message.type === 'error'
                      ? (isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800')
                      : (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
                  }`}>
                    {message.type === 'error' ? <ErrorIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                    <span>{message.text}</span>
                  </div>
              </div>
            )}

            <div className={`flex justify-end space-x-3 border-t p-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button type="button" onClick={() => { setView('select'); setMessage(null); }} className={`font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm ${isDarkMode ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Back
              </button>
              <button type="submit" form="add-department-form" disabled={isSubmitting} className={`font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {isSubmitting ? 'Saving...' : 'Save Source'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DomainsModal;