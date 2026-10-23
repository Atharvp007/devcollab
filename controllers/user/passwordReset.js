const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../../models/user");

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendOtpEmail(email, otp) {
  const transporter = buildTransporter();
  if (!transporter) {
    console.warn("SMTP not configured; skipping email send");
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your DevCollab password reset code",
    html: `
      <p>We received a request to reset your DevCollab password.</p>
      <p><strong>Your OTP: ${otp}</strong></p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

// POST /auth/forgot-password
async function requestPasswordReset(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  // Always respond the same to avoid enumeration
  if (!user) {
    return res.status(200).json({ message: "If that email exists, an OTP has been sent." });
  }

  const otp = generateOtp();
  user.resetPasswordOTPHash = hashOtp(otp);
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // send email (best-effort)
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("Failed to send OTP email:", err.message);
  }

  const response = { message: "If that email exists, an OTP has been sent." };
  if (process.env.NODE_ENV !== "production") {
    response.devOtp = otp;
  }
  return res.status(200).json(response);
}

// POST /auth/reset-password
async function resetPassword(req, res) {
  const { email, otp, password } = req.body || {};
  if (!email || !otp || !password) {
    return res.status(400).json({ message: "Email, OTP, and new password are required" });
  }

  const user = await User.findOne({
    email,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!user || user.resetPasswordOTPHash !== hashOtp(otp)) {
    return res.status(400).json({ message: "OTP is invalid or has expired" });
  }

  user.password = password;
  user.resetPasswordOTPHash = undefined;
  user.resetPasswordOTPExpires = undefined;
  await user.save();

  return res.status(200).json({ message: "Password has been reset successfully" });
}

module.exports = {
  requestPasswordReset,
  resetPassword,
};
