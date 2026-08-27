import React, { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Phone, User, Calendar, ExternalLink, Image as ImageIcon } from "lucide-react";

function ViewEmergencyAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/get-all-emergency-alerts");
                const result = await response.json();
                if (response.ok && result.data) {
                    setAlerts(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch emergency alerts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) {
        return <div className="p-10 text-center font-bold text-neutral-500">Loading alerts...</div>;
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-red-900 flex items-center gap-3">
                    <AlertTriangle size={32} />
                    Emergency Alerts Received
                </h2>
                <p className="text-neutral-500 font-medium mt-2">
                    Manage and view all emergency alerts submitted by citizens.
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl text-center border border-neutral-200">
                    <p className="text-neutral-500 font-bold">No emergency alerts found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {alerts.map((alert) => (
                        <div key={alert._id} className="bg-white rounded-3xl border border-red-100 shadow-md shadow-red-900/5 overflow-hidden flex flex-col">
                            <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-start">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                        Emergency
                                    </span>
                                    <h3 className="font-black text-neutral-900 text-xl">{alert.name}</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4 flex-1">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                        <Phone size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-400">Caller Contact</p>
                                        <p className="font-black text-neutral-800">{alert.contact}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-400">Family/Friend Contact</p>
                                        <p className="font-black text-neutral-800">{alert.emrgencycontact}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex flex-col gap-3">
                                {alert.fileUrl && (
                                    <a 
                                        href={alert.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-100 transition"
                                    >
                                        <ImageIcon size={16} /> View Attached Evidence
                                    </a>
                                )}
                                
                                <a 
                                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-700 transition"
                                >
                                    <MapPin size={16} /> View Live Location
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ViewEmergencyAlerts;
