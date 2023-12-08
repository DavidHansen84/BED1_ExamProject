// Middleware function to determine if the API endpoint request is from an authenticated user
const jwt = require('jsonwebtoken');

function isAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ status: "error", error: "JWT token not provided" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decodedToken;
        next();
    } catch (err) {
        return res.status(400).json({ status: "error", error: "Invalid token" });
    }
}

function isAdmin(req, res, next) {
    if(req.user.role == "Admin") {
        console.log(req.user.role)
        next();
        return;
    }
    else {
        console.log(req.user)
        res.status(401).send({ status: "Unauthorized", error: "Only admin access"});
    }
}

module.exports = { isAuth, isAdmin };
