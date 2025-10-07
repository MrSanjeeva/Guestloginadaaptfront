// DataSourceSetupScreen.tsx

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiChevronLeft,
  FiBox,
  FiCloudSnow,
  FiDatabase,
  FiLayers,
  FiCloud,
  FiFolder,
} from 'react-icons/fi';

const popularDataSources = [
  { name: 'Amazon S3', description: 'Connect to your object storage buckets.', icon: <FiBox size={24} /> },
  { name: 'Snowflake', description: 'Analyze data from your cloud data platform.', icon: <FiCloudSnow size={24} /> },
  { name: 'Google BigQuery', description: 'Access and query massive datasets.', icon: <FiDatabase size={24} /> },
  { name: 'PostgreSQL', description: 'Connect to your relational database.', icon: <FiDatabase size={24} /> },
  { name: 'Databricks', description: 'Leverage your lakehouse platform.', icon: <FiLayers size={24} /> },
  { name: 'Salesforce', description: 'Sync your CRM data for insights.', icon: <FiCloud size={24} /> },
  { name: 'MySQL', description: 'Connect to your open-source database.', icon: <FiDatabase size={24} /> },
  { name: 'Google Drive', description: 'Analyze files directly from your drive.', icon: <FiFolder size={24} /> },
  { name: 'Microsoft OneDrive', description: 'Connect files from your cloud storage.', icon: <FiCloud size={24} /> },
  { name: 'Azure Blob Storage', description: "Access data from Microsoft's cloud.", icon: <FiCloud size={24} /> },
];

interface DataSourceCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({ name, description, icon }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="bg-white border border-gray-200/80 rounded-xl p-6 flex flex-col items-start shadow-sm hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1e293b]">{name}</h3>
    </div>
    <p className="text-sm text-[#64748b] flex-grow mb-6">{description}</p>
    <button className="w-full mt-auto px-4 py-2 text-sm font-bold text-white bg-[#1e293b] rounded-lg hover:bg-slate-700 transition-colors duration-200">
      Connect
    </button>
  </motion.div>
);

interface DataSourceSetupScreenProps {
  onBack: () => void;
}

const DataSourceSetupScreen: React.FC<DataSourceSetupScreenProps> = ({ onBack }) => {
  return (
    <div className="p-6 md:p-8 h-full flex flex-col">
       <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#64748b] hover:bg-gray-200/50 transition-colors"
        >
          <FiChevronLeft size={18} />
          <span>Back</span>
        </button>
      </div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#1e293b]">Connect a New Data Source</h1>
        <p className="mt-2 text-lg text-[#64748b]">Select from our popular integrations to get started.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-8">
        {popularDataSources.map(source => (
          <DataSourceCard key={source.name} {...source} />
        ))}
      </div>
    </div>
  );
};

export default DataSourceSetupScreen;