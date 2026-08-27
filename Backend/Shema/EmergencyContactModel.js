import mongoose from "mongoose";

const EmergencyContactSchema = new mongoose.Schema({

    emrgencycontact: {

        type: String,
        required: true
    },

    contact: {

        type: String,
        required: true
    },

    name: {

        type: String,
        required: true
    },

    latitude: {

        type: String,
        required: true
    },

    longitude: {
        type: String,
        required: true
    },

    fileUrl: {
        type: String,
        required: false
    }
});

export const EmergencyContactModel = mongoose.model("emergencyContacts", EmergencyContactSchema);
