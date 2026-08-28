import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, ImagePlus, Loader2, MessageSquarePlus, Mic, Search, Send, Sparkles, UploadCloud } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { analyzeComplaint, analyzeComplaintFile, submitComplaintAI } from "../Services/UserAIService";

const initialForm = {
  name: "",
  email: "",
  contact: "",
};

const complaintCategories = ["Water Supply", "Road", "Street Light", "Sanitation", "Property Tax", "Certificate", "Public Works", "Other"];

function normalizeCategory(value) {
  const text = String(value || "").toLowerCase();

  if (text.includes("water") || text.includes("pani") || text.includes("pipe") || text.includes("drainage")) return "Water Supply";
  if (text.includes("road") || text.includes("rasta") || text.includes("pothole") || text.includes("khadda")) return "Road";
  if (text.includes("light") || text.includes("street") || text.includes("electric") || text.includes("pole")) return "Street Light";
  if (text.includes("sanitation") || text.includes("garbage") || text.includes("kachra") || text.includes("waste") || text.includes("clean")) return "Sanitation";
  if (text.includes("tax") || text.includes("property")) return "Property Tax";
  if (text.includes("certificate") || text.includes("birth") || text.includes("death") || text.includes("residence")) return "Certificate";
  if (text.includes("public") || text.includes("construction") || text.includes("building") || text.includes("work")) return "Public Works";

  return complaintCategories.includes(value) ? value : "Other";
}

