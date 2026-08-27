import React, { useState } from "react";
import { Building2, Phone, Mail, CheckCircle, Loader2, Save, UploadCloud } from "lucide-react";
import { BASE_URL } from "../Services/apiConfig";

function AddOfficialEmergencyContact() {
    const [formData, setFormData] = useState({
        serviceType: "Police",
        name: "",
        contactNumber: "",
        email: "",
    });
    const [file, setFile] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        
        try {
            const submitData = new FormData();
            submitData.append("serviceType", formData.serviceType);
            submitData.append("name", formData.name);
            submitData.append("contactNumber", formData.contactNumber);
            submitData.append("email", formData.email);
            
            if (file) {
                submitData.append("file", file);
            }

            const response = await fetch(`${BASE_URL}/api/official-emergency-contact`, {
                method: "POST",
                body: submitData,
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setStatus("success");
                setFormData({
                    serviceType: "Police",
                    name: "",
                    contactNumber: "",
                    email: "",
                });
                setFile(null);
                
                setTimeout(() => setStatus(null), 3000);
            } else {
                setStatus("error");
                alert(data.message || "Failed to add contact.");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            alert("Network error, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-emerald-950">Add Official Emergency Contact</h2>
                <p className="text-neutral-500 font-medium mt-2">
                    Add contacts for Police, Ambulance, Fire Brigade, etc. These will be visible to the public during emergencies and will receive automatic alerts.
                </p>
            </div>

            {status === "success" && (
                <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-xl flex items-center gap-3 border border-green-200">
                    <CheckCircle className="text-green-600 shrink-0" size={20} />
                    <span className="font-bold">Emergency Contact added successfully!</span>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-900/5 overflow-hidden border border-neutral-100">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="space-y-2">
                            <label className="text-sm font-black text-neutral-700">Service Type</label>
                            <select 
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition font-medium text-neutral-800"
                            >
                                <option value="Police">Police</option>
                                <option value="Ambulance">Ambulance / Hospital</option>
                                <option value="Fire Brigade">Fire Brigade</option>
                                <option value="Disaster Management">Disaster Management</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-neutral-700">Department / Organization Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building2 size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition font-medium placeholder:font-normal placeholder:text-neutral-400"
                                    placeholder="e.g. City Police Station"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-black text-neutral-700">Contact Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input 
                                    type="tel" 
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition font-medium placeholder:font-normal placeholder:text-neutral-400"
                                    placeholder="e.g. 100, 108 or landline"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-neutral-700">Alert Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-neutral-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition font-medium placeholder:font-normal placeholder:text-neutral-400"
                                    placeholder="Emergency alert email"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-black text-neutral-700">Service Image / Icon</label>
                            <div className="relative group border-2 border-dashed border-neutral-200 rounded-xl p-4 bg-neutral-50 hover:border-emerald-300 hover:bg-emerald-50 transition cursor-pointer text-center">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept="image/jpeg, image/png"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <UploadCloud className="text-emerald-500" size={28} />
                                    <span className="font-bold text-neutral-700">
                                        {file ? file.name : "Tap to upload image/icon for this service"}
                                    </span>
                                    {!file && <span className="text-xs text-neutral-400">Max size: 2MB (JPG, PNG)</span>}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3.5 rounded-xl font-black text-white shadow-xl transition-all flex items-center gap-2 ${
                                loading
                                ? "bg-emerald-400 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:scale-95"
                            }`}
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={20} /> Save Contact</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddOfficialEmergencyContact;
