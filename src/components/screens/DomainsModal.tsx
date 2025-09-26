import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from "../../api/apiClient";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';

interface Department {
  id: string;
  display_name: string;
  name: string;
  description: string;
  is_active: boolean;
  embedding_model: string;
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
  const [message, setMessage] = useState<{ text: string } | null>(null);
  const [internalSelections, setInternalSelections] = useState<string[]>(selectedDomains);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  useEffect(() => {
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
        setMessage({ text: 'Could not load domains.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleDomain = (domainId: string) => {
    setInternalSelections(prev =>
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Select Data Sources</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Choose domains for the AI to search.</p>
          </div>
          <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-800'}`}>
            <CloseIcon />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 -mr-3 space-y-2.5">
          {isLoading ? (
            <p className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading domains...</p>
          ) : domains.length === 0 ? (
            <p className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No accessible domains found.</p>
          ) : (
            domains.map(domain => {
              const isSelected = internalSelections.includes(domain.id);
              return (
                <div
                  key={domain.id}
                  onClick={() => handleToggleDomain(domain.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-900 border-blue-700 ring-2 ring-blue-800'
                        : 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : isDarkMode
                        ? 'border-gray-600 hover:border-gray-400 bg-gray-800'
                        : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center border-2 transition-colors ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-blue-600 border-blue-600'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-600'
                        : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <CheckIcon sx={{ color: 'white', fontSize: 16 }} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{domain.display_name}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{domain.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {message && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`}>
            <ErrorIcon fontSize="small" />
            {message.text}
          </div>
        )}
        <div className="mt-6 flex justify-end space-x-3 border-t pt-5 -mx-6 px-6">
          <button
            onClick={onClose}
            className={`font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${
              isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => onDone(internalSelections)}
            className={`font-semibold py-2 px-4 rounded-lg transition-colors text-sm ${
              isDarkMode ? 'bg-blue-700 text-gray-100 hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Done {internalSelections.length > 0 && `(${internalSelections.length})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DomainsModal;