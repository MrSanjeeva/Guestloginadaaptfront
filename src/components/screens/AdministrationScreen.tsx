import React, { useState, useEffect } from 'react';
import apiClient from "../../api/apiClient";

// --- TYPE DEFINITIONS ---

interface File {
    id: string;
    filename: string;
    title: string;
    document_type: string;
    status: string;
    file_size: number;
    created_at: string;
    domain_id: string;
}

interface KnowledgeBaseDomain {
    id: string;
    name: string;
    display_name: string;
    description: string;
    is_active: boolean;
    embedding_model: string;
    chunk_size: number;
    chunk_overlap: number;
    allowed_roles: string[];
    created_at: string;
    updated_at: string;
}

// --- HELPER & UI COMPONENTS ---

const Icon: React.FC<{ path: string; className?: string }> = ({ path, className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const FileIcon: React.FC<{ documentType: string; className?: string }> = ({ documentType, className = 'w-6 h-6' }) => {
    let path;
    let colorClass;

    const base_path = "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z";
    const corner_path = "M14 2v6h6";
    const text_lines = "M16 13H8 M16 17H8";
    const sheet_lines = "M10 12v6 M14 12v6 M7 15h10";

    switch (documentType?.toLowerCase()) {
        case 'pdf':
            path = `${base_path} ${corner_path} ${text_lines}`;
            colorClass = "text-red-500";
            break;
        case 'csv':
        case 'xls':
        case 'xlsx':
            path = `${base_path} ${corner_path} ${sheet_lines}`;
            colorClass = "text-green-600";
            break;
        case 'doc':
        case 'docx':
            path = `${base_path} ${corner_path} ${text_lines}`;
            colorClass = "text-blue-500";
            break;
        default:
            path = `${base_path} ${corner_path}`;
            colorClass = "text-gray-500";
            break;
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${colorClass}`}>
            <path d={path}></path>
        </svg>
    );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
    >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
    </button>
);

const Spinner: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Alert: React.FC<{ type: 'success' | 'error'; text: string }> = ({ type, text }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';
    const iconPath = isSuccess
        ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" // Check circle
        : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"; // X circle

    return (
        <div className={`rounded-md p-4 mb-6 ${bgColor}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon path={iconPath} className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="ml-3">
                    <p className={`text-sm font-medium ${textColor}`}>{text}</p>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const AdministrationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // General State
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'register' | 'knowledge_base'>('register');

    // Knowledge-base Tab State
    const [files, setFiles] = useState<File[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState<boolean>(false);
    const [selectedDomain, setSelectedDomain] = useState<KnowledgeBaseDomain | null>(null);

    // Register User Tab State & Shared Domains
    const [isDomainsLoading, setIsDomainsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [domains, setDomains] = useState<KnowledgeBaseDomain[]>([]);
    const [email, setEmail] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [organization, setOrganization] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [role, setRole] = useState<string>('employee');
    const [password, setPassword] = useState<string>('');
    const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
    const [isSuperuser, setIsSuperuser] = useState<boolean>(false);

    // Effect for fetching domains once on component mount
    useEffect(() => {
        const fetchDomains = async () => {
            setIsDomainsLoading(true);
            try {
                const response = await apiClient.get<KnowledgeBaseDomain[]>('/knowledge-base/domains');
                setDomains(response.data);
                if (response.data.length > 0) {
                    setDepartment(response.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch domains:", error);
                setMessage({ type: 'error', text: 'Could not load required department data.' });
            } finally {
                setIsDomainsLoading(false);
            }
        };

        fetchDomains();
    }, []);

    // Effect to clear messages and state on tab switch
    useEffect(() => {
        setMessage(null);
        setSelectedDomain(null);
        setFiles([]);
    }, [activeTab]);

    const handleAllowedDomainsChange = (domainId: string) => {
        setAllowedDomains(prev =>
            prev.includes(domainId)
                ? prev.filter(id => id !== domainId)
                : [...prev, domainId]
        );
    };

    const handleSelectAllDomains = () => {
        if (allowedDomains.length === domains.length) {
            setAllowedDomains([]);
        } else {
            setAllowedDomains(domains.map(d => d.id));
        }
    };
    
    const resetForm = () => {
        setEmail('');
        setFullName('');
        setOrganization('');
        setDepartment(domains.length > 0 ? domains[0].id : '');
        setRole('employee');
        setPassword('');
        setAllowedDomains([]);
        setIsSuperuser(false);
    }

    const handleRegisterUser = async () => {
        if (!email || !fullName || !password || !department || !organization) {
            setMessage({ type: 'error', text: 'Please fill out all required fields.' });
            return;
        }
        setIsSubmitting(true);
        setMessage(null);
        try {
            await apiClient.post('/auth/register', {
                email,
                full_name: fullName,
                organization,
                department,
                role,
                password,
                allowed_domains: allowedDomains,
                is_superuser: isSuperuser,
                is_active: true,
                is_verified: true,
            });
            setMessage({ type: 'success', text: 'User registered successfully!' });
            resetForm();
        } catch (error) {
            console.error("User registration failed:", error);
            setMessage({ type: 'error', text: 'User registration failed. Please check the details and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDomainSelect = async (domain: KnowledgeBaseDomain) => {
        setSelectedDomain(domain);
        setIsFilesLoading(true);
        setFiles([]);
        setMessage(null);
        try {
            const response = await apiClient.get<File[]>(`/ingestion/documents?domain_id=${domain.id}`);
            setFiles(response.data);
        } catch (error) {
            console.error(`Failed to fetch files for domain ${domain.id}:`, error);
            setMessage({ type: 'error', text: `Could not load files for ${domain.display_name}.` });
        } finally {
            setIsFilesLoading(false);
        }
    };

    // --- RENDER LOGIC ---

    const renderRegisterForm = () => (
        <>
            <div className="flex items-center mb-6">
                <Icon path="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" className="w-8 h-8 text-gray-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Register a New User</h3>
            </div>
            {message && <Alert type={message.type} text={message.text} />}
            {isDomainsLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner className="w-10 h-10 text-blue-600"/></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g., Jane Doe" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="user@example.com" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Enter a secure password" />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">Organization</label>
                                <input id="organization" type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g., Acme Corp" />
                            </div>
                            <div>
                                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Primary Department</label>
                                <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    {domains.map(d => <option key={d.id} value={d.id}>{d.display_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                                    <option value="employee">Employee</option>
                                    <option value="sales_manager">Sales Manager</option>
                                    <option value="hr_specialist">HR Specialist</option>
                                    <option value="analyst">Analyst</option>
                                </select>
                            </div>
                        </div>
                        {/* Full Width Section */}
                        <div className="md:col-span-2 space-y-6 pt-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700">Allowed Department Access</label>
                                    {domains.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllDomains}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            {allowedDomains.length === domains.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                                    {domains.map(d => (
                                        <div key={d.id} className="flex items-center">
                                            <input id={`domain-${d.id}`} type="checkbox" checked={allowedDomains.includes(d.id)} onChange={() => handleAllowedDomainsChange(d.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                            <label htmlFor={`domain-${d.id}`} className="ml-3 text-sm text-gray-700">{d.display_name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                <label htmlFor="is_superuser" className="font-medium text-gray-800">Create as Superuser</label>
                                <ToggleSwitch checked={isSuperuser} onChange={setIsSuperuser} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-6 flex justify-end">
                        <button onClick={handleRegisterUser} className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed" disabled={isSubmitting || !email || !fullName || !password}>
                            {isSubmitting ? <><Spinner className="w-5 h-5 mr-2"/> Processing...</> : 'Register User'}
                        </button>
                    </div>
                </>
            )}
        </>
    );

    const renderKnowledgeBaseView = () => {
        if (selectedDomain) {
            return (
                <>
                    <button onClick={() => setSelectedDomain(null)} className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Icon path="M15.75 19.5L8.25 12l7.5-7.5" className="w-4 h-4 mr-1" />
                        Back to All Departments
                    </button>
                    <div className="flex items-center mb-6">
                        <Icon path="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" className="w-8 h-8 text-gray-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-800">Files in {selectedDomain.display_name}</h3>
                    </div>
                    {message && <Alert type={message.type} text={message.text} />}
                    {isFilesLoading ? (
                        <div className="flex justify-center items-center h-64"><Spinner className="w-10 h-10 text-blue-600"/></div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-16">
                            <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No files found</h3>
                            <p className="mt-1 text-sm text-gray-500">There are currently no documents in this department.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Title</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Original Filename</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900">Date Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {files.map(file => (
                                        <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap"><FileIcon documentType={file.document_type} className="w-6 h-6" /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{file.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.filename}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                    file.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                                    file.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {file.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            );
        }

        return (
            <>
                <div className="flex items-center mb-6">
                    <Icon path="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" className="w-8 h-8 text-gray-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">Knowledge Base Departments</h3>
                </div>
                {message && <Alert type={message.type} text={message.text} />}
                {isDomainsLoading ? (
                    <div className="flex justify-center items-center h-64"><Spinner className="w-10 h-10 text-blue-600"/></div>
                ) : domains.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">No departments have been configured yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {domains.map(domain => (
                            <button key={domain.id} onClick={() => handleDomainSelect(domain)} className="group p-5 bg-white border border-gray-200 rounded-lg text-left hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {/* ✨ CHANGED: Wrapped content in a flex container to position icon */}
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex-1 pr-4">
                                        <p className="font-semibold text-base text-gray-800 group-hover:text-blue-600">{domain.display_name}</p>
                                        <p className="text-sm text-gray-500 mt-1 h-10 overflow-hidden">{domain.description || 'No description available.'}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Icon path="M8.25 4.5l7.5 7.5-7.5 7.5" className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4">
                        <Icon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" className="w-5 h-5 mr-2" />
                        Back to Ask AI
                    </button>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Administration Panel</h1>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('register')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'register' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Register User
                        </button>
                        <button onClick={() => setActiveTab('knowledge_base')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'knowledge_base' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Knowledge Base
                        </button>
                    </nav>
                </div>

                <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
                    {activeTab === 'register' ? renderRegisterForm() : renderKnowledgeBaseView()}
                </div>
            </div>
        </div>
    );
};

export default AdministrationScreen;