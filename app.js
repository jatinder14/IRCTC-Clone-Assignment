const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');

require('dotenv').config();
const port = process.env.PORT || 3001;
const SECRET_KEY=process.env.SECRET_KEY || "jatinder-secret";

// Middleware
// Parsing the data in body header to json 
app.use(bodyParser.json());

// Database newConnection dB is created and every new newConnection
// is created from this dB to allow for multiple users 
const {dB}=require('./models/db.js');

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);


// Get Seat Availability
app.get('/api/trains/availability', (req, res) => {
    const { source, destination } = req.query;
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {  
          console.error(err);
          return res.status(500).send('Error connecting to database');
        }
        newConnection.query('SELECT * FROM Trains WHERE source = ? AND destination = ?',
          [source, destination],
          (err, results) => {
            newConnection.release();
            if (err) {
              console.error(err);
              return res.status(500).send('Error fetching trains');
            }
            console.log(results);
            res.send(results);
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching trains');
    }
  });
  
  
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
