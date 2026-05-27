"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ShopChatbotProps {
  shopId: string;
  businessName: string;
  fullPage?: boolean;
  suggestedPrompts?: string[];
}

export function ShopChatbot({
  shopId,
  businessName,
  fullPage = false,
  suggestedPrompts = [],
}: ShopChatbotProps) {
  const [open, setOpen] = useState(fullPage);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm the AI assistant for ${businessName}. Ask me about products, delivery, or payment.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const payload = sessionId
        ? { shopId, message: trimmed, sessionId }
        : { shopId, message: trimmed };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.sessionId) setSessionId(data.sessionId);
        setMessages((current) => [
          ...current,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: "Sorry, I couldn't respond. Try again." },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submitCurrentInput() {
    void sendMessage(input);
  }

  const chatShell = (
    <div className="flex h-full min-h-[640px] flex-col">
      <div className="border-b border-slate-200/80 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              AI Sales Chat
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {businessName}
            </h2>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Online
          </div>
        </div>

        {suggestedPrompts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_rgba(248,250,252,0.88)_0%,_rgba(255,255,255,0.94)_100%)] px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-[28px] px-5 py-4 text-sm leading-7 shadow-sm sm:max-w-[80%] ${
                  message.role === "user"
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-[28px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitCurrentInput();
              }
            }}
            placeholder="Message the shop assistant..."
            rows={1}
            className="max-h-40 min-h-[28px] flex-1 resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={submitCurrentInput}
            disabled={loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return chatShell;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-800"
        aria-label="Open chat"
      >
        {open ? "X" : "Chat"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 h-[620px] w-[380px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          {chatShell}
        </div>
      )}
    </>
  );
}
