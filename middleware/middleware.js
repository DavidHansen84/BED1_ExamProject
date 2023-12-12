// Middleware function to determine if the API endpoint request is from an authenticated user
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// had to use chatGPT here also :( had a problem with getting to use it only with postman or only with the browser
// chatGPT based on my code and then I edited the code again after that to my use :)
function isAuth(req, res, next) {
    const cookieHeader = req.headers.cookie;
    const cookies = cookie.parse(cookieHeader || '');
    const token = (req.headers.authorization?.split(' ')[1]) || cookies.token.split(' ')[1];
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
    if (req.user.role == "Admin") {
        next();
    }
    else {
        res.status(401).send({ status: "Unauthorized", error: "Only admin access" });
    }
}

module.exports = { isAuth, isAdmin };
