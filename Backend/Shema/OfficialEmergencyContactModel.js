import mongoose from "mongoose";

const OfficialEmergencyContactSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    }
});

export const OfficialEmergencyContactModel = mongoose.model("officialEmergencyContacts", OfficialEmergencyContactSchema);
