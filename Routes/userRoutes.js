const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { checkJwt } = require('../middleware/auth');

// Registering the user
router.post('/register', userController.register);

// Logging in the user
router.post('/login', userController.login);

// Creating a booking with a given train id
router.post('/bookings/book', checkJwt, userController.bookSeat);

// Fetching all the bookings by a particular user
router.get('/bookings/', checkJwt, userController.bookingHistory);

module.exports = router;
