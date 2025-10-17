import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Local Component Imports ---
import { LeadershipInsights } from './LeadershipInsights';
import AdministrationScreen from './AdministrationScreen';
import DesignDiscoverPage from './DesignDiscoverPage';
import DataSourceSetupScreen from './DataSourceSetupScreen';
import { AdaaptLogo } from '../AdaabtLogo';
import { ChatScreen, Message, AIMessageData } from './chat';
import UploadModal from './UploadModal';
import DomainsModal from './DomainsModal';
import ViewProfileModal from './ViewProfile';

// --- React Icons Imports ---
import {
  FiTrendingUp,
  FiCompass,
  FiCheck,
  FiMessageSquare,
  FiShield,
  FiX,
  FiLogOut,
  FiMenu,
  FiSun,
  FiPaperclip,
  FiDatabase,
  FiChevronLeft,
  FiMonitor,
  FiGrid,
  FiFileText,
  FiCode,
  FiPenTool,
  FiScissors,
  FiMessageCircle,
  FiImage,
  FiVideo,
  FiClipboard,
  FiBox,
  FiUsers,
  FiZap,
  FiMic,
  FiChevronDown,
  FiArrowUp,
  FiUser,
  FiStar,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

// --- TYPE DEFINITION FOR USER PROFILE ---
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
  allowed_domains: string[];
}


// --- STYLED SUB-COMPONENTS ---
interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active = false, onClick, isCollapsed = false }) => {
  const iconWithColor = React.cloneElement(icon as React.ReactElement, {
    style: { color: active ? '#1e293b' : '#64748b' },
    size: 24,
  });

  return (
    <li
      className={`flex items-center p-3 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
        isCollapsed ? 'justify-center' : ''
      } ${active ? 'bg-[#e0f2fe] text-[#1e293b] font-bold' : 'hover:bg-white text-[#64748b]'}`}
      onClick={onClick}
    >
      {iconWithColor}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
            animate={{ width: 'auto', opacity: 1, marginLeft: '0.75rem' }}
            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`overflow-hidden whitespace-nowrap text-sm ${active ? 'font-bold' : 'font-semibold'}`}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </li>
  );
};

interface PromptPillProps {
  text: string;
  onClick: (text: string) => void;
}

