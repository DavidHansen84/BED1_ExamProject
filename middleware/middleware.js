// Middleware function to determine if the API endpoint request is from an authenticated user
const jwt = require('jsonwebtoken');

function isAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({status: "error", error : "JWT token not provided"});
    }

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decodedToken; 
        next();
    } catch (err) {
        return res.status(400).json({status: "error", error: "Invalid token"});
    }
}

module.exports = isAuth;
