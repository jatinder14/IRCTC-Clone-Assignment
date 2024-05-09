const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { checkApiKey, checkJwt } = require('../middleware/auth');

// All Admin routes are protected with the checkApiKet middleware that look for api key in the req header

//registrating the admin
router.post('/register', checkApiKey, adminController.register);

//Logging in the admin
router.post('/login', checkApiKey, adminController.login);

//Adding a new train w given source, destination and total seat count
router.post('/trains/add', checkApiKey, checkJwt, adminController.addTrain);

module.exports = router;
