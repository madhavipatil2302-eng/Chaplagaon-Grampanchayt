import ollama from "ollama";

const DEFAULT_TIMEOUT_MS = 30000;

function toSafeJson(value) {
    return JSON.stringify(value ?? null);
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function extractUserQuestion(value) {
    const text = String(value || "").trim();
    const match = text.match(/(?:^|\n)\s*Question:\s*([\s\S]*)$/i);
    return (match?.[1] || text).trim();
}

function hasAnyWord(text, words) {
    return words.some((word) => text.includes(word));
}

function isInternalQuestion(question) {
    const text = normalizeText(question);

    return hasAnyWord(text, [
        "scheme", "yojana", "project", "population", "household", "literacy", "area", "statistics",
        "budget", "contractor", "status", "योजना", "प्रकल्प", "लोकसंख्या", "साक्षरता", "आकडेवारी",
    ]);
}

function buildPrompt({ qun, schemes, ongoingProjects, emptyVillageStatistics }) {
    const userQuestion = extractUserQuestion(qun);
    const internalQuestion = isInternalQuestion(userQuestion);

    if (!internalQuestion) {
        return `
You are a precise and accurate AI assistant.
Read the full question carefully and answer exactly what the user asked.
Do not give vague filler.
For simple questions, answer directly in 1 to 3 lines.
For broad questions, give a useful answer with clear bullet points.
Use the language requested by the user.

User question:
${qun}
`.trim();
    }

    return `
You are a precise AI assistant for this Gram Panchayat application.

Rules:
1. For schemes, ongoing projects, and village statistics, answer only from the internal data below.
2. Do not invent missing internal data.
3. If matching internal data is empty, say: "No data is available for this request in the system."
4. If data exists, give a clear complete answer with headings and bullets.
5. Use the language requested by the user.
6. Do not mention timeout, server, API, or internal errors.

User question:
${qun}

Internal data:
schemes:
${toSafeJson(schemes)}

ongoingProjects:
${toSafeJson(ongoingProjects)}

villageStatistics:
${toSafeJson(emptyVillageStatistics)}
`.trim();
}

function isValidAnswer(answer) {
    const text = String(answer || "").trim();
    const lowerText = text.toLowerCase();

    return text.length >= 2
        && !lowerText.includes("timed out")
        && !lowerText.includes("internal server")
        && !lowerText.includes("could not reach")
        && !lowerText.includes("api key")
        && !lowerText.includes("quota exceeded")
        && !lowerText.includes("please try again");
}

async function generateOllamaAnswer(prompt) {
    const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || "qwen3:0.6b",
        keep_alive: "30m",
        think: false,
        messages: [{ role: "user", content: prompt }],
        options: {
            temperature: Number(process.env.OLLAMA_TEMPERATURE || 0.1),
            num_predict: Number(process.env.OLLAMA_NUM_PREDICT || 140),
            num_ctx: Number(process.env.OLLAMA_NUM_CTX || 1024),
            top_p: 0.85,
            repeat_penalty: 1.1,
        },
    });

    const answer = response?.message?.content || response?.message?.thinking || "";

    if (!isValidAnswer(answer)) {
        throw new Error("AI returned an incomplete answer.");
    }

    return { answer, provider: "ollama" };
}

async function generateAnswer(prompt) {
    return generateOllamaAnswer(prompt);
}

async function OllamaSetup(req, res) {
    try {
        const {
            qun,
            schemes = [],
            ongoingProjects = [],
            emptyVillageStatistics = null,
        } = req.body ?? {};

        if (!qun || typeof qun !== "string" || !qun.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        const prompt = buildPrompt({
            qun: qun.trim(),
            schemes,
            ongoingProjects,
            emptyVillageStatistics,
        });
        const response = await generateAnswer(prompt);

        return res.status(200).json({
            success: true,
            data: response.answer,
            provider: response.provider,
        });
    } catch (err) {
        console.log("AI Error", err.message);

        return res.status(200).json({
            success: false,
            message: "Ollama could not generate an answer right now. Please check that the Ollama app is running and the selected model is available.",
        });
    }
}

export default OllamaSetup;
