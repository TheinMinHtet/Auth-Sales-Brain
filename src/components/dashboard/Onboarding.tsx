import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Shirt,
  Utensils,
  ShoppingBasket,
  Globe,
  Home,
  TrendingDown,
  UserPlus,
  Users,
  Archive,
  Megaphone,
  Truck,
  TrendingUp,
  Sparkles,
  Heart,
  Share2,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Compass,
  Briefcase,
  Layers,
  HelpCircle,
  FileText
} from "lucide-react";

export interface OnboardingProfile {
  shopName: string;
  ownerName: string;
  businessCategory: string[];
  salesChannels: string[];
  customers: string[];
  ageGroup: string;
  customerValues: string[];
  businessChallenge: string;
  marketingMethods: string[];
  businessGoal: string;
}

interface OnboardingProps {
  lang: "en" | "my";
  onComplete: (profile: OnboardingProfile, aiSummary: string) => void;
  initialShopName?: string;
  initialOwnerName?: string;
  onLangChange?: (l: "en" | "my") => void;
}

export function Onboarding({
  lang,
  onComplete,
  initialShopName = "",
  initialOwnerName = "",
  onLangChange
}: OnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 is loading/AI synthesis step, followed by the Summary Page
  const [profile, setProfile] = useState<OnboardingProfile>({
    shopName: initialShopName || "Shwe Pathein Sweet Treats",
    ownerName: initialOwnerName || "Yoon Yamone Oo",
    businessCategory: [],
    salesChannels: [],
    customers: [],
    ageGroup: "",
    customerValues: [],
    businessChallenge: "",
    marketingMethods: [],
    businessGoal: ""
  });

  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [aiSummaryHtml, setAiSummaryHtml] = useState<string>("");
  const [summaryShown, setSummaryShown] = useState<boolean>(false);

  // SECTION 1 options
  const categoriesList = [
    { id: "Electronics & Gadgets", labelEn: "Electronics & Gadgets", labelMy: "လျှပ်စစ်နှင့် စမတ်ပစ္စည်းများ", icon: Smartphone },
    { id: "Fashion & Clothing", labelEn: "Fashion & Clothing", labelMy: "ဖက်ရှင်နှင့် အဝတ်အထည်", icon: Shirt },
    { id: "Food", labelEn: "Food & Desserts", labelMy: "စားသောက်ဖွယ်ရာနှင့် မုန့်မျိုးစုံ", icon: Utensils },
    { id: "FMCG & Groceries", labelEn: "FMCG & Groceries", labelMy: "လူသုံးကုန်နှင့် ကုန်စုံဆိုင်", icon: ShoppingBasket },
    { id: "Digital Products & Services", labelEn: "Digital Products", labelMy: "ဒစ်ဂျစ်တယ် ဝန်ဆောင်မှုများ", icon: Globe },
    { id: "Home & Lifestyle Products", labelEn: "Home & Lifestyle", labelMy: "အိမ်သုံးနှင့် လူနေမှုအသုံးအဆောင်", icon: Home }
  ];

  const channelsList = [
    { id: "Facebook", labelEn: "Facebook Messenger", labelMy: "ဖေ့စ်ဘွတ်ခ် စာမျက်နှာ" },
    { id: "Telegram", labelEn: "Telegram Channels / Bots / Groups", labelMy: "တယ်လီဂရမ် ချန်နယ် / ဘော့တ်" },
    { id: "Instagram", labelEn: "Instagram DMs", labelMy: "အင်စတာဂရမ်" },
    { id: "TikTok", labelEn: "TikTok Shop / Videos", labelMy: "တစ်တော့ခ်" },
    { id: "Website", labelEn: "E-commerce Website", labelMy: "ဝဘ်ဆိုက်" },
    { id: "Physical Store", labelEn: "Physical Retail Store", labelMy: "ဆိုင်တိုက်ရိုက်" },
    { id: "Marketplace", labelEn: "Local Marketplace", labelMy: "အခြား အရောင်းပလက်ဖောင်း" }
  ];

  // SECTION 2 options
  const targetCustomersList = [
    { id: "Students", labelEn: "Students", labelMy: "ကျောင်းသား/သူများ" },
    { id: "Office Workers", labelEn: "Office Workers", labelMy: "ရုံးဝန်ထမ်းများ" },
    { id: "Parents", labelEn: "Parents", labelMy: "မိဘများ/အိမ်ထောင်ရှင်များ" },
    { id: "Teenagers", labelEn: "Teenagers", labelMy: "ဆယ်ကျော်သက်များ" },
    { id: "Young Adults", labelEn: "Young Adults", labelMy: "လူငယ်လူရွယ်များ" },
    { id: "Businesses", labelEn: "B2B Businesses", labelMy: "စီးပွားရေးလုပ်ငန်းများ" },
    { id: "General Customers", labelEn: "General Mass Public", labelMy: "ဘုံအများပြည်သူ" }
  ];

  const ageGroupsList = [
    { id: "Under 18", labelEn: "Under 18 Years", labelMy: "၁၈ နှစ်အောက်" },
    { id: "18–24", labelEn: "18 – 24 Years", labelMy: "၁၈ မှ ၂၄ နှစ်" },
    { id: "25–34", labelEn: "25 – 34 Years", labelMy: "၂၅ မှ ၃၄ နှစ်" },
    { id: "35–44", labelEn: "35 – 44 Years", labelMy: "၃၅ မှ ၄၄ နှစ်" },
    { id: "45+", labelEn: "45 Years and Older", labelMy: "၄၅ နှစ်နှင့်အထက်" }
  ];

  const customerValuesList = [
    { id: "Low Price", labelEn: "Budget / Low Price", labelMy: "သက်သာသောဈေးနှုန်း" },
    { id: "Product Quality", labelEn: "Superior Product Quality", labelMy: "ထုတ်ကုန် အရည်အသွေးကောင်းမွန်မှု" },
    { id: "Fast Delivery", labelEn: "Ultra Fast Delivery", labelMy: "အမြန်ဆုံး အိမ်ရောက်ပို့ဆောင်မှု" },
    { id: "Brand Reputation", labelEn: "Prestigious Brand Reputation", labelMy: "နာမည်ကောင်း ဂုဏ်သတင်းကျော်ကြားမှု" },
    { id: "Trendy Products", labelEn: "Trendy & Viral Products", labelMy: "ခေတ်မှီဆန်းသစ်ပြီး တောင်းဆိုမှုများသောပစ္စည်း" },
    { id: "Discounts & Promotions", labelEn: "Frequent Deals & Promos", labelMy: "အထူးလျှော့ဈေးနှင့် ပရိုမိုးရှင်းများ" }
  ];

  // SECTION 3 options
  const challengesList = [
    { id: "Low Sales", labelEn: "Low Sales Volume", labelMy: "ရောင်းအားနည်းပါးခြင်း", icon: TrendingDown },
    { id: "Getting New Customers", labelEn: "Attracting New Customers", labelMy: "ဝယ်သူအသစ်များ ရရှိရန်ခက်ခဲခြင်း", icon: UserPlus },
    { id: "Customer Retention", labelEn: "Customer Retention / Repeats", labelMy: "ဝယ်သူဟောင်းများ ဆက်ထိန်းရန်ခက်ခြင်း", icon: Users },
    { id: "Unsold Inventory", labelEn: "Dead / Unsold Stock Accumulation", labelMy: "ကုန်ပစ္စည်းများ ကုန်စင်အောင်မရောင်းရခြင်း", icon: Archive },
    { id: "Marketing & Promotion", labelEn: "Struggling with Ad Campaigns", labelMy: "မားကက်တင်း စနစ်တကျ မလုပ်တတ်ခြင်း", icon: Megaphone },
    { id: "Delivery Management", labelEn: "Fulfillment & Deliveries Matrix", labelMy: "ရန်ကုန်မြို့တွင်း ပို့ဆောင်ရေးစီစဉ်မှုများ", icon: Truck }
  ];

  const marketingMethodsList = [
    { id: "Facebook Ads", labelEn: "Paid Facebook Ads Campaign", labelMy: "ဖေ့စ်ဘွတ်ခ် ကြော်ငြာများ" },
    { id: "Boosted Posts", labelEn: "Manual Boosted Page Posts", labelMy: "စစ်မမှန် ပို့စ်များအား ပိုက်ဆံပေးတွန်းတင်ခြင်း" },
    { id: "Influencer Marketing", labelEn: "KOL / Influencer Engagements", labelMy: "အင်ဖလူလင်ဇာများဖြင့် ပရိုမိုးရှင်းလုပ်ခြင်း" },
    { id: "Discount Campaigns", labelEn: "Seasonal Discount Promotions", labelMy: "ပရိုမိုးရှင်း ဈေးလျှော့ရောင်းချခြင်း" },
    { id: "Telegram/Viber Promotion", labelEn: "Viber / Telegram Message Broadcasts", labelMy: "ဗိုက်ဘာနှင့် တယ်လီဂရမ်မှ ရောင်းချခြင်း" },
    { id: "No Marketing Yet", labelEn: "No Professional Marketing Yet", labelMy: "မားကက်တင်း တစ်ခါမှမလုပ်ဖူးသေးပါ" }
  ];

  const goalsList = [
    { id: "Increase Sales", labelEn: "Increase Monthly Sales Total", labelMy: "လစဉ် ရောင်းအားပမာဏ တဟုန်ထိုးတက်ရန်", icon: TrendingUp },
    { id: "Grow Customer Base", labelEn: "Acquire Brand New Leads", labelMy: "ဝယ်သူအသစ် လက်လှမ်းလှမ်းချဲ့ထွင်ရန်", icon: UserPlus },
    { id: "Improve Brand Awareness", labelEn: "Build Strong Online Presence", labelMy: "မိမိဆိုင်၏ ကုန်အမှတ်တံဆိပ် ကြော်ငြာရန်", icon: Sparkles },
    { id: "Increase Repeat Customers", labelEn: "Nurture Loyal Returning Buyers", labelMy: "ပြန်လည်ဝယ်ယူသည့် ဝယ်သူဟောင်း တိုးပွားရန်", icon: Heart },
    { id: "Expand Online Presence", labelEn: "Omnichannel Social Integration", labelMy: "အွန်လိုင်း ချန်နယ်မျိုးစုံ ချိတ်ဆက်သွားရန်", icon: Share2 }
  ];

  // Logic helpers for multiple selecting state arrays
  const handleToggleMulti = (field: "businessCategory" | "salesChannels" | "customers" | "customerValues" | "marketingMethods", value: string) => {
    setProfile((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((x) => x !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        profile.shopName.trim() !== "" &&
        profile.ownerName.trim() !== "" &&
        profile.businessCategory.length > 0 &&
        profile.salesChannels.length > 0
      );
    }
    if (step === 2) {
      return (
        profile.customers.length > 0 &&
        profile.ageGroup !== "" &&
        profile.customerValues.length > 0
      );
    }
    if (step === 3) {
      return (
        profile.businessChallenge !== "" &&
        profile.marketingMethods.length > 0 &&
        profile.businessGoal !== ""
      );
    }
    return true;
  };

  // Submit profile answers to backend, generate summary using Gemini
  const handleFinalSubmit = async () => {
    onComplete(profile, "Initial onboarding profile saved! Feel free to request customized smart marketing campaigns or re-evaluate core strategy inside the AI Advisor Desk.");
  };

  // Step names localization
  const currentStepLabel = () => {
    if (lang === "my") {
      switch (step) {
        case 1: return "လုပ်ငန်းသတင်းအချက်အလက်";
        case 2: return "ဝယ်ယူသူဦးတည်ချက်";
        case 3: return "အရောင်းနှင့် မားကက်တင်း မဟာဗျူဟာ";
        default: return "အချက်အလက် စီစစ်တွက်ချက်ခြင်း";
      }
    } else {
      switch (step) {
        case 1: return "Business Information";
        case 2: return "Customer Information";
        case 3: return "Sales & Marketing";
        default: return "Cognitive Processing";
      }
    }
  };

  if (summaryShown) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden">
        {/* Soft elegant blurs in background */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-12 w-full max-w-2xl shadow-xl space-y-8 relative z-10"
        >
          {/* Header with Language Selector toggle */}
          <div className="relative pb-4 border-b border-slate-100 flex flex-col items-center">
            {/* Language Selection Bar */}
            <div className="absolute top-0 right-0 flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/40">
              <button
                type="button"
                onClick={() => onLangChange?.("en")}
                className={`px-2 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  lang === "en" ? "bg-black text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange?.("my")}
                className={`px-2 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  lang === "my" ? "bg-black text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                မြန်မာ
              </button>
            </div>

            <div className="inline-flex w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl items-center justify-center text-3xl shadow-sm text-indigo-600">
              ✨
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight mt-3 text-center">
              {lang === "my" ? "သင့်တော်သော AI လုပ်ငန်းမဟာဗျူဟာ ထွက်ပေါ်လာပါပြီ" : "AI Business Briefing Generated!"}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1 text-center">
              {lang === "my" ? "Sales Brain AI မှ သင့်အချက်အလက်များကိုအခြေခံ၍ ရေးဆွဲပေးထားသော မူဘောင်ဖြစ်ပါသည်" : "Sales Brain AI synthesized your answers into a tailor-made growth report."}
            </p>
          </div>

          {/* Business Summary Text Box with clean scannable paragraph and style pairings */}
          <div className="bg-[#fcfdfe] border border-indigo-100/40 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30">
              <Sparkles size={13} />
              <span>{lang === "my" ? "အေအိုင် အမှတ်တရ လမ်းညွှန်ချက်" : "Sales Brain AI Strategist Report"}</span>
            </div>
            
            <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-700 whitespace-pre-line select-text space-y-3 font-sans">
              {aiSummaryHtml}
            </div>
          </div>

          {/* Call to action button to route back to actual workspace */}
          <div className="text-center pt-2">
            <button
              onClick={() => onComplete(profile, aiSummaryHtml)}
              className="w-full sm:w-auto bg-black hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] mx-auto"
            >
              <span>{lang === "my" ? "အေအိုင် သတင်းအချက်အလက် စင်တာသို့ ဝင်မည်" : "Enter SME Intelligence Suite"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Absolute blurry background ambient overlays */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-300/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-3xl space-y-8 relative z-20">
        
        {/* PROGRESS STEPPER HEADER */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between font-mono text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/50 w-full gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Compass size={12} className="text-indigo-500" />
              <span>{lang === "my" ? "အရောင်းဆိုင် အေအိုင် လုပ်ငန်းလမ်းညွှန်" : "SALES BRAIN AI ONBOARDING DESK"}</span>
            </div>

            {/* Elegant Language Switcher available directly in onboarding session */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/60 p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => onLangChange?.("en")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-black text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange?.("my")}
                className={`px-2 py-0.5 text-[8px] font-bold rounded-md transition-all cursor-pointer ${
                  lang === "my"
                    ? "bg-black text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                မြန်မာ
              </button>
            </div>

            <div className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md shrink-0">
              {lang === "my" ? `အဆင့် ${step} / ၃` : `Step ${step} of 3`}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                {currentStepLabel()}
              </h1>
              <span className="text-[10px] font-bold text-indigo-500 font-mono">
                {Math.round(((step - 1) / 3) * 100)}% Completed
              </span>
            </div>

            {/* Solid Horizontal Premium Stepper Link Area */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/20">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* STEPPER CONTENT CONTAINER CARD */}
        <div className="bg-white border border-slate-200/75 rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col min-h-[460px] justify-between relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Row 1: Quick Brand identification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                        {lang === "my" ? "ဆိုင် / လုပ်ငန်းအမည်" : "Brand / Shop Name"}
                      </label>
                      <div className="relative">
                        <Store className="absolute left-3.5 top-[13px] text-slate-400" size={14} />
                        <input
                          type="text"
                          value={profile.shopName}
                          onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                          placeholder="e.g., Shwe Pathein Sweet Treats"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 h-10.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                        {lang === "my" ? "ဆိုင်ရှင်အမည်" : "SME Owner Name"}
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-[13px] text-slate-400" size={14} />
                        <input
                          type="text"
                          value={profile.ownerName}
                          onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                          placeholder="e.g., Yoon Yamone Oo"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 h-10.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question 1: What type of business do you run? (Selectable cards) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "သင့်လုပ်ငန်းက ဘယ်အမျိုးအစားဖြစ်ပါသလဲ? (တစ်ခု သို့မဟုတ် ထို့ထက်ပို၍ ရွေးပါ)" : "What type of business do you run? (Single or Multi-select)"}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categoriesList.map((item) => {
                        const isCatSelected = profile.businessCategory.includes(item.id);
                        const IconComponent = item.icon;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleMulti("businessCategory", item.id)}
                            className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between space-y-4 transition-all hover:shadow-xs group ${
                              isCatSelected
                                ? "bg-indigo-50/50 border-indigo-600 text-slate-900 shadow-inner"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-350"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className={`p-2 rounded-xl border ${
                                isCatSelected ? "bg-indigo-600 text-white border-indigo-100/30" : "bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-indigo-50/50 group-hover:text-indigo-600"
                              }`}>
                                <IconComponent size={14} />
                              </div>
                              {isCatSelected && (
                                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check size={9} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-[10.5px] font-bold text-slate-800 block leading-tight">
                                {lang === "my" ? item.labelMy : item.labelEn}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: Where do you mainly sell? (Check chips) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "ကုန်ပစ္စည်းများကို ဘယ်လမ်းကြောင်းတွေကနေ အဓိကရောင်းချပါသလဲ?" : "Where do you mainly sell your products? (Multi-select options)"}
                    </label>

                    <div className="flex flex-wrap gap-2.5">
                      {channelsList.map((chan) => {
                        const isChanSelected = profile.salesChannels.includes(chan.id);
                        return (
                          <button
                            key={chan.id}
                            type="button"
                            onClick={() => handleToggleMulti("salesChannels", chan.id)}
                            className={`px-4 py-2 text-[10.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                              isChanSelected
                                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "my" ? chan.labelMy : chan.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Question 1: Who are your main customers? (Multi-select chips) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "သင့်ဆိုင်၏ အဓိကဝယ်ယူသူတွေက ဘယ်သူတွေလဲ?" : "Who are your main customers? (Multi-select categories)"}
                    </label>

                    <div className="flex flex-wrap gap-2.5">
                      {targetCustomersList.map((cust) => {
                        const isCustSelected = profile.customers.includes(cust.id);
                        return (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => handleToggleMulti("customers", cust.id)}
                            className={`px-4 py-2 text-[10.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                              isCustSelected
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/85"
                            }`}
                          >
                            {lang === "my" ? cust.labelMy : cust.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: What age group buys most? (Single select pills) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "ဘယ်အသက်အရွယ်အပိုင်းအခြားက ကုန်ပစ္စည်းတွေကို အများဆုံးဝယ်ယူပါသလဲ?" : "What age group buys your products most? (Single-select)"}
                    </label>

                    <div className="flex flex-wrap gap-2.5">
                      {ageGroupsList.map((age) => {
                        const isAgeSelected = profile.ageGroup === age.id;
                        return (
                          <button
                            key={age.id}
                            type="button"
                            onClick={() => setProfile((prev) => ({ ...prev, ageGroup: age.id }))}
                            className={`px-4 py-2 text-[10.5px] font-bold rounded-xl border transition-all cursor-pointer ${
                              isAgeSelected
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "my" ? age.labelMy : age.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 3: What matters most to customers? (Multi-select chips) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "ဝယ်ယူသူတွေအတွက် ကုန်ပစ္စည်းဝယ်ယူရာတွင် ဘာက အရေးအကြီးဆုံးလဲ?" : "What matters most to your customers? (Multi-select priorities)"}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {customerValuesList.map((val) => {
                        const isValSelected = profile.customerValues.includes(val.id);
                        return (
                          <div
                            key={val.id}
                            onClick={() => handleToggleMulti("customerValues", val.id)}
                            className={`px-4 py-3 rounded-xl border cursor-pointer hover:bg-slate-50 transition-all flex items-center justify-between ${
                              isValSelected
                                ? "bg-slate-50 border-slate-800 text-slate-900"
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="text-[10.5px] font-bold">
                              {lang === "my" ? val.labelMy : val.labelEn}
                            </span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isValSelected ? "bg-black border-black text-white" : "border-slate-300"
                            }`}>
                              {isValSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Question 1: What is biggest business challenge? (Cards with icons) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "သင့်လုပ်ငန်းအတွက် လက်ရှိအကြီးမားဆုံး အခက်အခဲ စိန်ခေါ်မှုက ဘာလဲ?" : "What is your biggest business challenge? (Choose 1)"}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {challengesList.map((ch) => {
                        const isChSelected = profile.businessChallenge === ch.id;
                        const ChIcon = ch.icon;

                        return (
                          <div
                            key={ch.id}
                            onClick={() => setProfile((prev) => ({ ...prev, businessChallenge: ch.id }))}
                            className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between space-y-3 transition-colors ${
                              isChSelected
                                ? "bg-indigo-50/50 border-indigo-600 text-indigo-950"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-center bg-transparent">
                              <div className={`p-1.5 rounded-lg border ${
                                isChSelected ? "bg-indigo-600 text-white border-indigo-200/50" : "bg-slate-50 text-slate-400 border-slate-100"
                              }`}>
                                <ChIcon size={12} />
                              </div>
                              {isChSelected && (
                                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                  <Check size={9} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-800 leading-tight">
                              {lang === "my" ? ch.labelMy : ch.labelEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 2: What marketing methods do you currently use? (Check chips) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "လက်ရှိမှာ ဘယ်လိုမားကက်တင်း နည်းလမ်းတွေကို အဓိကသုံးနေပါသလဲ?" : "What marketing methods do you currently use? (Select what applies)"}
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {marketingMethodsList.map((m) => {
                        const isMSelected = profile.marketingMethods.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleMulti("marketingMethods", m.id)}
                            className={`px-3.5 py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                              isMSelected
                                ? "bg-slate-900 border-slate-900 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {lang === "my" ? m.labelMy : m.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question 3: What is your main business goal? (Single-select card) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-extrabold text-slate-400 uppercase block tracking-wider">
                      {lang === "my" ? "သင့်လုပ်ငန်း၏ အဓိကရည်မှန်းချက် ပန်းတိုင်က ဘာလဲ? (တစ်ခုရွေးရန်)" : "What is your main business goal? (Select 1 target)"}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {goalsList.map((g) => {
                        const isGSelected = profile.businessGoal === g.id;

                        return (
                          <div
                            key={g.id}
                            onClick={() => setProfile((prev) => ({ ...prev, businessGoal: g.id }))}
                            className={`p-3 rounded-2xl border cursor-pointer flex flex-col sm:flex-row sm:items-center gap-3 transition-colors sm:col-span-1 border-dashed ${
                              isGSelected
                                ? "bg-black border-black text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                            style={{ gridColumn: "span 1 / span 5" }}
                          >
                            <div className="flex-1">
                              <span className={`text-[10.5px] font-bold block leading-snug ${isGSelected ? "text-white" : "text-slate-800"}`}>
                                {lang === "my" ? g.labelMy : g.labelEn}
                              </span>
                            </div>
                            {isGSelected && (
                              <div className="ml-auto w-4 h-4 rounded-full bg-white text-black flex items-center justify-center font-bold">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col justify-center items-center text-center space-y-6 min-h-[350px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl text-indigo-600">
                    <Sparkles className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold tracking-widest uppercase font-mono text-indigo-600 animate-pulse">
                    {lang === "my" ? "အေအိုင်မှ စီစစ်အကြံပြုချက်များ ရေးဆွဲနေသည်..." : "Architecting Growth Blueprint..."}
                  </h3>
                  <p className="text-xs text-slate-400/85 max-w-sm leading-relaxed mx-auto font-medium">
                    {lang === "my"
                      ? "လုပ်ငန်းအမျိုးအစား၊ ဝယ်ယူသူများနှင့် အရောင်းလိုင်းများကို ဆန်းစစ်ကာ အသင့်တော်ဆုံး CRM စနစ်အား ချိန်ညှိပေးနေပါသည်"
                      : "Analyzing sales channels, customer age ranges, and barriers to compile your tailored SME Strategy."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Footer Rules Actions */}
          {step < 4 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 shrink-0">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>{lang === "my" ? "နောက်သို့" : "Back"}</span>
              </button>

              <button
                type="button"
                disabled={!isStepValid()}
                onClick={() => {
                  if (step === 3) {
                    handleFinalSubmit();
                  } else {
                    setStep((prev) => (prev + 1) as any);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-1.5 ${
                  isStepValid()
                    ? "bg-black hover:bg-slate-800 shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>{step === 3 ? (lang === "my" ? "အချက်အလက်သိမ်းဆည်းပြီး ဝင်မည်" : "Finish & Enter Dashboard") : (lang === "my" ? "ရှေ့သို့" : "Next")}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
