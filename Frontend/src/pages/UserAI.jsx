import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Droplets,
  FileBadge,
  Home,
  Info,
  Loader2,
  MessageSquarePlus,
  Mic,
  Paperclip,
  Search,
  Send,
  Users,
  Bot,
} from "lucide-react";
import { getPublicOngoingProjects, getPublicSchemes, getPublicVillageStatistics } from "../Services/moduleDataService";
import { UserAI as askUserAI } from "../Services/UserAIService";

import { Link } from "react-router-dom";

const content = {
  en: {
    title: "Grampanchayat AI",
    subtitle: "Your digital assistant",
    description: "Get information about schemes, services, certificates, taxes and Gram Panchayat work.",
    greeting:
      "Hello! I am your Grampanchayat AI assistant. I can help you with schemes, services, certificates, taxes and Gram Panchayat related information. Please ask your question.",
    suggestionTitle: "You can ask:",
    placeholder: "Type your question here...",
    disclaimer:
      "AI generated information is for assistance only. Contact the Gram Panchayat office for official confirmation.",
    languagePrompt: "Answer in English. Keep the answer simple and useful for village citizens.",
    categories: [
      ["Scheme Information", "Know about government schemes and benefits", FileBadge],
      ["Certificates", "Required documents and certificate process", FileBadge],
      ["Tax Registration", "Property tax registration and payment details", Users],
      ["General Information", "Gram Panchayat work, members and public information", Info],
    ],
    suggestions: [
      "What is Pradhan Mantri Awas Yojana?",
      "What documents are needed for residence certificate?",
      "What is required to get birth certificate?",
      "How to register property tax?",
      "What are the Gram Panchayat office timings?",
    ],
  },
  mr: {
    title: "Grampanchayat AI",
    subtitle: "तुमचा डिजिटल सहाय्यक",
    description: "योजना, सेवा, दाखले, कर आणि ग्रामपंचायत संबंधित माहिती मिळवा.",
    greeting:
      "नमस्कार! मी तुमचा Grampanchayat AI सहाय्यक आहे. योजना, सेवा, दाखले, कर आणि ग्रामपंचायत माहितीमध्ये मी मदत करू शकतो. कृपया तुमचा प्रश्न विचारा.",
    suggestionTitle: "तुम्ही विचारू शकता:",
    placeholder: "तुमचा प्रश्न येथे टाइप करा...",
    disclaimer:
      "AI दिलेली माहिती फक्त सहाय्यासाठी आहे. अधिकृत माहितीसाठी ग्रामपंचायत कार्यालयाशी संपर्क साधा.",
    languagePrompt: "उत्तर मराठीत द्या. उत्तर गावातील नागरिकांना समजेल असे सोपे आणि उपयोगी ठेवा.",
    categories: [
      ["योजना माहिती", "शासकीय योजना आणि लाभ जाणून घ्या", FileBadge],
      ["दाखले", "दाखल्यांसाठी लागणारी कागदपत्रे आणि प्रक्रिया", FileBadge],
      ["कर नोंदणी", "मालमत्ता कर नोंदणी आणि भरणा माहिती", Users],
      ["सामान्य माहिती", "ग्रामपंचायत कामकाज, सदस्य आणि सार्वजनिक माहिती", Info],
    ],
    suggestions: [
      "प्रधानमंत्री आवास योजना काय आहे?",
      "निवास दाखल्यासाठी कोणती कागदपत्रे लागतात?",
      "जन्म दाखला मिळवण्यासाठी काय लागते?",
      "मालमत्ता कर नोंदणी कशी करायची?",
      "ग्रामपंचायत कार्यालयाची वेळ काय आहे?",
    ],
  },
  hi: {
    title: "Grampanchayat AI",
    subtitle: "आपका डिजिटल सहायक",
    description: "योजनाओं, सेवाओं, प्रमाणपत्रों, कर और ग्राम पंचायत से जुड़ी जानकारी पाएं।",
    greeting:
      "नमस्कार! मैं आपका Grampanchayat AI सहायक हूं। मैं योजनाओं, सेवाओं, प्रमाणपत्रों, कर और ग्राम पंचायत जानकारी में मदद कर सकता हूं। कृपया अपना प्रश्न पूछें।",
    suggestionTitle: "आप पूछ सकते हैं:",
    placeholder: "अपना प्रश्न यहां टाइप करें...",
    disclaimer:
      "AI द्वारा दी गई जानकारी केवल सहायता के लिए है। आधिकारिक जानकारी के लिए ग्राम पंचायत कार्यालय से संपर्क करें।",
    languagePrompt: "उत्तर हिंदी में दें। उत्तर गांव के नागरिकों के लिए सरल और उपयोगी रखें.",
    categories: [
      ["योजना जानकारी", "सरकारी योजनाओं और लाभों की जानकारी लें", FileBadge],
      ["प्रमाणपत्र", "जरूरी दस्तावेज और प्रमाणपत्र प्रक्रिया", FileBadge],
      ["कर पंजीकरण", "संपत्ति कर पंजीकरण और भुगतान जानकारी", Users],
      ["सामान्य जानकारी", "ग्राम पंचायत कार्य, सदस्य और सार्वजनिक जानकारी", Info],
    ],
    suggestions: [
      "प्रधानमंत्री आवास योजना क्या है?",
      "निवास प्रमाणपत्र के लिए कौन से दस्तावेज चाहिए?",
      "जन्म प्रमाणपत्र के लिए क्या चाहिए?",
      "संपत्ति कर पंजीकरण कैसे करें?",
      "ग्राम पंचायत कार्यालय का समय क्या है?",
    ],
  },
};

