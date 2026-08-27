import React, { useState, useEffect } from "react";
import { 
    MapPin, Phone, User, Mail, AlertTriangle, CheckCircle, Loader2, Building2, 
    UploadCloud, X, Home, ChevronRight, Navigation, Megaphone, Users, Camera, 
    Clock, FileText, Target, Bell, ShieldCheck, Shield, Send
} from "lucide-react";

function EmergencyContact() {
    const [formData, setFormData] = useState({
        emrgencycontact: "",
        contact: "",
        name: "",
        email: "",
    });
    const [file, setFile] = useState(null);
    const [location, setLocation] = useState({ latitude: "", longitude: "" });
    const [lastUpdated, setLastUpdated] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [officialContacts, setOfficialContacts] = useState([]);
    
    // Dialog state
    const [selectedService, setSelectedService] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchOfficialContacts = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/official-emergency-contacts");
                const result = await response.json();
                if (response.ok && result.data) {
                    setOfficialContacts(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch official contacts", error);
            }
        };
        fetchOfficialContacts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getLocation = () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLastUpdated(formatTime(new Date()));
                setLocationLoading(false);
            },
            (error) => {
                console.log("Location Error:", error);
                alert("Please allow location permission in your browser to use this feature.");
                setLocationLoading(false);
            }
        );
    };

    const openDialog = (contact = null) => {
        setSelectedService(contact);
        setIsDialogOpen(true);
        setStatus(null);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedService(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!location.latitude || !location.longitude) {
            alert("Please get your location first by clicking 'Share My Location'.");
            return;
        }
        
        setLoading(true);
        setStatus(null);
        
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("email", formData.email);
            submitData.append("contact", formData.contact);
            submitData.append("emrgencycontact", formData.emrgencycontact);
            submitData.append("latitude", location.latitude.toString());
            submitData.append("longitude", location.longitude.toString());
            
            if (selectedService?.email) {
                submitData.append("officialEmail", selectedService.email);
            }
            if (file) {
                submitData.append("file", file);
            }

            const response = await fetch("http://localhost:8000/api/emergency-contact", {
                method: "POST",
                body: submitData,
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setStatus("success");
                setFormData({ emrgencycontact: "", contact: "", name: "", email: "" });
                // We keep location so they don't have to fetch again
                setFile(null);
                
                setTimeout(() => {
                    closeDialog();
                }, 3000);
            } else {
                setStatus("error");
                alert(data.message || "Failed to submit request.");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            alert("Network error, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { icon: MapPin, label: "Share Live Location", color: "text-green-500", bg: "bg-green-50", action: getLocation },
        { icon: Megaphone, label: "Send Panic Alert", color: "text-red-500", bg: "bg-red-50", action: () => openDialog() },
        { icon: Users, label: "Notify Contacts", color: "text-purple-500", bg: "bg-purple-50", action: () => openDialog() },
        { icon: Camera, label: "Upload Photo/Video", color: "text-orange-500", bg: "bg-orange-50", action: () => openDialog() },
        { icon: FileText, label: "View My Alerts", color: "text-blue-500", bg: "bg-blue-50", action: () => {} },
        { icon: Clock, label: "Alert History", color: "text-teal-500", bg: "bg-teal-50", action: () => {} },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                    <Home size={16} className="text-blue-600" />
                    <ChevronRight size={14} />
                    <span className="text-blue-600 cursor-pointer hover:underline">Home</span>
                    <ChevronRight size={14} />
                    <span className="text-neutral-700">Emergency Services</span>
                </div>

                {/* Top Banner */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute right-10 top-0 opacity-10 pointer-events-none transform -translate-y-1/4 scale-150">
                        <AlertTriangle size={300} />
                    </div>

                    <div className="flex items-center gap-6 z-10 w-full lg:w-auto">
                        <div className="bg-white text-red-600 font-black text-3xl w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                            SOS
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Emergency Services</h1>
                            <p className="text-red-100 font-medium text-sm md:text-base max-w-lg">
                                Get instant help in any emergency. Your location will be shared with the nearest authorities and emergency contacts.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-red-500/50 pt-6 lg:pt-0 lg:pl-6">
                        <div className="text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                <MapPin size={16} className="text-red-200" />
                                <span className="text-white font-bold text-sm">Location Status</span>
                                {location.latitude ? (
                                    <span className="bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Enabled</span>
                                ) : (
                                    <span className="bg-red-900 text-white text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Pending</span>
                                )}
                            </div>
                            <p className="text-red-200 text-xs font-medium">
                                Last updated: {lastUpdated || "Not shared yet"}
                            </p>
                        </div>
                        <button 
                            onClick={getLocation}
                            disabled={locationLoading}
                            className="bg-white text-red-700 hover:bg-red-50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
                        >
                            {locationLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Fetching...</>
                            ) : (
                                <><Navigation size={18} /> Share My Location</>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Column: Emergency Contacts */}
                    <div className="xl:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-emerald-700 rounded-full"></div>
                            <h2 className="text-lg font-black text-neutral-800">Emergency Contacts</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {officialContacts.length > 0 ? (
                                officialContacts.map((contact, index) => (
                                    <div key={index} className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center overflow-hidden border-2 border-red-100">
                                                {contact.image ? (
                                                    <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    contact.serviceType.toLowerCase().includes("police") ? <ShieldCheck size={28} /> : 
                                                    contact.serviceType.toLowerCase().includes("ambulance") ? <AlertTriangle size={28} /> : 
                                                    <Building2 size={28} />
                                                )}
                                            </div>
                                            <a 
                                                href={`tel:${contact.contactNumber}`}
                                                className="border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition"
                                            >
                                                <Phone size={14} /> Call
                                            </a>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h3 className="font-black text-lg text-neutral-900 truncate">{contact.name}</h3>
                                            <p className="text-red-600 font-black text-lg mt-0.5">{contact.contactNumber}</p>
                                            <span className="inline-block mt-2 bg-neutral-100 text-neutral-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
                                                {contact.serviceType}
                                            </span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => openDialog(contact)}
                                            className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                        >
                                            <Send size={16} /> Send Live Alert
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-10 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-500 font-bold">
                                    No official emergency contacts added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Quick Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-emerald-700 rounded-full"></div>
                            <h2 className="text-lg font-black text-neutral-800">Quick Actions</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <button 
                                        key={index}
                                        onClick={action.action}
                                        className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-md transition flex flex-col items-center justify-center text-center gap-3 active:scale-95"
                                    >
                                        <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className="text-xs font-black text-neutral-700">{action.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-emerald-700 rounded-full"></div>
                        <h2 className="text-lg font-black text-neutral-800">How it works</h2>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
                        {/* Connecting Lines for Desktop */}
                        <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-neutral-100 -translate-y-1/2 z-0"></div>

                        {[
                            { icon: Target, title: "1. Tap Emergency", desc: "Press the emergency button to start.", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
                            { icon: MapPin, title: "2. Share Location", desc: "Your live location will be captured.", color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
                            { icon: Bell, title: "3. Alert Sent", desc: "Alerts will be sent to contacts & authorities.", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
                            { icon: ShieldCheck, title: "4. Help on the Way", desc: "Help will reach you as soon as possible.", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" }
                        ].map((step, index) => {
                            const StepIcon = step.icon;
                            return (
                                <React.Fragment key={index}>
                                    <div className="flex items-center gap-4 z-10 bg-white p-2">
                                        <div className={`w-14 h-14 rounded-full ${step.bg} ${step.color} border-2 ${step.border} flex items-center justify-center shrink-0`}>
                                            <StepIcon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-neutral-900 text-sm">{step.title}</h4>
                                            <p className="text-xs font-medium text-neutral-500 max-w-[140px] mt-0.5 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                    {index < 3 && (
                                        <ChevronRight className="hidden md:block text-neutral-300 z-10 bg-white px-1" size={32} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="bg-[#eaf4ec] rounded-2xl p-6 md:p-8 flex items-center justify-between relative overflow-hidden border border-emerald-100 mt-4">
                    <div className="flex items-center gap-4 z-10 relative">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shrink-0">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-emerald-950 text-lg">Your Safety, Our Priority</h3>
                            <p className="text-emerald-800 text-sm font-medium mt-1">
                                We are committed to your safety and well-being. Use emergency services responsibly.
                            </p>
                        </div>
                    </div>
                    {/* Decorative trees/houses mimicking the screenshot */}
                    <div className="hidden md:flex absolute right-0 bottom-0 items-end opacity-80 pointer-events-none">
                        <div className="w-8 h-12 bg-emerald-700 rounded-t-full mx-2 mb-2"></div>
                        <div className="w-10 h-16 bg-emerald-600 rounded-t-full mx-1 mb-2"></div>
                        <div className="w-24 h-16 bg-emerald-800 rounded-t-lg mx-4 relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[24px] border-b-emerald-800"></div>
                            <div className="absolute bottom-0 left-4 w-4 h-6 bg-white"></div>
                            <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-200"></div>
                        </div>
                        <div className="w-6 h-10 bg-emerald-700 rounded-t-full mx-2 mb-2"></div>
                    </div>
                </div>

            </div>

            {/* Dialog Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 my-8 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        
                        <div className="bg-red-600 p-6 flex items-center justify-between text-white">
                            <div>
                                <h3 className="text-2xl font-black">{selectedService ? `Alert: ${selectedService.name}` : "Send Emergency Alert"}</h3>
                                <p className="text-red-100 font-medium text-sm mt-1">This will send an immediate notification to the authorities.</p>
                            </div>
                            <button onClick={closeDialog} className="p-2 bg-red-700 hover:bg-red-800 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
                            {status === "success" && (
                                <div className="mb-8 bg-green-50 text-green-800 p-5 rounded-2xl flex items-start gap-4 border border-green-200">
                                    <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={24} />
                                    <div>
                                        <h4 className="text-lg font-black">Alert Sent Successfully</h4>
                                        <p className="text-sm font-medium mt-1">Help is on the way. Closing form automatically...</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-neutral-700">Full Name</label>
                                        <input 
                                            type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition font-medium"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-neutral-700">Email Address</label>
                                        <input 
                                            type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition font-medium"
                                            placeholder="Your Email"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-neutral-700">Your Contact No.</label>
                                        <input 
                                            type="tel" name="contact" value={formData.contact} onChange={handleChange} required
                                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition font-medium"
                                            placeholder="Your Mobile"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-neutral-700">Family/Friend Contact</label>
                                        <input 
                                            type="tel" name="emrgencycontact" value={formData.emrgencycontact} onChange={handleChange} required
                                            className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition font-medium"
                                            placeholder="Secondary Number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-neutral-700">Upload Photo/Evidence (Optional)</label>
                                    <div className="relative group border-2 border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50 hover:border-red-300 hover:bg-red-50 transition cursor-pointer text-center">
                                        <input 
                                            type="file" 
                                            onChange={handleFileChange} 
                                            accept="image/jpeg, image/png, audio/*, video/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                                            <UploadCloud className="text-red-500" size={28} />
                                            <span className="font-bold text-neutral-700">
                                                {file ? file.name : "Tap to upload a photo or file"}
                                            </span>
                                            {!file && <span className="text-xs text-neutral-400">Max size: 2MB (JPG, PNG)</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                                    <h3 className="font-black text-red-900 mb-3 flex items-center gap-2">
                                        <MapPin size={18} className="text-red-600" /> Live Location
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={getLocation}
                                            disabled={locationLoading}
                                            className="w-full sm:w-auto px-5 py-3 bg-white text-red-700 font-bold border border-red-200 rounded-xl hover:bg-red-50 transition shadow-sm flex justify-center items-center gap-2"
                                        >
                                            {locationLoading ? (
                                                <><Loader2 size={16} className="animate-spin" /> Fetching...</>
                                            ) : (
                                                <><MapPin size={16} /> Tap to get Location</>
                                            )}
                                        </button>
                                        <div className="flex-1 text-sm font-medium">
                                            {location.latitude ? (
                                                <div className="text-green-700 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Location locked</div>
                                            ) : (
                                                <p className="text-red-500 text-xs">* Required to dispatch services.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeDialog}
                                        className="w-1/3 py-4 rounded-xl font-black text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !location.latitude}
                                        className={`w-2/3 py-4 rounded-xl font-black text-white shadow-xl transition flex justify-center items-center gap-2 ${
                                            !location.latitude || loading
                                            ? "bg-red-300 shadow-none cursor-not-allowed"
                                            : "bg-red-600 hover:bg-red-700"
                                        }`}
                                    >
                                        {loading ? (
                                            <><Loader2 size={20} className="animate-spin" /> Sending...</>
                                        ) : (
                                            <><AlertTriangle size={20} /> Send Alert</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmergencyContact;