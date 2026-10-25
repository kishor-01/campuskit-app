// src/components/roadmap/NodeTutor.tsx
// AI Co-Pilot chat component — native streaming via fetch + ReadableStream
// (ai v6 removed useChat; this implementation works with toTextStreamResponse)
'use client';

import React, { useRef, useEffect, useState, useCallback, useReducer } from 'react';
import { Bot, Send, Loader2, User, AlertCircle, RotateCcw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  input: string;
};

type ChatAction =
  | { type: 'SET_INPUT'; value: string }
  | { type: 'ADD_USER_MSG'; message: ChatMessage }
  | { type: 'START_ASSISTANT_MSG'; id: string }
  | { type: 'APPEND_ASSISTANT_CHUNK'; id: string; chunk: string }
  | { type: 'FINISH_LOADING' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.value };
    case 'ADD_USER_MSG':
      return {
        ...state,
        messages: [...state.messages, action.message],
        isLoading: true,
        error: null,
        input: '',
      };
    case 'START_ASSISTANT_MSG':
      return {
        ...state,
        messages: [...state.messages, { id: action.id, role: 'assistant', content: '' }],
      };
    case 'APPEND_ASSISTANT_CHUNK':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, content: m.content + action.chunk } : m
        ),
      };
    case 'FINISH_LOADING':
      return { ...state, isLoading: false };
    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.error };
    case 'RESET':
      return { messages: [], isLoading: false, error: null, input: '' };
    default:
      return state;
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NodeTutorProps {
  nodeId: string;
  nodeTitle: string;
  briefing: string;
  seniorInsight?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NodeTutor({ nodeId, nodeTitle, briefing, seniorInsight }: NodeTutorProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isLoading: false,
    error: null,
    input: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset when node changes
  useEffect(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: 'RESET' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = state.input.trim();
    if (!trimmed || state.isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    dispatch({ type: 'ADD_USER_MSG', message: userMsg });

    const assistantId = `a-${Date.now()}`;
    const historyForApi = [...state.messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/ai/node-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: historyForApi,
          nodeTitle,
          briefing,
          seniorInsight,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
        dispatch({ type: 'SET_ERROR', error: errData.error || `HTTP ${res.status}` });
        return;
      }

      if (!res.body) {
        dispatch({ type: 'SET_ERROR', error: 'No response stream from server.' });
        return;
      }

      dispatch({ type: 'START_ASSISTANT_MSG', id: assistantId });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          dispatch({ type: 'APPEND_ASSISTANT_CHUNK', id: assistantId, chunk });
        }
      }

      dispatch({ type: 'FINISH_LOADING' });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Unexpected error';
      dispatch({ type: 'SET_ERROR', error: msg });
    }
  }, [state.input, state.messages, state.isLoading, nodeTitle, briefing, seniorInsight]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const hasMessages = state.messages.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.15em]">
            AI Co-Pilot
          </p>
          <p className="text-[9px] text-slate-500 leading-none">
            Ask anything about {nodeTitle}
          </p>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={() => {
              abortControllerRef.current?.abort();
              dispatch({ type: 'RESET' });
            }}
            className="ml-auto flex items-center gap-1 text-[9px] font-semibold text-slate-600 hover:text-slate-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/60"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* ── Message Thread ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[340px] flex flex-col gap-3 pr-1">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-violet-400/60" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Your Staff Engineer is ready
            </p>
            <p className="text-[10px] text-slate-600 max-w-[200px] leading-relaxed">
              Ask questions, get unstuck, or request a deeper explanation of any concept in this node.
            </p>
          </div>
        )}

        {state.messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  isUser
                    ? 'bg-indigo-500/15 border-indigo-500/25'
                    : 'bg-violet-500/15 border-violet-500/25'
                }`}
              >
                {isUser ? (
                  <User className="w-3 h-3 text-indigo-400" />
                ) : (
                  <Bot className="w-3 h-3 text-violet-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/20 border border-indigo-500/25 text-indigo-100 rounded-tr-sm'
                    : 'bg-slate-900/60 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                }`}
              >
                <span className="whitespace-pre-wrap">
                  {message.content}
                  {/* Blinking cursor while streaming this message */}
                  {!isUser && state.isLoading &&
                   message.id === state.messages[state.messages.length - 1]?.id && (
                    <span className="inline-block w-0.5 h-3 bg-violet-400 ml-0.5 animate-pulse align-middle" />
                  )}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading dots — shown before assistant message appears */}
        {state.isLoading && state.messages[state.messages.length - 1]?.role === 'user' && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-500/15 border border-violet-500/25">
              <Bot className="w-3 h-3 text-violet-400" />
            </div>
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Error state */}
        {state.error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/5 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-red-400/80 leading-relaxed">{state.error}</p>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_ERROR', error: '' })}
                className="mt-1 text-[9px] font-bold text-red-400 hover:text-red-300 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-2 flex-shrink-0">
        <textarea
          ref={textareaRef}
          value={state.input}
          onChange={(e) => dispatch({ type: 'SET_INPUT', value: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${nodeTitle}…`}
          rows={2}
          disabled={state.isLoading}
          className="flex-1 resize-none rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-200 placeholder:text-slate-600
            px-3 py-2.5 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
            transition-all duration-200 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={state.isLoading || !state.input.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500
            flex items-center justify-center transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:shadow-[0_0_16px_rgba(139,92,246,0.4)]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label="Send message"
        >
          {state.isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>

      <p className="text-[9px] text-slate-700 flex-shrink-0 text-center">
        Shift+Enter for new line · Enter to send · Scoped to this topic only
      </p>
    </div>
  );
}