function getLanguageContent(language) {
  return content[language] || content.en;
}

function buildQuestion(question, copy) {
  return `${copy.languagePrompt}\n\nQuestion: ${question}`;
}

function splitAiResponse(value = "") {
  return String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\s+\*/g, "\n*")
    .replace(/\s+(\d+\.\s+\*\*)/g, "\n$1")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderInlineFormat(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong className="font-black text-slate-950" key={`${part}-${index}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
}

function FormattedAiResponse({ text }) {
  const lines = splitAiResponse(text);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const numberedMatch = line.match(/^(\d+)\.\s*(.*)$/);
        const bulletMatch = line.match(/^[*-]\s*(.*)$/);

        if (numberedMatch) {
          return (
            <div className="flex gap-3" key={`${line}-${index}`}>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">
                {numberedMatch[1]}
              </span>
              <p className="min-w-0">{renderInlineFormat(numberedMatch[2])}</p>
            </div>
          );
        }

        if (bulletMatch) {
          return (
            <div className="flex gap-3" key={`${line}-${index}`}>
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
              <p className="min-w-0">{renderInlineFormat(bulletMatch[1])}</p>
            </div>
          );
        }

        return <p key={`${line}-${index}`}>{renderInlineFormat(line)}</p>;
      })}
    </div>
  );
}

function UserAssistantRobot({ mini = false, mood = "idle", message = "" }) {
  return (
    <div className={`complaint-robot ${mini ? "complaint-robot-mini" : ""} ${mood ? `complaint-robot-${mood}` : ""}`} aria-hidden="true">
      {message && !mini && <div className="complaint-robot-bubble">{message}</div>}
      <div className="complaint-robot-glow" />
      <div className="complaint-robot-character">
        <div className="complaint-robot-head">
          <div className="complaint-robot-antenna" />
          <div className="complaint-robot-ear complaint-robot-ear-left" />
          <div className="complaint-robot-ear complaint-robot-ear-right" />
          <div className="complaint-robot-face">
            <span className="complaint-robot-eye complaint-robot-eye-left" />
            <span className="complaint-robot-eye complaint-robot-eye-right" />
            <span className="complaint-robot-mouth" />
          </div>
        </div>
        <div className="complaint-robot-arm complaint-robot-arm-left">
          <span />
        </div>
        <div className="complaint-robot-arm complaint-robot-arm-right">
          <span />
        </div>
        <div className="complaint-robot-body">
          <div className="complaint-robot-chest" />
          <div className="complaint-robot-badge" />
        </div>
        <div className="complaint-robot-base" />
      </div>
    </div>
  );
}

const INTERNAL_DATA_CACHE_MS = 5 * 60 * 1000;
let internalSystemDataCache = {
  data: null,
  expiresAt: 0,
  pending: null,
};

async function loadInternalSystemData() {
  const now = Date.now();

  if (internalSystemDataCache.data && internalSystemDataCache.expiresAt > now) {
    return internalSystemDataCache.data;
  }

  if (internalSystemDataCache.pending) {
    return internalSystemDataCache.pending;
  }

  const withFallback = async (request, fallback) => {
    const timeout = new Promise((resolve) => {
      window.setTimeout(() => resolve({ success: false, data: fallback }), 1200);
    });

    return Promise.race([request(), timeout]).catch(() => ({ success: false, data: fallback }));
  };

  internalSystemDataCache.pending = Promise.all([
    withFallback(getPublicSchemes, []),
    withFallback(getPublicOngoingProjects, []),
    withFallback(getPublicVillageStatistics, null),
  ]).then(([schemesResult, ongoingProjectsResult, villageStatisticsResult]) => {
    const data = {
      emptyVillageStatistics: villageStatisticsResult.success ? villageStatisticsResult.data : null,
      ongoingProjects: ongoingProjectsResult.success && Array.isArray(ongoingProjectsResult.data) ? ongoingProjectsResult.data : [],
      schemes: schemesResult.success && Array.isArray(schemesResult.data) ? schemesResult.data : [],
    };

    internalSystemDataCache = {
      data,
      expiresAt: Date.now() + INTERNAL_DATA_CACHE_MS,
      pending: null,
    };

    return data;
  }).catch(() => {
    internalSystemDataCache.pending = null;

    return {
      emptyVillageStatistics: null,
      ongoingProjects: [],
      schemes: [],
    };
  });

  return internalSystemDataCache.pending;
}

function isInternalSystemQuestion(question) {
  const text = String(question || "").toLowerCase();
  const words = [
    "scheme",
    "yojana",
    "project",
    "population",
    "household",
    "literacy",
    "area",
    "statistics",
    "budget",
    "contractor",
    "status",
    "योजना",
    "प्रकल्प",
    "लोकसंख्या",
    "साक्षरता",
    "आकडेवारी",
    "जनसंख्या",
    "परियोजना",
  ];

  return words.some((word) => text.includes(word));
}

function UserAI() {
  const { i18n } = useTranslation();
  const copy = useMemo(() => getLanguageContent(i18n.language), [i18n.language]);
  const [qun, setquestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [ans, setans] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const [robotMood, setRobotMood] = useState("greeting");
  const [robotMessage, setRobotMessage] = useState("Hi! \u{1F44B}");
  const requestIdRef = useRef(0);
  const recognitionRef = useRef(null);
  const micStreamRef = useRef(null);

  async function loadAnswer(question, shouldSaveQuestion = true) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setRobotMood("listening");

    try {
      const internalSystemData = isInternalSystemQuestion(cleanQuestion)
        ? await loadInternalSystemData()
        : { schemes: [], ongoingProjects: [], emptyVillageStatistics: null };
      const response = await askUserAI(
        buildQuestion(cleanQuestion, copy),
        internalSystemData.schemes,
        internalSystemData.ongoingProjects,
        internalSystemData.emptyVillageStatistics
      );
      const nextAnswer = response?.data || response?.message;

      if (requestIdRef.current === requestId && nextAnswer) {
        setans(nextAnswer);
        if (shouldSaveQuestion) {
          setLastQuestion(cleanQuestion);
        }
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        setRobotMood("idle");
      }
    }
  }

  const SearchAns = async (e) => {
    e.preventDefault();
    await loadAnswer(qun);
  };

  function askSuggestion(question) {
    setquestion(question);
    loadAnswer(question);
  }

  function stopVoiceQuestion() {
    recognitionRef.current?.stop();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    setListening(false);
  }

  function releaseMicStream() {
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
  }

  async function startVoiceQuestion() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (listening) {
      stopVoiceQuestion();
      return;
    }

    if (!SpeechRecognition) {
      setSpeechStatus("Mic is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setSpeechStatus("Mic access is not available in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!window.isSecureContext) {
      setSpeechStatus("Mic works only on localhost or HTTPS. Please open the app using localhost or HTTPS.");
      return;
    }

    setSpeechStatus("Starting mic...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
    } catch (error) {
      console.log("Mic device permission check failed", error);
      setSpeechStatus("Mic permission check failed. Still trying browser speech recognition...");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === "hi" ? "hi-IN" : i18n.language === "mr" ? "mr-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setRobotMood("listening");
      setSpeechStatus("Listening... speak now");
    };
    recognition.onend = () => {
      releaseMicStream();
      setListening(false);
      setRobotMood("idle");
      setSpeechStatus((status) => (
        status === "Listening... speak now" || status === "Listening... keep speaking"
          ? "Mic stopped. Please click mic again if you want to speak."
          : status
      ));
    };
    recognition.onerror = (event) => {
      releaseMicStream();
      setListening(false);
      setRobotMood("idle");
      const errorMessages = {
        "not-allowed": "Mic permission denied. Please allow microphone access in browser settings and Windows privacy settings.",
        "service-not-allowed": "Speech recognition is blocked. Please allow microphone/speech access in browser settings.",
        "no-speech": "No speech detected. Please click mic and speak again.",
        "audio-capture": "No microphone found. Please check your mic device.",
        network: "Speech service network error. Please try again.",
        aborted: "Mic stopped.",
      };
      setSpeechStatus(errorMessages[event.error] || "Mic could not hear clearly. Please try again.");
    };
    recognition.onnomatch = () => {
      setSpeechStatus("Could not understand. Please speak again.");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript || "";
        isFinal = isFinal || event.results[index]?.isFinal;
      }

      const voiceQuestion = transcript.trim();

      if (!voiceQuestion) {
        return;
      }

      setquestion(voiceQuestion);
      setSpeechStatus(isFinal ? "" : "Listening... keep speaking");

      if (isFinal) {
        loadAnswer(voiceQuestion);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      releaseMicStream();
      setListening(false);
      setSpeechStatus("Mic is already starting. Please try again.");
    }
  }

  useEffect(() => {
    const danceTimer = window.setTimeout(() => {
      setRobotMessage("");
      setRobotMood("dancing");
    }, 2200);
    const idleTimer = window.setTimeout(() => setRobotMood("idle"), 4200);

    return () => {
      window.clearTimeout(danceTimer);
      window.clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    loadInternalSystemData();
  }, []);

  useEffect(() => {
    if (lastQuestion && ans) {
      loadAnswer(lastQuestion, false);
    }
  }, [i18n.language]);

  return (
    <main
      className="min-h-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#dffcf1_0,#f7fbff_34%,#f8fafc_68%)] px-4 py-5 text-slate-950 sm:px-6"
      data-no-translate="true"
    >

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="mb-2 flex border-b border-slate-200">
          <Link
            to="/user-ai"
            className="flex items-center gap-2 border-b-2 border-emerald-600 px-4 py-3 text-sm font-black text-emerald-700 transition"
          >
            <Bot size={18} />
            Grampanchayat AI
          </Link>
          <Link
            to="/complint-ai"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <MessageSquarePlus size={18} />
            Complaint AI
          </Link>
          <Link
            to="/track-compilnt"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <Search size={18} />
            Track Complaint
          </Link>
        </div>
        <section className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,118,110,0.14)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_46%,#e0f2fe_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),rgba(14,165,233,0.10),rgba(255,255,255,0))]" />
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(240,253,250,0.58))]" />
          <div className="relative grid min-h-60 gap-8 px-5 py-8 sm:px-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center md:gap-10 lg:py-10">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_18px_45px_rgba(15,118,110,0.18)] ring-1 ring-emerald-100 sm:h-32 sm:w-32">
                <div className="absolute inset-2 rounded-full border border-cyan-100 bg-emerald-50/70" />
                <UserAssistantRobot mini mood={robotMood} />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-[11px] font-black uppercase text-emerald-800 shadow-sm">
                  Smart Citizen Helpdesk
                </span>
                <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">
                  {copy.title}
                </h1>
                <p className="mt-3 text-xl font-black text-emerald-950 sm:text-2xl">{copy.subtitle}</p>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{copy.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Schemes", "Certificates", "Taxes"].map((item) => (
                    <span
                      className="rounded-lg border border-emerald-100 bg-white/85 px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl px-4 py-6 md:min-h-64 md:px-6">
              <div className="absolute inset-x-8 bottom-5 h-36 rounded-xl border border-white/80 bg-white/65 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur md:inset-x-2 md:h-40 lg:inset-x-8">
                <div className="absolute left-5 top-5 h-2 w-20 rounded-full bg-emerald-200" />
                <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
                  <span className="h-14 rounded-lg bg-emerald-50" />
                  <span className="h-14 rounded-lg bg-cyan-50" />
                  <span className="h-14 rounded-lg bg-slate-50" />
                </div>
              </div>
              <UserAssistantRobot message={robotMessage} mood={robotMood} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.categories.map(([title, description, Icon]) => (
            <article
              className="group flex min-h-28 items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
              key={title}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition group-hover:bg-emerald-700 group-hover:text-white">
                <Icon size={25} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-emerald-800">{title}</h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-200">
              <UserAssistantRobot mini mood={loading ? "listening" : "idle"} />
            </div>
            <div className="min-w-0 max-w-4xl rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-semibold leading-7 text-slate-700 shadow-sm">
              {ans ? <FormattedAiResponse text={ans} /> : copy.greeting}
              {loading && (
                <span className="ml-3 inline-flex items-center gap-2 text-emerald-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-black text-slate-800">{copy.suggestionTitle}</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {copy.suggestions.map((suggestion, index) => {
                const icons = [Home, FileBadge, Info, Droplets, Users];
                const Icon = icons[index] || Info;
                return (
                  <button
                    className="flex min-h-16 items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/80 px-4 text-left text-xs font-black leading-5 text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    key={suggestion}
                    onClick={() => askSuggestion(suggestion)}
                    type="button"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-emerald-700" />
                    <span>{suggestion}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form className="mt-8 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_36px_rgba(15,23,42,0.08)] sm:p-4" onSubmit={SearchAns}>
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(e) => setquestion(e.target.value)}
                placeholder={copy.placeholder}
                type="text"
                value={qun}
              />
              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100" title="Attach file" type="button">
                <Paperclip size={21} />
              </button>
              <button
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition ${listening ? "bg-red-100 text-red-700" : "text-slate-500 hover:bg-slate-100"
                  }`}
                onClick={startVoiceQuestion}
                title={listening ? "Stop listening" : "Speak question"}
                type="button"
              >
                <Mic size={21} />
              </button>
              <button
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                disabled={loading}
                type="submit"
                title="Send question"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={21} />}
              </button>
            </div>
            {speechStatus && (
              <p className={`mt-3 text-xs font-bold ${listening ? "text-emerald-700" : "text-red-600"}`}>
                {speechStatus}
              </p>
            )}
          </form>

          <p className="mt-4 text-center text-xs font-bold text-slate-400">{copy.disclaimer}</p>
        </section>
      </div>
    </main>
  );
}

export default UserAI;
