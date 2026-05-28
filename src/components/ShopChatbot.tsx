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

type Theme = "light" | "dark";
type Language = "en" | "my";

const MYANMAR_COPY = {
  eyebrow: "AI အရောင်း Chat",
  online: "အွန်လိုင်း",
  helper:
    "ပစ္စည်း၊ ပို့ဆောင်မှု၊ ငွေပေးချေမှု၊ စတော့ အကြောင်း မေးနိုင်ပါတယ်။",
  placeholder:
    "ဆိုင် assistant ကို စာပို့ပါ...",
  send: "ပို့မယ်",
  thinking: "စဉ်းစားနေပါတယ်...",
  error:
    "တုံ့ပြန်လို့မရပါဘူး။ ထပ်စမ်းကြည့်ပါ။",
  connectionError:
    "ချိတ်ဆက်မှု ပြဿနာရှိပါတယ်။ ထပ်စမ်းကြည့်ပါ။",
  quickPrompts: "အမြန်မေးခွန်းများ",
  openChat: "Chat ဖွင့်ရန်",
  closeChat: "Chat ပိတ်ရန်",
  theme: "အရောင်",
  language: "ဘာသာ",
};

export function ShopChatbot({
  shopId,
  businessName,
  fullPage = false,
  suggestedPrompts = [],
}: ShopChatbotProps) {
  const [open, setOpen] = useState(fullPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStarted = messages.length > 0;

  const copy =
    language === "en"
      ? {
          eyebrow: "AI Sales Chat",
          online: "Online",
          greeting: `Hi! I'm the AI assistant for ${businessName}.`,
          helper: "Ask me about products, delivery, payment, or stock.",
          placeholder: "Message the shop assistant...",
          send: "Send",
          thinking: "Thinking...",
          error: "Sorry, I couldn't respond. Try again.",
          connectionError: "Connection error. Please try again.",
          quickPrompts: "Quick prompts",
          openChat: "Open chat",
          closeChat: "Close chat",
          theme: "Theme",
          language: "Language",
        }
      : {
          ...MYANMAR_COPY,
          greeting: `${businessName} အတွက် AI အကူအညီပါ။`,
        };

  const themeClasses =
    theme === "dark"
      ? {
          shell: "bg-zinc-950 text-zinc-100",
          border: "border-zinc-800",
          muted: "text-zinc-400",
          strong: "text-zinc-50",
          panel: "bg-zinc-900/92",
          panelSoft: "bg-zinc-900/80",
          chip: "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800",
          assistant: "border border-zinc-800 bg-zinc-900 text-zinc-100",
          user: "bg-white text-zinc-950",
          composer:
            "border-zinc-700 bg-zinc-900/96 shadow-[0_20px_80px_rgba(0,0,0,0.28)]",
          input: "text-zinc-50 placeholder:text-zinc-500",
          send: "bg-white text-zinc-950 hover:bg-zinc-200",
          ghost: "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800",
        }
      : {
          shell: "bg-white text-slate-950",
          border: "border-slate-200",
          muted: "text-slate-500",
          strong: "text-slate-950",
          panel: "bg-white/92",
          panelSoft: "bg-slate-50/90",
          chip:
            "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
          assistant: "border border-slate-200 bg-white text-slate-800",
          user: "bg-slate-950 text-white",
          composer:
            "border-slate-200 bg-white/96 shadow-[0_20px_80px_rgba(15,23,42,0.12)]",
          input: "text-slate-950 placeholder:text-slate-400",
          send: "bg-slate-950 text-white hover:bg-slate-800",
          ghost: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function localizePrompt(prompt: string) {
    if (language === "en") return prompt;

    if (prompt === "What products do you sell?") {
      return "ဘာပစ္စည်းတွေ ရောင်းပါသလဲ?";
    }

    if (prompt === "What are your delivery options?") {
      return "ပို့ဆောင်မှု ရွေးချယ်စရာတွေက ဘာတွေလဲ?";
    }

    if (prompt === "What payment methods do you accept?") {
      return "ဘယ်ငွေပေးချေမှုနည်းလမ်းတွေ လက်ခံပါသလဲ?";
    }

    if (prompt === "Recommend a product for me") {
      return "ကျွန်တော်/ကျွန်မအတွက် ပစ္စည်းတစ်ခု ညွှန်းပေးပါ";
    }

    const productMatch = prompt.match(/^Tell me about (.+)$/);
    if (productMatch?.[1]) {
      return `${productMatch[1]} အကြောင်း ပြောပြပါ`;
    }

    return prompt;
  }

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
          { role: "assistant", content: copy.error },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: copy.connectionError },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submitCurrentInput() {
    void sendMessage(input);
  }

  const promptBar = suggestedPrompts.length > 0 && (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-1">
      <p className={`text-xs font-medium ${themeClasses.muted}`}>
        {copy.quickPrompts}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {suggestedPrompts.map((prompt) => {
          const label = localizePrompt(prompt);

          return (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs transition ${themeClasses.chip}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const composer = (
    <div
      className={`mx-auto flex w-full max-w-3xl items-end gap-3 rounded-[28px] border px-4 py-3 backdrop-blur ${themeClasses.composer}`}
    >
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitCurrentInput();
          }
        }}
        placeholder={copy.placeholder}
        rows={1}
        className={`max-h-40 min-h-[28px] flex-1 resize-none bg-transparent text-sm leading-7 outline-none ${themeClasses.input}`}
      />
      <button
        type="button"
        onClick={submitCurrentInput}
        disabled={loading}
        className={`rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${themeClasses.send}`}
      >
        {copy.send}
      </button>
    </div>
  );

  const chatShell = (
    <div className={`flex h-full min-h-0 flex-col ${themeClasses.shell}`}>
      <div
        className={`shrink-0 border-b px-4 py-4 sm:px-6 ${themeClasses.border}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.24em] ${themeClasses.muted}`}
            >
              {copy.eyebrow}
            </p>
            <h2 className={`mt-2 text-xl font-semibold ${themeClasses.strong}`}>
              {businessName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "my" : "en")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${themeClasses.ghost}`}
              aria-label={copy.language}
            >
              {language === "en" ? "MY" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${themeClasses.ghost}`}
              aria-label={copy.theme}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:block">
              {copy.online}
            </div>
          </div>
        </div>
      </div>

      {!hasStarted ? (
        <div
          className={`flex min-h-0 flex-1 items-center px-4 py-6 sm:px-6 ${themeClasses.panelSoft}`}
        >
          <div className="mx-auto flex w-full max-w-3xl -translate-y-8 flex-col gap-5">
            <div className="text-center">
              <h3
                className={`text-2xl font-semibold sm:text-4xl ${themeClasses.strong}`}
              >
                {copy.greeting}
              </h3>
              <p
                className={`mx-auto mt-3 max-w-xl text-sm leading-6 sm:text-base ${themeClasses.muted}`}
              >
                {copy.helper}
              </p>
            </div>
            <div className="space-y-3">
              {promptBar}
              {composer}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 ${themeClasses.panelSoft}`}
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-[28px] px-5 py-4 text-sm leading-7 shadow-sm sm:max-w-[80%] ${
                      message.role === "user"
                        ? themeClasses.user
                        : themeClasses.assistant
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className={`rounded-[28px] px-5 py-4 text-sm shadow-sm ${themeClasses.assistant}`}
                  >
                    {copy.thinking}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <div
            className={`shrink-0 border-t px-4 py-3 backdrop-blur sm:px-6 ${themeClasses.border} ${themeClasses.panel}`}
          >
            <div className="space-y-3">
              {promptBar}
              {composer}
            </div>
          </div>
        </>
      )}
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800"
        aria-label={open ? copy.closeChat : copy.openChat}
      >
        {open ? "X" : "Chat"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 h-[min(620px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-3rem))] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          {chatShell}
        </div>
      )}
    </>
  );
}
