const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, "SECRET_JWT_CODE", (error, decoded) => {
        if (error) {
            return res.status(401).json({ message: error.message
                ||'Unauthorized: Invalid token' });
        }
        req.userId = decoded.userId; // Add the userId to the request object
        next();
    });
};