const PromptPill: React.FC<PromptPillProps> = ({ text, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out bg-white/60 border border-gray-200/80 text-[#1e293b] hover:bg-white/90 hover:shadow-lg transform hover:scale-102"
  >
    <FiZap size={16} color="#64748b" />
    <span>{text}</span>
  </button>
);

const AgentIcon: React.FC<{ icon: React.ReactNode; text: string; bgColor: string; iconColor: string; isNew?: boolean }> = ({
  icon,
  text,
  bgColor,
  iconColor,
  isNew,
}) => (
  <div className="flex flex-col items-center gap-2 text-center cursor-pointer group">
    <div
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl ${bgColor}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: iconColor, size: 22 })}
      {isNew && (
        <span className="absolute top-0 right-0 bg-[#fb7185] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ring-2 ring-white">
          NEW
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-[#64748b] group-hover:text-[#1e293b]">{text}</p>
  </div>
);

const aiAgents = [
  { name: 'AI Slides', icon: <FiMonitor />, iconColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  { name: 'AI Sheets', icon: <FiGrid />, iconColor: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'AI Docs', icon: <FiFileText />, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'AI Developer', icon: <FiCode />, iconColor: 'text-sky-600', bgColor: 'bg-sky-100' },
  { name: 'AI Designer', icon: <FiPenTool />, iconColor: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: 'Clip Genius', icon: <FiScissors />, iconColor: 'text-violet-600', bgColor: 'bg-violet-100' },
  { name: 'AI Chat', icon: <FiMessageCircle />, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { name: 'AI Image', icon: <FiImage />, iconColor: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: 'AI Video', icon: <FiVideo />, iconColor: 'text-rose-600', bgColor: 'bg-rose-100' },
  { name: 'Meeting Notes', icon: <FiClipboard />, iconColor: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: 'All Agents', icon: <FiBox />, iconColor: 'text-gray-600', bgColor: 'bg-gray-200' },
];

// --- MAIN COMPONENT ---
interface HomeAskAIScreenProps {
  onLogout: () => void;
}

const HomeAskAIScreen: React.FC<HomeAskAIScreenProps> = ({ onLogout }) => {
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDomainsModalOpen, setIsDomainsModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'administration' | 'insights' | 'discover' | 'dataSourceSetup'>('home');
  const [showConnectionMessage, setShowConnectionMessage] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState('');
  const [greeting, setGreeting] = useState({ text: 'Good morning,', icon: <FiSun size={32} /> });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isChatting = messages.length > 0;

  // --- NEW: Handler for global search (Ctrl+K) ---
  const handleSelectAllDomainsForSearch = async () => {
    setStreamStatus("Fetching all available data sources...");
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error("Authentication token not found.");

      const [userResponse, domainsResponse] = await Promise.all([
        fetch('https://api.getadaapt.com/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('https://api.getadaapt.com/api/v1/knowledge-base/domains', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userResponse.ok) throw new Error(`Failed to fetch user profile: ${userResponse.statusText}`);
      const currentUser: UserProfile = await userResponse.json();

      if (!domainsResponse.ok) throw new Error(`Failed to fetch domains: ${domainsResponse.statusText}`);
      const allDomains: { id: string; name: string }[] = await domainsResponse.json();

      const allowedDomainIds = allDomains
        .filter(domain => currentUser.allowed_domains.includes(domain.name))
        .map(domain => domain.id);

      setSelectedDomains(allowedDomainIds);
      setShowConnectionMessage(true);
      setTimeout(() => setShowConnectionMessage(false), 3000);
    } catch (error) {
      console.error("Failed to select all domains for global search:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStreamStatus(`Error: Could not select all sources. ${errorMessage}`);
    }
  };

  // --- Effect to listen for Ctrl+K shortcut ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleSelectAllDomainsForSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- Fetch user profile on component mount ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error("No access token found for fetching profile.");
        return;
      }
      try {
        const response = await fetch('https://api.getadaapt.com/api/v1/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDomainsSelected = (selectedIds: string[]) => {
    setSelectedDomains(selectedIds);
    setIsDomainsModalOpen(false);
    if (selectedIds.length > 0) {
      setShowConnectionMessage(true);
      setTimeout(() => setShowConnectionMessage(false), 3000);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setThreadId(null);
    setStreamStatus('');
    setCurrentScreen('home');
  };

  // --- UPDATED SSE HANDLER ---
  const handleStreamEvent = (event: { event: string; data: any }, currentMessageIndex: number | null) => {
    const { event: eventType, data } = event;
    if (currentMessageIndex === null) return;

    const updateMessage = (updater: (prevContent: AIMessageData) => AIMessageData) => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const currentContent = (updatedMessages[currentMessageIndex].content as AIMessageData) || {};
        updatedMessages[currentMessageIndex] = {
          type: 'ai',
          content: updater(currentContent),
        };
        return updatedMessages;
      });
    };

    const updateThinkingStep = (message: string) => {
      if (!message) return;
      updateMessage(currentContent => ({
        ...currentContent,
        thinkingSteps: message,
      }));
    };

    switch (eventType) {
      case 'start':
        updateThinkingStep("🚀 Initializing AI agent...");
        setIsStreaming(true);
        break;

      case 'status':
        updateThinkingStep("🔗 Establishing secure connection...");
        if (data.thread_id && !threadId) setThreadId(data.thread_id);
        break;

      case 'node_complete':
        updateThinkingStep("🤔 Analyzing your query structure...");
        break;

      case 'tool_execution':
        updateThinkingStep("🔎 Searching connected data sources...");
        break;

      case 'tool_result':
        updateThinkingStep("📊 Interpreting search results...");
        break;

      case 'progress_update':
        updateThinkingStep("✨ Generating insights...");
        break;

      case 'chunk':
        // This event can be used to stream the final answer token by token if needed.
        // For now, we are handling the full answer in the 'final' event.
        break;

      case 'final':
        // As requested, use the message from the backend for the 'final' event.
        let finalAnswer = '';
        if (Array.isArray(data.answer) && data.answer.length > 0) {
          finalAnswer = data.answer.map((item: any) => (item.text ? item.text : '')).join('\n\n');
        } else if (typeof data.answer === 'string') {
          finalAnswer = data.answer;
        }

        updateMessage(currentContent => ({
          ...currentContent,
          thinkingSteps: undefined, // Clear the thinking steps
          answer: finalAnswer,
          steps: data.steps,
          thread_id: data.thread_id,
          dashboardUrl: data.dashboard_url || currentContent.dashboardUrl,
          domains_searched: data.domains_searched,
          sources: data.sources,
        }));
        setIsStreaming(false);
        break;

      case 'complete':
        // This event signifies the end of the stream. The final message is handled above.
        setIsStreaming(false);
        break;

      case 'error':
        const errorMessage = `Error: ${data.message || 'An unknown error occurred.'}`;
        updateMessage(() => ({
          thinkingSteps: undefined,
          error: errorMessage,
        }));
        setIsStreaming(false);
        break;

      default:
        console.log(`[SSE] Received unhandled event: ${eventType}`);
        break;
    }
  };


  const handleSubmit = async () => {
    if (!query.trim() || isSending) return;

    if (!userProfile?.id) {
      console.error("User profile or ID not loaded. Cannot submit query.");
      return;
    }

    const userMessage: Message = { type: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    const currentQuery = query;
    setQuery('');
    let currentMessageIndex: number | null = null;
    setMessages((prev) => {
      const newMessages = [...prev, { type: 'ai', content: { thinkingSteps: 'Initializing...' } } as Message];
      currentMessageIndex = newMessages.length - 1;
      return newMessages;
    });
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token available.');

      const requestBody = {
        question: currentQuery,
        domain_ids: selectedDomains,
        create_thread: !threadId,
        user_id: userProfile.id,
        ...(threadId && { thread_id: threadId }),
      };

      const response = await fetch('https://api.getadaapt.com/api/v1/agentic/agentic-ask-stream', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const newThreadId = response.headers.get('x-thread-id');
      if (newThreadId && !threadId) setThreadId(newThreadId);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable.');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          console.log('[RAW SSE MESSAGE]', line);
          if (line.startsWith('data: ')) {
            const dataString = line.substring(6);
            try {
              const jsonData = JSON.parse(dataString);
              handleStreamEvent(jsonData, currentMessageIndex);
            } catch (error) {
              console.warn('Failed to parse SSE JSON, but continuing stream:', dataString, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
      if (currentMessageIndex !== null) {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[currentMessageIndex] = {
            type: 'ai',
            content: { error: 'Failed to connect to the server.' },
          };
          return updatedMessages;
        });
      }
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting({ text: 'Good morning,', icon: <FiSun size={32} /> });
    } else if (currentHour < 18) {
      setGreeting({ text: 'Good afternoon,', icon: <FiSun size={32} /> });
    } else {
      setGreeting({ text: 'Good evening,', icon: <FiSun size={32} /> });
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [query]);

  // --- NEW: Effect to handle sidebar collapse on resize ---
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1023) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const screenVariants = {
    initial: { opacity: 0, x: -50, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: 50, scale: 0.98 },
  };

  const screenTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen font-figtree font-medium text-black bg-gray-100"
      >
        <div className="flex h-screen p-4 gap-4">
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 max-lg:block" onClick={() => setIsSidebarOpen(false)}></div>
          )}
          <aside
            className={`fixed inset-y-0 left-0 z-40 p-4 flex flex-col transform ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            } ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-all duration-300 ease-in-out max-lg:bg-[#ffffff] max-lg:border max-lg:border-gray-200/80 max-lg:rounded-lg max-lg:shadow-lg lg:relative lg:translate-x-0`}
          >
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6 h-[40px]`}>
              {!isSidebarCollapsed && <AdaaptLogo />}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-lg hover:bg-gray-200/50"
                >
                  <FiChevronLeft
                    size={20}
                    color="#64748b"
                    className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsSidebarCollapsed(true);
                  }}
                  className="max-lg:block lg:hidden p-1 rounded-md hover:bg-gray-200/50"
                >
                  <FiX size={20} color="#64748b" />
                </button>
              </div>
            </div>
            <div className="flex-grow flex flex-col">
              <nav className="space-y-2">
                <NavItem
                  text="Ask AI"
                  isCollapsed={isSidebarCollapsed}
                  active={currentScreen === 'home'}
                  icon={<HiSparkles />}
                  onClick={() => setCurrentScreen('home')}
                />
                <NavItem
                  text="Insights"
                  isCollapsed={isSidebarCollapsed}
                  active={currentScreen === 'insights'}
                  onClick={() => setCurrentScreen('insights')}
                  icon={<FiTrendingUp />}
                />
                <NavItem
                  text="Discover"
                  isCollapsed={isSidebarCollapsed}
                  active={currentScreen === 'discover'}
                  onClick={() => setCurrentScreen('discover')}
                  icon={<FiCompass />}
                />
                <NavItem
                  text="Setup Data Source"
                  isCollapsed={isSidebarCollapsed}
                  icon={<FiDatabase />}
                  active={currentScreen === 'dataSourceSetup'}
                  onClick={() => setCurrentScreen('dataSourceSetup')}
                />
              </nav>
              <div className="mt-auto">
                <div className="space-y-2">
                  <NavItem text="Start a new chat" isCollapsed={isSidebarCollapsed} onClick={handleNewChat} icon={<FiMessageSquare />} />
                  <NavItem text="Team Chat" isCollapsed={isSidebarCollapsed} icon={<FiUsers />} />
                  <NavItem
                    text="Administration"
                    isCollapsed={isSidebarCollapsed}
                    active={currentScreen === 'administration'}
                    icon={<FiShield />}
                    onClick={() => setCurrentScreen('administration')}
                  />
                </div>
                <div ref={profileMenuRef} className="relative mt-4 pt-4 border-t border-gray-200/60">
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute bottom-full mb-2 ${isSidebarCollapsed ? 'w-48 left-1/2 -translate-x-1/2' : 'w-full'}`}
                      >
                        <div className="bg-white rounded-xl shadow-2xl backdrop-blur-xl border border-gray-300/80 overflow-hidden">
                          <button
                            onClick={() => {
                              setIsProfileModalOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-[#334155] hover:bg-gray-100 transition-colors"
                          >
                            <FiUser size={16} />
                            <span>View Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              onLogout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <FiLogOut size={16} />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className={`w-full flex items-center p-2 rounded-lg transition-colors duration-200 ${
                      isSidebarCollapsed ? 'justify-center' : ''
                    } ${isProfileMenuOpen ? 'bg-gray-200/70' : 'hover:bg-gray-100'}`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80"
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white/50 shadow-md"
                    />
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.div
                          initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                          animate={{ width: 'auto', opacity: 1, marginLeft: '0.75rem' }}
                          exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden text-left"
                        >
                          <p className="text-sm font-bold text-[#1e293b] whitespace-nowrap flex items-center gap-1.5">
                            {userProfile?.full_name || 'Loading...'}
                            {userProfile?.is_superuser && (
                              <FiStar size={12} className="text-amber-500 fill-amber-400" title="Superuser" />
                            )}
                          </p>
                          <p className="text-xs text-[#64748b] whitespace-nowrap">{userProfile?.email || '...'}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                variants={screenVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={screenTransition}
                className="w-full h-full overflow-y-auto"
              >
                {currentScreen === 'home' ? (
                  <main className="flex-1 flex flex-col p-4 md:p-6 h-full">
                    <div className="lg:hidden flex items-center mb-4">
                      <button
                        onClick={() => {
                          setIsSidebarOpen(true);
                          setIsSidebarCollapsed(true);
                        }}
                        className="p-2 rounded-md hover:bg-slate-200/50 text-[#1e293b]"
                      >
                        <FiMenu size={24} />
                      </button>
                    </div>
                    <div className="w-full max-w-5xl mx-auto h-full flex flex-col">
                      <div className={`relative ${isChatting ? 'flex-1 min-h-0' : ''}`}>
                        <AnimatePresence initial={false}>
                          {isChatting ? (
                            <ChatScreen messages={messages} isSending={isStreaming} />
                          ) : (
                            <motion.div key="welcome-view" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                              <div className="text-center py-4 md:py-8">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                  <div className="inline-block p-2 rounded-full bg-[#e0f2fe] text-[#1e293b]">
                                    {greeting.icon}
                                  </div>
                                  <p className="text-lg font-semibold text-[#64748b]">{greeting.text}</p>
                                </div>
                                <h1 className="text-4xl font-extrabold font-figtree text-black mt-1 h-[50px] md:h-auto">
                                  What would you like to analyze today?
                                </h1>
                                <p className="mt-2 text-[#64748b]">Start typing your query below or try a suggestion</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        layout
                        transition={{ type: 'spring', duration: 0.7, bounce: 0.2 }}
                        className={`w-full pt-4 ${isChatting ? 'mt-auto' : 'mt-4'}`}
                      >
                        <AnimatePresence>
                          {!isChatting && (
                            <motion.div
                              key="prompt-pills"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="mb-6 flex items-center justify-center gap-3 flex-wrap px-2"
                            >
                              <span className="text-sm font-semibold text-[#64748b]">Try:</span>
                              <PromptPill text="Relationship between promotions and sales" onClick={setQuery} />
                              <PromptPill text="Top sales promoters by amount" onClick={setQuery} />
                              <PromptPill text="Give me some insights" onClick={setQuery} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex flex-col p-3 gap-3 transition-all duration-300 ease-in-out bg-white/70 border border-gray-300 backdrop-blur-2xl rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.1)] ">
                          <div className="flex items-start w-full">
                            <HiSparkles color="#94a3b8" size={20} className="mt-[10px] mr-2 flex-shrink-0" />
                            <textarea
                              ref={textareaRef}
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmit();
                                }
                              }}
                              placeholder="What files do I have access to?"
                              rows={1}
                              className="w-full pt-2 text-base text-[#1e293b] placeholder:text-[#94a3b8] border-none resize-none overflow-y-hidden bg-transparent flex-1 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsDomainsModalOpen(true)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border transition-all duration-300 ease-in-out ${
                                  selectedDomains.length > 0
                                    ? 'border-blue-200 bg-blue-50 text-blue-800 font-bold hover:bg-blue-100'
                                    : 'border-gray-200/70 bg-gray-50/80 text-[#64748b] font-semibold hover:bg-gray-100'
                                }`}
                              >
                                <span>
                                  {selectedDomains.length > 0
                                    ? `${selectedDomains.length} Source${selectedDomains.length > 1 ? 's' : ''} Selected`
                                    : 'Select Source'}
                                </span>
                                <FiChevronDown size={15} />
                              </button>
                              {showConnectionMessage && (
                               <div className="text-sm font-semibold ml-2 flex items-center gap-1 text-[#34d399]">
 <FiCheck size={18} /> {/* Using the FiCheck icon */}
 <span className="hidden md:inline">Dataset connected</span>
</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200/70 bg-gray-50/80 text-[#64748b] hover:bg-gray-100 transition-all duration-300 ease-in-out"
                                aria-label="Attach file"
                              >
                                <FiPaperclip size={15} />
                                <span>Upload to knowledge-base</span>
                              </button>
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl border border-gray-200/70 bg-gray-50/80 text-[#64748b] hover:bg-gray-100 transition-all duration-300 ease-in-out"
                                aria-label="Use voice"
                              >
                                <FiMic size={15} />
                                <span>Voice</span>
                              </button>
                              <button
                                onClick={handleSubmit}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-[#64748b] rounded-xl transition-all duration-300 ease-in-out bg-blue-300/80 shadow-sm border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transform hover:scale-102 active:scale-95"
                                disabled={!query.trim() || isSending}
                                aria-label="Send message"
                              >
                                <FiArrowUp size={15} />
                                <span>Send</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {!isChatting && (
                            <motion.div
                              key="bottom-content"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, y: 30 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="mt-8">
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-x-4 gap-y-6">
                                  {aiAgents.map((agent) => (
                                    <AgentIcon
                                      key={agent.name}
                                      icon={agent.icon}
                                      text={agent.name}
                                      bgColor={agent.bgColor}
                                      iconColor={agent.iconColor}
                                    />
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </main>
                ) : currentScreen === 'administration' ? (
                  <AdministrationScreen onBack={() => setCurrentScreen('home')} />
                ) : currentScreen === 'insights' ? (
                  <LeadershipInsights />
                ) : currentScreen === 'dataSourceSetup' ? (
                  <DataSourceSetupScreen onBack={() => setCurrentScreen('home')} />
                ) : (
                  <DesignDiscoverPage onBack={() => setCurrentScreen('home')} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {isUploadModalOpen && currentScreen === 'home' && <UploadModal onClose={() => setIsUploadModalOpen(false)} />}
            {isDomainsModalOpen && currentScreen === 'home' && (
              <DomainsModal
                onClose={() => setIsDomainsModalOpen(false)}
                onDone={handleDomainsSelected}
                selectedDomains={selectedDomains}
              />
            )}
            {isProfileModalOpen && userProfile && (
              <ViewProfileModal user={userProfile} onClose={() => setIsProfileModalOpen(false)} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default HomeAskAIScreen;