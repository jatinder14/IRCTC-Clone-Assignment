const { dB } = require('../models/db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || "secret";

// All admin API routes need to provide API key
// Registering the admin

// Parameterized queries are used to avoid SQL injection
exports.register = (req, res) => {
    const { username, password, role } = req.body;
  
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Database newConnection error');// Internal server error
        }
  
        newConnection.query('INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)',
          [username, password, role],
          (err, results) => {
            if (err) {
              console.error(err);
              newConnection.release();
              return res.status(500).send('Admin cannot be registred');
            }
  
            newConnection.release();
            res.status(201).send({ message: "Admin registered successfully" });
          });
      });
    } catch (error) {
      res.status(500).send('Error registering admin');
    }
};
// Logging in the adming and sending the jsonwebtoken in response
exports.login = (req, res) => {
    const { username, password } = req.body;
  
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error connecting to database');
        }
  
        newConnection.query('SELECT * FROM Users WHERE username = ? AND role = "admin"',
          [username],
          async (err, results) => {
            if (err) {
              console.error(err);
              newConnection.release();
              return res.status(500).send('Error logging in');
            }
  
            if (results.length === 0) {
              newConnection.release();
              return res.status(401).send('Invalid username or password');
            }
  
            const user = results[0];
            const storedPassword = user.password_hash;
  
            const passwordMatch = (storedPassword === password);
  
            if (!passwordMatch) {
              newConnection.release();
              return res.status(401).send('Invalid username or password');
            }
  
            const token = jwt.sign({ user_id: user.user_id, username: user.username }, SECRET_KEY);
            newConnection.release();
            res.status(200).send({ access_token: token });
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error logging in');
    }
};
//Adding a train with given source, destination and total no. of seats
exports.addTrain = (req, res) => {
    const { source, destination, total_seats } = req.body;
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error connecting to the database');
        }
        newConnection.query('INSERT INTO Trains (source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?)',
          [source, destination, total_seats, total_seats],
          (err, results) => {
            newConnection.release();
            if (err) {
              console.error(err);
              return res.status(500).send('Error adding train');
            }
            res.status(201).send('Train added successfully');
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding train');
    }
};
