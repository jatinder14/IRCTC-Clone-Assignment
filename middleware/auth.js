const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;
const ADMIN_API_KEY=process.env.ADMIN_API_KEY;

//middleware to check jwt tokens
const checkJwt = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.log(token);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        req.user = decoded; //user object is attached to the headers
        next();
    });
};

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== ADMIN_API_KEY) {
        return res.status(403).json({ message:'Invalid API key' });
    }
    next();
};
module.exports={checkApiKey,checkJwt};