import mongoose from "mongoose";

const complintSchema = new mongoose.Schema({


    complint: {

        type: String,

    },
    complaintName: {

        type: String,

    },
    category: {

        type: String,

    },
    description: {

        type: String
    },
    name: {

        type: String,

    },
    email: {

        type: String
    },
    phone: {

        type: String
    },

    file: {

        type: String
    },
    files: [{

        type: String
    }],
    aiResponse: {

        type: String
    },

    status: {

        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
    },
    comment: {

        type: String

    },
    token: {

        type: String,
        default: () => `CMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        unique: true
    },

    createdAt: {

        type: Date,
        default: Date.now
    }

})

const ComplintModel = mongoose.model("complints", complintSchema);

export default ComplintModel;
