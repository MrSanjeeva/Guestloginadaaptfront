import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, RefreshCw, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

// UserMessage component with modern glassmorphism
const UserMessage: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-end">
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0, x: 50 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" },
        default: { duration: 0.3, ease: "easeOut" }
      }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-200" />
      <div className="relative rounded-2xl rounded-br-md py-3 px-5 max-w-lg shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-medium">
        {text}
      </div>
    </motion.div>
  </div>
);

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="flex gap-1.5 items-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{
          y: [0, -8, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.15
        }}
      />
    ))}
  </div>
);

// AIMessage component with modern design
// AIMessage component with modern design
const AIMessage: React.FC<{ data: AIMessageData; isStreaming?: boolean }> = ({ data, isStreaming = false }) => {
  const [isIframeLoading, setIsIframeLoading] = React.useState(true);
  
  const processedData = { ...data };
  const dashboardUrlRegex = /\[(?:View Interactive Dashboard|Click here to view your interactive dashboard)\]\(([^)]+)\)/;

  if (processedData.answer && typeof processedData.answer === 'string') {
    const match = processedData.answer.match(dashboardUrlRegex);
    if (match && match[1]) {
      processedData.dashboardUrl = match[1];
      processedData.answer = processedData.answer.replace(match[0], '').trim();
    }
  }

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
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl rounded-bl-md py-4 px-5 max-w-lg shadow-lg bg-red-50 border border-red-200"
        >
          <p className="font-semibold text-red-900 mb-1">Error</p>
          <p className="text-red-700">{processedData.error}</p>
        </motion.div>
      </div>
    );
  }

  const markdownComponents = {
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-3 mt-6 text-gray-900 first:mt-0" {...props} />,
    // 👇 **CHANGED LINES**
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 pl-5 my-4" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 pl-5 my-4" {...props} />,
    // 👆 **CHANGED LINES**
    li: ({ node, ...props }) => <li className="mb-1 text-gray-700" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="bg-gray-100 text-gray-800 rounded-md px-2 py-0.5 text-sm font-mono" {...props} />
      ) : (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm my-4 font-mono" {...props} />
      ),
    table: ({ node, ...props }) => (
      <div className="my-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 bg-white" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
    th: ({ node, ...props }) => (
      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700" {...props} />
    ),
    td: ({ node, ...props }) => <td className="px-6 py-4 align-middle text-gray-700" {...props} />,
  };

  return (
    <div className="flex justify-start">
      <motion.div
        layout
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          layout: { duration: 0.3, ease: "easeInOut" },
          default: { duration: 0.3 }
        }}
        className="relative max-w-5xl w-full"
      >
        <div className="rounded-2xl rounded-bl-md py-4 px-5 shadow-lg bg-white border border-gray-200 space-y-4">
          {processedData.answer ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {processedData.answer}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-600">
              <TypingIndicator />
              <span className="text-sm font-medium">
                {processedData.thinkingSteps || 'Thinking...'}
              </span>
            </div>
          )}

          {processedData.dashboardUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-xl overflow-hidden h-[500px] border border-gray-200 shadow-inner bg-gray-50"
            >
              <AnimatePresence>
                {isIframeLoading && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white z-10"
                  >
                    <div className="flex items-center gap-3 text-blue-600">
                      <RefreshCw className="animate-spin" size={20} />
                      <span className="text-sm font-medium">Loading dashboard...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <iframe
                src={processedData.dashboardUrl}
                title="Interactive Dashboard"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allow="fullscreen"
                onLoad={() => setIsIframeLoading(false)}
              />
            </motion.div>
          )}

          {(processedData.answer || processedData.dashboardUrl) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {processedData.dashboardUrl && (
                <a
                  href={processedData.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex border border-gray-200 items-center gap-2 font-semibold py-2.5 px-4 rounded-3xl text-sm transition-all bg-gradient-to-r from-blue-700 to-indigo-800 text-black hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <BarChart size={16} />
                  Open Dashboard
                </a>
              )}
              {processedData.answer && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 font-semibold py-2.5 px-4 rounded-3xl text-sm transition-all border border-gray-200 text-black hover:bg-gray-200 hover:shadow-md active:scale-95"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
          )}

          {processedData.domains_searched && processedData.domains_searched.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                Sources Searched
              </h4>
              <div className="flex flex-wrap gap-2">
                {processedData.domains_searched.map((domain) => (
                  <span
                    key={domain}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!processedData.answer && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-2xl overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{ width: '33%' }}
              />
            </div>
          )}
        </div>
      </motion.div>
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
      className="h-full relative bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="h-full overflow-y-auto space-y-6 px-4 py-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                layout: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.3 },
                y: { duration: 0.3 }
              }}
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
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </motion.div>
  );
};