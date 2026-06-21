import React, { useState, useRef } from 'react';
import { Sparkles, Send, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  action?: any;
}

const QUICK_PROMPTS = [
  'Summarize my reconciliations',
  'Which reconciliation has the most anomalies?',
  'What are the common anomaly patterns?',
  'How can I improve my match rate?',
];

// ── Markdown renderer styled to match the app theme ──────────────
const markdownComponents = {
  p: ({ children }: any) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: any) => (
    <ul className="mb-2 last:mb-0 pl-4 space-y-1 list-disc marker:text-ai-500">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="mb-2 last:mb-0 pl-4 space-y-1 list-decimal marker:text-ai-500 marker:font-semibold">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="pl-1">{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-surface-900">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-surface-700">{children}</em>
  ),
  code: ({ children }: any) => (
    <code className="px-1.5 py-0.5 rounded bg-surface-100 text-ai-700 text-[13px] font-mono">{children}</code>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-base font-bold text-surface-900 mt-3 mb-1.5 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-[15px] font-bold text-surface-900 mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-bold text-surface-800 mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  hr: () => <hr className="my-3 border-surface-200" />,
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 underline underline-offset-2">
      {children}
    </a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-surface-200">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-surface-50">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left font-semibold text-surface-600 border-b border-surface-200">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-surface-700 border-b border-surface-100">{children}</td>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-ai-300 pl-3 my-2 text-surface-500 italic">{children}</blockquote>
  ),
};

