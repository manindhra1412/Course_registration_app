// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const auth = (roles) => (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;

        if (roles && !roles.includes(req.user.role)) {
            return res.status(403).send('Forbidden');
        }
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};

module.exports = auth;