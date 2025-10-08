import React from 'react';
import { motion } from 'framer-motion';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- ADDED FOR LOADING BAR ANIMATION ---
const loadingBarStyle = `
  @keyframes indeterminate-progress {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }
  .animate-indeterminate-progress {
    animation: indeterminate-progress 0.5s infinite ease-in-out;
  }
`;

// Type definitions
export interface AIMessageData {
  thinkingSteps?: string;
  answer?: string;
  error?: string;
  domains_searched?: string[];
  sources?: any[];
  steps?: any[];
  dashboardUrl?: string;
  thread_id?: string;
}

export interface Message {
  type: 'user' | 'ai';
  content: string | AIMessageData;
}

// UserMessage component
const UserMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-end">
    <div className="rounded-lg rounded-br-none py-3 px-4 max-w-lg shadow-md bg-[#4A7FA7] text-[#F6FAFD] font-figtree">
      {text}
    </div>
  </div>
);

// AIMessage component - MODIFIED TO EXTRACT IFRAME URL
const AIMessage: React.FC<{ data: AIMessageData; isStreaming?: boolean }> = ({ data, isStreaming = false }) => {
  const [isIframeLoading, setIsIframeLoading] = React.useState(true);

  // --- START: MODIFICATION FOR DASHBOARD URL EXTRACTION ---
  // Create a mutable copy to process and extract the dashboard URL
  const processedData = { ...data };
  // UPDATED REGEX: Matches both "View Interactive Dashboard" and "Click here to view your interactive dashboard"
  const dashboardUrlRegex = /\[(?:View Interactive Dashboard|Click here to view your interactive dashboard)\]\(([^)]+)\)/;


  if (processedData.answer && typeof processedData.answer === 'string') {
    const match = processedData.answer.match(dashboardUrlRegex);

    if (match && match[1]) {
      // 1. Extract the URL and assign it to the dashboardUrl property
      processedData.dashboardUrl = match[1];

      // 2. Remove the markdown link line from the answer to prevent displaying it twice
      processedData.answer = processedData.answer.replace(match[0], '').trim();
    }
  }
  // --- END: MODIFICATION FOR DASHBOARD URL EXTRACTION ---

  const handleDownload = () => {
    if (!processedData.answer) return;
    const blob = new Blob([processedData.answer], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-response.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (processedData.error) {
    return (
      <div className="flex justify-start">
        <div className="rounded-lg rounded-bl-none py-3 px-4 max-w-lg shadow-md bg-red-100 text-red-800 border border-red-200 font-figtree">
          <p className="font-medium">Error:</p>
          <p>{processedData.error}</p>
        </div>
      </div>
    );
  }

  const markdownComponents = {
    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-3 text-[#0A1931]" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 pl-2" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 pl-2" {...props} />,
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold text-[#0A1931]" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="bg-[#B3CFE5]/50 text-[#0A1931] rounded px-1.5 py-1 text-sm font-figtree" {...props} />
      ) : (
        <pre className="bg-[#F6FAFD] p-3 rounded-md overflow-x-auto text-sm" {...props} />
      ),
    table: ({ node, ...props }) => (
      <div className="my-4 overflow-hidden rounded-lg border border-[#B3CFE5]/50">
        <table className="min-w-full text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-[#F6FAFD]" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-[#B3CFE5]/50 bg-white" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-[#F6FAFD]/70" {...props} />,
    th: ({ node, ...props }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1A3D63]" {...props} />
    ),
    td: ({ node, ...props }) => <td className="px-4 py-3 align-middle text-[#1A3D63]" {...props} />,
  };

  return (
    <div className="flex justify-start">
      <div className="relative max-w-5xl w-full space-y-4 text-[#1A3D63] font-figtree">
        {processedData.answer ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {processedData.answer}
            </ReactMarkdown>
          </div>
        ) : (
          <div>
            <p className="font-mono text-sm text-[#4A7FA7] truncate">
              {processedData.thinkingSteps || 'Thinking...'}
            </p>
          </div>
        )}

        {processedData.dashboardUrl && (
          <div className="relative rounded-lg overflow-hidden h-[500px] mt-4 border border-gray-200">
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#4A7FA7]">
                <AutorenewIcon className="animate-spin mr-2" />
                Loading interactive dashboard...
              </div>
            )}
            <iframe
              src={processedData.dashboardUrl}
              title="Embedded Interactive Dashboard"
              className={`w-full h-full border-0 transition-opacity duration-300 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allow="fullscreen"
              onLoad={() => setIsIframeLoading(false)}
            />
          </div>
        )}

        {(processedData.answer || processedData.dashboardUrl) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {processedData.dashboardUrl && (
                <a
                  href={processedData.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold py-2 px-3 rounded-lg text-xs transition-colors bg-[#B3CFE5] text-[#0A1931] hover:bg-[#4A7FA7] hover:text-[#F6FAFD]"
                >
                  <BarChartIcon sx={{ fontSize: 16 }} />
                  Open Dashboard in New Tab
                </a>
              )}
              {processedData.answer && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 font-semibold py-2 px-3 rounded-lg text-xs transition-colors bg-white text-[#4A7FA7] border border-[#B3CFE5] hover:bg-[#F6FAFD]"
                >
                  <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                  Download Response
                </button>
              )}
            </div>
        )}

        {processedData.domains_searched && processedData.domains_searched.length > 0 && (
          <div className="pt-2">
            <h4 className="font-semibold text-sm text-[#1A3D63]">Domains Searched:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {processedData.domains_searched.map((domain) => (
                <span key={domain} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#B3CFE5]/50 text-[#1A3D63]">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}
        {processedData.sources && processedData.sources.length > 0 && (
          <div className="pt-2">
            <h4 className="font-semibold text-sm text-[#1A3D63]">Sources:</h4>
            <div className="space-y-2 mt-1">
              {processedData.sources.map((source, index) => (
                <div key={index} className="p-2 rounded-md text-xs bg-[#F6FAFD] text-[#1A3D63]">
                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(source, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {!processedData.answer && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#B3CFE5]/30">
                <style>{loadingBarStyle}</style>
                <div className="h-full w-1/3 bg-[#4A7FA7] animate-indeterminate-progress"></div>
            </div>
        )}
      </div>
    </div>
  );
};

// ChatScreen component
interface ChatScreenProps {
  messages: Message[];
  isSending: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ messages, isSending }) => {
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      key="chat-view"
      className="h-full relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full overflow-y-auto space-y-6 pr-2">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.type === 'user' ? (
              <UserMessage text={msg.content as string} />
            ) : (
              <AIMessage
                data={typeof msg.content === 'string' ? { answer: msg.content } : msg.content as AIMessageData}
                isStreaming={isSending && index === messages.length - 1}
              />
            )}
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </motion.div>
  );
};