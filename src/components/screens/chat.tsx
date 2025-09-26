import React from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReactMarkdown from 'react-markdown';

// Type definitions
export interface AIMessageData {
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

// UserMessage component - Themed
const UserMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-end">
    <div className="rounded-lg rounded-br-none py-3 px-4 max-w-lg shadow-md bg-[#4A7FA7] text-[#F6FAFD]">
      {text}
    </div>
  </div>
);

// AIMessage component with typing animation - Themed
const AIMessage: React.FC<{ data: AIMessageData; isStreaming?: boolean }> = ({ data, isStreaming = false }) => {
  const [isIframeLoading, setIsIframeLoading] = React.useState(true);

  // Handler for the download button
  const handleDownload = () => {
    if (!data.answer) return;
    const blob = new Blob([data.answer], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-response.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (data.error) {
    return (
      <div className="flex justify-start">
        <div className="rounded-lg rounded-bl-none py-3 px-4 max-w-lg shadow-md bg-red-100 text-red-800 border border-red-200">
          <p className="font-medium">Error:</p>
          <p>{data.error}</p>
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
        <code className="bg-[#B3CFE5]/50 text-[#0A1931] rounded px-1.5 py-1 text-sm font-mono" {...props} />
      ) : (
        <pre className="bg-[#F6FAFD] p-3 rounded-md overflow-x-auto text-sm border border-[#B3CFE5]" {...props} />
      ),
  };

  return (
    <div className="flex justify-start">
      <div className="border border-[#B3CFE5] rounded-lg rounded-bl-none p-4 max-w-5xl w-full space-y-4 shadow-md bg-white text-[#1A3D63]">
        {data.answer &&
          (isStreaming ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <TypeAnimation
                sequence={[data.answer]}
                wrapper="div"
                speed={50}
                style={{ fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}
                cursor={true}
              />
            </motion.div>
          ) : (
            <ReactMarkdown components={markdownComponents}>{data.answer}</ReactMarkdown>
          ))}

        {data.dashboardUrl && (
          <div className="relative border border-[#B3CFE5] rounded-lg overflow-hidden bg-white h-[500px] mt-4">
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#4A7FA7]">
                <AutorenewIcon className="animate-spin mr-2" />
                Loading interactive dashboard...
              </div>
            )}
            <iframe
              src={data.dashboardUrl}
              title="Embedded Interactive Dashboard"
              className={`w-full h-full border-0 transition-opacity duration-300 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allow="fullscreen"
              onLoad={() => setIsIframeLoading(false)}
            />
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[#B3CFE5]/50 pt-3">
          {data.dashboardUrl && (
            <a
              href={data.dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold py-2 px-3 rounded-lg text-xs transition-colors bg-[#B3CFE5] text-[#0A1931] hover:bg-[#4A7FA7] hover:text-[#F6FAFD]"
            >
              <BarChartIcon sx={{ fontSize: 16 }} />
              Open Dashboard in New Tab
            </a>
          )}
          {data.answer && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 font-semibold py-2 px-3 rounded-lg text-xs transition-colors bg-white text-[#4A7FA7] border border-[#B3CFE5] hover:bg-[#F6FAFD]"
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
              Download Response
            </button>
          )}
        </div>

        {data.domains_searched && data.domains_searched.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-[#1A3D63]">Domains Searched:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.domains_searched.map((domain) => (
                <span key={domain} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#B3CFE5]/50 text-[#1A3D63]">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.sources && data.sources.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-[#1A3D63]">Sources:</h4>
            <div className="space-y-2 mt-1">
              {data.sources.map((source, index) => (
                <div key={index} className="border p-2 rounded-md text-xs bg-[#F6FAFD] text-[#1A3D63] border-[#B3CFE5]">
                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(source, null, 2)}</pre>
                </div>
              ))}
            </div>
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