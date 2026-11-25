import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  RefreshCw,
  MessageSquarePlus,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useData, api, endpoints, rows } from '../services/api';

const suggestedPrompts = [
  'What daily nutrition keeps a puppy healthy?',
  'How often should my cat get vaccinated?',
  'Safe grooming tips for golden retrievers',
];

export function Chat() {
  const [provider, setProvider] = useState('openrouter');
  const [model, setModel] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [petId, setPetId] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const pets = useData('/pets');

  const models = useData(endpoints.models + '?provider=' + provider + '&useCase=pet_health_chat');
  const petList = rows(pets.data, 'pets');
  const modelList = rows(models.data, 'models');
  const readyModels = modelList.filter(item => item.providerConfigured);
  const selectedPet = petList.find(item => item._id === petId);
  const selectedModel = readyModels.find(item => item._id === model);
  const historyRef = useRef(null);

  useEffect(() => {
    if (!pets.loading && !petList.some(item => item._id === petId)) setPetId(petList[0]?._id || '');
  }, [pets.data, pets.loading, petId]);
  useEffect(() => {
    if (!models.loading && !readyModels.some(item => item._id === model)) setModel(readyModels[0]?._id || '');
  }, [models.data, models.loading, model]);
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [messages, busy]);

  const blockedReason = pets.loading || models.loading ? 'Loading pets and models...'
    : pets.error ? 'Could not load pets. Please retry.'
    : !selectedPet ? 'Add a pet in My Pets to start personalized AI chat.'
    : models.error ? 'Could not load models. Please retry.'
    : !selectedModel ? 'No configured model is available for this provider.' : '';

  async function send(e) {
    e.preventDefault();
    if (busy) return;
    if (blockedReason) { setError(blockedReason); return; }
    if (!input.trim()) { setError('Type a question first.'); return; }
    const text = input.trim();
    setBusy(true);
    setError('');
    try {
      const d = await api(endpoints.chat, 'POST', {
        provider,
        selectionId: model,
        petId,
        conversationId,
        message: text,
      });
      const reply = d.response?.content;
      if (typeof reply !== 'string') throw Error('Unsupported response format');
      setConversationId(d.conversationId);
      setInput('');
      setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: [d.response.emergencyNotice, reply, d.response.disclaimer].filter(Boolean).join('\n\n') }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEAD1] text-[#E66B00]">
            <Bot size={21} />
          </span>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#22262E]">
              VioletVet AI Assistant
              <Sparkles size={18} className="text-[#FF8C1A]" />
            </h1>
            <p className="text-xs text-[#5C6470]">
              Ask everyday questions about pet care, nutrition, and wellness.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#F3E5D3] bg-white p-5 shadow-xs">
        {/* Controls Bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <select disabled={busy || pets.loading} aria-label="Pet" value={petId} onChange={e => { setPetId(e.target.value); setMessages([]); setConversationId(null); setError(''); }}>
            <option value="">Select your pet</option>
            {rows(pets.data, 'pets').map(p => <option key={p._id} value={p._id}>{p.petName}</option>)}
          </select>
          <select
            aria-label="AI provider"
            disabled={busy}
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setModel('');
              setConversationId(null);
              setMessages([]);
            }}
            className="rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3 py-2 text-xs font-semibold text-[#2D3138] sm:text-sm"
          >
            <option value="openrouter">OpenRouter</option>
            <option value="nvidia">NVIDIA</option>
          </select>

          <select
            aria-label="AI model"
            disabled={busy || models.loading}
            value={model}
            onChange={(e) => { setModel(e.target.value); setConversationId(null); setMessages([]); }}
            className="min-w-[180px] flex-1 rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-3 py-2 text-xs font-semibold text-[#2D3138] sm:text-sm"
          >
            <option value="">{models.loading ? 'Loading models...' : 'Select model'}</option>
            {rows(models.data, 'models').map((m) => (
              <option key={m._id} value={m._id} disabled={!m.providerConfigured}>
                {m.displayName}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={busy || pets.loading || models.loading}
            onClick={() => { models.load(); pets.load(); setError(''); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF8C1A] px-3.5 py-2 text-xs font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            type="button"
            disabled={busy}
            className="secondary inline-flex items-center gap-1.5 rounded-xl bg-[#FFEAD1] px-3.5 py-2 text-xs font-semibold text-[#C25900] hover:bg-[#FFD8AA]"
            onClick={() => { setMessages([]); setConversationId(null); }}
          >
            <MessageSquarePlus size={14} /> New chat
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#F7DFC0] bg-[#FFF4E5] px-3.5 py-2.5 text-xs text-[#7A4B12]">
          <ShieldAlert size={15} className="shrink-0 text-[#E66B00]" />
          <span>
            General pet care information only. For urgent symptoms, contact a
            veterinarian immediately.
          </span>
        </div>

        {(error || models.error || pets.error) && (
          <p role="alert" className="error mb-3">{error || models.error || pets.error}</p>
        )}
        {blockedReason && <div role="status" className="mb-3 rounded-xl bg-orange-50 p-3 text-sm text-orange-900">{blockedReason} {!pets.loading && !pets.error && !petList.length && <Link className="font-semibold underline" to="/app/pets">Add your pet</Link>}</div>}
        {!blockedReason && <p className="mb-3 text-xs text-[#5C6470]">Chatting about {selectedPet.petName} using {selectedModel.displayName}.</p>}

        {/* Chat History */}
        <div ref={historyRef} className="chat mb-4" aria-live="polite">
          {!messages.length && (
            <div className="my-auto py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFEAD1] text-[#E66B00]">
                <Bot size={24} />
              </div>
              <p className="mt-3 text-sm font-bold text-[#22262E]">
                Ask a pet care question
              </p>
              <p className="mt-1 text-xs text-[#5C6470]">
                Select your pet and model above, then try one of these topics:
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-[#F3E5D3] bg-[#FFF8EE] px-3.5 py-1.5 text-xs font-medium text-[#7A4B12] hover:border-[#FF8C1A] hover:bg-[#FFEAD1]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}

          {busy && (
            <div className="bubble w-fit animate-pulse text-xs font-medium text-[#7A4B12]">
              Thinking…
            </div>
          )}
        </div>

        {/* Message Input */}
        <form className="flex flex-wrap gap-2.5" onSubmit={send}>
          <input
            value={input}
            aria-label="Your pet health question"
            maxLength={4000}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about pet care, nutrition, grooming…"
            className="flex-1 rounded-xl border border-[#EBD8C3] bg-[#FFFBF5] px-4 py-2.5 text-sm text-[#2D3138]"
          />
          <button
            type="submit"
            disabled={busy || Boolean(blockedReason) || !input.trim()}
            title={blockedReason || 'Send message'}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF8C1A] px-5 py-2.5 text-sm font-semibold text-[#2E1E0F] hover:bg-[#FFA242]"
          >
            <Send size={15} />
            {busy ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChatMessage({ message }) {
  return <div className={'bubble whitespace-pre-wrap break-words ' + message.role}>{message.content}</div>;
}
