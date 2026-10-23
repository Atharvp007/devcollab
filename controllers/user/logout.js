async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
}

module.exports = {
  logout,
};