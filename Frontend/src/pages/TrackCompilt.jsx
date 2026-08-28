import React, { useState } from "react";
import { 
    Search, ClipboardList, Bot, MessageSquarePlus,
    CheckCircle2, Settings, Building, CheckCircle, 
    Calendar, History, User, CalendarDays, 
    Info, Bell, FileText, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { TrackToken } from "../Services/TractokenServices.jsx";
import { resolveBackendAssetUrl } from "../Services/apiConfig.jsx";

function TrackCompilt() {
    const [tokenId, setTokenId] = useState("");
    const [tokenData, setTokenData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handletrack = async (e) => {
        e.preventDefault();
        if (!tokenId.trim()) return;
        setError("");
        setLoading(true);
        const response = await TrackToken(tokenId);
        if (response?.success) {
            setTokenData(response.data);
        } else {
            setError(response?.message || "Error fetching token");
            setTokenData(null);
        }
        setLoading(false);
    }

    const formatDate = (dateString) => {
        if (!dateString) return "22 May 2025, 10:30 AM";
        try {
            return new Date(dateString).toLocaleString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric', 
                hour: '2-digit', minute: '2-digit', hour12: true 
            });
        } catch {
            return "22 May 2025, 10:30 AM";
        }
    }

    // Determine step status based on API status
    const currentStatus = tokenData?.status || "Pending";
    const steps = [
        { id: 1, title: "Complaint Registered", date: formatDate(tokenData?.createdAt), icon: ClipboardList, active: true, completed: true },
        { id: 2, title: "Under Process", date: currentStatus === "In Progress" || currentStatus === "Resolved" ? formatDate(tokenData?.updatedAt) : "Pending", icon: Settings, active: currentStatus === "In Progress" || currentStatus === "Resolved", completed: currentStatus === "Resolved" || currentStatus === "In Progress" },
        { id: 3, title: "Field Inspection", date: "Pending", icon: Building, active: false, completed: false },
        { id: 4, title: "Resolved", date: currentStatus === "Resolved" ? formatDate(tokenData?.updatedAt) : "Pending", icon: CheckCircle, active: currentStatus === "Resolved", completed: currentStatus === "Resolved" }
    ];

    return (
        <main className="min-h-full bg-[radial-gradient(circle_at_top_left,#dffcf1_0,#f7fbff_35%,#f8fafc_70%)] px-4 py-5 text-slate-950 sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
                
                {/* Tab Navigation */}
                <div className="mb-2 flex border-b border-slate-200">
                    <Link
                        to="/user-ai"
                        className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
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
                        className="flex items-center gap-2 border-b-2 border-emerald-600 px-4 py-3 text-sm font-black text-emerald-700 transition"
                    >
                        <Search size={18} />
                        Track Complaint
                    </Link>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Top Section */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
                        <div className="flex flex-col-reverse items-start justify-between gap-6 md:flex-row md:items-center">
                            <div className="w-full md:max-w-md">
                                <h1 className="mb-6 text-3xl font-black text-slate-900">Track Complaint</h1>
                                <form onSubmit={handletrack} className="flex flex-col gap-3 sm:flex-row">
                                    <input 
                                        type="text" 
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50"
                                        placeholder="Enter Complaint Token ID..."
                                        value={tokenId} 
                                        onChange={(e) => setTokenId(e.target.value)} 
                                    />
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-6 text-sm font-bold text-white transition hover:bg-[#0d645c] disabled:opacity-70"
                                    >
                                        <Search size={18} />
                                        Track
                                    </button>
                                </form>
                                {error && <p className="mt-3 text-sm font-bold text-red-500">{error}</p>}
                            </div>
                            
                            {/* Illustration Mockup */}
                            <div className="hidden h-32 w-48 shrink-0 md:block">
                                <div className="relative h-full w-full rounded-xl bg-emerald-50">
                                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                                        <ClipboardList size={60} className="text-emerald-200" />
                                        <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-700 p-2 text-white">
                                            <Search size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        {tokenData && (
                            <div className="mt-12 mb-4 px-2">
                                <div className="relative flex justify-between">
                                    <div className="absolute left-0 top-6 h-1 w-full bg-slate-100">
                                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: currentStatus === "Resolved" ? '100%' : currentStatus === "In Progress" ? '33%' : '0%' }} />
                                    </div>
                                    {steps.map((step, idx) => (
                                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] bg-white transition-colors duration-300 ${step.completed ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-400"} ${step.active && !step.completed ? "border-emerald-500 text-emerald-600" : ""}`}>
                                                <step.icon size={20} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-sm font-bold ${step.active || step.completed ? "text-slate-900" : "text-slate-500"}`}>{step.title}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">{step.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Complaint Details Card */}
                    {tokenData && (
                        <div className="rounded-xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] overflow-hidden">
                            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={20} className="text-emerald-700" />
                                    <h2 className="text-lg font-black text-slate-900">Complaint Details</h2>
                                </div>
                                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                                    currentStatus === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                                    currentStatus === "In Progress" ? "bg-blue-50 text-blue-700 border border-blue-200" : 
                                    "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                    <Info size={14} />
                                    <span>Status: {currentStatus}</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
                                    {/* Image */}
                                    <div className="w-full">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                                            {tokenData.file ? (
                                                <img 
                                                    src={resolveBackendAssetUrl(`/uploads/${tokenData.file}`)} 
                                                    alt="Complaint Proof" 
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <FileText size={48} className="opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col justify-center">
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3">
                                            <div className="col-span-2 sm:col-span-1">
                                                <p className="text-xs font-semibold text-slate-500">Complaint ID</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{tokenData.token}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Name</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{tokenData.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-500">Phone</p>
                                                <p className="mt-1 text-sm font-bold text-slate-900">{tokenData.phone}</p>
                                            </div>
                                            
                                            <div className="col-span-2 sm:col-span-3">
                                                <p className="text-xs font-semibold text-slate-500">Category</p>
                                                <div className="mt-1.5 inline-block rounded-md bg-[#dcfce7] px-2.5 py-1 text-xs font-bold text-emerald-800">
                                                    {tokenData.category}
                                                </div>
                                            </div>

                                            <div className="col-span-2 sm:col-span-3">
                                                <p className="text-xs font-semibold text-slate-500">Description</p>
                                                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
                                                    {tokenData.description || tokenData.complint}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4">
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                        <div className="rounded-lg bg-white p-2 shadow-sm"><Calendar size={20} className="text-slate-600" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500">Date of Complaint</p>
                                            <p className="mt-0.5 text-xs font-bold text-slate-900">{formatDate(tokenData.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                        <div className="rounded-lg bg-white p-2 shadow-sm"><History size={20} className="text-slate-600" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500">Last Updated</p>
                                            <p className="mt-0.5 text-xs font-bold text-slate-900">{formatDate(tokenData.updatedAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                        <div className="rounded-lg bg-white p-2 shadow-sm"><User size={20} className="text-slate-600" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500">Assigned To</p>
                                            <p className="mt-0.5 text-xs font-bold text-slate-900">Gram Sevak Team</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                        <div className="rounded-lg bg-white p-2 shadow-sm"><CalendarDays size={20} className="text-slate-600" /></div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-500">Expected Resolution</p>
                                            <p className="mt-0.5 text-xs font-bold text-slate-900">30 May 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notification Banner */}
                            <div className="flex items-center justify-between bg-[#f0fdf4] px-6 py-4 border-t border-emerald-100">
                                <div className="flex items-center gap-2 text-emerald-800">
                                    <Info size={18} />
                                    <span className="text-sm font-bold">Important Note</span>
                                    <span className="ml-2 text-sm font-medium text-emerald-700 hidden sm:inline">You will be notified once there is an update in your complaint status.</span>
                                </div>
                                <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-900">
                                    <Bell size={14} />
                                    Get Updates
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default TrackCompilt;