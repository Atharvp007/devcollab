const { verifyToken } = require("../services/authentication");
const User = require('../models/user');

function checkForAuthenticationCookie(cookieName) {
    return async (req, res, next) => {
        let tokenCookieValue = req.cookies ? req.cookies[cookieName] : null;

        // Fallback to Bearer token in Authorization header for cross-domain clients
        if (!tokenCookieValue && req.headers && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith("Bearer ")) {
                tokenCookieValue = authHeader.substring(7);
            }
        }

        if (!tokenCookieValue) {
            return next();
        } 
        
        try {
            const decoded = verifyToken(tokenCookieValue);
            if (!decoded) {
                return next();
            }
            const user = await User.findById(decoded._id);
            req.user = user;
        } catch (err) {
            console.error('Authentication error:', err);
        }

        return next();
    }
}

module.exports = {
    checkForAuthenticationCookie,
}