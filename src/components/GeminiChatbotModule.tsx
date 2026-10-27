import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  MapPin,
  Bot,
  User as UserIcon,
  RefreshCw,
  ExternalLink,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Building2,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  groundingMetadata?: any;
}

const QUICK_PROMPTS = [
  {
    title: 'Find Paint Suppliers (Maps Grounded)',
    prompt: 'Find major automotive refinish and 2K polyurethane paint suppliers near Workington, Graniteside, and Harare industrial areas. Include addresses and brands.',
    useMaps: true,
  },
  {
    title: 'Orange Peel Rectification',
    prompt: 'A bus panel shows grade 3 orange peel texture after spraying 2K clearcoat. What are the root causes in flash-off time and spray gun pressure, and how do we buff it out?',
    useMaps: false,
  },
  {
    title: 'Steel Tubing Stockists (Maps Grounded)',
    prompt: 'Where can we procure rectangular hollow steel (100x50x3mm) and galvaneal body sheets near Harare or Bulawayo?',
    useMaps: true,
  },
  {
    title: 'WPS Porosity Troubleshooting',
    prompt: 'We are observing code W-01 weld porosity along the chassis outrigger. Give me the shielding gas flow rate and voltage adjustment checklist.',
    useMaps: false,
  },
];

export const GeminiChatbotModule: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Greetings. I am the **AVM Chief Plant Technologist & Factory Assistant**.\n\nI can assist you with:\n- **Paint & Livery Science**: CIELAB Delta E verification, 2K mixing ratios, spray gun pressure, and flash-off timing.\n- **Manufacturing Quality Gates**: Weld inspection (W-01, W-02), diagonal tolerances, and Design Freeze governance.\n- **Google Maps Logistics Grounding**: Finding real automotive paint suppliers, steel fabricators, and delivery transit routes in Harare, Bulawayo, and regional corridors.\n\nHow can I support your bay today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-3.5-flash'
  );
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string, overrideMaps?: boolean) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const mapsActive = overrideMaps !== undefined ? overrideMaps : useMapsGrounding;

    const userMessage: ChatMessage = {
      id: `USR-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, content: m.content })),
          model: mapsActive ? 'gemini-3.5-flash' : selectedModel,
          useMapsGrounding: mapsActive,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `AI-${Date.now()}`,
        role: 'model',
        content: data.text || 'No response returned from the engineering assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save to Firestore if authenticated
      if (user) {
        try {
          await addDoc(collection(db, 'chat_messages'), {
            userId: user.uid,
            role: 'user',
            content: userMessage.content,
            timestamp: new Date().toISOString(),
          });
          await addDoc(collection(db, 'chat_messages'), {
            userId: user.uid,
            role: 'model',
            content: assistantMessage.content,
            timestamp: new Date().toISOString(),
            groundingMetadata: assistantMessage.groundingMetadata || null,
          });
        } catch (e) {
          // ignore offline sync
        }
      }
    } catch (err: any) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ERR-${Date.now()}`,
          role: 'model',
          content: 'Unable to reach Gemini AI Assistant server route. Please verify server connectivity or local network.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[740px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Chat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AVM Engineering & Paint AI Specialist</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                Multi-Turn
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Technical guidance on 2K paint chemistry, weld gates, and Google Maps supplier logistics
            </p>
          </div>
        </div>

        {/* Model & Grounding Controls */}
        <div className="flex items-center gap-2">
          {/* Maps Grounding Toggle */}
          <button
            onClick={() => setUseMapsGrounding(!useMapsGrounding)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              useMapsGrounding
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 shadow-xs'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Enable Google Maps Grounding with gemini-3.5-flash"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Maps Grounding</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                useMapsGrounding ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </button>

          {/* Model Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="gemini-3.5-flash: Balanced reasoning, comprehensive technical answers, and Maps Grounding"
            >
              gemini-3.5-flash
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="gemini-3.1-flash-lite: Low-latency fast shopfloor query responses"
            >
              flash-lite
            </button>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                  : 'bg-slate-800 text-blue-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                <span className="font-semibold font-sans">
                  {msg.role === 'user' ? 'Plant Operator' : 'AVM Senior Technologist'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text with basic markdown spacing */}
              <div className="whitespace-pre-wrap font-sans text-xs space-y-1.5 selection:bg-blue-800">
                {msg.content}
              </div>

              {/* Google Maps Grounding Card if present */}
              {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Google Maps Grounded Locations & Suppliers:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-[11px] text-white block truncate">
                              {web.title || 'Location Reference'}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {web.uri}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>
                {useMapsGrounding
                  ? 'Retrieving Google Maps locations and synthesizing manufacturing guidance with gemini-3.5-flash...'
                  : 'Synthesizing technical response...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Quick Prompts:
        </span>
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt, qp.useMaps)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {qp.useMaps && <MapPin className="w-3 h-3 text-emerald-400" />}
            <span>{qp.title}</span>
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={
              useMapsGrounding
                ? 'Ask about paint formulation, weld quality gates, or search nearby suppliers via Google Maps...'
                : 'Ask technical question about paint formulations, bus jigs, or defect resolution...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 resize-none font-sans"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold transition-colors cursor-pointer shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