const AICopilotPage: React.FC = () => {
  const { activeOrgId } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: "Hello! I'm your Refinely AI Copilot, powered by Llama 3.1 via Groq. I can help you:\n\n• Understand reconciliation results\n• Analyze anomaly patterns across all sessions\n• Suggest resolution strategies\n• Explain unusual transaction patterns\n\nSelect a reconciliation context or ask me anything!",
    },
  ]);
  const [selectedReconId, setSelectedReconId] = useState<number | null>(null);

  const { data: reconciliations = [] } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

  const sendMessage = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setAiLoading(true);

    try {
      if (!selectedReconId && reconciliations.length > 0) {
        const latestId = reconciliations[reconciliations.length - 1].id;
        setSelectedReconId(latestId);
        const res = await reconciliationService.copilotChat({ reconciliation_id: latestId, message: msg });
        setMessages((prev) => [...prev, { role: 'ai', text: res.message, action: res.suggested_action }]);
      } else if (selectedReconId) {
        const res = await reconciliationService.copilotChat({ reconciliation_id: selectedReconId, message: msg });
        setMessages((prev) => [...prev, { role: 'ai', text: res.message, action: res.suggested_action }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: "Please create a reconciliation first to get contextual AI analysis." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'I encountered an error. Please try again.' }]);
    } finally {
      setAiLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">
      <div className="flex-shrink-0">
        <PageHeader
          title="AI Copilot"
          subtitle="Powered by Llama 3.1 via Groq"
        />
      </div>

      <div className="flex-1 flex gap-5 p-8 min-h-0 overflow-hidden">
        {/* Main Chat */}
        <div className="flex-1 card flex flex-col overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ai-500 to-[#6366F1] flex items-center justify-center shadow-md">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-surface-800">AI Copilot</p>
                <p className="text-xs text-surface-400">Llama 3.1 · 8B · Groq</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {reconciliations.length > 0 && (
                <select
                  value={selectedReconId ?? ''}
                  onChange={(e) => setSelectedReconId(Number(e.target.value) || null)}
                  className="h-8 px-3 rounded-md border border-surface-200 text-xs text-surface-700 bg-white focus:outline-none focus:border-ai-500 transition-all"
                >
                  <option value="">Latest reconciliation</option>
                  {reconciliations.map((r) => (
                    <option key={r.id} value={r.id}>Reconciliation #{r.id}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setMessages([{
                  role: 'ai',
                  text: "Hello! How can I help you with your reconciliations today?",
                }])}
                className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 transition-colors"
              >
                <RefreshCcw size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Messages — only this area scrolls */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className="max-w-[72%] space-y-2">
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ai-500 to-[#6366F1] flex items-center justify-center mb-1">
                      <Sparkles size={13} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white rounded-[16px_16px_4px_16px] whitespace-pre-wrap'
                        : 'bg-white border border-surface-200 text-surface-700 rounded-[16px_16px_16px_4px] border-l-[3px] border-l-ai-500 shadow-xs',
                    )}
                  >
                    {msg.role === 'ai' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.action && (
                    <div className="bg-ai-50 border border-ai-200 rounded-lg p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles size={13} className="text-ai-600" />
                        <span className="text-xs font-bold text-ai-700">Suggested Action</span>
                      </div>
                      <div className="space-y-1.5 text-sm text-surface-700 mb-3">
                        <p><span className="font-medium text-surface-600">Action:</span> {msg.action.action?.replace(/_/g, ' ')}</p>
                        {msg.action.amount && <p><span className="font-medium text-surface-600">Amount:</span> PKR {Number(msg.action.amount).toLocaleString()}</p>}
                        {msg.action.description && <p><span className="font-medium text-surface-600">Note:</span> {msg.action.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors">
                          Apply Action
                        </button>
                        <button className="px-3 py-1.5 border border-surface-200 text-surface-600 text-xs font-medium rounded-md hover:bg-surface-50 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ai-500 to-[#6366F1] flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="flex gap-1.5 px-4 py-3 bg-white border border-surface-200 rounded-[16px_16px_16px_4px]">
                  {[0,1,2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-ai-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts — always visible, never scrolls away */}
          <div className="px-6 pt-3 pb-1 border-t border-surface-100 flex gap-2 flex-wrap flex-shrink-0">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setChatInput(p); }}
                className="text-xs px-3 py-1.5 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-ai-300 hover:text-ai-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input — always visible, never scrolls away */}
          <div className="p-4 pt-3 flex items-end gap-2 flex-shrink-0">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about your reconciliations..."
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-sm resize-none focus:outline-none focus:border-ai-500 focus:ring-2 focus:ring-ai-500/20 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim() || aiLoading}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-ai-500 to-[#6366F1] hover:from-ai-600 hover:to-[#4F46E5] disabled:opacity-40 text-white rounded-xl transition-all shadow-md flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="px-6 pb-3 text-[11px] text-surface-400 flex-shrink-0">
            AI may make mistakes. Always verify before applying actions.
          </p>
        </div>

        {/* Context Sidebar */}
        <div className="w-72 space-y-4 overflow-y-auto">
          <div className="card p-5">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-surface-400 mb-4">Recent Reconciliations</p>
            {reconciliations.length === 0 ? (
              <p className="text-sm text-surface-400">No reconciliations yet.</p>
            ) : (
              <div className="space-y-2">
                {reconciliations.slice(-5).reverse().map((r) => {
                  const rate = r.total_bank_transactions > 0
                    ? Math.round((r.matched_count / r.total_bank_transactions) * 100)
                    : 0;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReconId(r.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        selectedReconId === r.id ? 'border-ai-400 bg-ai-50' : 'border-surface-200 hover:bg-surface-50',
                      )}
                    >
                      <p className="text-xs font-semibold text-surface-700">#{r.id}</p>
                      <p className="text-xs text-surface-400">Match rate: {rate}%</p>
                      {r.anomaly_count > 0 && (
                        <p className="text-xs text-danger-500 font-medium">{r.anomaly_count} anomalies</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-surface-400 mb-3">Tips</p>
            <ul className="space-y-2 text-xs text-surface-600">
              <li className="flex gap-2"><span className="text-ai-500">•</span>Ask about specific anomaly types to get tailored advice</li>
              <li className="flex gap-2"><span className="text-ai-500">•</span>Select a specific reconciliation for context-aware answers</li>
              <li className="flex gap-2"><span className="text-ai-500">•</span>AI suggestions are advisory — always review before applying</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopilotPage;  