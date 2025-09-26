import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import apiClient from "../../api/apiClient";
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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

interface UploadModalProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, isDarkMode = false }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userPromise = apiClient.get<User>('/auth/me');
        const domainsPromise = apiClient.get<Department[]>('/knowledge-base/domains');
        const [userResponse, domainsResponse] = await Promise.all([userPromise, domainsPromise]);
        const currentUser = userResponse.data;
        const allowedDomains = domainsResponse.data.filter(domain =>
          currentUser.allowed_domains.includes(domain.name)
        );
        setDepartments(allowedDomains);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setMessage({ type: 'error', text: 'Could not load departments.' });
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      setSelectedFile(files[0]);
      setMessage(null);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedDomainId || !selectedFile) {
      setMessage({ type: 'error', text: 'Please select a department and a file.' });
      return;
    }
    setIsUploading(true);
    setMessage(null);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 10;
      });
    }, 150);

    const formData = new FormData();
    formData.append('domain_id', selectedDomainId);
    formData.append('file', selectedFile);

    try {
      await apiClient.post('/ingestion/upload', formData);
      clearInterval(interval);
      setUploadProgress(100);
      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setTimeout(onClose, 1500);
    } catch (error) {
      clearInterval(interval);
      console.error("Upload failed:", error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`rounded-2xl shadow-2xl p-6 w-full max-w-md m-4 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-bold">Upload Document</h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Add a file to a department knowledge base.</p>
          </div>
          <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-800'}`}>
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="department" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>1. Select Department</label>
            <select
              id="department"
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className={`w-full p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
            >
              <option value="" disabled>Choose a department...</option>
              {departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.display_name}</option>))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5`}>2. Attach File</label>
            {isUploading ? (
              <div className="w-full bg-gray-200 rounded-full h-2 my-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }}></div>
              </div>
            ) : selectedFile ? (
              <div className={`border rounded-lg p-3 flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-3">
                  <InsertDriveFileIcon className={isDarkMode ? 'text-gray-300' : 'text-blue-500'} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)} className={`text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}>Remove</button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? isDarkMode
                      ? 'border-blue-500 bg-gray-800'
                      : 'border-blue-500 bg-blue-50'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-blue-400 bg-gray-900'
                      : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
                <UploadFileIcon className={isDarkMode ? 'text-gray-400 mx-auto' : 'text-gray-400 mx-auto'} sx={{ width: 32, height: 32 }} />
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Click to browse</span> or drag & drop
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>PDF, DOCX, TXT (max. 25MB)</p>
              </div>
            )}
          </div>
        </div>
        {message && (
          <div className={`mt-5 p-3 rounded-lg flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? isDarkMode
                ? 'bg-green-900 text-green-300'
                : 'bg-green-100 text-green-800'
              : isDarkMode
                ? 'bg-red-900 text-red-300'
                : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
            {message.text}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            className={`w-full font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed ${
              isDarkMode
                ? 'bg-blue-700 text-gray-100 hover:bg-blue-600 disabled:bg-blue-900'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
            }`}
            disabled={isUploading || !selectedFile || !selectedDomainId}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Confirm Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadModal;