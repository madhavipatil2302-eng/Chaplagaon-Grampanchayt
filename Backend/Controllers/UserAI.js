// import dotenv from 'dotenv';
// import { GoogleGenAI } from "@google/genai";
// dotenv.config();


// const apikey= new GoogleGenAI({

//     apiKey:process.env.GOOGLE_GEMINI_KEY
// });


// function toSafeJson(value) {
//     return JSON.stringify(value ?? null, null, 2);
// }

// function buildPrompt({ qun, schemes, ongoingProjects, emptyVillageStatistics }) {
//     return `
// You are an AI assistant for this Gram Panchayat application.

// Internal API data available to you:
// - qun
// - schemes
// - ongoingProjects
// - emptyVillageStatistics

// Rules:
// 1. If the user asks anything related to schemes, ongoing projects, village statistics, population, households, area, literacy, or any information that belongs to these internal datasets, answer ONLY from the matching internal API data below.
// 2. Do not use outside knowledge for schemes, ongoing projects, or village statistics.
// 3. Do not assume, infer, or fabricate missing fields.
// 4. If the matching API data is empty, null, or does not contain the requested information, respond exactly:
// "This information is not available in the provided system data."
// 5. If an API response is empty or null for the requested internal-data topic, respond exactly:
// "No data is available for this request in the system."
// 6. If the user asks a general/external question unrelated to these datasets, answer from general knowledge and clearly say it is not based on internal API data.
// 7. If the user asks both an internal-data question and a general question, split the answer into:
// Internal System Data
// General Information
// 8. Never mix internal API data with external knowledge in the same answer.
// 9. Prioritize internal API data over general knowledge for anything related to schemes, ongoing projects, or village statistics.
// 10. Keep the answer in the language requested inside qun.
// 11. Format internal-data answers clearly. Use short headings and numbered or bullet points. Avoid one long paragraph.
// 12. Do not wrap the whole answer in markdown code blocks.

// Internal API Data:
// qun:
// ${qun}

// schemes:
// ${toSafeJson(schemes)}

// ongoingProjects:
// ${toSafeJson(ongoingProjects)}

// emptyVillageStatistics:
// ${toSafeJson(emptyVillageStatistics)}
// `.trim();
// }

// export const UserAI=async (req,res)=>{

//     const {qun, schemes = [], ongoingProjects = [], emptyVillageStatistics = null}=req.body;

//     if (!qun) {
//         return res.status(400).json({
//             success: false,
//             message: "Question is required",
//         });
//     }

//     try {
//     const response= await  apikey.models.generateContent({

//         model:'gemini-2.5-flash',
//         contents: buildPrompt({ qun, schemes, ongoingProjects, emptyVillageStatistics })
//     });

//     if(response)
//     {

//         return res.status(200).json({

//             success: true,
//             message:"User Response Is",
//             data:response.text
//         })
//     }
//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Unable to generate response",
//         });
//     }

// }
