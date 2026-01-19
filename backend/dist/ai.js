"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
// AI Configuration
const VERTEX_AI_ENDPOINT = process.env.VERTEX_AI_ENDPOINT || "";
const VERTEX_AI_API_KEY = process.env.VERTEX_AI_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
// Generic AI helper function
async function generateWithAI(prompt, maxTokens = 500) {
    // Try OpenAI first (easier to set up)
    if (OPENAI_API_KEY) {
        try {
            const response = await axios_1.default.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates professional content.",
                    },
                    { role: "user", content: prompt },
                ],
                max_tokens: maxTokens,
                temperature: 0.7,
            }, {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error("OpenAI API error:", error.response?.data || error.message);
        }
    }
    // Try Vertex AI as fallback
    if (VERTEX_AI_ENDPOINT && VERTEX_AI_API_KEY) {
        try {
            const response = await axios_1.default.post(VERTEX_AI_ENDPOINT, {
                instances: [{ prompt }],
                parameters: {
                    maxOutputTokens: maxTokens,
                    temperature: 0.7,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${VERTEX_AI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data.predictions[0].content;
        }
        catch (error) {
            console.error("Vertex AI error:", error.response?.data || error.message);
        }
    }
    // Return a placeholder response if no AI is configured
    throw new Error("No AI service configured. Please add OPENAI_API_KEY or Vertex AI credentials.");
}
// Expand expert profile based on provided information
router.post("/expand-profile", auth_1.authenticate, async (req, res) => {
    try {
        const { name, headline, company, skills, experience } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        const prompt = `
You are helping an expert create their professional profile. Based on the following information, generate a comprehensive profile expansion.

Name: ${name}
${headline ? `Current Position/Headline: ${headline}` : ""}
${company ? `Company: ${company}` : ""}
${skills?.length ? `Skills: ${skills.join(", ")}` : ""}
${experience ? `Experience: ${experience}` : ""}

Please generate the following in JSON format:
1. "bio": A professional 2-3 sentence bio highlighting their expertise and value proposition (max 200 characters)
2. "skillTags": An array of 5-8 relevant skill tags based on their background
3. "serviceCategories": An array of 3-5 service categories they could offer expertise in
4. "experienceSummary": A brief 1-2 sentence summary of their experience
5. "suggestions": An array of 3 suggestions to improve their profile

Respond ONLY with valid JSON, no additional text.
`;
        const aiResponse = await generateWithAI(prompt, 800);
        // Parse the AI response
        let expandedProfile;
        try {
            // Clean up the response (remove markdown code blocks if present)
            const cleanedResponse = aiResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            expandedProfile = JSON.parse(cleanedResponse);
        }
        catch (parseError) {
            console.error("Failed to parse AI response:", aiResponse);
            return res.status(500).json({
                error: "Failed to parse AI response",
                rawResponse: aiResponse,
            });
        }
        res.json({
            success: true,
            expandedProfile,
        });
    }
    catch (error) {
        console.error("Expand profile error:", error);
        res.status(500).json({
            error: error.message || "Failed to expand profile",
        });
    }
});
// Enhance seeker question
router.post("/enhance-question", auth_1.authenticate, async (req, res) => {
    try {
        const { questionTitle, questionDescription, questionCategory } = req.body;
        if (!questionTitle && !questionDescription) {
            return res.status(400).json({ error: "Question title or description is required" });
        }
        const prompt = `
You are helping a knowledge seeker improve their question to get better answers from experts.

Original Question Title: ${questionTitle || "Not provided"}
Original Description: ${questionDescription || "Not provided"}
${questionCategory ? `Category: ${questionCategory}` : ""}

Please enhance this question by:
1. Making it clearer and more specific
2. Adding context that might help experts understand the problem
3. Suggesting relevant details the seeker should include

Respond in JSON format with:
{
  "enhancedTitle": "Improved, more specific title",
  "enhancedDescription": "Enhanced description with better structure and context",
  "suggestedTags": ["array", "of", "relevant", "tags"],
  "additionalQuestions": ["List of clarifying questions the seeker should consider"]
}

Respond ONLY with valid JSON, no additional text.
`;
        const aiResponse = await generateWithAI(prompt, 600);
        // Parse the AI response
        let enhancedQuestion;
        try {
            const cleanedResponse = aiResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            enhancedQuestion = JSON.parse(cleanedResponse);
        }
        catch (parseError) {
            console.error("Failed to parse AI response:", aiResponse);
            return res.status(500).json({
                error: "Failed to parse AI response",
                rawResponse: aiResponse,
            });
        }
        res.json({
            success: true,
            enhancedQuestion,
            original: {
                title: questionTitle,
                description: questionDescription,
            },
        });
    }
    catch (error) {
        console.error("Enhance question error:", error);
        res.status(500).json({
            error: error.message || "Failed to enhance question",
        });
    }
});
// Generate expert pitch/proposal message
router.post("/generate-pitch", auth_1.authenticate, async (req, res) => {
    try {
        const { questionTitle, questionDescription, expertName, expertSkills, expertBio } = req.body;
        if (!questionTitle || !expertName) {
            return res.status(400).json({ error: "Question title and expert name are required" });
        }
        const prompt = `
You are helping an expert write a compelling pitch/proposal to answer a seeker's question.

Question Title: ${questionTitle}
Question Description: ${questionDescription || "Not provided"}

Expert Name: ${expertName}
${expertSkills?.length ? `Expert Skills: ${expertSkills.join(", ")}` : ""}
${expertBio ? `Expert Bio: ${expertBio}` : ""}

Write a professional, friendly pitch message (150-200 words) that:
1. Acknowledges the seeker's question
2. Briefly highlights the expert's relevant experience
3. Explains how the expert can help
4. Creates a sense of trust and expertise

Respond with just the pitch message text, no JSON or additional formatting.
`;
        const pitchMessage = await generateWithAI(prompt, 300);
        res.json({
            success: true,
            pitchMessage: pitchMessage.trim(),
        });
    }
    catch (error) {
        console.error("Generate pitch error:", error);
        res.status(500).json({
            error: error.message || "Failed to generate pitch",
        });
    }
});
exports.default = router;
