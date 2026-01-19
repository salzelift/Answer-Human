"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.generateOTP = generateOTP;
exports.getOTPEmailTemplate = getOTPEmailTemplate;
exports.getPasswordResetSuccessTemplate = getPasswordResetSuccessTemplate;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@example.com";
async function sendEmail(options) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        if (error) {
            console.error("Resend email error:", error);
            return false;
        }
        console.log("Email sent successfully:", data);
        return true;
    }
    catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}
// Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Email templates
function getOTPEmailTemplate(otp, purpose) {
    const title = purpose === "verification"
        ? "Verify Your Email"
        : "Reset Your Password";
    const message = purpose === "verification"
        ? "Thank you for registering! Please use the following OTP to verify your email address:"
        : "You have requested to reset your password. Please use the following OTP:";
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            ${message}
          </p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
            This OTP will expire in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Answer Human. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function getPasswordResetSuccessTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 480px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Password Reset Successful</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            Your password has been successfully reset.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            You can now log in with your new password.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't make this change, please contact support immediately.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Answer Human. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
exports.default = resend;
