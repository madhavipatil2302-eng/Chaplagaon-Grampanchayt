import { EmergencyContactModel } from "../Shema/EmergencyContactModel.js";
import { OfficialEmergencyContactModel } from "../Shema/OfficialEmergencyContactModel.js";
import Transpoter from "../EmailSetup/Email.js";
import { getUploadedFileUrl } from "../Uploadfile/fileupload.js";

export const GetEmergencyContact = async (req, res) => {

    try {

        const emergencyType = req.body.emrgencycontact ?? req.body.emergencyContact ?? req.body.emergencycontact ?? "";
        const contactNumber = req.body.contact ?? req.body.phone ?? req.body.mobileNumber ?? "";
        const personName = req.body.name ?? "";
        const latitude = req.body.latitude ?? "";
        const longitude = req.body.longitude ?? "";
        const email = req.body.email ?? "";
        const officialEmail = req.body.officialEmail ?? req.body.official_email ?? "";

        if (!emergencyType || !contactNumber || !personName || !latitude || !longitude || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        let fileUrl = "";
        if (req.file) {
            fileUrl = await getUploadedFileUrl(req.file);
            if (fileUrl && !/^https?:\/\//i.test(fileUrl)) {
                fileUrl = `${req.protocol}://${req.get("host")}${fileUrl}`;
            }
        }

        const Response = await EmergencyContactModel.create({
            emrgencycontact: emergencyType,
            contact: contactNumber,
            name: personName,
            latitude: latitude,
            longitude: longitude,
            fileUrl: fileUrl,
        });

        if (!Response) {
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
        if (Response) {

            try {
                let toEmails = email;
                
                if (officialEmail) {
                    toEmails = [email, officialEmail].join(',');
                } else {
                    const officialContacts = await OfficialEmergencyContactModel.find({});
                    const officialEmails = officialContacts.map(c => c.email).filter(e => e);
                    toEmails = [email, ...officialEmails].join(',');
                }

                let emailText = `EMERGENCY ALERT!\n\nName: ${personName}\nContact: ${contactNumber}\nEmergency Contact Provided: ${emergencyType}\n\nLive Location: https://www.google.com/maps?q=${latitude},${longitude}\n\nPlease take immediate action.`;
                
                if (fileUrl) {
                    emailText += `\n\nAttached Evidence: ${fileUrl}`;
                }

                await Transpoter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: toEmails,
                    subject: "URGENT: Emergency Contact Alert",
                    text: emailText
                });
            } catch (emailError) {
                console.error("Email Error:", emailError);
            }

            return res.status(200).json({
                message: "Emergency Contact Added Successfully",
                data: Response
            })

        }


    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const AddOfficialEmergencyContact = async (req, res) => {
    try {
        const serviceType = req.body.serviceType ?? req.body.service_type ?? "";
        const name = req.body.name ?? "";
        const contactNumber = req.body.contactNumber ?? req.body.contact_number ?? req.body.phone ?? "";
        const email = req.body.email ?? "";

        if (!serviceType || !name || !contactNumber || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let image = "";
        if (req.file) {
            image = await getUploadedFileUrl(req.file);
            if (image && !/^https?:\/\//i.test(image)) {
                image = `${req.protocol}://${req.get("host")}${image}`;
            }
        }

        const newContact = await OfficialEmergencyContactModel.create({
            serviceType,
            name,
            contactNumber,
            email,
            image
        });

        return res.status(201).json({
            message: "Official Emergency Contact Added Successfully",
            data: newContact
        });
    } catch (error) {
        console.error("AddOfficialEmergencyContact Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const GetOfficialEmergencyContacts = async (req, res) => {
    try {
        const contacts = await OfficialEmergencyContactModel.find({});
        return res.status(200).json({
            message: "Fetched Successfully",
            data: contacts
        });
    } catch (error) {
        console.error("GetOfficialEmergencyContacts Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const GetAllEmergencyAlerts = async (req, res) => {
    try {
        const alerts = await EmergencyContactModel.find({}).sort({ _id: -1 });
        return res.status(200).json({
            message: "Fetched Successfully",
            data: alerts
        });
    } catch (error) {
        console.error("GetAllEmergencyAlerts Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};