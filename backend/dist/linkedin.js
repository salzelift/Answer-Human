"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const auth_1 = require("./middleware/auth");
const router = (0, express_1.Router)();
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || "";
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || "";
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || "";
// Get LinkedIn authorization URL
router.get("/auth-url", auth_1.authenticate, async (req, res) => {
    try {
        const state = Buffer.from(JSON.stringify({ userId: req.user.userId })).toString("base64");
        const scopes = [
            "openid",
            "profile",
            "email",
            "w_member_social",
        ].join(" ");
        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
            `response_type=code&` +
            `client_id=${LINKEDIN_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
            `state=${state}&` +
            `scope=${encodeURIComponent(scopes)}`;
        res.json({ authUrl });
    }
    catch (error) {
        console.error("LinkedIn auth URL error:", error);
        res.status(500).json({ error: "Failed to generate LinkedIn auth URL" });
    }
});
// LinkedIn OAuth callback
router.get("/callback", async (req, res) => {
    try {
        const { code, state, error } = req.query;
        if (error) {
            console.error("LinkedIn OAuth error:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/expert/onboarding?linkedin_error=${error}`);
        }
        if (!code || !state) {
            return res.redirect(`${process.env.FRONTEND_URL}/expert/onboarding?linkedin_error=missing_params`);
        }
        // Decode state to get userId
        let stateData;
        try {
            stateData = JSON.parse(Buffer.from(state, "base64").toString());
        }
        catch {
            return res.redirect(`${process.env.FRONTEND_URL}/expert/onboarding?linkedin_error=invalid_state`);
        }
        // Exchange code for access token
        const tokenResponse = await axios_1.default.post("https://www.linkedin.com/oauth/v2/accessToken", new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: LINKEDIN_REDIRECT_URI,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const accessToken = tokenResponse.data.access_token;
        // Fetch user profile
        const profileResponse = await axios_1.default.get("https://api.linkedin.com/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const profile = profileResponse.data;
        // Encode profile data to pass to frontend
        const linkedinData = {
            name: profile.name || "",
            email: profile.email || "",
            picture: profile.picture || "",
            sub: profile.sub || "", // LinkedIn user ID
        };
        const encodedData = encodeURIComponent(JSON.stringify(linkedinData));
        // Redirect back to frontend with profile data
        res.redirect(`${process.env.FRONTEND_URL}/expert/onboarding?linkedin_data=${encodedData}`);
    }
    catch (error) {
        console.error("LinkedIn callback error:", error.response?.data || error);
        res.redirect(`${process.env.FRONTEND_URL}/expert/onboarding?linkedin_error=callback_failed`);
    }
});
// Get LinkedIn profile data manually (if user provides URL)
router.post("/parse-url", auth_1.authenticate, async (req, res) => {
    try {
        const { linkedinUrl } = req.body;
        if (!linkedinUrl) {
            return res.status(400).json({ error: "LinkedIn URL is required" });
        }
        // Extract username from LinkedIn URL
        const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
        if (!match) {
            return res.status(400).json({ error: "Invalid LinkedIn URL format" });
        }
        // Return parsed data
        // Note: Actual scraping of LinkedIn profiles is against their ToS
        // In production, use LinkedIn API with proper OAuth
        res.json({
            success: true,
            message: "LinkedIn URL validated",
            username: match[1],
        });
    }
    catch (error) {
        console.error("Parse LinkedIn URL error:", error);
        res.status(500).json({ error: "Failed to parse LinkedIn URL" });
    }
});
exports.default = router;
