import React, { useState, useRef } from 'react';
import { Sparkles, Send, RefreshCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
        // Use latest reconciliation as context
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
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="AI Copilot"
        subtitle="Powered by Llama 3.1 via Groq"
      />

      <div className="flex-1 flex gap-5 p-8 min-h-0">
        {/* Main Chat */}
        <div className="flex-1 card flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                      'px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-brand-500 text-white rounded-[16px_16px_4px_16px]'
                        : 'bg-white border border-surface-200 text-surface-700 rounded-[16px_16px_16px_4px] border-l-[3px] border-l-ai-500 shadow-xs',
                    )}
                  >
                    {msg.text}
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

          {/* Quick prompts */}
          <div className="px-6 pt-3 border-t border-surface-100 flex gap-2 flex-wrap">
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

          {/* Input */}
          <div className="p-4 flex items-end gap-2">
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
          <p className="px-6 pb-4 text-[11px] text-surface-400">
            AI may make mistakes. Always verify before applying actions.
          </p>
        </div>

        {/* Context Sidebar */}
        <div className="w-72 space-y-4">
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