function createComplaintId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `complaint-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSpeechLanguage() {
  const language = localStorage.getItem("i18nextLng") || navigator.language || "en-IN";

  if (language.startsWith("mr")) return "mr-IN";
  if (language.startsWith("hi")) return "hi-IN";

  return "en-IN";
}

function ComplaintRobot({ mood, message }) {
  return (
    <div className={`complaint-robot ${mood ? `complaint-robot-${mood}` : ""}`} aria-hidden="true">
      {message && <div className="complaint-robot-bubble">{message}</div>}
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

function ComplintAi() {
  const navigate = useNavigate();
  const [complaintId, setComplaintId] = useState(() => createComplaintId());
  const [complaint, setComplaint] = useState("");
  const [analysis, setAnalysis] = useState({ name: "", category: "", description: "" });
  const [details, setDetails] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [activeMic, setActiveMic] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [robotMessage, setRobotMessage] = useState("Hi! \u{1F44B}");
  const [robotMood, setRobotMood] = useState("greeting");
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  const fileNames = useMemo(() => files.map((file) => file.name).join(", "), [files]);
  const hasComplaintInput = complaint.trim() || files.length > 0;
  const canSubmit = (complaint.trim() || analysis.description.trim()) && analysis.name.trim() && analysis.category && analysis.description.trim() && details.name.trim() && details.email.trim() && details.contact.trim();

  function stopMic() {
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current = null;
    streamRef.current = null;
    setActiveMic("");
  }

  async function startMic(fieldName, applyTranscript) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (activeMic === fieldName) {
      stopMic();
      return;
    }

    if (!SpeechRecognition) {
      setStatus("Mic is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!window.isSecureContext) {
      setStatus("Mic works on localhost or HTTPS only.");
      return;
    }

    stopMic();
    setStatus("Starting mic...");

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("Mic permission check failed. Trying speech recognition...");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLanguage();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setActiveMic(fieldName);
      setStatus("Listening... speak now");
    };
    recognition.onend = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setActiveMic("");
    };
    recognition.onerror = (event) => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setActiveMic("");
      setStatus(event.error === "not-allowed" ? "Mic permission denied." : "Could not hear clearly. Please try again.");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      let isFinal = false;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index]?.[0]?.transcript || "";
        isFinal = isFinal || event.results[index]?.isFinal;
      }

      const text = transcript.trim();

      if (text) {
        applyTranscript(text);
      }

      if (isFinal) {
        setStatus("");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      stopMic();
      setStatus("Mic is already starting. Please try again.");
    }
  }

  async function analyzeCurrentComplaint() {
    const cleanComplaint = complaint.trim();

    if (!cleanComplaint && files.length === 0) {
      setStatus("Please write, speak, or upload complaint image first.");
      return;
    }

    setAnalyzing(true);
    setStatus(files[0] ? "AI is analyzing uploaded image..." : "AI is analyzing complaint...");

    try {
      const result = files[0]
        ? await analyzeComplaintFile(files[0])
        : await analyzeComplaint(cleanComplaint);
      const nextAnalysis = result?.data || {};

      if (result?.success === false) {
        setStatus(result.message || "Unable to analyze complaint.");
        return;
      }

      setAnalysis({
        name: nextAnalysis.name || cleanComplaint.slice(0, 60) || files[0]?.name || "Uploaded Image Complaint",
        category: normalizeCategory(nextAnalysis.category || nextAnalysis.name || nextAnalysis.description || files[0]?.name),
        description: nextAnalysis.description || cleanComplaint || "Complaint image uploaded for review.",
      });

      if (!cleanComplaint && nextAnalysis.description) {
        setComplaint(nextAnalysis.description);
      }

      setStatus(result.message || "Complaint analyzed. Please verify details.");
    } finally {
      setAnalyzing(false);
    }
  }

  function updateDetail(fieldName, value) {
    setDetails((current) => ({ ...current, [fieldName]: value }));
  }

  function handleComplaintChange(value) {
    setComplaint(value);

    if (!["greeting", "dancing", "leaving", "celebrating"].includes(robotMood)) {
      setRobotMood(value.trim() ? "listening" : "idle");
    }
  }

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 5);

    setFiles(selectedFiles);
    setAnalysis({ name: "", category: "", description: "" });
    setStatus(selectedFiles[0] ? "Image uploaded. Click Analyze to fill complaint details." : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) {
      setStatus("Please complete complaint, AI analysis and user details.");
      return;
    }

    setSubmitting(true);
    setStatus("Submitting complaint...");

    const result = await submitComplaintAI({
      token: complaintId,
      complaintName: analysis.name.trim(),
      complint: complaint.trim() || analysis.description.trim(),
      description: analysis.description.trim(),
      category: analysis.category,
      name: details.name.trim(),
      email: details.email.trim(),
      contact: details.contact.trim(),
      files,
    });

    setSubmitting(false);

    if (result?.success === false) {
      setStatus(result.message || "Complaint submit failed.");
      return;
    }

    setStatus(`Complaint submitted successfully. ID: ${complaintId}`);
    setRobotMood("celebrating");
    setRobotMessage("Done!");
    setComplaint("");
    setAnalysis({ name: "", category: "", description: "" });
    setDetails(initialForm);
    setFiles([]);
    setComplaintId(createComplaintId());
    window.setTimeout(() => {
      setRobotMessage("");
      setRobotMood("idle");
    }, 1800);
  }

  function handleBack(event) {
    event.preventDefault();
    stopMic();
    setRobotMessage("Bye! \u{1F44B}");
    setRobotMood("leaving");
    window.setTimeout(() => navigate("/user-ai"), 850);
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
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,#dffcf1_0,#f7fbff_35%,#f8fafc_70%)] px-4 py-5 text-slate-950 sm:px-6" data-no-translate="true">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="mb-2 flex overflow-x-auto border-b border-slate-200 whitespace-nowrap">
          <Link
            to="/user-ai"
            className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <Bot size={18} />
            Grampanchayat AI
          </Link>
          <Link
            to="/complint-ai"
            className="flex items-center gap-2 border-b-2 border-emerald-600 px-4 py-3 text-sm font-black text-emerald-700 transition"
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
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_48%,#e0f2fe_100%)]" />
          <div className="relative grid gap-8 px-5 py-7 sm:px-8 md:grid-cols-[minmax(0,13fr)_minmax(220px,7fr)] md:items-center md:gap-12">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1 text-[11px] font-black uppercase text-emerald-800 shadow-sm">
                <Bot size={14} />
                Complaint AI
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950 sm:text-5xl">Smart Complaint Assistant</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                Write or speak your complaint. AI will select the category and description, then collect citizen details before submission.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2 text-xs font-black text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                ID: {complaintId}
              </div>
            </div>
            <div className="flex min-h-60 items-center justify-center overflow-hidden rounded-xl px-5 py-7 md:min-h-64 lg:min-h-72">
              <ComplaintRobot message={robotMessage} mood={robotMood} />
            </div>
          </div>
        </section>

        <form className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950">Complaint</h2>
                <p className="text-xs font-bold text-slate-500">Manual write or mic input</p>
              </div>
            </div>

            <div className="mt-5">
              <textarea
                className="min-h-36 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                onChange={(event) => handleComplaintChange(event.target.value)}
                placeholder="Write complaint here..."
                value={complaint}
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className={`inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-black transition ${activeMic === "complaint" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  onClick={() => startMic("complaint", setComplaint)}
                  type="button"
                >
                  <Mic size={18} />
                  {activeMic === "complaint" ? "Stop Mic" : "Speak Complaint"}
                </button>
                <button
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  disabled={analyzing || !hasComplaintInput}
                  type="button"
                  onClick={analyzeCurrentComplaint}
                >
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={18} />}
                  Analyze
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-black uppercase text-slate-500">Complaint Name</span>
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setAnalysis((current) => ({ ...current, name: event.target.value }))}
                  placeholder="AI generated complaint name will appear here"
                  value={analysis.name}
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-500">Category</span>
                <select
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setAnalysis((current) => ({ ...current, category: event.target.value }))}
                  value={analysis.category}
                >
                  <option value="">Select category</option>
                  {complaintCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-black uppercase text-slate-500">AI Description</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  onChange={(event) => setAnalysis((current) => ({ ...current, description: event.target.value }))}
                  placeholder="AI generated description will appear here"
                  value={analysis.description}
                />
              </label>
            </div>

            <label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 px-4 text-center transition hover:bg-emerald-50">
              <ImagePlus className="h-7 w-7 text-emerald-700" />
              <span className="text-sm font-black text-slate-800">Upload complaint images</span>
              <span className="text-xs font-bold text-slate-500">
                {analyzing && files[0] ? "Analyzing image..." : fileNames || "Up to 5 images"}
              </span>
              <input accept="image/png,image/jpeg" className="hidden" multiple onChange={handleFiles} type="file" />
            </label>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                <UploadCloud size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950">User Details</h2>
                <p className="text-xs font-bold text-slate-500">You can fill details using mic</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[
                ["name", "Full name", "Enter citizen name"],
                ["email", "Email", "Enter email address"],
                ["contact", "Contact", "Enter mobile number"],
              ].map(([fieldName, label, placeholder]) => (
                <label className="block" key={fieldName}>
                  <span className="text-xs font-black uppercase text-slate-500">{label}</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      onChange={(event) => updateDetail(fieldName, event.target.value)}
                      placeholder={placeholder}
                      type={fieldName === "email" ? "email" : "text"}
                      value={details[fieldName]}
                    />
                    <button
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg transition ${activeMic === fieldName ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      onClick={() => startMic(fieldName, (text) => updateDetail(fieldName, text))}
                      title={`Speak ${label}`}
                      type="button"
                    >
                      <Mic size={19} />
                    </button>
                  </div>
                </label>
              ))}
            </div>

            {status && (
              <p className={`mt-5 rounded-lg px-4 py-3 text-sm font-bold ${status.includes("successfully") ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"}`}>
                {status}
              </p>
            )}

            <button
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
              disabled={submitting || !canSubmit}
              type="submit"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={19} />}
              Submit Complaint
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

export default ComplintAi;


