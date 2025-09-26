import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Local Component Imports ---
import { LeadershipInsights } from './LeadershipInsights';
import AdministrationScreen from './AdministrationScreen';
import DesignDiscoverPage from './DesignDiscoverPage';
import { AdaaptLogo } from '../AdaabtLogo';
import { ChatScreen, Message, AIMessageData } from './chat';
import UploadModal from './UploadModal';
import DomainsModal from './DomainsModal';

// --- Material-UI Icon Imports ---
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import ForumIcon from '@mui/icons-material/Forum';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import NotesIcon from '@mui/icons-material/Notes';
import AppsIcon from '@mui/icons-material/Apps';
import ChatIcon from '@mui/icons-material/Chat';
import BoltIcon from '@mui/icons-material/Bolt';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

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
  });

  return (
    <li
      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
        active ? 'bg-[#e0f2fe] text-[#1e293b] font-semibold' : 'hover:bg-white text-[#64748b]'
      }`}
      onClick={onClick}
    >
      {iconWithColor}
      <span
        className={`ml-3 text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-0' : 'w-auto'
        } ${active ? 'font-semibold' : 'font-medium'}`}
      >
        {text}
      </span>
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
    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out bg-white/60 border border-gray-200/80 text-[#1e293b] hover:bg-white/90 hover:shadow-lg transform hover:scale-102"
  >
    <BoltIcon sx={{ width: 16, height: 16, color: '#64748b' }} />
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
      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl ${bgColor}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: iconColor, sx: { fontSize: 28 } })}
      {isNew && (
        <span className="absolute top-0 right-0 bg-[#fb7185] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
          NEW
        </span>
      )}
    </div>
    <p className="text-xs font-medium text-[#64748b] group-hover:text-[#1e293b]">{text}</p>
  </div>
);

const aiAgents = [
  { name: 'AI Slides', icon: <SlideshowIcon />, iconColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  { name: 'AI Sheets', icon: <GridOnIcon />, iconColor: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'AI Docs', icon: <DescriptionIcon />, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'AI Developer', icon: <CodeIcon />, iconColor: 'text-sky-600', bgColor: 'bg-sky-100' },
  { name: 'AI Designer', icon: <DesignServicesIcon />, iconColor: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: 'Clip Genius', icon: <ContentCutIcon />, iconColor: 'text-violet-600', bgColor: 'bg-violet-100' },
  { name: 'AI Chat', icon: <ChatBubbleOutlineIcon />, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { name: 'AI Image', icon: <ImageIcon />, iconColor: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: 'AI Video', icon: <VideocamIcon />, iconColor: 'text-rose-600', bgColor: 'bg-rose-100' },
  { name: 'Meeting Notes', icon: <NotesIcon />, iconColor: 'text-teal-600', bgColor: 'bg-teal-100' },
  { name: 'All Agents', icon: <AppsIcon />, iconColor: 'text-gray-600', bgColor: 'bg-gray-200' },
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
  const [currentScreen, setCurrentScreen] = useState<'home' | 'administration' | 'insights' | 'discover'>('home');
  const [showConnectionMessage, setShowConnectionMessage] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState('');
  const [greeting, setGreeting] = useState({
    text: 'Good morning,',
    icon: <WbSunnyOutlinedIcon sx={{ width: 32, height: 32 }} />,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isChatting = messages.length > 0;

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

  const handleStreamEvent = (event: { event: string; data: any }, currentMessageIndex: number | null) => {
    const { event: eventType, data } = event;
    if (currentMessageIndex === null) return;

    switch (eventType) {
      case 'start':
        setStreamStatus(data.message || 'Starting analysis...');
        setIsStreaming(true);
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[currentMessageIndex] = {
            type: 'ai',
            content: { answer: data.message || 'Starting analysis...' } as AIMessageData,
          };
          return updatedMessages;
        });
        break;

      case 'status':
        setStreamStatus(`[${data.step}] ${data.message}`);
        if (data.thread_id && !threadId) setThreadId(data.thread_id);
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const currentContent = updatedMessages[currentMessageIndex].content as AIMessageData;
          updatedMessages[currentMessageIndex] = {
            type: 'ai',
            content: { ...currentContent, answer: `${currentContent.answer || ''}\n[${data.step}] ${data.message}` },
          };
          return updatedMessages;
        });
        break;

      case 'chunk':
        if (data.chunk_type === 'StreamPart' && data.partial_content) {
          setIsStreaming(true);
          setMessages((prev) => {
            const updatedMessages = [...prev];
            const currentContent = updatedMessages[currentMessageIndex].content as AIMessageData;
            updatedMessages[currentMessageIndex] = {
              type: 'ai',
              content: { ...currentContent, answer: `${currentContent.answer || ''}${data.partial_content}` },
            };
            return updatedMessages;
          });
        }
        break;

      case 'final':
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const existingContent = updatedMessages[currentMessageIndex].content as AIMessageData;
          updatedMessages[currentMessageIndex] = {
            type: 'ai',
            content: {
              ...existingContent,
              answer: data.answer,
              steps: data.steps,
              thread_id: data.thread_id,
              dashboardUrl: data.dashboard_url || existingContent.dashboardUrl,
            },
          };
          return updatedMessages;
        });
        setStreamStatus('Analysis complete!');
        setIsStreaming(false);
        break;

      case 'complete':
        setStreamStatus('Ready for next question.');
        setIsStreaming(false);
        setTimeout(() => setStreamStatus(''), 3000);
        break;

      case 'error':
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[currentMessageIndex] = {
            type: 'ai',
            content: { error: data.message || 'An unknown error occurred.' },
          };
          return updatedMessages;
        });
        setStreamStatus(`Error: ${data.message}`);
        setIsStreaming(false);
        break;
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || isSending) return;

    const userMessage: Message = { type: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    setStreamStatus('Initializing stream...');
    const currentQuery = query;
    setQuery('');

    let currentMessageIndex: number | null = null;
    setMessages((prev) => {
      const newMessages = [...prev, { type: 'ai', content: { answer: '' } } as Message];
      currentMessageIndex = newMessages.length - 1;
      return newMessages;
    });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token available.');

      const response = await fetch('http://65.2.61.187:8000/api/v1/agentic/agentic-ask-stream', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          question: currentQuery,
          domain_ids: selectedDomains,
          max_steps: 10,
          create_thread: !threadId,
          ...(threadId && { thread_id: threadId }),
        }),
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
      setStreamStatus('Error: Failed to connect to the server.');
    } finally {
      setIsSending(false);
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    document.body.style.backgroundImage = 'linear-gradient(135deg, #f8fafc 0%, #f0f5ff 50%, #fdf2f8 100%)';
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting({ text: 'Good morning,', icon: <WbSunnyOutlinedIcon sx={{ width: 32, height: 32 }} /> });
    } else if (currentHour < 18) {
      setGreeting({ text: 'Good afternoon,', icon: <WbSunnyOutlinedIcon sx={{ width: 32, height: 32 }} /> });
    } else {
      setGreeting({ text: 'Good evening,', icon: <WbSunnyOutlinedIcon sx={{ width: 32, height: 32 }} /> });
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [query]);

  const screenVariants = {
    initial: { opacity: 0, x: -50, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: 50, scale: 0.98 },
  };

  const screenTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <div className="min-h-screen font-figtree text-[#1e293b] bg-transparent">
      <div className="flex h-screen p-4 gap-4">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-40 p-4 flex flex-col transform ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 bg-[#C3E4E9] rounded-2xl border border-gray-200/80`}
        >
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-8 h-[40px]`}>
            {!isSidebarCollapsed && <AdaaptLogo />}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-gray-200/50"
              >
                <ChevronLeftIcon
                  sx={{
                    transition: 'transform 0.3s ease',
                    transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: '#64748b',
                  }}
                />
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-200/50">
                <CloseIcon sx={{ width: 20, height: 20, color: '#64748b' }} />
              </button>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <nav className="space-y-2">
              <NavItem
                text="Ask AI"
                isCollapsed={isSidebarCollapsed}
                active={currentScreen === 'home'}
                icon={<AutoAwesomeIcon />}
                onClick={() => setCurrentScreen('home')}
              />
              <NavItem
                text="Insights"
                isCollapsed={isSidebarCollapsed}
                active={currentScreen === 'insights'}
                onClick={() => setCurrentScreen('insights')}
                icon={<InsightsIcon />}
              />
              <NavItem
                text="Discover"
                isCollapsed={isSidebarCollapsed}
                active={currentScreen === 'discover'}
                onClick={() => setCurrentScreen('discover')}
                icon={<TravelExploreIcon />}
              />
              <NavItem text="Setup Data Source" isCollapsed={isSidebarCollapsed} icon={<SettingsEthernetIcon />} />
            </nav>
            <div className="mt-auto space-y-2">
              <NavItem text="Start a new chat" isCollapsed={isSidebarCollapsed} onClick={handleNewChat} icon={<ChatIcon />} />
              <NavItem text="Team Chat" isCollapsed={isSidebarCollapsed} icon={<ForumIcon />} />
              <NavItem
                text="Administration"
                isCollapsed={isSidebarCollapsed}
                active={currentScreen === 'administration'}
                icon={<AdminPanelSettingsIcon />}
                onClick={() => setCurrentScreen('administration')}
              />
              <button
                onClick={onLogout}
                className={`w-full mt-4 font-semibold py-2.5 rounded-xl flex items-center transition-all duration-300 ease-in-out text-sm ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-start px-4'
                } bg-white text-[#64748b] hover:bg-gray-100 border border-gray-200`}
              >
                <LogoutIcon sx={{ width: 20, height: 20 }} />
                {!isSidebarCollapsed && <span className="ml-2">Log Out</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#ffffff] border border-gray-200/80 rounded-2xl shadow-lg">
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
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-2 rounded-md hover:bg-slate-200/50 text-[#1e293b]"
                    >
                      <MenuIcon sx={{ width: 24, height: 24 }} />
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
                                <p className="text-lg text-[#64748b]">{greeting.text}</p>
                              </div>
                              <h1 className="text-4xl font-bold font-figtree text-[#1e293b] mt-1">
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
                            <span className="text-sm font-medium text-[#64748b]">Try:</span>
                            <PromptPill text="Relationship between promotions and sales" onClick={setQuery} />
                            <PromptPill text="Top sales promoters by amount" onClick={setQuery} />
                            <PromptPill text="Give me some insights" onClick={setQuery} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* --- MODIFIED ASK BAR --- */}
                      <div
                        className="flex flex-col p-3 gap-3 transition-all duration-300 ease-in-out
                          bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-[20px]
                          shadow-[0_12px_32px_rgba(0,0,0,0.1)]
                          focus-within:ring-4 focus-within:ring-blue-500/20"
                      >
                        <div className="flex items-start w-full">
                          <AutoAwesomeIcon
                            sx={{ color: '#94a3b8', width: 20, height: 20, marginTop: '10px', marginRight: '8px', flexShrink: 0 }}
                          />
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
                            placeholder="What are the best open opportunities by company size?"
                            rows={1}
                            className="w-full pt-2 text-base text-[#1e293b] placeholder:text-[#94a3b8] border-none resize-none overflow-y-hidden focus:ring-0 bg-transparent flex-1"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsDomainsModalOpen(true)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border transition-all duration-300 ease-in-out ${
                                selectedDomains.length > 0
                                  ? 'border-blue-200 bg-blue-50 text-blue-800 font-semibold hover:bg-blue-100'
                                  : 'border-gray-200/70 bg-gray-50/80 text-[#64748b] font-medium hover:bg-gray-100'
                              }`}
                            >
                              <span>
                                {selectedDomains.length > 0
                                  ? `${selectedDomains.length} Source${selectedDomains.length > 1 ? 's' : ''} Selected`
                                  : 'Select Source'}
                              </span>
                              <KeyboardArrowDownIcon sx={{ width: 15, height: 15 }} />
                            </button>
                            {showConnectionMessage && (
                              <div className="text-sm font-medium ml-2 flex items-center gap-1 text-[#34d399]">
                                ✔️ <span className="hidden md:inline">Dataset connected</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setIsUploadModalOpen(true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200/70 bg-gray-50/80 text-[#64748b] hover:bg-gray-100 transition-all duration-300 ease-in-out"
                              aria-label="Attach file"
                            >
                              <AttachFileIcon sx={{ width: 15, height: 15 }} />
                              <span>Attach</span>
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200/70 bg-gray-50/80 text-[#64748b] hover:bg-gray-100 transition-all duration-300 ease-in-out"
                              aria-label="Use voice"
                            >
                              <MicIcon sx={{ width: 15, height: 15 }} />
                              <span>Voice</span>
                            </button>
                            <button
                              onClick={handleSubmit}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-[#64748b] rounded-xl transition-all duration-300 ease-in-out
                                bg-blue-300/80
                                shadow-sm border border-blue-500/20
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                                transform hover:scale-102 active:scale-95"
                              disabled={!query.trim() || isSending}
                              aria-label="Send message"
                            >
                              <ArrowUpwardIcon sx={{ width: 15, height: 15 }} />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* --- END MODIFICATION --- */}

                      {(isSending || streamStatus) && (
                        <div className="text-center text-xs text-[#94a3b8] font-light mt-2 h-4">{streamStatus}</div>
                      )}
                      
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
                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-x-2 gap-y-4">
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
              ) : (
                <DesignDiscoverPage onBack={() => setCurrentScreen('home')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- Modals --- */}
        <AnimatePresence>
          {isUploadModalOpen && currentScreen === 'home' && <UploadModal onClose={() => setIsUploadModalOpen(false)} />}
          {isDomainsModalOpen && currentScreen === 'home' && (
            <DomainsModal
              onClose={() => setIsDomainsModalOpen(false)}
              onDone={handleDomainsSelected}
              selectedDomains={selectedDomains}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomeAskAIScreen;