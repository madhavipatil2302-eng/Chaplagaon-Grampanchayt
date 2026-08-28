import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ViewNotificationById } from "../Services/GetNotification";
import { ArrowLeft, Calendar, Mail, Phone, User, Tag, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { UpdateStatusNotification } from "../Services/GetNotification";
import { resolveBackendAssetUrl } from "../Services/apiConfig";
// import { toast } from "react-toastify";


function ViewNotification() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setrole] = useState(null);
    // const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchNotificationDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await ViewNotificationById(id);
                if (response && response.success) {
                    setNotification(response.data);
                } else {
                    setError(response?.message || "Failed to load notification details.");
                }
            } catch (err) {
                console.error("Error loading notification by ID:", err);
                setError("An error occurred while loading notification details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNotificationDetails();
        }
    }, [id]);

    const [updatingStatus, setUpdatingStatus] = useState(false);

    const SetApprove = async (status) => {
        setUpdatingStatus(true);
        try {
            const Response = await UpdateStatusNotification(id, status);

            if (Response && Response.success) {
                setNotification((prev) => (prev ? { ...prev, status } : prev));
                toast.success(`Status successfully updated to ${status}!`);
            } else {
                toast.error(Response?.message || "Failed to update status.");
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error("Failed to update status.");
        } finally {
            setUpdatingStatus(false);
        }
    }

    useEffect(() => {
        const getAcesstoken = localStorage.getItem("accesstoken");
        if (getAcesstoken) {
            try {
                const decodeToken = jwtDecode(getAcesstoken);
                console.log("decoded token is :", decodeToken);
                setrole(decodeToken?.role || null);
            } catch (err) {
                console.error("Failed to decode token:", err);
            }
        }
    }, []);




    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 transition shadow-sm"
                    type="button"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <h1 className="text-2xl font-black text-emerald-950">Notification Details</h1>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm font-bold text-neutral-500">Loading Notification Details...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            ) : notification ? (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Token ID</span>
                            <h2 className="text-xl font-black text-neutral-900">{notification.token || notification._id}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${notification.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : notification.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                <Clock size={14} />
                                {notification.status ? notification.status.toUpperCase() : 'PENDING'}
                            </span>
                        </div>
                    </div>

                    {/* Main Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                            <div>
                                {notification?.file && <img src={resolveBackendAssetUrl(`/uploads/${notification.file}`)} alt="" />}

                            </div>
                            <User className="text-emerald-700 shrink-0" size={22} />


                            <div>
                                <p className="text-xs font-bold text-neutral-400">Citizen Name</p>
                                <p className="text-sm font-bold text-neutral-900">{notification.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                            <Mail className="text-emerald-700 shrink-0" size={22} />
                            <div>
                                <p className="text-xs font-bold text-neutral-400">Email Address</p>
                                <p className="text-sm font-bold text-neutral-900">{notification.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                            <Phone className="text-emerald-700 shrink-0" size={22} />
                            <div>
                                <p className="text-xs font-bold text-neutral-400">Contact Number</p>
                                <p className="text-sm font-bold text-neutral-900">{notification.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                            <Tag className="text-emerald-700 shrink-0" size={22} />
                            <div>
                                <p className="text-xs font-bold text-neutral-400">Category</p>
                                <p className="text-sm font-bold text-neutral-900">{notification.category || 'General'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Complaint Details */}
                    <div className="space-y-2 border-t border-neutral-100 pt-5">
                        <h3 className="text-sm font-black text-neutral-900 flex items-center gap-2">
                            <FileText size={18} className="text-emerald-700" />
                            Complaint Subject / Title
                        </h3>
                        <p className="text-base font-bold text-neutral-800 bg-neutral-50 p-4 rounded-xl">
                            {notification.complaintName || notification.complint || 'No Title Provided'}
                        </p>
                    </div>

                    {notification.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-black text-neutral-900">Full Description</h3>
                            <p className="text-sm font-semibold text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl whitespace-pre-wrap">
                                {notification.description}
                            </p>
                        </div>
                    )}
                    {
                        (role === "ApplicationAdmin" || role === "sarpanch" || role === "admin" || role === "DeputySarpanch" || role === "UpSarpanch") && (
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    disabled={updatingStatus}
                                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                                    onClick={() => SetApprove("approved")}
                                    type="button"
                                >
                                    {updatingStatus ? "Updating..." : "Approve"}
                                </button>
                                <button
                                    disabled={updatingStatus}
                                    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                                    onClick={() => SetApprove("rejected")}
                                    type="button"
                                >
                                    {updatingStatus ? "Updating..." : "Reject"}
                                </button>
                            </div>
                        )
                    }

                    {notification.createdAt && (
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 pt-2">
                            <Calendar size={14} />
                            Submitted on: {new Date(notification.createdAt).toLocaleString()}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default ViewNotification;