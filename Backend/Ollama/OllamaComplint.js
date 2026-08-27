
import ollama from "ollama";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import { AddComplint } from "../Controllers/ComplintController.js";

const COMPLAINT_IMAGE_PROMPT = `
Analyze this Gram Panchayat complaint image.
Return only JSON with this exact shape:
{"name":"short complaint title","category":"Water Supply | Road | Street Light | Sanitation | Property Tax | Certificate | Public Works | Other","description":"clear complaint description based on visible issue"}

If the image does not show a civic complaint, use category "Other" and describe what is visible.
`;

function extractJson(text) {
    const match = String(text || "").match(/\{[\s\S]*\}/);

    if (!match) {
        return null;
    }

    try {
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
}

function inferComplaintFromFileName(fileName = "") {
    const normalizedName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
    const lowerName = normalizedName.toLowerCase();
    const categoryRules = [
        ["Water Supply", ["water", "pani", "pipe", "drainage", "nala"]],
        ["Road", ["road", "rasta", "khadda", "pothole"]],
        ["Street Light", ["light", "street", "electric", "pole"]],
        ["Sanitation", ["garbage", "kachra", "waste", "clean", "toilet"]],
        ["Property Tax", ["tax", "property"]],
        ["Certificate", ["certificate", "birth", "death", "residence"]],
        ["Public Works", ["construction", "school", "building", "work"]],
    ];
    const matchedCategory = categoryRules.find(([, words]) => words.some((word) => lowerName.includes(word)))?.[0] || "Other";
    const title = normalizedName ? `${matchedCategory} Complaint` : "Uploaded Image Complaint";

    return {
        name: title,
        category: matchedCategory,
        description: normalizedName
            ? `${normalizedName} related complaint image uploaded for review.`
            : "Complaint image uploaded for review.",
    };
}

async function analyzeWithOllamaVision(imageBase64) {
    const response = await ollama.chat({
        model: process.env.OLLAMA_VISION_MODEL || "llama3.2-vision:latest",
        messages: [
            {
                role: "user",
                content: COMPLAINT_IMAGE_PROMPT,
                images: [imageBase64],
            }
        ],
        options: {
            temperature: 0.1,
            num_predict: 180,
        },
    });

    return extractJson(response?.message?.content);
}

async function analyzeWithGeminiVision(imageBase64, mimeType) {
    if (!process.env.GOOGLE_GEMINI_KEY) {
        return null;
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GEMINI_KEY,
    });
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash",
        contents: [
            {
                inlineData: {
                    data: imageBase64,
                    mimeType,
                },
            },
            {
                text: COMPLAINT_IMAGE_PROMPT,
            },
        ],
    });

    return extractJson(response?.text);
}

export const AnalyzeComplaintFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File is required"
            });
        }

        const imageBase64 = await fs.readFile(req.file.path, { encoding: "base64" });
        let parsed = null;
        let provider = "fallback";

        try {
            parsed = await analyzeWithOllamaVision(imageBase64);
            provider = parsed ? "ollama" : provider;
        } catch (err) {
            console.log("Ollama vision failed", err.message);
        }

        if (!parsed) {
            try {
                parsed = await analyzeWithGeminiVision(imageBase64, req.file.mimetype);
                provider = parsed ? "gemini" : provider;
            } catch (err) {
                console.log("Gemini vision failed", err.message);
            }
        }

        const fallback = inferComplaintFromFileName(req.file.originalname);

        return res.status(200).json({
            success: true,
            data: {
                name: parsed?.name || fallback.name,
                category: parsed?.category || fallback.category,
                description: parsed?.description || fallback.description,
                provider,
            },
            message: provider === "fallback"
                ? "AI image analysis is not available right now. Filled details from file name."
                : "Uploaded file analyzed successfully."
        });
    } catch (err) {
        console.log("Complaint file AI Error", err.message);

        return res.status(500).json({
            success: false,
            message: "Unable to analyze uploaded file"
        });
    }
}



const OllamaComplint = async (req, res) => {


    try {

        const { complint, complaintName, description, category, name, email, contact, token } = req.body;
        if (!complint || !description || !category || !name || !email || !contact) {

            return res.status(400).json({

                success: false,
                message: "All fields are required"
            })
        }

        const response = await ollama.chat({

            model: process.env.OLLAMA_MODEL || "llama3.2:3b",
            messages: [
                {
                    role: "user",
                    content: `
You are a precise and accurate AI assistant.
Read the full question carefully and answer exactly what the user asked.
Do not give vague filler.
For simple questions, answer directly in 1 to 3 lines.
For broad questions, give a useful answer with clear bullet points.
Use the language requested by the user.

User question:
${complint}
`
                }
            ]
        });

        const fileNames = Array.isArray(req.files) ? req.files.map((file) => file.filename) : [];
        const complaint = await AddComplint({
            complint,
            complaintName,
            description,
            category,
            name,
            email,
            contact,
            file: fileNames[0] || "",
            files: fileNames,
            aiResponse: response?.message?.content || "",
            token,
        });

        return res.status(200).json({

            success: true,
            message: "Complint Added Successfully",
            data: complaint
        });

    } catch (err) {
        console.log("Complaint AI Error", err.message);

        return res.status(500).json({


            success: false,
            message: "Internal Server Error"
        })
    }
}

export default OllamaComplint;
