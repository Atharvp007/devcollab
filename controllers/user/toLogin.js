const User = require("../../models/user");

async function toLogin(req, res) {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordandGenerateToken(email, password);
    const isProduction = process.env.NODE_ENV === "production";

    // Dynamic cookie security settings for dev vs production deployments
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        token,
      });
  } catch (error) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
}

module.exports = {
  toLogin,
};