"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface ShopChatbotProps {
  shopId: string;
  businessName: string;
  fullPage?: boolean;
  suggestedPrompts?: string[];
  products?: ChatProduct[];
  onOpenInfo?: () => void;
}

type Language = "en" | "my";

const MYANMAR_COPY = {
  eyebrow: "AI အရောင်း Chat",
  online: "အွန်လိုင်း",
  greeting: "ဘာရှာပေးရမလဲ?",
  helper: "ပစ္စည်း၊ ပို့ဆောင်မှု၊ ငွေပေးချေမှု၊ စတော့ အကြောင်း မေးနိုင်ပါတယ်။",
  placeholder: "ဆိုင် assistant ကို စာပို့ပါ...",
  send: "ပို့",
  thinking: "စဉ်းစားနေပါတယ်...",
  error: "တုံ့ပြန်လို့မရပါဘူး။ ထပ်စမ်းကြည့်ပါ။",
  connectionError: "ချိတ်ဆက်မှု ပြဿနာရှိပါတယ်။ ထပ်စမ်းကြည့်ပါ။",
  quickPrompts: "အမြန်မေးခွန်းများ",
  productsTitle: "ရနိုင်သော ပစ္စည်းများ",
  productsHint: "များတဲ့ catalog အတွက် card တွေကို ဘေးတိုက် scroll လုပ်ကြည့်ပါ။",
  info: "ဆိုင် info",
  language: "ဘာသာစကား",
  openChat: "Chat ဖွင့်ရန်",
  closeChat: "Chat ပိတ်ရန်",
};

const ENGLISH_COPY = {
  eyebrow: "AI Sales Chat",
  online: "Online",
  greeting: "What can I help you find?",
  helper: "Ask about products, delivery, payment, or stock.",
  placeholder: "Message the shop assistant...",
  send: "Send",
  thinking: "Thinking...",
  error: "Sorry, I couldn't respond. Try again.",
  connectionError: "Connection error. Please try again.",
  quickPrompts: "Quick prompts",
  productsTitle: "Available products",
  productsHint: "For larger catalogs, scroll sideways through the cards.",
  info: "Shop info",
  language: "Language",
  openChat: "Open chat",
  closeChat: "Close chat",
};

export function ShopChatbot({
  shopId,
  businessName,
  fullPage = false,
  suggestedPrompts = [],
  products = [],
  onOpenInfo,
}: ShopChatbotProps) {
  const [open, setOpen] = useState(fullPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasStarted = messages.length > 0;
  const copy = language === "en" ? ENGLISH_COPY : MYANMAR_COPY;

  const featuredProducts = useMemo(() => products.slice(0, 24), [products]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    requestAnimationFrame(() => {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    });
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

  function shouldShowProductCards(index: number) {
    if (!featuredProducts.length || messages[index]?.role !== "assistant") {
      return false;
    }

    const previousUserMessage = [...messages]
      .slice(0, index)
      .reverse()
      .find((message) => message.role === "user")?.content;

    return Boolean(
      previousUserMessage &&
        /(what products|products do you sell|catalog|show.*products|recommend|available products|ဘာပစ္စည်း|ပစ္စည်း)/i.test(
          previousUserMessage
        )
    );
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

  const languageToggle = (
    <div
      className="grid grid-cols-2 rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold"
      aria-label={copy.language}
    >
      {(["en", "my"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`rounded-full px-3 py-1.5 transition ${
            language === option
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {option === "en" ? "EN" : "မြန်"}
        </button>
      ))}
    </div>
  );

  const promptBar = suggestedPrompts.length > 0 && (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-1">
      <p className="text-xs font-medium text-slate-500">{copy.quickPrompts}</p>
      <div className="chat-scrollbar flex gap-2 overflow-x-auto pb-1">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => void sendMessage(prompt)}
            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            {localizePrompt(prompt)}
          </button>
        ))}
      </div>
    </div>
  );

  const productCards = (
    <div className="mt-3 w-full max-w-full">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {copy.productsTitle}
          </p>
          <p className="text-xs text-slate-500">{copy.productsHint}</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {products.length}
        </span>
      </div>
      <div className="chat-scrollbar flex gap-3 overflow-x-auto pb-2">
        {featuredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => void sendMessage(`Tell me about ${product.name}`)}
            className="w-52 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="px-3 text-center text-xs font-medium text-slate-500">
                  {product.name}
                </span>
              )}
            </div>
            <p className="mt-3 line-clamp-1 text-sm font-semibold text-slate-950">
              {product.name}
            </p>
            <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-5 text-slate-500">
              {product.description || "Ask for details, price, and stock."}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-950">
                ${product.price.toFixed(2)}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} left` : "Out"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const composer = (
    <div className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-[34px] bg-[#202020] px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.18)] sm:rounded-[42px] sm:px-5">
      <button
        type="button"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#343434] text-3xl font-light leading-none text-white transition hover:bg-[#3f3f3f]"
        aria-label="Add attachment"
      >
        +
      </button>
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitCurrentInput();
          }
        }}
        placeholder={language === "en" ? "Ask anything" : "ဘာမဆို မေးပါ"}
        rows={1}
        className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-0 py-2 text-[19px] leading-7 text-white outline-none placeholder:text-[#b8b8b8] sm:text-[22px]"
      />
      <button
        type="button"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#343434] text-white transition hover:bg-[#3f3f3f]"
        aria-label="Voice input"
      >
        <span className="relative h-6 w-4" aria-hidden="true">
          <span className="absolute left-1/2 top-0 h-4 w-3 -translate-x-1/2 rounded-b-full rounded-t-full border-2 border-white" />
          <span className="absolute left-1/2 top-3 h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-l-2 border-r-2 border-white" />
          <span className="absolute bottom-0 left-1/2 h-2 w-0.5 -translate-x-1/2 rounded-full bg-white" />
        </span>
      </button>
      <button
        type="button"
        onClick={submitCurrentInput}
        disabled={loading || !input.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#141414] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        aria-label={copy.send}
      >
        <span className="flex h-6 items-center gap-1" aria-hidden="true">
          <span className="h-3 w-1 rounded-full bg-current" />
          <span className="h-5 w-1 rounded-full bg-current" />
          <span className="h-2.5 w-1 rounded-full bg-current" />
          <span className="h-4 w-1 rounded-full bg-current" />
        </span>
      </button>
    </div>
  );

  const chatShell = (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <div className="shrink-0 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {onOpenInfo && (
              <button
                type="button"
                onClick={onOpenInfo}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
              >
                {copy.info}
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.eyebrow}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold text-slate-950">
                {businessName}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {languageToggle}
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:block">
              {copy.online}
            </div>
          </div>
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex min-h-0 flex-1 items-center bg-slate-50/80 px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl -translate-y-8 flex-col gap-5">
            <div className="text-center">
              <h3 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {copy.greeting}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
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
            ref={scrollRef}
            className="chat-scrollbar min-h-0 flex-1 scroll-smooth overflow-y-auto overscroll-contain bg-slate-50/80 px-4 py-6 sm:px-6"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="space-y-3">
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[92%] rounded-[26px] px-5 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] ${
                        message.role === "user"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                  {shouldShowProductCards(index) && productCards}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[26px] border border-slate-200 bg-white px-5 py-3 text-sm text-slate-500 shadow-sm">
                    {copy.thinking}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
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
